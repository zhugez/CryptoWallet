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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    address = Column(String, unique=True, nullable=False)
    private_key = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(String, primary_key=True)
    wallet_id = Column(Integer, ForeignKey('wallets.id'))  # Changed to Integer to match Wallet.id
    from_wallet = Column(String(255), nullable=False)  # Added length constraint
    recipient = Column(String(255), nullable=False)    # Added length constraint
    status = Column(String(50), nullable=False)        # Added length constraint
    transaction_type = Column(String(50), nullable=False)  # Added length constraint
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)

    wallet = relationship("Wallet", back_populates="transactions")
    # Removed duplicate wallet_id column definition