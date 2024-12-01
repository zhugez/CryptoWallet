export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatBalance = (balance: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(balance);
};

export const calculateTotalBalance = (wallets: { balance: number }[]) => {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
};

export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};