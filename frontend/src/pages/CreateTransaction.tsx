import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { createTransaction } from '@/apis/transaction';
import { toastConfig } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/utils/enums';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Wallet } from '@/types/wallet';

const CreateTransaction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [formData, setFormData] = useState({
    wallet_id: '',
    amount: '',
    transaction_type: 'withdraw' as 'withdraw' | 'deposit' | 'transfer', // Add 'transfer' type
    recipient: '',
    private_key: '', // Rename private key field
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate(PATHS.LOGIN); // Redirect to login page if token is missing
    } else {
      fetchWallets();
    }
  }, [navigate]);

  const fetchWallets = async () => {
    setIsLoadingWallets(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/wallets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setWallets(data);

      // Set first wallet as default if available
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, wallet_id: data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast(toastConfig.error('Failed to fetch wallets'));
    } finally {
      setIsLoadingWallets(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, private_key: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user_id = 1; // Get this from your auth context
      const transactionData = {
        ...formData,
        user_id,
        wallet_id: parseInt(formData.wallet_id),
        amount: parseFloat(formData.amount),
      };

      console.log('Transaction Data:', transactionData); // Log the request payload

      const response = await createTransaction(transactionData);

      console.log('Transaction created:', response);

      // Check if id is null or status is "Invalid private key"
      if (!response.id || response.status === "Invalid private key") {
        toast(toastConfig.error('Invalid private key'));
      } else {
        toast(toastConfig.success('Transaction created successfully'));
        navigate(PATHS.TRANSACTION);
      }
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      toast(toastConfig.error(error.response?.data?.message || 'Failed to create transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#0D0D1F]">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10">
              <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Create Transaction
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-400 mb-2 block">Wallet</label>
                  <Select
                    value={formData.wallet_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, wallet_id: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder={isLoadingWallets ? "Loading wallets..." : "Select wallet"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingWallets ? (
                        <SelectItem value="loading" disabled>Loading wallets...</SelectItem>
                      ) : wallets.length > 0 ? (
                        wallets.map(wallet => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {`${wallet.address.substring(0, 6)}...${wallet.address.substring(38)} (${wallet.balance} ETH)`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_wallets" disabled>No wallets available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 mb-2 block">Amount (ETH)</label>
                  <Input
                    type="text"
                    step="0.000001"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0.0"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 mb-2 block">Transaction Type</label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value as 'withdraw' | 'deposit' | 'transfer' }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdraw">Withdraw</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem> {/* Add Transfer option */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 mb-2 block">Recipient (Optional)</label>
                  <Input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Recipient address"
                  />
                </div>
                <div>
                  <label htmlFor="private_key" className="text-gray-400 mb-2 block">Wallet Private Key</label>
                  <Input
                    type="password"
                    id="private_key"
                    name="private_key"
                    value={formData.private_key}
                    onChange={handlePrivateKeyChange}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white"
                >
                  {isLoading ? 'Processing...' : 'Create Transaction'}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTransaction;