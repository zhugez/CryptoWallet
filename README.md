# Project Documentation

## 🚀 **Routing**

### 📊 **Dashboard**
The **Dashboard** serves as the central hub for the user's wallet and transaction activities. It provides the following features:

- **List Wallet**: Displays a comprehensive list of the user's wallet addresses and essential information.
- **Refresh Button**: Allows users to quickly refresh wallet details for up-to-date information.
- **New Wallet Button**: Enables users to create new wallets with ease.
- **Account**: Access personal account settings or profile information.

### 🔐 **Login**
The **Login** page is where users securely authenticate to access their accounts. It requires valid credentials to proceed.

### 📝 **Register**
The **Register** page enables new users to create an account by entering essential details such as authentication credentials and personal information.

### 💳 **Transaction**
The **Transaction** page lets users manage their transaction activities, including viewing history and initiating new transactions.

- **Show History**: Displays a list of all previous transactions with real-time status updates.
- **New Transaction Button**: Allows users to initiate a new transaction seamlessly.

---

## 🔑 **Account Authentication Process**

The authentication process ensures secure access to the user's account. The flow involves the following steps:

1. **User Login**: Users log in with their credentials (username, password, etc.) to verify identity.
2. **Session Creation**: Upon successful login, a secure session is created, granting access to dashboard features and other resources.
3. **Token-Based Authentication**: To maintain secure access, a token (e.g., JWT) is used, ensuring that the user’s session remains protected.

---

## 💼 **Wallet Creation Process**

The process of creating a wallet involves generating a private-public key pair. The steps are as follows:

1. **Generate Wallet Using Web3**:
   - This step leverages the `web3` Python library to generate a unique wallet.
   - The `web3` library generates a new **private key** and **public key** pair for security.

2. **Hash the Public Key**:
   - The **public key** undergoes a **sha3_256** hash to protect the key and ensure it isn't exposed.

3. **Generate Wallet Address**:
   - The wallet address is derived by extracting the last **20 bytes** from the **public key hash**, ensuring that the wallet address is both unique and secure.
   
   **Note**: The **private key** is sensitive and should be securely stored by the user, never to be shared or exposed.

---

## 💸 **Transaction Creation Process**

Transactions go through a structured process, and their statuses are tracked. The process includes:

1. **Transaction Status**:
   - A transaction can have one of three statuses:
     - **Pending**: The transaction is in progress.
     - **Success**: The transaction has been successfully processed.
     - **Fail**: The transaction has failed during processing.

2. **Transaction Workflow**:
   - Once initiated, the transaction begins in the **Pending** state.
   - The transaction then undergoes processing using **zk-SNARK** (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) for verification.
     - If successful, the transaction moves to the **Success** state.
     - If the processing fails, it transitions to the **Fail** state.

   **Note**: The **zk-SNARK** protocol ensures that transaction details remain private while still allowing for verifiable and secure processing.
