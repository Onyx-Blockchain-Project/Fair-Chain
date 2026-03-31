import React, { useState, useEffect } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { 
  TrendingUp, 
  Users, 
  Leaf, 
  DollarSign, 
  Factory,
  Shield,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function SDGDashboard() {
  const { getSDGMetrics, loading } = useAPI();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getSDGMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load SDG metrics:', err);
    }
  };

  const sampleData = {
    economic: {
      factories_registered: 124,
      audits_completed: 456,
      sme_revenue_growth: 23,
      jobs_supported: 2840,
      trade_finance_unlocked: 1250000,
    },
    environmental: {
      co2_reduction_tons: 156,
      waste_reduction_percent: 18,
      water_usage_optimized: 45,
      sustainable_factories: 89,
    },
    social: {
      female_led_factories: 42,
      female_led_percent: 34,
      wage_compliance_rate: 94,
      safety_incidents_reduced: 67,
    },
    monthly_audits: [
      { month: 'Jan', audits: 28, factories: 45 },
      { month: 'Feb', audits: 35, factories: 52 },
      { month: 'Mar', audits: 42, factories: 61 },
      { month: 'Apr', audits: 38, factories: 68 },
      { month: 'May', audits: 56, factories: 79 },
      { month: 'Jun', audits: 48, factories: 89 },
    ],
    regional_distribution: [
      { name: 'Sidama', value: 45, color: '#22c55e' },
      { name: 'Yirgacheffe', value: 32, color: '#3b82f6' },
      { name: 'Jimma', value: 28, color: '#f59e0b' },
      { name: 'Harrar', value: 19, color: '#ef4444' },
    ],
    compliance_categories: [
      { category: 'Labor', compliant: 89, total: 100 },
      { category: 'Environmental', compliant: 76, total: 100 },
      { category: 'Quality', compliant: 94, total: 100 },
      { category: 'Safety', compliant: 82, total: 100 },
    ],
  };

  const data = metrics || sampleData;

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-army-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-army-800">{value}</p>
          {subtitle && <p className="text-xs text-army-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-army-800 mb-2">
          Sustainable Development Goals Impact
        </h2>
        <p className="text-army-600">
          Tracking FairChain's contribution to Ethiopia's economic, environmental, and social progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Factories Registered"
          value={data.economic.factories_registered}
          subtitle="Across Ethiopia"
          icon={Factory}
          color="army"
        />
        <StatCard
          title="Audits Completed"
          value={data.economic.audits_completed}
          subtitle="On-chain verified"
          icon={Shield}
          color="dark"
        />
        <StatCard
          title="Trade Finance Unlocked"
          value={`$${(data.economic.trade_finance_unlocked / 1000000).toFixed(1)}M`}
          subtitle="XLM backed loans"
          icon={DollarSign}
          color="army"
        />
        <StatCard
          title="Jobs Supported"
          value={data.economic.jobs_supported.toLocaleString()}
          subtitle="Direct & indirect"
          icon={Users}
          color="dark"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <h3 className="text-lg font-semibold text-army-800 mb-4">
            Monthly Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_audits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#7a7a68" />
                <YAxis stroke="#7a7a68" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="audits" 
                  stroke="#4b5320" 
                  strokeWidth={2}
                  name="Audits"
                />
                <Line 
                  type="monotone" 
                  dataKey="factories" 
                  stroke="#5c5c50" 
                  strokeWidth={2}
                  name="Factories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <h3 className="text-lg font-semibold text-army-800 mb-4">
            Regional Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.regional_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.regional_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {data.regional_distribution.map((region) => (
              <div key={region.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-sm text-army-600">{region.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
        <h3 className="text-lg font-semibold text-army-800 mb-4">
          Compliance by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.compliance_categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} stroke="#7a7a68" />
              <YAxis dataKey="category" type="category" stroke="#7a7a68" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="compliant" fill="#4b5320" name="Compliant %" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-army-100 to-army-200 rounded-lg p-6 border border-army-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-army-700 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-army-800">SDG 8: Decent Work</h3>
          </div>
          <ul className="space-y-2 text-sm text-army-700">
            <li className="flex justify-between">
              <span>Wage compliance rate</span>
              <span className="font-medium">{data.social.wage_compliance_rate}%</span>
            </li>
            <li className="flex justify-between">
              <span>Safety improvement</span>
              <span className="font-medium">-{data.social.safety_incidents_reduced}%</span>
            </li>
            <li className="flex justify-between">
              <span>Female-led factories</span>
              <span className="font-medium">{data.social.female_led_percent}%</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-army-200 to-army-300 rounded-lg p-6 border border-army-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-army-800 rounded-lg">
              <Globe className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-army-900">SDG 9: Industry & Innovation</h3>
          </div>
          <ul className="space-y-2 text-sm text-army-800">
            <li className="flex justify-between">
              <span>SME revenue growth</span>
              <span className="font-medium">+{data.economic.sme_revenue_growth}%</span>
            </li>
            <li className="flex justify-between">
              <span>Blockchain-verified</span>
              <span className="font-medium">{data.economic.audits_completed} audits</span>
            </li>
            <li className="flex justify-between">
              <span>Trade finance</span>
              <span className="font-medium">${(data.economic.trade_finance_unlocked / 1000000).toFixed(1)}M</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-dark-100 to-army-300 rounded-lg p-6 border border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-dark-200 rounded-lg">
              <Leaf className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-dark-200">SDG 12: Responsible Consumption</h3>
          </div>
          <ul className="space-y-2 text-sm text-dark-100">
            <li className="flex justify-between">
              <span>CO₂ reduction</span>
              <span className="font-medium">{data.environmental.co2_reduction_tons} tons</span>
            </li>
            <li className="flex justify-between">
              <span>Waste reduction</span>
              <span className="font-medium">{data.environmental.waste_reduction_percent}%</span>
            </li>
            <li className="flex justify-between">
              <span>Sustainable factories</span>
              <span className="font-medium">{data.environmental.sustainable_factories}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
