import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const PATH = `${API_URL}/api/wallets`;

export const fetchWallets = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(PATH, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

export const createWallet = async (user_id: number) => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post(
    `${PATH}?user_id=${user_id}`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};