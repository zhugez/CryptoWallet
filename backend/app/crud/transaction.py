from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from fastapi import HTTPException, status
from app.models import Wallet, Transaction
from app.schemas import (
    TransactionCreate,
    TransactionResponse,
    TransferCreate,
    TransactionType,
)
import datetime

async def get_transactions(db: AsyncSession, skip: int = 0, limit: int = 10) -> dict:
    """
    Fetch transactions with pagination support.
    """
    result = await db.execute(select(Transaction).offset(skip).limit(limit))
    transactions = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(Transaction))

    return {
        "transactions": [TransactionResponse.from_orm(t) for t in transactions],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


async def get_transaction_by_id(
    db: AsyncSession, transaction_id: int
) -> TransactionResponse:
    """
    Fetch a transaction by its ID.
    """
    query = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    return TransactionResponse.from_orm(transaction)


async def create_transaction(
    db: AsyncSession, transaction: TransactionCreate
) -> TransactionResponse:
    """
    Create a new transaction and update wallet balance accordingly.
    """
    async with db.begin():  # Ensure atomicity
        query = select(Wallet).where(Wallet.id == transaction.wallet_id)
        result = await db.execute(query)
        wallet = result.scalar_one_or_none()

        if not wallet:
            message = "Wallet not found"
            return TransactionResponse(
                id=None,
                wallet_id=None,
                amount=None,
                transaction_type=None,
                status=message,
                recipient=None,
                created_at=datetime.datetime.now(),  # Set created_at to current datetime
            )

        # Check wallet private key
        if wallet.private_key != transaction.private_key:
            message = "Invalid private key"
            return TransactionResponse(
                id=None,
                wallet_id=None,
                amount=None,
                transaction_type=None,
                status=message,
                recipient=None,
                created_at=datetime.datetime.now(),  # Set created_at to current datetime
            )

        if (
            transaction.transaction_type.value == TransactionType.WITHDRAW
            and wallet.balance < transaction.amount
        ):
            message = "Insufficient balance"
            return TransactionResponse(
                id=None,
                wallet_id=None,
                amount=None,
                transaction_type=None,
                status=message,
                recipient=None,
                created_at=datetime.datetime.now(),  # Set created_at to current datetime
            )

        # Create the transaction
        new_transaction = Transaction(
            wallet_id=transaction.wallet_id,
            transaction_type=transaction.transaction_type.value,
            amount=transaction.amount,
            recipient=transaction.recipient,
            status="success",
            created_at=datetime.datetime.now(),
        )
        db.add(new_transaction)

        # Update wallet balance
        if transaction.transaction_type == TransactionType.DEPOSIT:
            wallet.balance += transaction.amount
        elif transaction.transaction_type == TransactionType.WITHDRAW:
            wallet.balance -= transaction.amount

    await db.refresh(new_transaction)
    return TransactionResponse.from_orm(new_transaction)
async def transfer_funds(
    db: AsyncSession, transfer: TransferCreate
) -> TransactionResponse:
    """
    Transfer funds between two wallets.
    """

    async with db.begin():
        # Validate both wallets in a single query
        query = select(Wallet).where(
            Wallet.id.in_([transfer.from_wallet_id, transfer.to_wallet_id])
        )
        result = await db.execute(query)
        wallets = {wallet.id: wallet for wallet in result.scalars().all()}

        sender_wallet = wallets.get(transfer.from_wallet_id)
        recipient_wallet = wallets.get(transfer.to_wallet_id)

        if not sender_wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Sender wallet not found"
            )
        if not recipient_wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient wallet not found",
            )
        if sender_wallet.balance < transfer.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance"
            )

        # Perform the transfer
        sender_wallet.balance -= transfer.amount
        recipient_wallet.balance += transfer.amount

        new_transaction = Transaction(
            wallet_id=transfer.from_wallet_id,
            transaction_type=TransactionType.TRANSFER.value,  # Store enum value instead of enum member
            amount=transfer.amount,
            recipient=recipient_wallet.address,
            status="completed",
        )
        db.add(new_transaction)

    await db.refresh(new_transaction)
    return TransactionResponse.from_orm(new_transaction)
