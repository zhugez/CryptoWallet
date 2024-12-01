from fastapi import FastAPI
from app.database import init_db
from app.api import router
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)
origins = [
    "*",
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000",  # React frontend
]
app.add_event_handler("startup", init_db)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
try:
    app.include_router(router)
except Exception as e:
    print(f"Error while setting up the app: {e}")
    app.add_event_handler("shutdown", init_db)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)