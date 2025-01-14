import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FiRefreshCw, FiCopy, FiCheck, FiCalendar, FiPlus, FiX, FiKey } from 'react-icons/fi';
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

const Home = () => {
  const { toast } = useToast();
  const {
    wallets,
    setWallets,
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
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedWalletForKey, setSelectedWalletForKey] = useState(null);
  const AUTO_REFRESH_INTERVAL = 30000; // 15 seconds

  // Load wallets from API on component mount
  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

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

      // Lưu cả label và private key vào localStorage
      const walletLabels = JSON.parse(localStorage.getItem('walletLabels') || '{}');
      const walletPrivateKeys = JSON.parse(localStorage.getItem('walletPrivateKeys') || '{}');
      
      walletLabels[wallet.address] = walletLabel;
      walletPrivateKeys[wallet.address] = wallet.private_key;
      
      localStorage.setItem('walletLabels', JSON.stringify(walletLabels));
      localStorage.setItem('walletPrivateKeys', JSON.stringify(walletPrivateKeys));

      // Set new wallet data
      setNewWallet({
        ...wallet,
        label: walletLabel,
        created_at: new Date().toISOString()
      });

      // Cập nhật danh sách ví với label mới
      const updatedWallets = wallets.map(w => 
        w.address === wallet.address 
          ? { ...w, label: walletLabel }
          : w
      );
      setWallets(updatedWallets);

      setCountdown(30);
      setIsDialogOpen(false);
      setWalletLabel('');

      // Thêm refresh sau khi tạo ví thành công
      await loadWallets();

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

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      await loadWallets();
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      await loadWallets();
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const loadWalletsWithLabels = async () => {
      await loadWallets();
      const walletLabels = JSON.parse(localStorage.getItem('walletLabels') || '{}');
      const walletsWithLabels = wallets.map(wallet => ({
        ...wallet,
        label: walletLabels[wallet.address] || wallet.label || 'Unnamed Wallet'
      }));
      setWallets(walletsWithLabels);
    };

    loadWalletsWithLabels();
  }, [loadWallets]);

  useEffect(() => {
    const walletLabels = JSON.parse(localStorage.getItem('walletLabels') || '{}');
    console.log('All wallet labels:', walletLabels);
    console.log('Current wallets:', currentWallets);
    
    // Thử map wallets với labels
    const walletsWithLabels = currentWallets.map(wallet => ({
      ...wallet,
      displayLabel: walletLabels[wallet.address] || 'Unnamed Wallet'
    }));
    console.log('Wallets with labels:', walletsWithLabels);
  }, [currentWallets]);

  const handleVerifyPassword = () => {
    const storedPassword = localStorage.getItem('wallet_password');
    
    if (passwordInput === storedPassword && selectedWalletForKey) {
      try {
        // Lấy private key từ localStorage
        const walletPrivateKeys = JSON.parse(localStorage.getItem('walletPrivateKeys') || '{}');
        const privateKey = walletPrivateKeys[selectedWalletForKey.address];
        
        if (privateKey) {
          setSelectedWalletForKey({
            ...selectedWalletForKey,
            private_key: privateKey
          });
          setShowPrivateKey(true);
          setShowPasswordModal(false);
          setPasswordInput('');
        } else {
          toast(toastConfig.error('Private key not found'));
        }
      } catch (error) {
        console.error('Error getting private key:', error);
        toast(toastConfig.error('Failed to get private key'));
      }
    } else {
      toast(toastConfig.error('Incorrect password'));
    }
  };

  // Thêm useEffect để theo dõi state changes
  useEffect(() => {
    console.log('showPrivateKey:', showPrivateKey);
    console.log('selectedWalletForKey:', selectedWalletForKey);
  }, [showPrivateKey, selectedWalletForKey]);

  // Thêm useEffect để tự động refresh
  useEffect(() => {
    // Initial load
    loadWallets();
    
    // Set up interval for auto refresh
    const intervalId = setInterval(() => {
      console.log('Auto refreshing wallets...');
      loadWallets();
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [loadWallets]); // Chỉ phụ thuộc vào loadWallets

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
            <div className="grid gap-4 max-h-[calc(100vh-240px)] overflow-auto pr-2">
              {currentWallets.length > 0 ? (
                currentWallets.map((wallet, index) => (
                  <motion.div
                    key={`wallet-${wallet.id || index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-black/40 backdrop-blur-2xl border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {(() => {
                                try {
                                  const walletLabels = JSON.parse(localStorage.getItem('walletLabels') || '{}');
                                  return walletLabels[wallet.address] || 'Unnamed Wallet';
                                } catch (error) {
                                  console.error('Error parsing wallet labels:', error);
                                  return 'Unnamed Wallet';
                                }
                              })()}
                            </h3>
                            <div className="flex items-center gap-2">
                              <code className="text-white font-mono text-xs">
                                {wallet.address}
                              </code>
                              <button
                                onClick={() => copyToClipboard(wallet.address, 'Wallet Address')}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <FiCopy size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiCalendar size={14} />
                            <span className="text-xs">
                              Created: {formatDate(wallet.created_at)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4">
                            <button
                              onClick={() => {
                                setSelectedWalletForKey(wallet);
                                setShowPasswordModal(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:opacity-90 transition-opacity text-sm"
                            >
                              <FiKey className="text-white" size={14} />
                              <span>View Private Key</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-gray-400 text-sm mb-1">Balance</h3>
                          <p className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {formatBalance(wallet.balance)}
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
            <h2 className="text-3xl font-bold mb-4">Wallet Created</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p><strong>Label:</strong> {newWallet.label}</p>
              </div>
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
              <p className="text-sm text-gray-200 mb-4">Please save your private key securely. This key will not be shown again without password verification.</p>
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1B23] p-6 rounded-lg shadow-xl w-96"
          >
            <h3 className="text-xl font-bold mb-4 text-white">Enter Wallet Password</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your wallet password"
              className="w-full p-2 mb-4 bg-[#2D2E3D] text-white rounded border border-gray-600"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPassword}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded"
              >
                Verify
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showPrivateKey && selectedWalletForKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1B23] p-6 rounded-lg shadow-xl w-[600px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Private Key</h3>
              <button
                onClick={() => {
                  setShowPrivateKey(false);
                  setSelectedWalletForKey(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="bg-[#2D2E3D] p-4 rounded-lg break-all font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedWalletForKey.private_key}
                </span>
                <button
                  onClick={() => copyToClipboard(selectedWalletForKey.private_key, 'Private Key')}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <FiCopy size={20} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-red-400 text-sm">
              Warning: Never share your private key with anyone. Keep it secure.
            </p>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Home;
