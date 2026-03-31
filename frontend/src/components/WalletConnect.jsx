import React from 'react';
import { Wallet, LogOut, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export function WalletConnect({ 
  publicKey, 
  isConnected, 
  isConnecting,
  error,
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
        <div className="flex items-center gap-2 px-4 py-2 bg-army-100 text-army-800 rounded-lg border border-army-300">
          <CheckCircle size={18} className="text-army-700" />
          <span className="font-medium">{truncateAddress(publicKey)}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="p-2 text-dark-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-red-600 text-sm flex items-center gap-1 mr-2">
          <AlertCircle size={16} />
          <span className="hidden sm:inline">{error}</span>
        </div>
      )}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800 disabled:opacity-50"
      >
        {isConnecting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Wallet size={20} />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
