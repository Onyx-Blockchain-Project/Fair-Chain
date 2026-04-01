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
  onDisconnect
}) {
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-olive-100 text-olive-800 rounded-lg border border-olive-300">
          <CheckCircle size={18} className="text-olive-700" />
          <span className="font-medium">{truncateAddress(publicKey)}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="p-2 text-olive-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium border border-blue-700 disabled:opacity-50 shadow-lg"
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
