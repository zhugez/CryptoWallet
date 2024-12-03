from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional


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
    SEND = "send"
    RECEIVE = "receive"
class TransactionCreate(BaseModel):
    wallet_id: int
    amount: float
    transaction_type: TransactionType
    private_key: str
    recipient: str | None = None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int | None  # Make id optional
    wallet_id: int | None  # Make wallet_id optional
    amount: float | None  # Make amount optional
    transaction_type: str | None  # Make transaction_type optional
    status: str  # Make status optional
    recipient: str | None  # Keep recipient optional
    created_at: datetime | None  # Make created_at optional

    class Config:
        from_attributes = True

# class TransactionResponse(BaseModel):
#     id: int
#     wallet_id: int
#     amount: float
#     transaction_type: str  # Change to str since we store string in DB
#     status: str
#     recipient: Optional[str]
#     created_at: datetime

#     class Config:
#         from_attributes = True


class TransferCreate(BaseModel):
    from_wallet_id: int
    to_wallet_id: int
    amount: float

    class Config:
        from_attributes = True
