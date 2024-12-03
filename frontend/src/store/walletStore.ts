import { create } from 'zustand';
import { WalletInfo } from '@/types';
import { fetchWallets } from '@/apis/wallet';

interface WalletState {
  wallets: WalletInfo[];
  isLoading: boolean;
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
  currentPage: 1,
  walletsPerPage: 5,
  copiedAddress: '',
  loadWallets: async () => {
    set({ isLoading: true });
    try {
      const fetchedWallets = await fetchWallets();
      set({ wallets: fetchedWallets });
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setCopiedAddress: (address: string) => set({ copiedAddress: address }),
  setWallets: (wallets) => set({ wallets }),
}));
