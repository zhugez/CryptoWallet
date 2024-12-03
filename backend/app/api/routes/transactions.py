from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List
from app.crud.transaction import (
    get_transaction_by_id,
    get_transactions,
    create_transaction,
)
from app.schemas import (
    TransactionCreate,
    TransactionResponse,
    TransactionType,
)
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter()

@router.get("/" )
async def fetch_transactions(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):

    try:
        result = await get_transactions(db, skip, limit)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def fetch_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await get_transaction_by_id(db, transaction_id)

@router.post("/", response_model=TransactionResponse, status_code=201)
async def add_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if not isinstance(transaction.transaction_type, TransactionType):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transaction type. Must be one of: {[t.value for t in TransactionType]}",
            )
        return await create_transaction(db, transaction)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
