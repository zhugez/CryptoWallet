# wallets.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import (
    WalletResponse,
    WalletCreateResponse,
    DeleteWalletResponse,
    WalletBalanceResponse,
)
from app.crud.wallet import (
    get_wallets,
    create_wallet_in_db,
    get_wallet_by_id,
    get_wallet_balance,
)

router = APIRouter()


@router.get("/", response_model=list[WalletResponse])
async def get_wallets_route(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    wallets = await get_wallets(db=db, skip=skip, limit=limit)
    return [
        WalletResponse(
            id=wallet.id,
            user_id=wallet.user_id,
            address=wallet.address,
            balance=wallet.balance,
            created_at=wallet.created_at,
        )
        for wallet in wallets
    ]


@router.post("/", response_model=WalletCreateResponse)
async def create_wallet_route(user_id: int, db: AsyncSession = Depends(get_db)):
    return await create_wallet_in_db(db, user_id)


@router.get("/{wallet_id}", response_model=WalletResponse)
async def get_wallet_by_id_route(wallet_id: int, db: AsyncSession = Depends(get_db)):
    wallet = await get_wallet_by_id(db, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return WalletResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        address=wallet.address,
        balance=wallet.balance,
        created_at=wallet.created_at,
    )



@router.get("/{wallet_id}/balance", response_model=WalletBalanceResponse)
async def get_wallet_balance_route(wallet_id: int, db: AsyncSession = Depends(get_db)):
    balance = await get_wallet_balance(db, wallet_id)
    return WalletBalanceResponse(wallet_id=wallet_id, balance=balance)
