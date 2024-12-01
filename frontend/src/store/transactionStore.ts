import { create } from 'zustand';
import { fetchTransactions } from '@/apis/transaction';

interface TransactionState {
    transactions: any[];
    isLoading: boolean;
    currentPage: number;
    transactionsPerPage: number;
    loadTransactions: () => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    isLoading: false,
    currentPage: 1,
    transactionsPerPage: 5,
    loadTransactions: async () => {
        set({ isLoading: true });
        try {
            const response = await fetchTransactions();
            if (response && response.transactions) {
                set({ transactions: response.transactions });
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    setCurrentPage: (page: number) => set({ currentPage: page }),
}));