import { create } from 'zustand';
import { fetchTransactions } from '@/apis/transaction';
import { ITransaction } from '@/utils/interface';

interface TransactionState {
    transactions: ITransaction[];
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    transactionsPerPage: number;
    loadTransactions: () => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    transactionsPerPage: 5,
    loadTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
            const fetchedTransactions = await fetchTransactions();
            
            // Lọc các giao dịch trùng lặp dựa trên id hoặc tx_hash
            const uniqueTransactions = fetchedTransactions.reduce((acc: ITransaction[], current: ITransaction) => {
                const x = acc.find(item => 
                    item.id === current.id || 
                    (item.tx_hash && item.tx_hash === current.tx_hash)
                );
                if (!x) {
                    return acc.concat([current]);
                } else {
                    // Ưu tiên bản ghi có tx_hash
                    if (current.tx_hash && !x.tx_hash) {
                        return acc.map(item => item.id === x.id ? current : item);
                    }
                    return acc;
                }
            }, []);

            console.log('Filtered transactions:', uniqueTransactions);
            set({ transactions: uniqueTransactions });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            set({ error: 'Failed to fetch transactions' });
        } finally {
            set({ isLoading: false });
        }
    },
    setCurrentPage: (page: number) => set({ currentPage: page }),
}));