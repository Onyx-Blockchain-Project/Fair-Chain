import React, { useState } from 'react';
import './App.css';
import { WalletConnect } from './components/WalletConnect';
import { WalletConnectionPage } from './components/WalletConnectionPage';
import { FactoryRegistration } from './components/FactoryForm/FactoryRegistration';
import { AuditorDashboard } from './components/AuditorDashboard/AuditorDashboard';
import { BuyerPortal } from './components/BuyerPortal/BuyerPortal';
import { SDGDashboard } from './components/SDGDashboard/SDGDashboard';
import { useStellarWallet } from './hooks/useStellarWallet';
import { Factory, Shield, Users, Globe, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showWalletPage, setShowWalletPage] = useState(false);
  const { publicKey, isConnected, isConnecting, error, freighterAvailable, manualMode, detectionComplete, connect, disconnect, connectManual } = useStellarWallet();

  const renderContent = () => {
    if (showWalletPage) {
      return (
        <WalletConnectionPage 
          onConnect={connect}
          onConnectManual={connectManual}
          onBack={() => setShowWalletPage(false)}
          isConnected={isConnected}
        />
      );
    }

    switch (activeTab) {
      case 'factory':
        return <FactoryRegistration />;
      case 'auditor':
        return <AuditorDashboard />;
      case 'buyer':
        return <BuyerPortal />;
      case 'sdg':
        return <SDGDashboard />;
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-army-700 mb-4">
                FairChain
              </h1>
              <p className="text-xl text-army-600 mb-8">
                Ethiopia SME Compliance Verification on Stellar
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => setActiveTab('factory')}
                  className="flex items-center gap-2 px-6 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors border-2 border-army-900"
                >
                  <Factory size={20} />
                  Register Factory
                </button>
                <button
                  onClick={() => setActiveTab('auditor')}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-200 text-white rounded-lg hover:bg-dark-300 transition-colors border-2 border-dark-400"
                >
                  <Shield size={20} />
                  Auditor Portal
                </button>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-200 text-white rounded-lg hover:bg-dark-300 transition-colors border-2 border-dark-400"
                >
                  <Users size={20} />
                  Buyer Portal
                </button>
                <button
                  onClick={() => setActiveTab('sdg')}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-200 text-white rounded-lg hover:bg-dark-300 transition-colors border-2 border-dark-400"
                >
                  <Globe size={20} />
                  SDG Dashboard
                </button>
              </div>
            </div>

            <div className="text-center mt-12">
              <h2 className="text-2xl font-bold text-army-700 mb-4">
                Ethiopia SME Compliance Verification on Stellar
              </h2>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-army-50">
      <nav className="bg-dark-100 shadow-md border-b-2 border-army-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2"
              >
                <Factory className="text-army-400" size={28} />
                <span className="text-xl font-bold text-white">FairChain</span>
              </button>
              
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('factory')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'factory' 
                      ? 'text-white bg-army-700' 
                      : 'text-army-300 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  Factory
                </button>
                <button
                  onClick={() => setActiveTab('auditor')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'auditor' 
                      ? 'text-white bg-dark-300' 
                      : 'text-army-300 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  Auditor
                </button>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'buyer' 
                      ? 'text-white bg-army-600' 
                      : 'text-army-300 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => setActiveTab('sdg')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'sdg' 
                      ? 'text-white bg-dark-200' 
                      : 'text-army-300 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  Impact
                </button>
              </div>
            </div>

            <div className="flex items-center">
              {!showWalletPage && (
                <button
                  onClick={() => setShowWalletPage(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-olive-700 text-white rounded-lg hover:bg-olive-800 transition-colors font-semibold border border-olive-900 shadow-lg"
                >
                  <Factory size={20} />
                  Connect Wallet
                </button>
              )}
              
              {showWalletPage && (
                <WalletConnect 
                  publicKey={publicKey}
                  isConnected={isConnected}
                  isConnecting={isConnecting}
                  error={error}
                  freighterAvailable={freighterAvailable}
                  manualMode={manualMode}
                  detectionComplete={detectionComplete}
                  onConnect={connect}
                  onDisconnect={disconnect}
                  onConnectManual={connectManual}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
