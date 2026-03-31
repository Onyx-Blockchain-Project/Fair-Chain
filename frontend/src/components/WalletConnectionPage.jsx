import React, { useState } from 'react';
import { Wallet, ArrowLeft, ExternalLink } from 'lucide-react';

export function WalletConnectionPage({ onConnect, onBack, onConnectManual }) {
  const [manualAddress, setManualAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleFreighterConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Freighter connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualConnect = () => {
    if (manualAddress.length !== 56 || !manualAddress.startsWith('G')) {
      alert('Please enter a valid Stellar wallet address (starts with G, 56 characters)');
      return;
    }
    onConnectManual(manualAddress);
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

          {/* Connect Button */}
          <button
            onClick={handleFreighterConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-semibold text-lg disabled:opacity-50 border-2 border-olive-500 shadow-lg mb-4"
          >
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Wallet size={24} />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Freighter'}
          </button>

          {/* Download Link */}
          <a
            href="https://www.freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-olive-300 hover:text-white transition-colors text-sm"
          >
            <ExternalLink size={16} />
            Don't have Freighter? Install here
          </a>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-olive-700"></div>
            <span className="text-olive-400 text-sm">or</span>
            <div className="flex-1 h-px bg-olive-700"></div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-3">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value.toUpperCase())}
              placeholder="Enter wallet address (G...)"
              className="w-full px-4 py-3 bg-black border border-olive-600 rounded-xl text-white placeholder-olive-500 focus:ring-2 focus:ring-olive-400 focus:border-transparent"
            />
            <button
              onClick={handleManualConnect}
              disabled={!manualAddress || manualAddress.length !== 56 || !manualAddress.startsWith('G')}
              className="w-full px-6 py-3 bg-olive-600 text-white rounded-xl hover:bg-olive-500 transition-colors font-medium disabled:opacity-50 border border-olive-500"
            >
              Connect with Address
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-olive-400 font-bold text-lg mb-1">Secure</div>
            <div className="text-gray-500 text-sm">Blockchain verified</div>
          </div>
          <div className="p-4">
            <div className="text-olive-400 font-bold text-lg mb-1">Fast</div>
            <div className="text-gray-500 text-sm">Instant connection</div>
          </div>
          <div className="p-4">
            <div className="text-olive-400 font-bold text-lg mb-1">Free</div>
            <div className="text-gray-500 text-sm">No fees to connect</div>
          </div>
        </div>
      </div>
    </div>
  );
}
