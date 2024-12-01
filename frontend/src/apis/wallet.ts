import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const PATH = `${API_URL}/api/wallets`;

interface IWallet {
    id: number;
    user_id: number;
    address: string;
    private_key: string;
}

console.log('API URL:', PATH);

export const fetchWallets = async (): Promise<IWallet[]> => {
    try {
        const response = await axios.get(PATH);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch wallets:', error);
        throw error;
    }
};

export const createWallet = async (user_id: number) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Missing authentication token');
    }

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