export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import { formatEther } from 'ethers';

export const formatBalance = (balance: string | number | bigint): string => {
  try {
    // Handle different balance input types
    let balanceInWei: bigint;

    if (typeof balance === 'string') {
      // Handle scientific notation
      if (balance.includes('e')) {
        balanceInWei = BigInt(Number(balance).toString());
      } else {
        balanceInWei = BigInt(balance);
      }
    } else if (typeof balance === 'number') {
      balanceInWei = BigInt(Math.floor(balance));
    } else {
      balanceInWei = balance;
    }

    // Convert Wei to ETH and format
    const ethBalance = formatEther(balanceInWei);
    const formattedBalance = Number(ethBalance).toFixed(4);

    return `${formattedBalance} `;
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.0000 ETH';
  }
};



export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};