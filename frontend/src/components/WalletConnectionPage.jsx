import React, { useState } from 'react';
import { Wallet, ArrowLeft, ExternalLink, CheckCircle, Copy, Shield } from 'lucide-react';

export function WalletConnectionPage({ onConnect, onBack }) {
  const [manualAddress, setManualAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyTestAddress = () => {
    const testAddress = 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H';
    navigator.clipboard.writeText(testAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to App
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to connect your Stellar wallet to FairChain
            </p>
          </div>
        </div>

        {/* Wallet Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Freighter Option */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Freighter Wallet</h2>
                <p className="text-gray-600">Most popular Stellar wallet</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleFreighterConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 shadow-lg"
              >
                {isConnecting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Wallet size={24} />
                )}
                {isConnecting ? 'Connecting...' : 'Connect Freighter'}
              </button>
              
              <a
                href="https://www.freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg border border-gray-300"
              >
                <ExternalLink size={20} />
                Download Freighter
              </a>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Why Freighter?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Most trusted Stellar wallet</li>
                <li>• Easy to use browser extension</li>
                <li>• Secure key management</li>
                <li>• One-click transactions</li>
              </ul>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manual Entry</h2>
                <p className="text-gray-600">Enter wallet address directly</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stellar Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value.toUpperCase())}
                    placeholder="G..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <button
                onClick={handleManualConnect}
                disabled={!manualAddress || manualAddress.length !== 56 || !manualAddress.startsWith('G')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg disabled:opacity-50 shadow-lg"
              >
                <Shield size={24} />
                Connect Wallet
              </button>
              
              <button
                onClick={copyTestAddress}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg border border-gray-300"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copied ? 'Test Address Copied!' : 'Use Test Address'}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Manual Entry</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>• Use existing wallet address</li>
                <li>• No extension required</li>
                <li>• Works with any Stellar wallet</li>
                <li>• Quick demo testing available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🔧 Installation Help</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Click puzzle icon in toolbar</li>
                <li>• Find Freighter extension</li>
                <li>• Click "Add to browser"</li>
                <li>• Refresh this page</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🔑 Wallet Creation</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Install Freighter extension</li>
                <li>• Click extension icon</li>
                <li>• Choose "Create New Wallet"</li>
                <li>• Save your secret phrase</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Quick Start</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use "Use Test Address" button</li>
                <li>• Instant demo access</li>
                <li>• Test all features</li>
                <li>• No installation needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
