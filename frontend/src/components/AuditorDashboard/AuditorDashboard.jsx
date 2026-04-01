import React, { useState, useCallback, useEffect } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import { useAPI } from '../../hooks/useAPI';
import { Shield, User, AlertCircle, Award, History } from 'lucide-react';

export function AuditorDashboard() {
  console.log('🚀 UPDATED AuditorDashboard component rendering - NEW VERSION');
  
  const { publicKey, isConnected } = useWalletContext();
  const { getAuditorDashboard, loading } = useAPI();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!isConnected || !publicKey) return;
    
    try {
      console.log('🔍 Loading auditor dashboard for:', publicKey);
      setError(null);
      const response = await getAuditorDashboard(publicKey);
      console.log('✅ Dashboard data loaded:', response);
      setDashboardData(response.data);
    } catch (err) {
      console.error('❌ Failed to load auditor dashboard:', err);
      setError('Failed to load dashboard. You may need to stake first to become an auditor.');
    }
  }, [publicKey, getAuditorDashboard, isConnected]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Auditor Dashboard</h3>
          <p className="text-gray-600">Please connect your wallet to view your auditor profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Not an Auditor Yet</h3>
          <p className="text-gray-600 mb-4">{error || 'You need to stake XLM to become a verified auditor.'}</p>
          <button
            onClick={() => setActiveView('stake')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Become an Auditor
          </button>
        </div>
      </div>
    );
  }

  const { auditor, audits, stats } = dashboardData;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield size={32} />
          Auditor Dashboard
        </h1>
        <p className="text-gray-600">Manage your audits and track your reputation</p>
      </div>

      {/* Auditor Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {auditor.name || `Auditor ${auditor.wallet_address?.slice(0, 8)}...`}
              </h3>
              <p className="text-sm text-gray-600">{auditor.geo_region || 'Sidama'} Region</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">{auditor.reputation_score || 0}</div>
            <div className="text-sm text-gray-500">Reputation Score</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total_audits || 0}</div>
          <div className="text-sm text-gray-500">Total Audits</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.verified_audits || 0}</div>
          <div className="text-sm text-gray-500">Verified</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.average_score || 0}</div>
          <div className="text-sm text-gray-500">Avg Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.estimated_earnings || 0}</div>
          <div className="text-sm text-gray-500">XLM Earned</div>
        </div>
      </div>

      {/* Recent Audits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <History size={20} />
          Recent Audits
        </h3>
        {(!audits || audits.length === 0) ? (
          <p className="text-gray-500 text-center py-4">No audits submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {audits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {audit.factory?.name || 'Unknown Factory'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {audit.compliance_category} • {new Date(audit.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{audit.overall_score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
