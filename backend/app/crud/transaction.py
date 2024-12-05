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
        w3 = Web3(Web3.HTTPProvider('http://localhost:7545'))
        if not w3.is_connected():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cannot connect to Ethereum node"
            )
            
        latest_block = w3.eth.block_number
        transactions = []
        
        stmt = select(Wallet).options(selectinload(Wallet.transactions))
        result = await db.execute(stmt)
        wallets = {w.address.lower(): w for w in result.scalars().all()}
        
        if not wallets:
            return []

        for block_number in range(latest_block, max(0, latest_block - limit), -1):
            try:
                block = w3.eth.get_block(block_number, full_transactions=True)
                block_timestamp = block.timestamp
                for tx in block.transactions:
                    from_addr = tx['from'].lower()
                    to_addr = tx['to'].lower() if tx['to'] else None
                    
                    wallet = wallets.get(from_addr) or wallets.get(to_addr)
                    if wallet:
                        tx_id = tx['hash'].hex()
                        # Check if transaction already exists
                        existing_tx = await db.execute(
                            select(Transaction).where(Transaction.id == tx_id)
                        )
                        if not existing_tx.scalar_one_or_none():
                            transaction = Transaction(
                                id=tx_id,
                                wallet_id=wallet.id,
                                from_wallet=from_addr[:255],
                                recipient=to_addr[:255] if to_addr else None,
                                status="SUCCESS",
                                transaction_type="SEND" if from_addr == wallet.address.lower() else "RECEIVE",
                                amount=float(w3.from_wei(tx['value'], 'ether')),
                                created_at=block_timestamp
                            )
                            transactions.append(transaction)
                            await db.add(transaction)
                            print(f"Processed transaction {tx_id}")
            except Exception as block_error:
                print(f"Error processing block {block_number}: {str(block_error)}")
                continue

        if transactions:
            try:
                await db.commit()
            except Exception as commit_error:
                await db.rollback()
                print(f"Error saving transactions: {str(commit_error)}")
                raise

        return transactions

    except Exception as e:
        await db.rollback()
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
    async with db.begin():
        try:
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
            }

            signed_tx = w3.eth.account.sign_transaction(tx, sender_wallet.private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

            if tx_receipt['status'] != 1:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Transaction failed"
                )

            sender_wallet.balance = sender_wallet.balance - transaction.amount
            
            new_transaction = Transaction(
                wallet_id=sender_wallet.id,
                from_wallet=sender_wallet.address,
                recipient=transaction.recipient,
                amount=transaction.amount,
                status="SUCCESS",
                transaction_type="SEND",
                created_at=datetime.now(pytz.UTC),
                tx_hash=tx_hash.hex()
            )
            
            db.add(new_transaction)
            await db.commit()
            await db.refresh(new_transaction)

            return TransactionResponse.from_orm(new_transaction)

        except Exception as e:
            await db.rollback()
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transaction failed: {str(e)}"
            )