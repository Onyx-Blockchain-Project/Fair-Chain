import React, { createContext, useContext } from 'react';
import { useStellarWallet } from '../hooks/useStellarWallet';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const walletState = useStellarWallet();
  
  return (
    <WalletContext.Provider value={walletState}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

// Export the original hook for backward compatibility
export { useStellarWallet } from '../hooks/useStellarWallet';
