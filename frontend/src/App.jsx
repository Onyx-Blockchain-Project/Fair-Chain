import React, { useState } from 'react';
import './App.css';
import { WalletConnect } from './components/WalletConnect';
import { FactoryRegistration } from './components/FactoryForm/FactoryRegistration';
import { AuditorDashboard } from './components/AuditorDashboard/AuditorDashboard';
import { BuyerPortal } from './components/BuyerPortal/BuyerPortal';
import { SDGDashboard } from './components/SDGDashboard/SDGDashboard';
import { useStellarWallet } from './hooks/useStellarWallet';
import { Factory, Shield, Users, Globe, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { publicKey, isConnected, isConnecting, error, freighterAvailable, manualMode, detectionComplete, connect, disconnect, connectManual } = useStellarWallet();

  const renderContent = () => {
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
                  className="flex items-center gap-2 px-6 py-3 bg-army-600 text-white rounded-lg hover:bg-army-700 transition-colors border-2 border-army-800"
                >
                  <Users size={20} />
                  Buyer Portal
                </button>
                <button
                  onClick={() => setActiveTab('sdg')}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-100 text-white rounded-lg hover:bg-dark-200 transition-colors border-2 border-dark-300"
                >
                  <BarChart3 size={20} />
                  Impact Metrics
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-army-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-army-100 rounded-full">
                    <Factory className="text-army-700" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg text-army-800">Factory Onboarding</h3>
                </div>
                <p className="text-army-600">
                  Register your Ethiopian SME and receive a compliance-ready Stellar wallet
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dark-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-dark-100 rounded-full">
                    <Shield className="text-white" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg text-dark-100">Auditor Network</h3>
                </div>
                <p className="text-dark-200">
                  Staked auditors verify compliance with 10x cost reduction vs traditional audits
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-army-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-army-200 rounded-full">
                    <Globe className="text-army-800" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg text-army-800">Global Buyers</h3>
                </div>
                <p className="text-army-600">
                  Verify Ethiopian suppliers with cryptographically-proven compliance scores
                </p>
              </div>
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
