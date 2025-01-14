import { create } from 'zustand';
import { WalletInfo } from '@/types';
import { fetchWallets } from '@/apis/wallet';

interface WalletState {
  wallets: WalletInfo[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  walletsPerPage: number;
  copiedAddress: string;
  loadWallets: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  setCopiedAddress: (address: string) => void;
  setWallets: (wallets: WalletInfo[]) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  walletsPerPage: 5,
  copiedAddress: '',
  loadWallets: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedWallets = await fetchWallets();
      console.log('Fetched wallets:', fetchedWallets);
      set({ wallets: fetchedWallets });
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      set({ error: 'Failed to fetch wallets' });
    } finally {
      set({ isLoading: false });
    }
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setCopiedAddress: (address: string) => set({ copiedAddress: address }),
  setWallets: (wallets) => set({ wallets }),
}));
