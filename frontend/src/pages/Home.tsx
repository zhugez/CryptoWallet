import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FiRefreshCw, FiCopy, FiCheck, FiCalendar, FiPlus, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatDate, formatBalance } from '@/utils/formatters';
import { useWalletStore } from '@/store/walletStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toastConfig } from '@/utils/toast';
import { createWallet } from '@/apis/wallet'; // Import the createWallet function
import { Label } from '@/components/ui/label';

// Types
interface StoredWallet {
  address: string;
  private_key: string;
  label: string;
  created_at: string;  // Changed from createdAt to match backend
  balance: number;
}

// Helper functions for local storage with metadata
const getStoredWallets = (): StoredWallet[] => {
  try {
    const stored = localStorage.getItem('wallets');
    if (!stored) return [];

    const wallets = JSON.parse(stored);
    return wallets.map((wallet: StoredWallet) => ({
      ...wallet,
      balance: wallet.balance || '0',
      created_at: wallet.created_at || wallet.created_at || new Date().toISOString() // Handle both formats
    }));
  } catch (error) {
    console.error('Error loading wallets:', error);
    return [];
  }
};

const saveWalletToStorage = (wallet: StoredWallet) => {
  try {
    const wallets = getStoredWallets();
    const walletWithMeta = {
      ...wallet,
      created_at: new Date().toISOString(), // Changed from createdAt
      balance: wallet.balance || '0'
    };

    // Check if wallet already exists
    const existingIndex = wallets.findIndex(w => w.address === wallet.address);
    if (existingIndex >= 0) {
      wallets[existingIndex] = walletWithMeta;
    } else {
      wallets.push(walletWithMeta);
    }

    localStorage.setItem('wallets', JSON.stringify(wallets));
    return walletWithMeta;
  } catch (error) {
    console.error('Error saving wallet:', error);
    throw error;
  }
};

const Home = () => {
  const { toast } = useToast();
  const {
    wallets,
    setWallets, // Add this from wallet store
    isLoading,
    currentPage,
    walletsPerPage,
    copiedAddress,
    loadWallets,
    setCurrentPage,
    setCopiedAddress,
  } = useWalletStore();
  const [newWallet, setNewWallet] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletLabel, setWalletLabel] = useState('');

  // Load wallets from local storage on component mount
  useEffect(() => {
    const storedWallets = getStoredWallets();
    setWallets(storedWallets); // Use setWallets from the store
  }, [setWallets]);

  useEffect(() => {
    if (newWallet) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setNewWallet(null);
      }, 30000);

      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    }
  }, [newWallet]);

  const handleRefresh = async () => {
    await loadWallets();
  };

  const handleCreateWalletClick = () => {
    setIsDialogOpen(true);
  };

  const handleCreateWallet = async () => {
    try {
      if (!walletLabel.trim()) {
        toast(toastConfig.error('Please enter a wallet label'));
        return;
      }

      const user_id = localStorage.getItem('user_id');
      const wallet = await createWallet(Number(user_id));

      const walletWithMeta = {
        ...wallet,
        label: walletLabel || 'Unnamed',
        createdAt: new Date().toISOString(),
        balance: '0'
      };

      // Save to local storage
      saveWalletToStorage(walletWithMeta);

      // Update state
      setNewWallet(walletWithMeta);
      setWallets(getStoredWallets());
      setCountdown(30);
      setIsDialogOpen(false);
      setWalletLabel('');

      toast(toastConfig.success('Wallet created successfully'));
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast(toastConfig.error('Failed to create wallet'));
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast(toastConfig.success(`${label} copied to clipboard`));
  };

  const indexOfLastWallet = currentPage * walletsPerPage;
  const indexOfFirstWallet = indexOfLastWallet - walletsPerPage;
  const currentWallets = wallets.slice(indexOfFirstWallet, indexOfLastWallet);

  const totalPages = Math.ceil(wallets.length / walletsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0D0D1F] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                My Wallets
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >

              </motion.div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
              >
                <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                  <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </div>
              </Button>
              <Button
                onClick={handleCreateWalletClick}
                disabled={isLoading}
                className="p-[1px] bg-gradient-to-r from-green-500 to-teal-500"
              >
                <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                  <FiPlus />
                  Create Wallet
                </div>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <div className="grid gap-4">
              {currentWallets.length > 0 ? (
                currentWallets.map((wallet, index) => (
                  <motion.div
                    key={`wallet-${wallet.id || index}`} // Use wallet.id if available, fallback to index
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-gray-400 mb-1">{wallet.label}</h3>
                            <div className="flex items-center gap-2">
                              <code className="text-white font-mono text-sm">
                                {wallet.address}
                              </code>
                              <button
                                onClick={() => copyToClipboard(wallet.address, 'Wallet Address')}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <FiCopy />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiCalendar />
                            <span className="text-sm">
                              Created: {formatDate(wallet.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-gray-400 mb-1">Balance</h3>
                          <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {formatBalance(wallet.balance)} ETH
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-white">No wallets found</div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            >
              <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                Previous
              </div>
            </Button>
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            >
              <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                Next
              </div>
            </Button>
          </div>
        </div>
      </div>

      {newWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-red-500 to-green-700 p-8 rounded-lg shadow-lg text-white max-w-2xl w-full relative"
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setNewWallet(null)}
            >
              <FiX size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-4">{ }Wallet Created</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p><strong>Wallet Address:</strong> {newWallet.address}</p>
                <button
                  onClick={() => copyToClipboard(newWallet.address, 'Wallet Address')}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  <FiCopy />
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p><strong>Private Key:</strong> {newWallet.private_key}</p>
                <button
                  onClick={() => copyToClipboard(newWallet.private_key, 'Private Key')}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  <FiCopy />
                </button>
              </div>
              <p className="text-sm text-gray-200 mb-4">Please save your private key securely. This key will not be shown again.</p>
              <p className="text-sm text-gray-200 mb-4">This modal will close in {countdown} seconds.</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dialog for wallet label input */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1B23] p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 text-white">Create New Wallet</h3>
            <input
              type="text"
              value={walletLabel}
              onChange={(e) => setWalletLabel(e.target.value)}
              placeholder="Enter wallet label"
              className="w-full p-2 mb-4 bg-[#2D2E3D] text-white rounded border border-gray-600"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWallet}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Home;
