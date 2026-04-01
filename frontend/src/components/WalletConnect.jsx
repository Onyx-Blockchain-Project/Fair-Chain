import React, { useState } from 'react';
import { Wallet, LogOut, CheckCircle, Loader2 } from 'lucide-react';

export function WalletConnect({ 
  publicKey, 
  isConnected, 
  isConnecting,
  error,
  freighterAvailable,
  manualMode,
  detectionComplete,
  onConnect, 
  onDisconnect,
  setShowWalletPage
}) {
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowWalletPage && setShowWalletPage(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-navy-800 rounded-lg border-2 border-navy-700 shadow-lg hover:bg-navy-100 transition-all"
          title="Click to change wallet"
        >
          <CheckCircle size={18} className="text-navy-600" />
          <span className="font-semibold">{truncateAddress(publicKey)}</span>
        </button>
        <button
          onClick={onDisconnect}
          className="p-2 text-white hover:text-red-400 hover:bg-black rounded-lg transition-all border border-navy-700"
          title="Disconnect"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting || !detectionComplete}
      className="flex items-center gap-2 px-6 py-3 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-all font-semibold border-2 border-white shadow-xl disabled:opacity-50"
    >
      {isConnecting ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Wallet size={20} />
      )}
      {isConnecting ? 'Connecting...' : !detectionComplete ? 'Loading...' : 'Connect Wallet'}
    </button>
  );
}
