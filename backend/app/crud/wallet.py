from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.models import Wallet
from app.schemas import (
    WalletCreateResponse,
    WalletResponse,
    WalletBalanceResponse,
)
from web3 import Web3

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
        admin_wallet_priv = "0xe8953f487f2ebb2233754f6e04e1a655c88dda74f3e3208745dc43df66051314"
        amount = 0.1
        transaction = {
            "to": account.address,
            "value": w3.to_wei(amount, "ether"),
            "gas": 2000000,
            "gasPrice": w3.to_wei("50", "gwei"),
            "nonce": w3.eth.get_transaction_count(admin_wallet),
        }
        signed_txn = w3.eth.account.sign_transaction(transaction, admin_wallet_priv)
        txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        return {
            "address": account.address,
            "private_key": account.key.hex(),
            "balance": w3.eth.get_balance(account.address)*10**-18,
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
