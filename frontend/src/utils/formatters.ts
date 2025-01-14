export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatBalance = (balance: string | number): string => {
  try {
    // Convert balance to number if it's a string
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    
    // Format with 4 decimal places
    const formattedBalance = numBalance.toFixed(4);
    
    // Return with single ETH suffix
    return `${formattedBalance} ETH`;
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.0000 ETH';
  }
};



export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};