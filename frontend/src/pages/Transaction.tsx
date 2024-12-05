import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FiRefreshCw, FiPlus, FiCalendar, FiArrowDownLeft, FiArrowUpRight, FiInbox } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '@/store/transactionStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toastConfig } from '@/utils/toast';
import { PATHS } from '@/utils/enums';
import { formatDate, formatAmount } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Transaction {
  id: string;
  recipient: string;
  transaction_type: 'SEND' | 'RECEIVE';
  created_at: number;
  from_wallet: string;
  wallet_id: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  amount: number;
}

const Transaction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    transactions,
    isLoading,
    currentPage,
    transactionsPerPage,
    loadTransactions,
    setCurrentPage,
  } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = async () => {
    await loadTransactions();
  };

  const handleNavigateToCreate = () => {
    navigate(PATHS.CREATE_TRANSACTION);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

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
                My Transactions
              </h1>
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
                onClick={handleNavigateToCreate}
                className="p-[1px] bg-gradient-to-r from-green-500 to-teal-500"
              >
                <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                  <FiPlus />
                  New Transaction
                </div>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <div className="grid gap-4">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-gray-400 mb-1">Transaction ID</h3>
                            <div className="flex items-center gap-2">
                              <code className="text-white font-mono text-sm">
                                {transaction.id}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-400">
                              <FiCalendar />
                              <span className="text-sm">
                                {formatDate(transaction.created_at)}
                              </span>
                            </div>
                            <Badge variant={transaction.transaction_type === 'RECEIVE' ? 'success' : 'destructive'}>
                              {transaction.transaction_type === 'RECEIVE' ? (
                                <FiArrowDownLeft className="mr-1" />
                              ) : (
                                <FiArrowUpRight className="mr-1" />
                              )}
                              {transaction.transaction_type}
                            </Badge>
                            <Badge variant={transaction.status === 'SUCCESS' ? 'success' : 'warning'}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <h3 className="text-gray-400 mb-1">Amount</h3>
                          <p className={`text-2xl font-bold ${transaction.transaction_type === 'RECEIVE'
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                            : 'bg-gradient-to-r from-pink-400 to-red-400'
                            } bg-clip-text text-transparent`}>
                            {transaction.transaction_type === 'RECEIVE' ? '+' : '-'}
                            {formatAmount(transaction.amount)} ETH
                          </p>
                          {transaction.recipient && (
                            <div className="text-sm text-gray-400">
                              To: <code className="text-white font-mono">{transaction.recipient}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-12 bg-black/40 backdrop-blur-2xl border border-white/10">
                  <div className="text-center space-y-4">
                    <FiInbox className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="text-xl font-medium text-white">No transactions found</h3>
                    <p className="text-gray-400">
                      Your transactions will appear here once you make your first transfer.
                    </p>
                    <Button
                      onClick={handleNavigateToCreate}
                      className="p-[1px] bg-gradient-to-r from-green-500 to-teal-500 mt-4"
                    >
                      <div className="h-full w-full px-4 py-2 rounded-[4px] bg-[#0D0D1F] flex items-center gap-2">
                        <FiPlus />
                        Make Your First Transaction
                      </div>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {currentTransactions.length > 0 && (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transaction;