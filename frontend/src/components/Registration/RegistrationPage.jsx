import React, { useState } from 'react';
import { FactoryRegistration } from '../FactoryForm/FactoryRegistration';
import { AuditorRegistration } from './AuditorRegistration';
import { BuyerRegistration } from './BuyerRegistration';
import { Factory, Shield, Users, ArrowLeft } from 'lucide-react';

export function RegistrationPage({ onRegistrationComplete }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRegistrationSuccess = (role) => {
    // Redirect to appropriate dashboard after registration
    onRegistrationComplete(role);
  };

  if (selectedRole === 'factory') {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-4 flex items-center gap-2 text-army-600 hover:text-army-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to role selection
        </button>
        <FactoryRegistration 
          onRegistrationSuccess={() => handleRegistrationSuccess('factory-dashboard')} 
        />
      </div>
    );
  }

  if (selectedRole === 'auditor') {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-4 flex items-center gap-2 text-army-600 hover:text-army-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to role selection
        </button>
        <AuditorRegistration 
          onRegistrationSuccess={() => handleRegistrationSuccess('auditor')} 
        />
      </div>
    );
  }

  if (selectedRole === 'buyer') {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-4 flex items-center gap-2 text-army-600 hover:text-army-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to role selection
        </button>
        <BuyerRegistration 
          onRegistrationSuccess={() => handleRegistrationSuccess('buyer')} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-army-800 mb-2">Join FairChain</h2>
        <p className="text-army-600">Choose your role to get started with Ethiopia's SME compliance verification platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Factory Registration Card */}
        <button
          onClick={() => setSelectedRole('factory')}
          className="bg-white rounded-lg shadow-md p-6 border-2 border-army-200 hover:border-army-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-14 h-14 bg-army-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-army-200 transition-colors">
            <Factory className="text-army-700" size={28} />
          </div>
          <h3 className="text-xl font-bold text-army-800 mb-2">Register as Factory</h3>
          <p className="text-sm text-army-600 mb-4">
            Create your factory profile, get compliance verified, and connect with international buyers.
          </p>
          <ul className="text-sm text-army-500 space-y-1">
            <li>• Create on-chain factory profile</li>
            <li>• Get compliance audits</li>
            <li>• Access trade finance</li>
            <li>• Connect with buyers</li>
          </ul>
        </button>

        {/* Auditor Registration Card */}
        <button
          onClick={() => setSelectedRole('auditor')}
          className="bg-white rounded-lg shadow-md p-6 border-2 border-army-200 hover:border-army-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-14 h-14 bg-army-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-army-200 transition-colors">
            <Shield className="text-army-700" size={28} />
          </div>
          <h3 className="text-xl font-bold text-army-800 mb-2">Register as Auditor</h3>
          <p className="text-sm text-army-600 mb-4">
            Become a verified auditor, conduct factory inspections, and earn fees for each audit.
          </p>
          <ul className="text-sm text-army-500 space-y-1">
            <li>• Stake XLM to join network</li>
            <li>• Earn audit fees</li>
            <li>• Build reputation score</li>
            <li>• Geographic matching</li>
          </ul>
        </button>

        {/* Buyer Registration Card */}
        <button
          onClick={() => setSelectedRole('buyer')}
          className="bg-white rounded-lg shadow-md p-6 border-2 border-army-200 hover:border-army-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-14 h-14 bg-army-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-army-200 transition-colors">
            <Users className="text-army-700" size={28} />
          </div>
          <h3 className="text-xl font-bold text-army-800 mb-2">Register as Buyer</h3>
          <p className="text-sm text-army-600 mb-4">
            Discover verified Ethiopian suppliers with cryptographically-proven compliance scores.
          </p>
          <ul className="text-sm text-army-500 space-y-1">
            <li>• Search verified factories</li>
            <li>• View compliance scores</li>
            <li>• Contact suppliers</li>
            <li>• Track audit history</li>
          </ul>
        </button>
      </div>

      <div className="mt-8 bg-army-50 rounded-lg p-6 border border-army-200">
        <h4 className="font-semibold text-army-800 mb-2">Why Join FairChain?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-army-600">
          <div>
            <strong className="text-army-800">For Factories:</strong> Prove compliance, access trade finance, and connect with global buyers
          </div>
          <div>
            <strong className="text-army-800">For Auditors:</strong> Earn income conducting verifiable audits with blockchain-backed evidence
          </div>
          <div>
            <strong className="text-army-800">For Buyers:</strong> Source from verified suppliers with immutable compliance records
          </div>
        </div>
      </div>
    </div>
  );
}
