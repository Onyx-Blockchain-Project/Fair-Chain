import React, { useState, useEffect } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { Search, Filter, MapPin, Star, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export function BuyerPortal() {
  const { getFactories, getReputationScore, loading } = useAPI();
  const [factories, setFactories] = useState([]);
  const [filters, setFilters] = useState({
    productType: '',
    location: '',
    minScore: 0,
  });
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [reputationData, setReputationData] = useState(null);

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
    try {
      const repData = await getReputationScore(factory.wallet_address);
      setReputationData(repData);
    } catch (err) {
      console.error('Failed to load reputation:', err);
      setReputationData(null);
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

                <button className="w-full mt-6 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800">
                  Contact Factory
                </button>
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
