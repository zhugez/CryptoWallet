# Project Documentation

## **Routing**

### **Dashboard**
The Dashboard provides an overview of the user's wallet and transaction information. It includes the following functionalities:

- **List Wallet**: Displays the user's current wallet addresses and relevant information.
- **Refresh Button**: Allows the user to refresh the wallet information.
- **New Wallet Button**: Provides the option to create a new wallet.
- **Account**: Access account settings or user profile information.

### **Login**
The Login page allows users to authenticate and access their accounts. It requires the user to provide valid credentials.

### **Register**
The Register page enables new users to create an account by providing necessary information, including authentication details.

### **Transaction**
The Transaction page allows users to view their transaction history and initiate new transactions.

- **Show History**: Displays a list of all transactions the user has made, along with their current status.
- **New Transaction Button**: Lets the user initiate a new transaction.

---

## **Account Authentication Process**

The account authentication process involves securely verifying the user's identity. Key steps include:

1. **User Login**: Users authenticate via their credentials (username, password, etc.).
2. **Session Creation**: After successful authentication, a session is created, and the user is granted access to the dashboard and other features.
3. **Token-Based Authentication**: For secure access, a token (such as JWT) is used for maintaining the session.

---

## **Wallet Creation Process**

The wallet creation process generates a secure private-public key pair for the user. The key steps are:

1. **Generate Wallet using Web3**:
   - This process uses the `web3` library in Python to generate a new wallet.
   - The `web3` library creates a new **private key** and **public key** pair.

2. **Hash Public Key**:
   - The **public key** is hashed using the `sha3_256` hashing algorithm for added security and to ensure that the public key is not directly exposed.

3. **Generate Wallet Address**:
   - The wallet address is derived by extracting the last **20 bytes** from the **public key hash**. This ensures that the wallet address is unique and secure.
   
   **Note**: The private key should never be exposed and must be kept in a secure location by the user.

---

## **Transaction Creation Process**

The transaction process involves creating a transaction and tracking its status. The key steps and states of a transaction are outlined below:

1. **Transaction Status**:
   - There are three possible statuses for a transaction:
     - **Pending**: The transaction is in the processing state.
     - **Success**: The transaction has been successfully processed and completed.
     - **Fail**: The transaction has failed during processing.

2. **Transaction Workflow**:
   - When a user initiates a transaction, it starts in the **Pending** state.
   - After processing through **zk-SNARK** (zero-knowledge succinct non-interactive arguments of knowledge), the transaction's status is updated:
     - If successful, the status is updated to **Success**.
     - If there is a failure during processing, the status is updated to **Fail**.

   **Note**: The **zk-SNARK** process ensures transaction privacy and security by allowing transaction verification without exposing sensitive data.

---

## **Future Considerations**
- **Security Enhancements**: Consider implementing multi-factor authentication (MFA) and stronger encryption for sensitive data like the private key.
- **User Interface Improvements**: Improve the user experience with more intuitive interactions for wallet creation, transaction history, and dashboard components.
- **Blockchain Integration**: Explore integration with major blockchain platforms for cross-network transaction capabilities.
