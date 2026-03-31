import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Star, Filter, Building2 } from 'lucide-react';
import { API_URL } from '../config';

export function BuyerPortal() {
  const [factories, setFactories] = useState([]);
  const [filteredFactories, setFilteredFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [minReputation, setMinReputation] = useState(0);

  // Fetch factories on mount
  useEffect(() => {
    fetchFactories();
  }, []);

  // Filter factories when search criteria change
  useEffect(() => {
    filterFactories();
  }, [searchQuery, locationFilter, productTypeFilter, minReputation, factories]);

  const fetchFactories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/factories`);
      if (!response.ok) throw new Error('Failed to fetch factories');
      const data = await response.json();
      setFactories(data);
      setFilteredFactories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching factories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterFactories = () => {
    let filtered = factories;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(f => 
        f.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (productTypeFilter) {
      filtered = filtered.filter(f => 
        f.product_type?.toLowerCase().includes(productTypeFilter.toLowerCase())
      );
    }

    if (minReputation > 0) {
      filtered = filtered.filter(f => 
        (f.ReputationScore?.total_score || 0) >= minReputation
      );
    }

    setFilteredFactories(filtered);
  };

  // Get unique locations and product types for filters
  const locations = [...new Set(factories.map(f => f.location).filter(Boolean))];
  const productTypes = [...new Set(factories.map(f => f.product_type).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-army-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Error loading factories: {error}</p>
        <button 
          onClick={fetchFactories}
          className="px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-army-900 mb-2">Find Verified Factories</h2>
        <p className="text-dark-100">Search and filter through blockchain-verified Ethiopian manufacturers</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-army-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-army-400" size={20} />
            <input
              type="text"
              placeholder="Search factories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-army-200 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-army-400" size={20} />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-army-200 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Product Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-army-400" size={20} />
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-army-200 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Product Types</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Min Reputation */}
          <div className="flex items-center gap-2">
            <Star className="text-army-400" size={20} />
            <input
              type="range"
              min="0"
              max="100"
              value={minReputation}
              onChange={(e) => setMinReputation(Number(e.target.value))}
              className="flex-1 accent-army-700"
            />
            <span className="text-sm text-dark-100 w-12">{minReputation}+</span>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-dark-100">
          Showing {filteredFactories.length} of {factories.length} factories
        </div>
      </div>

      {/* Factory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFactories.map(factory => (
          <FactoryCard key={factory.id} factory={factory} />
        ))}
      </div>

      {filteredFactories.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-army-300 mb-4" />
          <p className="text-dark-100">No factories match your search criteria</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setLocationFilter('');
              setProductTypeFilter('');
              setMinReputation(0);
            }}
            className="mt-4 text-army-700 hover:text-army-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function FactoryCard({ factory }) {
  const reputation = factory.ReputationScore || {};
  const score = reputation.total_score || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-army-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-army-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-army-900">{factory.name}</h3>
          {score > 0 && (
            <div className="flex items-center gap-1 bg-army-100 px-2 py-1 rounded">
              <Star className="text-army-600" size={16} fill="currentColor" />
              <span className="text-sm font-bold text-army-700">{score}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-dark-100 line-clamp-2">{factory.description}</p>
      </div>

      {/* Details */}
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-army-500" />
          <span className="text-dark-100">{factory.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Building2 size={16} className="text-army-500" />
          <span className="text-dark-100">{factory.product_type}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-army-500" />
          <span className="text-dark-100">{factory.employee_count?.toLocaleString()} employees</span>
        </div>

        {/* Compliance Badge */}
        {factory.is_active && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified Active
            </span>
            {reputation.is_compliant && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Compliant
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-army-50 border-t border-army-100">
        <button className="w-full py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium">
          View Profile & Audits
        </button>
      </div>
    </div>
  );
}
