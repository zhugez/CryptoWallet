export interface ILogin {
  email: string
  password: string
}

export interface IRegister extends ILogin {
  confirmPassword: string;
}

export interface Time {
  year: number
  month: number
  day: number
}

export interface TimeMonth extends Omit<Time, 'day'> { }
export interface TimeYear extends Omit<Time, 'month' | 'day'> { }

export interface ITransaction {
  id: string;
  wallet_id: number;
  from_wallet: string;
  recipient: string;
  status: string;
  transaction_type: 'SEND' | 'RECEIVE';
  amount: number;
  created_at: number;
  tx_hash: string;
}
export interface IWallet {
  id: number;
  user_id: number;
  address: string;
  balance: number;
  created_at: string;
}

export interface IWalletResponse {
  address: string;
  private_key: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

