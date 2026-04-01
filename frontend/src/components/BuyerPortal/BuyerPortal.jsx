import React, { useState, useEffect } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useWalletContext } from '../../contexts/WalletContext';
import { Search, Filter, MapPin, Star, ExternalLink, CheckCircle, XCircle, Mail, Send, X } from 'lucide-react';

export function BuyerPortal() {
  const { getFactories, getReputationScore, createContactRequest, loading } = useAPI();
  const { publicKey, isConnected } = useWalletContext();
  const [factories, setFactories] = useState([]);
  const [filters, setFilters] = useState({
    productType: '',
    location: '',
    minScore: 0,
  });
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [reputationData, setReputationData] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    buyerEmail: '',
    buyerCompany: ''
  });
  const [contactStatus, setContactStatus] = useState(null);

  useEffect(() => {
    loadFactories();
  }, [filters]);

  const loadFactories = async () => {
    try {
      const data = await getFactories(filters);
      setFactories(data || []);
    } catch (err) {
      console.error('Failed to load factories:', err);
    }
  };

  const handleViewDetails = async (factory) => {
    setSelectedFactory(factory);
    setShowContactModal(false);
    setContactStatus(null);
    try {
      const repData = await getReputationScore(factory.wallet_address);
      setReputationData(repData);
    } catch (err) {
      console.error('Failed to load reputation:', err);
      setReputationData(null);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!contactForm.subject || !contactForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setContactStatus('sending');
      await createContactRequest({
        buyerAddress: publicKey,
        factoryAddress: selectedFactory.wallet_address,
        subject: contactForm.subject,
        message: contactForm.message,
        buyerEmail: contactForm.buyerEmail,
        buyerCompany: contactForm.buyerCompany
      });
      setContactStatus('success');
      setTimeout(() => {
        setShowContactModal(false);
        setContactForm({ subject: '', message: '', buyerEmail: '', buyerCompany: '' });
        setContactStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to send contact request:', err);
      setContactStatus('error');
    }
  };

  const getComplianceBadge = (score) => {
    if (score >= 80) return { color: 'green', text: 'Highly Compliant' };
    if (score >= 60) return { color: 'yellow', text: 'Compliant' };
    if (score >= 40) return { color: 'orange', text: 'Needs Improvement' };
    return { color: 'red', text: 'Non-Compliant' };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-army-800 mb-2">
          Find Verified Suppliers
        </h2>
        <p className="text-army-600">
          Search Ethiopian factories with cryptographically-proven compliance scores.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-army-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-army-700 mb-1">
              Product Type
            </label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            >
              <option value="">All Types</option>
              <option value="coffee">Coffee</option>
              <option value="textiles">Textiles</option>
              <option value="leather">Leather Goods</option>
              <option value="agriculture">Agriculture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-1">
              Region
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              <option value="Sidama">Sidama</option>
              <option value="Yirgacheffe">Yirgacheffe</option>
              <option value="Jimma">Jimma</option>
              <option value="Harrar">Harrar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Score: {filters.minScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadFactories}
              className="w-full flex items-center justify-center gap-2 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors border border-army-800"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-army-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-army-600">Loading factories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {factories.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
                <Filter className="mx-auto mb-4 text-army-400" size={48} />
                <p className="text-army-600">No factories match your criteria.</p>
              </div>
            ) : (
              factories.map((factory) => {
                const badge = getComplianceBadge(factory.score || 0);
                return (
                  <div
                    key={factory.wallet_address}
                    onClick={() => handleViewDetails(factory)}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-army-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-army-800">
                          {factory.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-army-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {factory.location}
                          </span>
                          <span className="capitalize">{factory.product_type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-army-100 text-army-800 border border-army-300`}>
                          {factory.score >= 60 ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Score: {factory.score || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-army-600">
                        <span className="font-medium">{factory.employee_count}</span> employees
                        {factory.audit_count > 0 && (
                          <span className="ml-4">
                            <span className="font-medium">{factory.audit_count}</span> audits
                          </span>
                        )}
                      </div>
                      <button className="flex items-center gap-1 text-army-700 hover:text-army-900 text-sm font-medium">
                        View Details
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div>
            {selectedFactory ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 border border-army-200">
                <h3 className="text-lg font-semibold text-army-800 mb-4">
                  Factory Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-army-500">Wallet Address</p>
                    <p className="font-mono text-sm truncate text-army-800">
                      {selectedFactory.wallet_address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-army-500">Location</p>
                      <p className="font-medium text-army-800">{selectedFactory.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-army-500">Product</p>
                      <p className="font-medium text-army-800 capitalize">{selectedFactory.product_type}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-army-500">Employees</p>
                    <p className="font-medium text-army-800">{selectedFactory.employee_count}</p>
                  </div>

                  {reputationData && (
                    <div className="border-t border-army-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-army-600">Total Score</span>
                        <div className="flex items-center gap-1">
                          <Star className="text-army-600" size={20} />
                          <span className="text-2xl font-bold text-army-800">{reputationData.total_score}</span>
                          <span className="text-army-400">/100</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-army-600">Auditor Reputation</span>
                            <span className="font-medium text-army-800">{reputationData.auditor_reputation_component}%</span>
                          </div>
                          <div className="h-2 bg-army-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-army-500 rounded-full"
                              style={{ width: `${reputationData.auditor_reputation_component}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-army-600">Evidence Depth</span>
                            <span className="font-medium text-army-800">{reputationData.evidence_depth_component}%</span>
                          </div>
                          <div className="h-2 bg-army-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-army-600 rounded-full"
                              style={{ width: `${reputationData.evidence_depth_component}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-army-600">Recency</span>
                            <span className="font-medium text-army-800">{reputationData.recency_component}%</span>
                          </div>
                          <div className="h-2 bg-army-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-army-400 rounded-full"
                              style={{ width: `${reputationData.recency_component}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-army-600">Category Coverage</span>
                            <span className="font-medium text-army-800">{reputationData.category_coverage_component}%</span>
                          </div>
                          <div className="h-2 bg-army-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-army-700 rounded-full"
                              style={{ width: `${reputationData.category_coverage_component}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-army-200">
                        <p className="text-sm text-army-600">
                          Based on <span className="font-medium text-army-800">{reputationData.audit_count}</span> verified audits
                        </p>
                        <p className="text-xs text-army-400 mt-1">
                          Last audit: {new Date(reputationData.last_audit_timestamp * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full mt-6 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800 flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Contact Factory
                </button>

                {/* Contact Modal */}
                {showContactModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-army-800 flex items-center gap-2">
                            <Mail size={20} />
                            Contact {selectedFactory.name}
                          </h3>
                          <button
                            onClick={() => setShowContactModal(false)}
                            className="text-army-400 hover:text-army-600"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        {!isConnected && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Please connect your wallet to send a contact request.
                            </p>
                          </div>
                        )}

                        {contactStatus === 'success' && (
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle size={20} />
                              <span className="font-medium">Contact request sent successfully!</span>
                            </div>
                          </div>
                        )}

                        {contactStatus === 'error' && (
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                              <XCircle size={20} />
                              <span className="font-medium">Failed to send request. Please try again.</span>
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-army-700 mb-1">
                              Subject *
                            </label>
                            <input
                              type="text"
                              value={contactForm.subject}
                              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                              required
                              disabled={contactStatus === 'sending' || contactStatus === 'success'}
                              className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                              placeholder="e.g., Coffee Purchase Inquiry"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-army-700 mb-1">
                              Your Company (Optional)
                            </label>
                            <input
                              type="text"
                              value={contactForm.buyerCompany}
                              onChange={(e) => setContactForm(prev => ({ ...prev, buyerCompany: e.target.value }))}
                              disabled={contactStatus === 'sending' || contactStatus === 'success'}
                              className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                              placeholder="e.g., Global Coffee Imports Ltd"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-army-700 mb-1">
                              Your Email (Optional)
                            </label>
                            <input
                              type="email"
                              value={contactForm.buyerEmail}
                              onChange={(e) => setContactForm(prev => ({ ...prev, buyerEmail: e.target.value }))}
                              disabled={contactStatus === 'sending' || contactStatus === 'success'}
                              className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                              placeholder="buyer@company.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-army-700 mb-1">
                              Message *
                            </label>
                            <textarea
                              value={contactForm.message}
                              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                              required
                              rows={4}
                              disabled={contactStatus === 'sending' || contactStatus === 'success'}
                              className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 resize-none"
                              placeholder="Describe your inquiry, order requirements, or questions..."
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={!isConnected || contactStatus === 'sending' || contactStatus === 'success'}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-300 disabled:cursor-not-allowed font-medium"
                          >
                            {contactStatus === 'sending' ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Sending...
                              </>
                            ) : contactStatus === 'success' ? (
                              <>
                                <CheckCircle size={18} />
                                Sent!
                              </>
                            ) : (
                              <>
                                <Send size={18} />
                                Send Contact Request
                              </>
                            )}
                          </button>
                        </form>

                        <p className="text-xs text-army-500 mt-4 text-center">
                          Your wallet address will be shared with the factory for verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center sticky top-4 border border-army-200">
                <Search className="mx-auto mb-4 text-army-400" size={48} />
                <p className="text-army-600">
                  Select a factory to view detailed compliance information.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
