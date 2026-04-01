import React, { useState, useEffect } from 'react';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { useAPI } from '../../hooks/useAPI';
import { TradeFinanceApplication } from '../TradeFinance/TradeFinanceApplication';
import { LoanStatus } from '../TradeFinance/LoanStatus';
import { 
  Factory, 
  Star, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText, 
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Package,
  DollarSign
} from 'lucide-react';

export function FactoryDashboard() {
  const { publicKey, isConnected } = useStellarWallet();
  const { getFactoryDashboard, updateContactStatus, loading } = useAPI();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [tradeFinanceView, setTradeFinanceView] = useState('status'); // 'status' or 'application'

  useEffect(() => {
    if (isConnected && publicKey) {
      loadDashboard();
    }
  }, [isConnected, publicKey]);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await getFactoryDashboard(publicKey);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    }
  };

  const handleContactStatusUpdate = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus);
      // Refresh dashboard
      await loadDashboard();
      setSelectedContact(null);
    } catch (err) {
      console.error('Failed to update contact status:', err);
      alert('Failed to update contact status. Please try again.');
    }
  };

  const getComplianceBadge = (score) => {
    if (score >= 80) return { color: 'green', text: 'Highly Compliant', icon: CheckCircle };
    if (score >= 60) return { color: 'yellow', text: 'Compliant', icon: CheckCircle };
    if (score >= 40) return { color: 'orange', text: 'Needs Improvement', icon: AlertCircle };
    return { color: 'red', text: 'Non-Compliant', icon: XCircle };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="text-green-500" size={20} />;
    if (trend < 0) return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-500" size={20} />;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <Factory className="mx-auto mb-4 text-army-400" size={48} />
          <h2 className="text-xl font-bold text-army-800 mb-2">Factory Dashboard</h2>
          <p className="text-army-600 mb-4">Please connect your Stellar wallet to view your factory dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading && !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <div className="animate-spin w-8 h-8 border-4 border-army-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-army-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <AlertCircle className="mx-auto mb-4 text-army-400" size={48} />
          <h2 className="text-xl font-bold text-army-800 mb-2">No Factory Found</h2>
          <p className="text-army-600 mb-4">
            No factory profile found for this wallet address. Please register your factory first.
          </p>
        </div>
      </div>
    );
  }

  const { factory, reputation, audits, contacts, stats } = dashboardData;
  const complianceBadge = getComplianceBadge(reputation?.total_score || 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-army-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-army-800 mb-1">{factory.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-army-600">
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {factory.location}
              </span>
              <span className="flex items-center gap-1">
                <Package size={16} />
                {factory.product_type}
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {factory.employee_count} employees
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Registered {new Date(factory.registered_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {reputation && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                complianceBadge.color === 'green' ? 'bg-green-50 border-green-200 text-green-800' :
                complianceBadge.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                complianceBadge.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                <complianceBadge.icon size={18} />
                <span className="font-medium">{reputation.total_score}/100 - {complianceBadge.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-army-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-army-800">{stats.total_audits}</div>
            <div className="text-sm text-army-500">Total Audits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-army-800">{stats.average_score}</div>
            <div className="text-sm text-army-500">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-army-800">{contacts.total}</div>
            <div className="text-sm text-army-500">Contact Requests</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-army-800">
              {getTrendIcon(stats.compliance_trend)}
            </div>
            <div className="text-sm text-army-500">Compliance Trend</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'audits'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          Audit History ({audits.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          Contacts ({contacts.total})
          {contacts.pending > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {contacts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('trade-finance')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'trade-finance'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          Trade Finance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Reputation Breakdown */}
          {reputation && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
              <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
                <Star className="text-army-600" size={20} />
                Reputation Score Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="text-sm text-army-600 mb-1">Auditor Reputation</div>
                  <div className="text-2xl font-bold text-army-800">{reputation.auditor_reputation_component}%</div>
                </div>
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="text-sm text-army-600 mb-1">Evidence Depth</div>
                  <div className="text-2xl font-bold text-army-800">{reputation.evidence_depth_component}%</div>
                </div>
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="text-sm text-army-600 mb-1">Recency</div>
                  <div className="text-2xl font-bold text-army-800">{reputation.recency_component}%</div>
                </div>
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="text-sm text-army-600 mb-1">Category Coverage</div>
                  <div className="text-2xl font-bold text-army-800">{reputation.category_coverage_component}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Audits */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
              <FileText className="text-army-600" size={20} />
              Recent Audits
            </h3>
            {audits.length === 0 ? (
              <p className="text-army-500 text-center py-4">No audits completed yet.</p>
            ) : (
              <div className="space-y-3">
                {audits.slice(0, 3).map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 bg-army-50 rounded-lg border border-army-200">
                    <div>
                      <div className="font-medium text-army-800">
                        Audit by {audit.auditor?.name || 'Unknown Auditor'}
                      </div>
                      <div className="text-sm text-army-500">
                        {new Date(audit.submitted_at).toLocaleDateString()} • {audit.status}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-army-800">
                      {audit.overall_score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contact Requests */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
              <Mail className="text-army-600" size={20} />
              Recent Contact Requests
            </h3>
            {contacts.recent.length === 0 ? (
              <p className="text-army-500 text-center py-4">No contact requests yet.</p>
            ) : (
              <div className="space-y-3">
                {contacts.recent.slice(0, 3).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-army-50 rounded-lg border border-army-200">
                    <div>
                      <div className="font-medium text-army-800">{contact.subject}</div>
                      <div className="text-sm text-army-500">
                        From {contact.buyer_address.slice(0, 8)}... • {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contact.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      contact.status === 'RESPONDED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <h3 className="text-lg font-semibold text-army-800 mb-4">Audit History</h3>
          {audits.length === 0 ? (
            <p className="text-army-500 text-center py-8">No audits completed yet.</p>
          ) : (
            <div className="space-y-4">
              {audits.map((audit) => (
                <AuditDetail key={audit.id} audit={audit} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <h3 className="text-lg font-semibold text-army-800 mb-4">Contact Requests</h3>
          {contacts.total === 0 ? (
            <p className="text-army-500 text-center py-8">No contact requests yet.</p>
          ) : (
            <div className="space-y-4">
              {contacts.recent.map((contact) => (
                <div key={contact.id} className="border border-army-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-army-800">{contact.subject}</h4>
                      <p className="text-sm text-army-500">
                        From: {contact.buyer_address.slice(0, 12)}...{contact.buyer_address.slice(-8)}
                        {contact.buyer_company && ` • ${contact.buyer_company}`}
                      </p>
                      <p className="text-sm text-army-500">
                        {new Date(contact.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contact.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      contact.status === 'RESPONDED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-army-600 text-sm mb-3">{contact.message}</p>
                  {contact.buyer_email && (
                    <p className="text-sm text-army-500 mb-3">
                      Contact Email: {contact.buyer_email}
                    </p>
                  )}
                  {contact.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContactStatusUpdate(contact.id, 'RESPONDED')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Mark Responded
                      </button>
                      <button
                        onClick={() => handleContactStatusUpdate(contact.id, 'CLOSED')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trade-finance' && (
        <div className="space-y-6">
          {/* Trade Finance Navigation */}
          <div className="bg-white rounded-lg shadow-md p-4 border border-army-200">
            <div className="flex gap-4">
              <button
                onClick={() => setTradeFinanceView('status')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tradeFinanceView === 'status'
                    ? 'bg-army-700 text-white'
                    : 'bg-army-50 text-army-700 hover:bg-army-100 border border-army-300'
                }`}
              >
                <DollarSign className="inline mr-2" size={16} />
                Loan Status
              </button>
              <button
                onClick={() => setTradeFinanceView('application')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tradeFinanceView === 'application'
                    ? 'bg-army-700 text-white'
                    : 'bg-army-50 text-army-700 hover:bg-army-100 border border-army-300'
                }`}
              >
                <FileText className="inline mr-2" size={16} />
                Apply for Loan
              </button>
            </div>
          </div>

          {/* Trade Finance Content */}
          {tradeFinanceView === 'status' ? <LoanStatus /> : <TradeFinanceApplication />}
        </div>
      )}
    </div>
  );
}

// Audit Detail Component
function AuditDetail({ audit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-army-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-army-50 hover:bg-army-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-army-800">{audit.overall_score}</div>
          <div className="text-left">
            <div className="font-medium text-army-800">
              Audit by {audit.auditor?.name || 'Unknown Auditor'}
            </div>
            <div className="text-sm text-army-500">
              {new Date(audit.submitted_at).toLocaleDateString()} • {audit.status}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {expanded && (
        <div className="p-4 border-t border-army-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-army-800">{audit.labor_score}</div>
              <div className="text-xs text-army-500">Labor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-army-800">{audit.environmental_score}</div>
              <div className="text-xs text-army-500">Environmental</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-army-800">{audit.quality_score}</div>
              <div className="text-xs text-army-500">Quality</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-army-800">{audit.safety_score}</div>
              <div className="text-xs text-army-500">Safety</div>
            </div>
          </div>
          {audit.notes && (
            <div className="mb-4">
              <h5 className="font-medium text-army-700 mb-1">Auditor Notes:</h5>
              <p className="text-sm text-army-600">{audit.notes}</p>
            </div>
          )}
          {audit.evidence_urls && audit.evidence_urls.length > 0 && (
            <div>
              <h5 className="font-medium text-army-700 mb-2">Evidence:</h5>
              <div className="flex flex-wrap gap-2">
                {audit.evidence_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-army-700 hover:text-army-900 underline"
                  >
                    Evidence {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
