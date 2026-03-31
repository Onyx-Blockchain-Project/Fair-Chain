import React, { useState, useEffect } from 'react';
import { Wallet, ArrowLeft, ExternalLink, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';

export function WalletConnectionPage({ onConnect, onBack, onConnectManual, isConnected }) {
  const [manualAddress, setManualAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [freighterDetected, setFreighterDetected] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-redirect if already connected
  useEffect(() => {
    if (isConnected) {
      setSuccess('✅ Already connected! Redirecting...');
      const timer = setTimeout(() => {
        onBack();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onBack]);

  // Check for Freighter on mount
  useEffect(() => {
    const checkFreighter = () => {
      const api = window.freighterApi || window.freighter || window.stellar;
      setFreighterDetected(!!api);
    };
    
    checkFreighter();
    
    // Listen for extension injection
    const interval = setInterval(checkFreighter, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFreighterConnect = async () => {
    setIsConnecting(true);
    setError('');
    setSuccess('');
    
    try {
      await onConnect();
      setSuccess('✅ Wallet connected successfully!');
      // Don't auto-redirect, let user see the success message
    } catch (err) {
      console.error('Freighter connection failed:', err);
      
      if (err.message.includes('MANUAL_FALLBACK_REQUIRED')) {
        setError('Freighter not detected. Please install it or use manual entry below.');
      } else if (err.message.includes('rejected') || err.message.includes('denied')) {
        setError('Connection was rejected. Please try again and approve the connection.');
      } else {
        setError('Failed to connect. Please try again or use manual entry.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualConnect = () => {
    setError('');
    setSuccess('');
    
    if (!manualAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (manualAddress.length !== 56) {
      setError('Wallet address must be 56 characters long');
      return;
    }
    
    if (!manualAddress.startsWith('G')) {
      setError('Wallet address must start with "G"');
      return;
    }
    
    try {
      onConnectManual(manualAddress);
      setSuccess('✅ Wallet connected successfully!');
      // Don't auto-redirect, let user see the success message
    } catch (err) {
      setError('Failed to connect with this address');
    }
  };

  const installFreighter = () => {
    window.open('https://www.freighter.app', '_blank');
  };

  const copyTestAddress = () => {
    const testAddress = 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H';
    navigator.clipboard.writeText(testAddress);
    setManualAddress(testAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-olive-400 hover:text-olive-300 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-gradient-to-b from-olive-800 to-olive-900 rounded-3xl p-8 border border-olive-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-olive-500">
              <Wallet size={32} className="text-olive-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Connect Wallet
            </h1>
            <p className="text-olive-200">
              Access FairChain with your Stellar wallet
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-200 text-sm">{success}</span>
              </div>
              <button
                onClick={onBack}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
              >
                Continue to App
              </button>
            </div>
          )}

          {/* Freighter Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${freighterDetected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-olive-300 text-sm">
                {freighterDetected ? 'Freighter detected' : 'Freighter not detected'}
              </span>
            </div>
            
            <button
              onClick={handleFreighterConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-semibold text-lg disabled:opacity-50 border-2 border-olive-500 shadow-lg"
            >
              {isConnecting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Wallet size={24} />
              )}
              {isConnecting ? 'Connecting...' : 'Connect Freighter'}
            </button>
          </div>

          {/* Download Link */}
          {!freighterDetected && (
            <div className="mb-6">
              <button
                onClick={installFreighter}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-olive-300 hover:text-white transition-colors text-sm border border-olive-600 rounded-lg hover:bg-olive-800/30"
              >
                <ExternalLink size={16} />
                Install Freighter Extension
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-olive-700"></div>
            <span className="text-olive-400 text-sm">or</span>
            <div className="flex-1 h-px bg-olive-700"></div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <label className="block text-olive-300 text-sm font-medium mb-2">
              Enter Wallet Address Manually
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value.toUpperCase())}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-3 bg-black border border-olive-600 rounded-xl text-white placeholder-olive-500 focus:ring-2 focus:ring-olive-400 focus:border-transparent font-mono text-sm"
                disabled={isConnecting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className={`text-xs ${manualAddress.length === 56 && manualAddress.startsWith('G') ? 'text-green-400' : 'text-olive-500'}`}>
                  {manualAddress.length}/56
                </span>
              </div>
            </div>
            
            <button
              onClick={handleManualConnect}
              disabled={!manualAddress || manualAddress.length !== 56 || !manualAddress.startsWith('G') || isConnecting}
              className="w-full px-6 py-3 bg-olive-600 text-white rounded-xl hover:bg-olive-500 transition-colors font-medium disabled:opacity-50 border border-olive-500 disabled:cursor-not-allowed"
            >
              Connect with Address
            </button>
            
            <button
              onClick={copyTestAddress}
              className="w-full px-6 py-2 text-olive-400 hover:text-olive-300 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Use Test Address'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-olive-900/30 rounded-xl border border-olive-800">
            <div className="text-olive-400 font-bold text-lg mb-1">Secure</div>
            <div className="text-gray-500 text-sm">Blockchain verified</div>
          </div>
          <div className="p-4 bg-olive-900/30 rounded-xl border border-olive-800">
            <div className="text-olive-400 font-bold text-lg mb-1">Fast</div>
            <div className="text-gray-500 text-sm">Instant connection</div>
          </div>
          <div className="p-4 bg-olive-900/30 rounded-xl border border-olive-800">
            <div className="text-olive-400 font-bold text-lg mb-1">Free</div>
            <div className="text-gray-500 text-sm">No fees to connect</div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-olive-900/20 rounded-xl border border-olive-800">
          <h3 className="text-white font-semibold mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-olive-300">
            <p>• <strong>Freighter:</strong> Install the browser extension, then click "Connect Freighter"</p>
            <p>• <strong>Manual:</strong> Enter any Stellar wallet address (starts with "G", 56 characters)</p>
            <p>• <strong>Test:</strong> Use any Stellar testnet address to try the app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
