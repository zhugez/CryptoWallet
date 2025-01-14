import axios from 'axios';
import { ITransaction } from '@/utils/interface';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const PATH = `${API_URL}/api/transactions/?skip=0&limit=1000`;

export const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token');

    const response = await axios.get(PATH, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data.transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (payload: any) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token');

    const response = await axios.post(PATH, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};
