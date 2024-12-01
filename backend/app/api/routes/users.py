from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import LoginSchema, UserResponse, UserCreate, RegisterResponse
from app.utils import verify_password, create_access_token
from app.database import get_db
from app.crud.user import create_user, get_user_by_email

router = APIRouter()

@router.post("/register", response_model=RegisterResponse)
async def register_user_endpoint(user: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user,message = await create_user(db, user)
    if not new_user:
        return RegisterResponse(user=UserResponse(id=None, email=None, created_at=None, is_active=False), message=message)
    return RegisterResponse(
            user=UserResponse(
                id=new_user.id,
                email=new_user.email,
                created_at=new_user.created_at,
                is_active=True
            ),message=message )
    \

@router.post("/login") 
async def login_user_endpoint(user: LoginSchema, db: AsyncSession = Depends(get_db)) -> dict:
    try:
        db_user = await get_user_by_email(db, user.email)
        if not db_user:
            return {
                "status": "Account not found",
                "access_token": None,
                "token_type": None,
                "user_id": None
            }

        if not verify_password(user.password, db_user.hashed_password):
            return {
                "status": "Incorrect password",
                "access_token": None,
                "token_type": None,
                "user_id": None
            }

        access_token = create_access_token(data={"user_id": db_user.id})
        return {
            "status": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user.id
        }
    except Exception as e:
        return {
            "status": "Login failed",
            "access_token": None,
            "token_type": None,
            "user_id": None
        }
