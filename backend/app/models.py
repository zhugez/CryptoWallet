from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum

Base = declarative_base()


# Mô hình Người dùng
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Mô hình Ví
class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address = Column(String, unique=True, nullable=False)
    private_key = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    transactions = relationship("Transaction", back_populates="wallet")


class TransactionType(Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    TRANSFER = "transfer"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    recipient = Column(String, nullable=True)  # Optional for transfers
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    wallet = relationship("Wallet", back_populates="transactions")
