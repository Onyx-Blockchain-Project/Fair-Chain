import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, CheckCircle, Loader2, AlertCircle, ExternalLink, Key } from 'lucide-react';

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
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  
  // Auto-show manual input when fallback is needed
  useEffect(() => {
    if (error && error.includes('Please use the Manual button')) {
      setShowManualInput(true);
    }
  }, [error]);
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 ${manualMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-army-100 text-army-800 border-army-300'} rounded-lg border`}>
          <CheckCircle size={18} className={manualMode ? 'text-amber-700' : 'text-army-700'} />
          <span className="font-medium">{truncateAddress(publicKey)}</span>
          {manualMode && <Key size={14} className="text-amber-600" />}
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
      
      {!isConnected && detectionComplete && !freighterAvailable && (
        <div className="text-amber-600 text-sm flex items-center gap-1 mr-2 max-w-xs">
          <AlertCircle size={16} />
          <span className="hidden sm:inline">Freighter not detected - use Manual button</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {!showManualInput ? (
          <>
            <button
              onClick={() => {
                if (detectionComplete && !freighterAvailable) {
                  // Auto-show manual input if Freighter not detected
                  setShowManualInput(true);
                } else {
                  onConnect();
                }
              }}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800 disabled:opacity-50"
              title={detectionComplete && !freighterAvailable ? "Click to enter wallet address manually" : "Connect with Freighter"}
            >
              {isConnecting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Wallet size={20} />
              )}
              {isConnecting ? 'Connecting...' : !detectionComplete ? 'Detecting...' : detectionComplete && !freighterAvailable ? 'Enter Wallet' : 'Connect Wallet'}
            </button>
            
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium border border-amber-700"
              title="Enter wallet address manually (bypasses Freighter)"
            >
              <Key size={20} />
              Manual
            </button>
            
            {!freighterAvailable && detectionComplete && (
              <a
                href="https://www.freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
                title="Get Freighter wallet extension"
              >
                <ExternalLink size={12} />
                Get Freighter
              </a>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="G... (56 characters)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              style={{width: '300px'}}
            />
            <button
              onClick={() => {
                if (manualAddress.length === 56 && manualAddress.startsWith('G')) {
                  onConnectManual(manualAddress);
                  setShowManualInput(false);
                  setManualAddress('');
                }
              }}
              disabled={manualAddress.length !== 56 || !manualAddress.startsWith('G')}
              className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              Connect
            </button>
            <button
              onClick={() => {
                setShowManualInput(false);
                setManualAddress('');
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
