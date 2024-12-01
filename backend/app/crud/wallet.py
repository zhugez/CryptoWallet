from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.models import Wallet
from app.schemas import (
    WalletCreateResponse,
    DeleteWalletResponse,
    WalletResponse,
    WalletBalanceResponse,
)
from web3 import Web3
import hashlib

async def get_wallets(
    db: AsyncSession, skip: int = 0, limit: int = 10
) -> list[WalletResponse]:
    subquery = select(Wallet.id).offset(skip).limit(limit).subquery()

    query = (
        select(Wallet)
        .where(Wallet.id.in_(subquery))
        .options(selectinload(Wallet.transactions))  # Efficient eager loading
    )

    result = await db.execute(query)
    wallets = result.scalars().all()
    return [WalletResponse.from_orm(wallet) for wallet in wallets]

async def custom_generate_address(public_key: str) -> str: 
    keccak_hash = hashlib.new('sha3_256', bytes.fromhex(public_key[2:])).digest()

    address = '0x' + keccak_hash[-20:].hex()
    return address

async def generate_ethereum_wallet():
    """
    Generate a new Ethereum wallet with address and private key.
    """
    account = Web3().eth.account.create()
    address = await custom_generate_address(account.address)
    return {"address": address, "private_key": account.key.hex()}

async def create_wallet_in_db(db: AsyncSession, user_id: int) -> WalletCreateResponse:
    wallet_data = await generate_ethereum_wallet()
    new_wallet = Wallet(
        user_id=user_id,
        address=wallet_data["address"],
        private_key=wallet_data["private_key"],  # Secure storage required
        balance=100.0,
    )
    db.add(new_wallet)
    await db.commit()
    await db.refresh(new_wallet)

    # Check if wallet is created
    result = await db.execute(select(Wallet).where(Wallet.id == new_wallet.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet not created"
        )

    return WalletCreateResponse.from_orm(new_wallet)


async def get_wallet_by_id(db: AsyncSession, wallet_id: int):
    """
    Retrieve wallet details by ID.
    """
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found"
        )

    return WalletResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        address=wallet.address,
        balance=wallet.balance,
        created_at=wallet.created_at,
    )


async def delete_wallet(db: AsyncSession, wallet_id: int) -> DeleteWalletResponse:
    """
    Delete a wallet by ID.
    """
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found"
        )

    await db.execute(delete(Wallet).where(Wallet.id == wallet_id))
    await db.commit()

    return DeleteWalletResponse(detail="Wallet deleted successfully")


async def get_wallet_balance(db: AsyncSession, wallet_id: int):
    """
    Retrieve wallet balance by ID.
    """
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found"
        )

    return WalletBalanceResponse(wallet_id=wallet.id, balance=wallet.balance)
