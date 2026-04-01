import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { useAPI } from '../../hooks/useAPI';
import { useIPFS } from '../../hooks/useIPFS';
import { 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle, 
  Star, 
  Coins, 
  LayoutDashboard,
  FileText,
  TrendingUp,
  Award,
  History,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User
} from 'lucide-react';

export function AuditorDashboard() {
  const { publicKey, isConnected } = useStellarWallet();
  const { submitAudit, stakeAsAuditor, getAuditorDashboard, loading } = useAPI();
  const { uploadMultipleFiles, uploading: ipfsUploading, error: ipfsError } = useIPFS();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadedHashes, setUploadedHashes] = useState([]);
  const [auditForm, setAuditForm] = useState({
    factoryAddress: '',
    complianceCategory: 'labor',
    scoreDelta: 0,
    notes: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load dashboard data immediately when component mounts
    if (isConnected && publicKey) {
      loadDashboard();
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    // Also load when switching to dashboard view
    if (isConnected && publicKey && activeView === 'dashboard') {
      loadDashboard();
    }
  }, [activeView]);

  useEffect(() => {
    // If user has dashboard data (is staked) and is on stake view, redirect to audit
    if (dashboardData && activeView === 'stake') {
      setActiveView('audit');
    }
  }, [dashboardData, activeView]);

  useEffect(() => {
    // Set initial view to audit if user is already staked when component loads
    if (dashboardData && activeView === 'dashboard') {
      setActiveView('audit');
    }
  }, [dashboardData]);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await getAuditorDashboard(publicKey);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load auditor dashboard:', err);
      setError('Failed to load dashboard. You may need to stake first to become an auditor.');
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 10,
  });

  const handleStake = async () => {
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await stakeAsAuditor({
        auditor: publicKey,
        amount: 500,
        geoRegion: 'Sidama',
      });
      alert('Successfully staked 500 XLM as auditor!');
      setActiveView('audit');
      loadDashboard();
    } catch (err) {
      console.error('Staking failed:', err);
      alert('Staking failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUploadEvidence = async () => {
    if (files.length === 0) return;

    try {
      const results = await uploadMultipleFiles(files);
      setUploadedHashes(results.map(r => r.hash));
      return results;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };

  const handleSubmitAudit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const ipfsResults = await handleUploadEvidence();
      const ipfsHashes = ipfsResults ? ipfsResults.map(r => r.hash) : uploadedHashes;

      const auditData = {
        auditor: publicKey,
        factory: auditForm.factoryAddress,
        ipfsHashes,
        complianceCategory: auditForm.complianceCategory,
        scoreDelta: parseInt(auditForm.scoreDelta),
        geolocation: 'Sidama',
      };

      await submitAudit(auditData);
      setSubmissionStatus('success');
      setFiles([]);
      setUploadedHashes([]);
      setAuditForm({ factoryAddress: '', complianceCategory: 'labor', scoreDelta: 0, notes: '' });
      setTimeout(() => {
        setSubmissionStatus(null);
        setActiveView('dashboard');
        loadDashboard();
      }, 2000);
    } catch (err) {
      console.error('Audit submission failed:', err);
      setSubmissionStatus('error');
    }
  };

  const renderDashboardView = () => {
    if (!isConnected) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <User className="mx-auto mb-4 text-army-400" size={48} />
          <h3 className="text-xl font-bold text-army-800 mb-2">Auditor Dashboard</h3>
          <p className="text-army-600">Please connect your wallet to view your auditor profile.</p>
        </div>
      );
    }

    if (loading && !dashboardData) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <div className="animate-spin w-8 h-8 border-4 border-army-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-army-600">Loading dashboard...</p>
        </div>
      );
    }

    if (error || !dashboardData) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <AlertCircle className="mx-auto mb-4 text-army-400" size={48} />
          <h3 className="text-xl font-bold text-army-800 mb-2">Not an Auditor Yet</h3>
          <p className="text-army-600 mb-4">{error || 'You need to stake XLM to become a verified auditor.'}</p>
          <button
            onClick={() => setActiveView('stake')}
            className="px-6 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800"
          >
            Stake Now
          </button>
        </div>
      );
    }

    const { auditor, audits, stats } = dashboardData;
    const tier = stats.reputation_tier;

    return (
      <div className="space-y-6">
        {/* Auditor Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                tier.color === 'gold' ? 'bg-yellow-100 border-2 border-yellow-400' :
                tier.color === 'purple' ? 'bg-purple-100 border-2 border-purple-400' :
                tier.color === 'blue' ? 'bg-blue-100 border-2 border-blue-400' :
                tier.color === 'green' ? 'bg-green-100 border-2 border-green-400' :
                'bg-gray-100 border-2 border-gray-400'
              }`}>
                <Award className={
                  tier.color === 'gold' ? 'text-yellow-600' :
                  tier.color === 'purple' ? 'text-purple-600' :
                  tier.color === 'blue' ? 'text-blue-600' :
                  tier.color === 'green' ? 'text-green-600' :
                  'text-gray-600'
                } size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-army-800">
                  {auditor.name || `Auditor ${auditor.wallet_address.slice(0, 8)}...`}
                </h3>
                <div className="flex items-center gap-2 text-sm text-army-600">
                  <span className="font-medium">{tier.tier} Tier</span>
                  <span>•</span>
                  <span>{auditor.geo_region || 'Sidama'} Region</span>
                </div>
                <p className="text-xs text-army-500 mt-1">{tier.benefits}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-army-800">{auditor.reputation_score}</div>
              <div className="text-sm text-army-500">Reputation Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border border-army-200 text-center">
            <div className="text-2xl font-bold text-army-800">{stats.total_audits}</div>
            <div className="text-sm text-army-500">Total Audits</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-army-200 text-center">
            <div className="text-2xl font-bold text-army-800">{stats.verified_audits}</div>
            <div className="text-sm text-army-500">Verified</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-army-200 text-center">
            <div className="text-2xl font-bold text-army-800">{stats.average_score}</div>
            <div className="text-sm text-army-500">Avg Score</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-army-200 text-center">
            <div className="text-2xl font-bold text-army-800">{stats.estimated_earnings}</div>
            <div className="text-sm text-army-500">XLM Earned</div>
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
          <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
            <History size={20} />
            Recent Audits
          </h3>
          {audits.length === 0 ? (
            <p className="text-army-500 text-center py-4">No audits submitted yet. Start by submitting your first audit!</p>
          ) : (
            <div className="space-y-3">
              {audits.slice(0, 5).map((audit) => (
                <AuditDetail key={audit.id} audit={audit} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStakeView = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
      <h3 className="text-xl font-bold text-army-800 mb-4">
        Become a Verified Auditor
      </h3>
      <p className="text-army-600 mb-6">
        Stake 500 XLM to join the auditor network. Your stake ensures accountability and quality.
      </p>

      <div className="bg-army-50 rounded-lg p-4 mb-6 border border-army-200">
        <h4 className="font-semibold text-army-800 mb-2">Benefits</h4>
        <ul className="space-y-2 text-sm text-army-700">
          <li className="flex items-center gap-2">
            <Star size={16} />
            Earn fees for each completed audit
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={16} />
            Match with nearby factories to reduce travel costs
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} />
            Build reputation and increase earnings over time
          </li>
        </ul>
      </div>

      <button
        onClick={handleStake}
        disabled={loading || !isConnected}
        className="w-full flex items-center justify-center gap-2 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800"
      >
        <Coins size={20} />
        {loading ? 'Processing...' : 'Stake 500 XLM'}
      </button>

      {!isConnected && (
        <p className="text-sm text-army-500 mt-4 text-center">
          Please connect your wallet to stake
        </p>
      )}
    </div>
  );

  const renderAuditView = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
      <h3 className="text-xl font-bold text-army-800 mb-4">
        Submit Audit Report
      </h3>

      {submissionStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800">Audit submitted successfully!</p>
        </div>
      )}

      {submissionStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800">Failed to submit audit. Please try again.</p>
        </div>
      )}

      <form onSubmit={handleSubmitAudit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            Factory Address
          </label>
          <input
            type="text"
            value={auditForm.factoryAddress}
            onChange={(e) => setAuditForm(prev => ({ ...prev, factoryAddress: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            placeholder="G..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            Compliance Category
          </label>
          <select
            value={auditForm.complianceCategory}
            onChange={(e) => setAuditForm(prev => ({ ...prev, complianceCategory: e.target.value }))}
            className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
          >
            <option value="labor">Labor Standards</option>
            <option value="environmental">Environmental</option>
            <option value="quality">Quality Control</option>
            <option value="safety">Safety Standards</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            Score Impact (-50 to +50)
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={auditForm.scoreDelta}
            onChange={(e) => setAuditForm(prev => ({ ...prev, scoreDelta: e.target.value }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-army-500 mt-1">
            <span>-50 (Critical Issues)</span>
            <span className="font-semibold">{auditForm.scoreDelta}</span>
            <span>+50 (Excellent)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-army-700 mb-2">
            <span className="flex items-center gap-2">
              <Camera size={16} />
              Evidence Photos/Documents
            </span>
          </label>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-army-500 bg-army-50' : 'border-army-300 hover:border-army-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-2 text-army-400" size={32} />
            <p className="text-sm text-army-600">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop photos, or click to select'}
            </p>
            <p className="text-xs text-army-500 mt-1">
              Max 10 files (JPG, PNG, PDF)
            </p>
          </div>

          {files.length > 0 && (
            <div>
              {uploadedHashes.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ {uploadedHashes.length} file(s) uploaded to storage
                  </p>
                </div>
              )}

              {ipfsError && (
                <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-red-800">
                    ⚠ Upload Error: {ipfsError}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-medium text-army-700 mb-2">
                  Selected files ({files.length}):
                </p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-army-50 px-3 py-2 rounded text-sm border border-army-200">
                      <span className="truncate text-army-800">{file.name}</span>
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || ipfsUploading || files.length === 0}
          className="w-full py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800"
        >
          {ipfsUploading ? 'Uploading files...' : loading ? 'Submitting...' : 'Submit Audit'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            activeView === 'dashboard'
              ? 'bg-army-700 text-white border-army-800'
              : 'bg-army-50 text-army-700 hover:bg-army-100 border-army-300'
          }`}
        >
          Dashboard
        </button>
        {!dashboardData && (
          <button
            onClick={() => setActiveView('stake')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              activeView === 'stake'
                ? 'bg-army-700 text-white border-army-800'
                : 'bg-army-50 text-army-700 hover:bg-army-100 border-army-300'
            }`}
          >
            Stake
          </button>
        )}
        {dashboardData && (
          <button
            onClick={() => setActiveView('audit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              activeView === 'audit'
                ? 'bg-army-700 text-white border-army-800'
                : 'bg-army-50 text-army-700 hover:bg-army-100 border-army-300'
            }`}
          >
            Submit Audit
          </button>
        )}
      </div>

      {activeView === 'dashboard' && renderDashboardView()}
      {activeView === 'stake' && renderStakeView()}
      {activeView === 'audit' && renderAuditView()}
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
          <div className="text-xl font-bold text-army-800">{audit.overall_score}</div>
          <div className="text-left">
            <div className="font-medium text-army-800">
              {audit.factory?.name || 'Unknown Factory'}
            </div>
            <div className="text-sm text-army-500">
              {audit.compliance_category} • {new Date(audit.submitted_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="p-4 bg-white border-t border-army-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-army-600">Score Delta:</span>
              <div className={`font-medium ${
                audit.score_delta > 0 ? 'text-green-600' : audit.score_delta < 0 ? 'text-red-600' : 'text-army-600'
              }`}>
                {audit.score_delta > 0 ? '+' : ''}{audit.score_delta}
              </div>
            </div>
            <div>
              <span className="text-sm text-army-600">Status:</span>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                audit.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                audit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                audit.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {audit.status}
              </div>
            </div>
          </div>

          {audit.ipfs_hashes && audit.ipfs_hashes.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-army-700 mb-2">Evidence Files:</h5>
              <div className="space-y-1">
                {audit.ipfs_hashes.map((hash, index) => (
                  <div key={index} className="text-sm text-army-600">
                    <a 
                      href={`https://ipfs.io/ipfs/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {hash.substring(0, 20)}...
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.notes && (
            <div>
              <h5 className="font-medium text-army-700 mb-1">Notes:</h5>
              <p className="text-sm text-army-600">{audit.notes}</p>
            </div>
          )}
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
        </div>
      )}
    </div>
  );
}
