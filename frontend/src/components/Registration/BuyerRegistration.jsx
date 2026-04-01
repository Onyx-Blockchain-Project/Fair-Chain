import React, { useState } from 'react';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { Users, CheckCircle, AlertCircle, Building2, Mail, User } from 'lucide-react';

export function BuyerRegistration({ onRegistrationSuccess }) {
  const { publicKey, isConnected } = useStellarWallet();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    productInterest: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.companyName || !formData.contactName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate API call - buyers don't need backend registration, just wallet connection
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Redirect to buyer portal after 2 seconds
      setTimeout(() => {
        onRegistrationSuccess();
      }, 2000);
    }, 1500);
  };

  const productTypes = [
    { value: '', label: 'Select product type' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'all', label: 'All Products' },
  ];

  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-army-800 mb-2">
          Welcome to FairChain!
        </h2>
        <p className="text-army-600 mb-4">
          You are now registered as a buyer. Start exploring verified Ethiopian suppliers.
        </p>
        <p className="text-sm text-army-500">
          Redirecting to buyer portal...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 border border-army-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-army-100 rounded-full flex items-center justify-center">
          <Users className="text-army-700" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-army-800">Register as Buyer</h2>
          <p className="text-army-600">Create your buyer profile to connect with verified suppliers</p>
        </div>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-600" size={20} />
          <p className="text-yellow-800 text-sm">Please connect your Stellar wallet to register.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            <span className="flex items-center gap-2">
              <Building2 size={16} />
              Company Name *
            </span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            placeholder="e.g., Global Coffee Imports Ltd"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            <span className="flex items-center gap-2">
              <User size={16} />
              Contact Person *
            </span>
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            placeholder="e.g., John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            <span className="flex items-center gap-2">
              <Mail size={16} />
              Email Address *
            </span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            placeholder="buyer@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            Product Interest
          </label>
          <select
            value={formData.productInterest}
            onChange={(e) => setFormData(prev => ({ ...prev, productInterest: e.target.value }))}
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
          >
            {productTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-army-50 rounded-lg p-4 border border-army-200">
          <h4 className="font-medium text-army-800 mb-2">Buyer Benefits</h4>
          <ul className="space-y-2 text-sm text-army-600">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <span>Access verified Ethiopian suppliers with compliance scores</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <span>View immutable audit history on the blockchain</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <span>Direct contact with factory owners</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <span>Free registration - no fees to browse suppliers</span>
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="w-full py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800 font-medium"
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </button>

        <p className="text-xs text-army-500 text-center">
          Your wallet address {publicKey ? `(${publicKey.slice(0, 8)}...)` : ''} will be used as your unique buyer identifier.
        </p>
      </form>
    </div>
  );
}
