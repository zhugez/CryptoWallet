import axios from 'axios';
import { ITransaction } from '@/utils/interface';
import { toastConfig } from '@/utils/toast';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const PATH = `${API_URL}/api/transactions`;

console.log('API URL:', PATH);

interface PaginatedResponse {
  transactions: ITransaction[];
  total: number;
  skip: number;
  limit: number;
}

export const fetchTransactions = async (): Promise<PaginatedResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(PATH, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    console.log('Transactions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

interface CreateTransactionPayload {
  user_id: number;
  wallet_id: number;
  amount: number;
  transaction_type: 'withdraw' | 'deposit' | 'transfer';
  recipient?: string;
  privateKey: string;
}

export const createTransaction = async (payload: CreateTransactionPayload): Promise<ITransaction> => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(PATH, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};
