import React, { useState } from 'react';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { useAPI } from '../../hooks/useAPI';
import { Shield, Coins, CheckCircle, AlertCircle, Star, MapPin } from 'lucide-react';

export function AuditorRegistration({ onRegistrationSuccess }) {
  const { publicKey, isConnected } = useStellarWallet();
  const { stakeAsAuditor, loading } = useAPI();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    geoRegion: 'Sidama',
    stakeAmount: 500,
  });
  const [error, setError] = useState(null);

  const handleStake = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      await stakeAsAuditor({
        auditor: publicKey,
        amount: formData.stakeAmount,
        geoRegion: formData.geoRegion,
        name: formData.name,
        email: formData.email,
      });
      setStep(3); // Success
      // Redirect to auditor dashboard after 2 seconds
      setTimeout(() => {
        onRegistrationSuccess();
      }, 2000);
    } catch (err) {
      console.error('Staking failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to stake. Please try again.');
    }
  };

  const regions = [
    'Sidama',
    'Yirgacheffe',
    'Jimma',
    'Harrar',
    'Addis Ababa',
    'Hawassa',
    'Bahir Dar',
    'Dire Dawa',
  ];

  // Step 1: Information
  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-army-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-army-100 rounded-full flex items-center justify-center">
            <Shield className="text-army-700" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-army-800">Become an Auditor</h2>
            <p className="text-army-600">Step 1 of 2: Your Information</p>
          </div>
        </div>

        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-yellow-800 text-sm">Please connect your Stellar wallet to continue.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
              placeholder="e.g., Abebe Kebede"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
              placeholder="auditor@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Primary Region *
              </span>
            </label>
            <select
              value={formData.geoRegion}
              onChange={(e) => setFormData(prev => ({ ...prev, geoRegion: e.target.value }))}
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <p className="text-xs text-army-500 mt-1">
              You'll be matched with factories in this region to reduce travel costs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!formData.name || !formData.email || !isConnected}
            className="w-full py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800 font-medium"
          >
            Continue to Staking
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Staking
  if (step === 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-army-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-army-100 rounded-full flex items-center justify-center">
            <Coins className="text-army-700" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-army-800">Stake XLM</h2>
            <p className="text-army-600">Step 2 of 2: Secure Your Position</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-army-50 rounded-lg p-6 mb-6 border border-army-200">
          <h3 className="font-semibold text-army-800 mb-4">Staking Requirements</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded border border-army-200">
              <span className="text-army-700">Minimum Stake</span>
              <span className="font-bold text-army-800">500 XLM</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded border border-army-200">
              <span className="text-army-700">Your Wallet</span>
              <span className="font-mono text-sm text-army-800">{publicKey?.slice(0, 12)}...</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Why stake?</strong> Your stake ensures accountability and quality. 
              You can unstake after 30 days if you choose to leave the network.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 border border-army-200">
          <h4 className="font-medium text-army-800 mb-3">Auditor Benefits</h4>
          <ul className="space-y-2 text-sm text-army-600">
            <li className="flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              Earn 10 XLM per audit (more for Elite tier)
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-army-500" />
              Geographic matching reduces travel costs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Build reputation to unlock higher earnings
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 py-3 bg-army-50 text-army-700 rounded-lg hover:bg-army-100 transition-colors border-2 border-army-300 font-medium"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleStake}
            disabled={loading}
            className="flex-1 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800 font-medium"
          >
            {loading ? 'Processing...' : `Stake ${formData.stakeAmount} XLM`}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="text-green-600" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-army-800 mb-2">
        Welcome to the Auditor Network!
      </h2>
      <p className="text-army-600 mb-4">
        You have successfully staked {formData.stakeAmount} XLM and joined the FairChain auditor network.
      </p>
      <p className="text-sm text-army-500">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
