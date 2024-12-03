from web3 import Web3
from eth_account import Account

# # Kết nối với Ganache hoặc một Ethereum node
# ganache_url = "http://127.0.0.1:7545"  # URL của Ganache
# w3 = Web3(Web3.HTTPProvider(ganache_url))

# # Kiểm tra kết nối
# if w3.is_connected():
#     print("Đã kết nối với Ethereum node!")
# else:
#     print("Không thể kết nối với Ethereum node.")

# # Tạo ví mới
# acct = Account.create()
# adminWalletpub = "0x7e768eBd678A91D084a4a1fa4Fe874DbB88F1744"
# adminWalletpriv = "0x09f8cb57aefb5ab5de738caeef3ab22532b05683e6985f21662e4eb426bf6f87"
# # In ra ví và private key
# print(f"Địa chỉ ví: {acct.address}")
# print(f"Private key: {acct._private_key.hex()}")
# print(f"Balance: {w3.eth.get_balance(acct.address)}")
# accounts = w3.eth.accounts
# print("Danh sách ví trong Ganache:")
# for account in accounts:
#     print(account)
# # Chuyển tiền từ admin wallet sang ví mới
# # Địa chỉ ví admin
# admin_address = adminWalletpub
# # Private key của ví admin
# private_key = adminWalletpriv
# # Địa chỉ ví mới
# to_address = acct.address
# # Số Ether cần chuyển: 100
# amount = 100
# # Chuyển tiền
# transaction = {
#     "to": to_address,
#     "value": w3.to_wei(amount, "ether"),
#     "gas": 2000000,
#     "gasPrice": w3.to_wei("50", "gwei"),
#     "nonce": w3.eth.get_transaction_count(admin_address),
#     "chainId": 1337,
# }
# signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
# txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
# print(f"Đã chuyển {amount} Ether từ ví admin sang ví mới.")
# print(f"Hash của giao dịch: {txn_hash.hex()}")
# # Kiểm tra số dư của ví mới
# print(f"Số dư của ví mới: {w3.eth.get_balance(acct.address)}")
# # Kiểm tra số dư của ví admin
# print(f"Số dư của ví admin: {w3.eth.get_balance(admin_address)}")
# w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
# account = w3.eth.account.create()

# print(f"Địa chỉ ví: {account.address}")
# adminWallet = w3.eth.accounts[0]
# adminWalletpriv = "0xd53394925e27c403449b1125d67f4b4fb8f5d5926232160b8423f35d89388f9f"
# amount = 100
# transaction = {
#     "to": account.address,
#     "value": w3.to_wei(amount, "ether"),
#     "gas": 2000000,
#     "gasPrice": w3.to_wei("50", "gwei"),
#     "nonce": w3.eth.get_transaction_count(adminWallet),
# }
# signed_txn = w3.eth.account.sign_transaction(transaction, adminWalletpriv)
# txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
# print(f"Đã chuyển {amount} Ether từ ví admin sang ví mới. Hash của giao dịch: {txn_hash.hex()}")
# w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
# account = w3.eth.account.create()
# admin_wallet = w3.eth.accounts[0]
# admin_wallet_priv = "0x76537d0232d868d5f945f643d8b6d4e5ea77b4004daafadeb7f5d7379e2aa294"
# amount = 0.1
# transaction = {
#     "to": account.address,
#     "value": w3.to_wei(amount, "ether"),
#     "gas": 2000000,
#     "gasPrice": w3.to_wei("50", "gwei"),
#     "nonce": w3.eth.get_transaction_count(admin_wallet),
# }
# signed_txn = w3.eth.account.sign_transaction(transaction, admin_wallet_priv)
# txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
# print(f"Đã chuyển {amount} Ether từ ví admin sang ví mới. Hash của giao dịch: {txn_hash.hex()}")
# from web3 import Web3
# from datetime import datetime, timezone
# import pytz

# w3 = Web3(Web3.HTTPProvider('http://localhost:7545'))
# latest_block = w3.eth.block_number  
# netransactions = []

# local_timezone = pytz.timezone('Asia/Ho_Chi_Minh')
# for block_number in range(latest_block, 0, -1):
#     block = w3.eth.get_block(block_number, full_transactions=True)
#     block_timestamp = block['timestamp']
#     dt_utc = datetime.fromtimestamp(block_timestamp, timezone.utc)
#     dt_local = dt_utc.astimezone(local_timezone)
#     formatted_timestamp = dt_local.strftime('%Y-%m-%dT%H:%M:%S.') + f"{int((block_timestamp % 1) * 1_000_000):06d}"
#     for tx in block.transactions:
#         netransaction = {
#             "Hash": tx['hash'].hex(),
#             "From": tx['from'],
#             "To": tx['to'],
#             "Amount": w3.from_wei(tx['value'], 'ether'),
#             "Created_At": formatted_timestamp
#         }
#         netransactions.append(netransaction)

from sqlalchemy.orm import selectinload
from app.models import Wallet
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio

# Create async engine and session
engine = create_async_engine('postgresql+asyncpg://your_db_url_here')
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_wallets():
    async with async_session() as db:
        stmt = select(Wallet).options(selectinload(Wallet.transactions))
        result = await db.execute(stmt)  # Add await here
        wallets = result.scalars().all()
        await db.close()  # Properly close the session
        return wallets

# Run the async function
if __name__ == "__main__":
    wallets = asyncio.run(get_wallets())
    print(wallets)