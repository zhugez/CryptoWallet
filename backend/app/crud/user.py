from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models import User
from app.schemas import UserCreate
from app.utils import hash_password


async def create_user(db: AsyncSession, usr: UserCreate):
    """
    Create a new user with the given data.
    """
    message = "User created successfully."
    query = await db.execute(select(User).where(User.email == usr.email))
    existing_user = query.scalar_one_or_none()
    if existing_user:
        message = "User already exists."
        return None, message

    # Hash mật khẩu
    hashed_pw = hash_password(usr.password)

    # Tạo người dùng mới
    new_user = User(email=usr.email, hashed_password=hashed_pw)

    # Lưu người dùng vào cơ sở dữ liệu
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        return None, message
    return new_user, message


async def get_user_by_email(db: AsyncSession, email: str):
    """
    Fetch a user by their email address.
    """
    query = await db.execute(select(User).where(User.email == email))
    return query.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int):
    """
    Fetch a user by their ID.
    """
    query = await db.execute(select(User).where(User.id == user_id))
    return query.scalar_one_or_none()


async def delete_user(db: AsyncSession, user_id: int):
    """
    Delete a user by their ID.
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    await db.delete(user)
    await db.commit()
    return {"message": f"User with id {user_id} deleted successfully."}
