from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.models import Wallet, Transaction
from app.schemas import (
    WalletCreateResponse,
    WalletResponse,
    WalletBalanceResponse,
    TransactionCreate,
)
from web3 import Web3
import uuid
from datetime import datetime

async def get_wallets(
    db: AsyncSession, skip: int = 0, limit: int = 10
) -> list[WalletResponse]:
    try:
        # Lấy danh sách ví từ database
        query = select(Wallet).offset(skip).limit(limit)
        result = await db.execute(query)
        wallets = result.scalars().all()

        # Khởi tạo Web3
        w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
        
        # Cập nhật balance cho mỗi ví
        wallet_responses = []
        for wallet in wallets:
            try:
                # Add debug logging
                print(f"Fetching balance for address: {wallet.address}")
                current_balance = w3.eth.get_balance(wallet.address)
                print(f"Raw balance: {current_balance}")
                balance_in_eth = w3.from_wei(current_balance, "ether")
                print(f"Balance in ETH: {balance_in_eth}")
                
                wallet_responses.append(
                    WalletResponse(
                        id=wallet.id,
                        user_id=wallet.user_id,
                        address=wallet.address,
                        balance=float(balance_in_eth),
                        created_at=wallet.created_at
                    )
                )
            except Exception as e:
                print(f"Error getting balance for wallet {wallet.address}: {str(e)}")
                # If there's an error getting the balance, return the stored balance
                wallet_responses.append(
                    WalletResponse(
                        id=wallet.id,
                        user_id=wallet.user_id,
                        address=wallet.address,
                        balance=wallet.balance,
                        created_at=wallet.created_at
                    )
                )
        
        return wallet_responses

    except Exception as e:
        print(f"Error in get_wallets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Helper function to get wallet by ID
async def fetch_wallet_by_id(db: AsyncSession, wallet_id: int) -> Wallet:
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found"
        )
    return wallet

async def generate_ethereum_wallet() -> dict:
    """
    Generate a new Ethereum wallet with address and private key.
    """
    try:
        w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
        account = w3.eth.account.create()
        admin_wallet = w3.eth.accounts[0]
        admin_wallet_priv = "0x49a6e48ffe4f1bf759a5166020ad7780498be13519685da4d6641cab8d8cfe36"
        amount = 10
        
        # Send initial balance
        transaction = {
            "to": account.address,
            "value": w3.to_wei(amount, "ether"),
            "gas": 2000000,
            "gasPrice": w3.to_wei("50", "gwei"),
            "nonce": w3.eth.get_transaction_count(admin_wallet),
        }
        signed_txn = w3.eth.account.sign_transaction(transaction, admin_wallet_priv)
        txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction to be mined
        w3.eth.wait_for_transaction_receipt(txn_hash)
        
        # Get updated balance
        updated_balance = w3.eth.get_balance(account.address)
        balance_in_eth = w3.from_wei(updated_balance, "ether")

        return {
            "address": account.address,
            "private_key": account.key.hex(),
            "balance": float(balance_in_eth),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
async def create_wallet_in_db(db: AsyncSession, user_id: int) -> WalletCreateResponse:
    wallet_data = await generate_ethereum_wallet()
    new_wallet = Wallet(
        user_id=user_id,
        address=wallet_data["address"],
        private_key=wallet_data["private_key"],  # Secure storage required
        balance=wallet_data["balance"],
    )
    db.add(new_wallet)
    await db.commit()
    await db.refresh(new_wallet)

    # Check if wallet is created
    wallet = await fetch_wallet_by_id(db, new_wallet.id)
    return WalletCreateResponse.from_orm(wallet)

async def get_wallet_by_id(db: AsyncSession, wallet_id: int) -> WalletResponse:
    """
    Retrieve wallet details by ID.
    """
    wallet = await fetch_wallet_by_id(db, wallet_id)
    return WalletResponse.from_orm(wallet)


async def get_wallet_balance(db: AsyncSession, wallet_id: int) -> WalletBalanceResponse:
    """
    Retrieve wallet balance by ID.
    """
    wallet = await fetch_wallet_by_id(db, wallet_id)
    return WalletBalanceResponse(wallet_id=wallet.id, balance=wallet.balance)

async def create_wallet(db: AsyncSession, transaction: TransactionCreate) -> WalletResponse:
    try:
        # Khởi tạo Web3
        w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
        if not w3.is_connected():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cannot connect to Ethereum node"
            )

        # Lấy thông tin ví gửi
        stmt = select(Wallet).where(Wallet.id == transaction.wallet_id)
        result = await db.execute(stmt)
        sender_wallet = result.scalar_one_or_none()

        if not sender_wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender wallet not found"
            )

        # Kiểm tra private key
        if sender_wallet.private_key != transaction.private_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid private key"
            )

        # Kiểm tra số dư
        balance = w3.eth.get_balance(sender_wallet.address)
        balance_in_eth = float(w3.from_wei(balance, "ether"))
        if balance_in_eth < transaction.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )

        # Tạo giao dịch
        nonce = w3.eth.get_transaction_count(sender_wallet.address)
        transaction_data = {
            "nonce": nonce,
            "to": transaction.recipient,
            "value": w3.to_wei(transaction.amount, "ether"),
            "gas": 21000,  # Gas limit cơ bản cho giao dịch chuyển ETH
            "gasPrice": w3.eth.gas_price,
            "chainId": 1337
        }

        # Ký giao dịch
        signed_txn = w3.eth.account.sign_transaction(
            transaction_data, 
            transaction.private_key
        )

        # Gửi giao dịch
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Đợi giao dịch được xác nhận
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        # Tạo transaction ID trước
        transaction_id = str(uuid.uuid4())

        # Tạo bản ghi transaction với ID đã tạo
        new_transaction = Transaction(
            id=transaction_id,  # Thêm ID vào đây
            wallet_id=transaction.wallet_id,
            from_wallet=sender_wallet.address,
            recipient=transaction.recipient,
            status="SUCCESS",
            transaction_type=transaction.transaction_type.value,  # Sử dụng .value cho Enum
            amount=transaction.amount,
            created_at=int(datetime.now().timestamp()),  # Sử dụng timestamp thay vì datetime
            tx_hash=tx_hash.hex()
        )

        # Cập nhật số dư ví
        new_balance = w3.eth.get_balance(sender_wallet.address)
        sender_wallet.balance = float(w3.from_wei(new_balance, "ether"))

        # Lưu vào database
        db.add(new_transaction)
        await db.commit()
        await db.refresh(sender_wallet)

        return WalletResponse(
            id=sender_wallet.id,
            user_id=sender_wallet.user_id,
            address=sender_wallet.address,
            balance=sender_wallet.balance,
            created_at=sender_wallet.created_at
        )

    except Exception as e:
        await db.rollback()
        print(f"Error in create_wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed: {str(e)}"
        )
