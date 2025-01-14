from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from fastapi import HTTPException, status
from app.models import Wallet, Transaction
from app.schemas import TransactionCreate, TransactionResponse
from datetime import datetime
from web3 import Web3
import pytz
from typing import List, Optional
from sqlalchemy.orm import selectinload
import uuid
import logging

async def get_transactions(db: AsyncSession, skip: int = 0, limit: int = 10) -> List[Transaction]:
    
    res =  await fetch_all_transactions(db, limit)

    # Fetch transactions from the database

    stmt = select(Transaction).offset(skip).limit(limit)
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    return {
        "transactions": transactions,
    }


async def fetch_all_transactions(db: AsyncSession, limit: int = 10) -> List[Transaction]:
    try:
        # Initialize Web3 connection
        w3 = Web3(Web3.HTTPProvider('http://localhost:7545'))
        if not w3.is_connected():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cannot connect to Ethereum node"
            )
            
        latest_block = w3.eth.block_number
        transactions = []
        
        # Fetch existing transactions and wallets in a single query with proper sorting
        stmt = select(Transaction, Wallet).join(
            Wallet, Transaction.wallet_id == Wallet.id
        ).order_by(Transaction.created_at.desc())  # Sort by created_at in descending order
        result = await db.execute(stmt)
        
        # Create lookup dictionaries
        existing_transactions = {}
        wallets = {}
        for tx, wallet in result.unique().all():
            existing_transactions[tx.id] = tx
            wallets[wallet.address.lower()] = wallet

        # If no wallets found, return early
        if not wallets:
            return []

        # Process blocks in reverse order
        start_block = max(0, latest_block - limit)
        for block_number in range(latest_block, start_block, -1):
            try:
                block = w3.eth.get_block(block_number, full_transactions=True)
                
                for tx in block.transactions:
                    from_addr = tx['from'].lower()
                    to_addr = tx['to'].lower() if tx['to'] else None
                    tx_id = tx['hash'].hex()
                    
                    # Skip if transaction already exists
                    if tx_id in existing_transactions:
                        continue
                        
                    # Process sending wallet
                    if from_wallet := wallets.get(from_addr):
                        amount_in_wei = tx['value']
                        amount_in_ether = w3.from_wei(amount_in_wei, 'ether')
                        # Get timestamp from the transaction itself
                        tx_timestamp = w3.eth.get_block(tx['blockNumber'])['timestamp'] * 1000  # Convert to milliseconds
                        transactions.append(
                            Transaction(
                                id=tx_id,
                                wallet_id=from_wallet.id,
                                from_wallet=from_addr,
                                recipient=to_addr,
                                status="SUCCESS",
                                transaction_type="SEND",
                                amount=float(format(amount_in_ether, '.18f')),
                                created_at=tx_timestamp,  # Use actual transaction timestamp
                                tx_hash=tx_id
                            )
                        )
                    
                    # Process receiving wallet
                    if to_addr and (to_wallet := wallets.get(to_addr)):
                        amount_in_wei = tx['value']
                        amount_in_ether = w3.from_wei(amount_in_wei, 'ether')
                        # Get timestamp from the transaction itself
                        tx_timestamp = w3.eth.get_block(tx['blockNumber'])['timestamp'] * 1000  # Convert to milliseconds
                        transactions.append(
                            Transaction(
                                id=tx_id,
                                wallet_id=to_wallet.id,
                                from_wallet=from_addr,
                                recipient=to_addr,
                                status="SUCCESS",
                                transaction_type="RECEIVE",
                                amount=float(format(amount_in_ether, '.18f')),
                                created_at=tx_timestamp,  # Use actual transaction timestamp
                                tx_hash=tx_id
                            )
                        )

            except Exception as block_error:
                logging.error(f"Error processing block {block_number}: {str(block_error)}")
                continue

        # Batch insert new transactions
        if transactions:
            try:
                db.add_all(transactions)
                await db.commit()
                
                # Update existing_transactions with new ones
                for tx in transactions:
                    existing_transactions[tx.id] = tx
                    
            except Exception as commit_error:
                await db.rollback()
                logging.error(f"Error saving transactions: {str(commit_error)}")
                raise

        # Return sorted transactions
        return sorted(
            existing_transactions.values(),
            key=lambda x: x.created_at,
            reverse=True
        )[:limit]

    except Exception as e:
        await db.rollback()
        logging.error(f"Error in fetch_all_transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

async def get_transaction_by_id(
    db: AsyncSession, transaction_id: int
) -> TransactionResponse:
    """
    Fetch a transaction by its ID.
    """
    try:
        query = select(Transaction).where(Transaction.id == transaction_id)
        result = await db.execute(query)
        transaction = result.scalar_one_or_none()

        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )

        return TransactionResponse.from_orm(transaction)
    except Exception as e:
        print(f"Error fetching transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transaction: {str(e)}"
        )

async def create_transaction(db: AsyncSession, transaction: TransactionCreate) -> TransactionResponse:
    try:
        # Kiểm tra ví gửi
        stmt = select(Wallet).where(Wallet.id == transaction.wallet_id)
        result = await db.execute(stmt)
        sender_wallet = result.scalar_one_or_none()
        
        if not sender_wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender wallet not found"
            )

        if sender_wallet.private_key != transaction.private_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid private key"
            )

        if sender_wallet.balance < transaction.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )

        if not Web3.is_address(transaction.recipient):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid recipient address"
            )

        w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
        if not w3.is_connected():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cannot connect to Ethereum node"
            )

        tx = {
            "from": sender_wallet.address,
            "to": transaction.recipient,
            "value": w3.to_wei(transaction.amount, "ether"),
            "gas": 2000000,
            "gasPrice": w3.to_wei("50", "gwei"),
            "nonce": w3.eth.get_transaction_count(sender_wallet.address),
            "chainId": 1337
        }

        signed_tx = w3.eth.account.sign_transaction(tx, sender_wallet.private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if tx_receipt['status'] != 1:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Transaction failed"
            )

        # Cập nhật số dư ví
        new_balance = w3.eth.get_balance(sender_wallet.address)
        sender_wallet.balance = float(w3.from_wei(new_balance, "ether"))
        
        # Tạo transaction với ID
        transaction_id = str(uuid.uuid4())
        new_transaction = Transaction(
            id=transaction_id,
            wallet_id=sender_wallet.id,
            from_wallet=sender_wallet.address,
            recipient=transaction.recipient,
            amount=transaction.amount,
            status="SUCCESS",
            transaction_type=transaction.transaction_type.value,
            created_at=int(datetime.now().timestamp()),
            tx_hash=tx_hash.hex()
        )
        
        # Lưu vào database
        db.add(new_transaction)
        await db.commit()
        await db.refresh(new_transaction)

        return TransactionResponse.from_orm(new_transaction)

    except Exception as e:
        await db.rollback()
        print(f"Error in create_transaction: {str(e)}")  # Thêm log để debug
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed: {str(e)}"
        )