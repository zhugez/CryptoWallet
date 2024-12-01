import jwt
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from web3 import Web3
from typing import NoReturn
from fastapi import HTTPException, status

from sqlalchemy.exc import SQLAlchemyError

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = "your_secret_key"  # Replace with your actual secret key
ALGORITHM = "HS256"

# -------------------- Password Utilities --------------------


def hash_password(password: str) -> str:
    """
    Hash a plaintext password.
    """
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify if the given password matches the hashed password.
    """
    return pwd_context.verify(password, hashed)


# -------------------- JWT Utilities --------------------


def create_access_token(
    data: dict, expires_delta: timedelta = timedelta(hours=1)
) -> str:
    """
    Create a JWT token with an optional expiration time.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> dict:
    """
    Verify and decode a JWT token. Raises exceptions for invalid or expired tokens.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token.")


# -------------------- Ethereum Utilities --------------------


def is_valid_eth_address(address: str) -> bool:
    """
    Validate if the provided address is a valid Ethereum address.
    """
    return Web3.isAddress(address)


def format_eth_address(address: str) -> str:
    """
    Format the Ethereum address into its checksum version.
    """
    if not is_valid_eth_address(address):
        raise ValueError(f"Invalid Ethereum address: {address}")
    return Web3.toChecksumAddress(address)


# -------------------- Balance Calculation --------------------


def calculate_balance(transactions: list) -> float:
    """
    Calculate the balance based on a list of transactions.
    Each transaction should be a dictionary with 'amount' and 'type' (e.g., 'deposit' or 'withdraw').
    """
    balance = 0.0
    for tx in transactions:
        if tx["type"] == "deposit":
            balance += tx["amount"]
        elif tx["type"] == "withdraw":
            balance -= tx["amount"]
    return balance


# -------------------- Miscellaneous Utilities --------------------


def generate_uuid() -> str:
    """
    Generate a random UUID string.
    """
    return str(uuid.uuid4())


def timestamp_to_datetime(timestamp: int) -> datetime:
    """
    Convert a Unix timestamp to a Python datetime object.
    """
    return datetime.fromtimestamp(timestamp)


def datetime_to_timestamp(dt: datetime) -> int:
    """
    Convert a Python datetime object to a Unix timestamp.
    """
    return int(dt.timestamp())


async def handle_db_error(error: Exception) -> NoReturn:
    if isinstance(error, SQLAlchemyError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred",
        )
    raise error
