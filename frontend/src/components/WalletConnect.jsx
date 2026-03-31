import React, { useState, useEffect } from 'react';
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
  onConnectManual 
}) {
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  // Auto-show wallet options when Freighter not available
  useEffect(() => {
    if (detectionComplete && !freighterAvailable && !isConnected) {
      setShowWalletOptions(true);
    }
  }, [detectionComplete, freighterAvailable, isConnected]);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
          <CheckCircle size={18} className="text-green-700" />
          <span className="font-medium">{truncateAddress(publicKey)}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  if (showWalletOptions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => window.open('https://www.freighter.app', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Wallet size={20} />
            Create/Install Freighter Wallet
          </button>
          
          <div className="text-center text-gray-500 text-sm">or</div>
          
          <button
            onClick={() => {
              const testAddress = 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H';
              onConnectManual(testAddress);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <Wallet size={20} />
            Use Test Wallet (Demo)
          </button>
        </div>
        
        <button
          onClick={() => setShowWalletOptions(false)}
          className="mt-4 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (freighterAvailable) {
          onConnect();
        } else {
          setShowWalletOptions(true);
        }
      }}
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
