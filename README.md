## Routing
#### Dashboard
- List Wallet
- Refresh button
- New Wallet button
- Account 
#### Login
#### Register
#### Transaction
- Show history.
- New Transaction button

# Quy trình xác thực tài khoản 
# Quy trình tạo ví |
- Generate ví sử dụng thư viện web3 trong python.
- Phương thức này sẽ tạo ra một khóa riêng (private key) và khóa công khai (public key).
- Hash public key: sử dụng sha3_256 để thực hiện.
- Tạo địa chỉ ví tùy chỉnh:  chỉ lấy 20 byte cuối cùng của public key hash để làm địa chỉ ví.
# Quy trình tạo transaction |
- Status của transaction có 3 mode: Pending , Success, Fail.
- Quy trình:
    + Giao dịch bắt đầu ở trạng thái Pending.
    + Sau khi xử lý(Process qua zk-snark), giao dịch có thể chuyển sang Success (thành công) hoặc Fail (thất bại).

