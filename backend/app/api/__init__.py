from fastapi import APIRouter
from app.api.routes import transactions, users, wallets
from fastapi.responses import JSONResponse

router = APIRouter()

router.include_router(users.router, prefix="/api/users", tags=["Users"])
router.include_router(wallets.router, prefix="/api/wallets", tags=["Wallets"])
router.include_router(
    transactions.router, prefix="/api/transactions", tags=["Transactions"]
)


@router.get("/")
async def root():
    return JSONResponse(content={"message": "Crypto Wallet API"})
