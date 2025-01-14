from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional, Literal


# Schemas cho Người dùng
class UserCreate(BaseModel):
    
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str




class UserResponse(BaseModel):
    id: Optional[int] = None  # id can be None
    email: Optional[str] = None  # email can be None
    created_at: Optional[datetime] = None  # created_at can be None
    is_active: bool  # is_active is required

    class Config:
        from_attributes = True
class RegisterResponse(BaseModel):
    user: UserResponse
    message: str = "Registration successful"

    class Config:
        from_attributes = True


# Schemas cho Ví
class WalletCreate(BaseModel):
    user_id: int
    model_config = {"from_attributes": True}


class WalletCreateResponse(BaseModel):
    address: str
    private_key: str

    model_config = {"from_attributes": True}


class WalletResponse(BaseModel):
    id: int
    user_id: int
    address: str
    balance: float
    created_at: datetime

    model_config = {"from_attributes": True}


class WalletBalanceResponse(BaseModel):
    wallet_id: int
    balance: float

    model_config = {"from_attributes": True}


class DeleteWalletResponse(BaseModel):
    detail: str

    class Config:
        from_attributes = True


# Schemas cho Giao dịch


class TransactionType(str, Enum):
    send = "send"
    receive = "receive"

class TransactionBase(BaseModel):
    id: Optional[int]  # Optional to allow auto-increment by the database
    wallet_id: int
    from_wallet: str
    recipient: str
    status: str
    transaction_type: str
    amount: float
    created_at: int
    tx_hash: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    wallet_id: int
    amount: float
    transaction_type: TransactionType
    private_key: str
    recipient: str

    model_config = {"from_attributes": True}

class TransactionResponse(BaseModel):
    id: str
    wallet_id: int
    from_wallet: str
    recipient: str
    status: str
    transaction_type: str
    amount: float
    created_at: int
    tx_hash: str

    model_config = {"from_attributes": True}


class TransferCreate(BaseModel):
    from_wallet_id: int
    to_wallet_id: int
    amount: float

    class Config:
        from_attributes = True
