import React, { useState } from 'react';
import { Wallet, LogOut, CheckCircle, Loader2, AlertCircle, ExternalLink, Key } from 'lucide-react';

export function WalletConnect({ 
  publicKey, 
  isConnected, 
  isConnecting,
  error,
  freighterAvailable,
  manualMode,
  onConnect, 
  onDisconnect,
  onConnectManual 
}) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
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
        <div className="text-red-600 text-sm flex items-center gap-1 mr-2 max-w-xs">
          <AlertCircle size={16} />
          <span className="hidden sm:inline truncate">{error}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
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
        
        {!freighterAvailable && (
          <a
            href="https://www.freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
            title="Get Freighter wallet"
          >
            <ExternalLink size={12} />
            Get Freighter
          </a>
        )}
      </div>
    </div>
  );
}
