import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { useAPI } from '../../hooks/useAPI';
import { useIPFS } from '../../hooks/useIPFS';
import { Camera, Upload, MapPin, CheckCircle, Star, Coins } from 'lucide-react';

export function AuditorDashboard() {
  const { publicKey, isConnected } = useStellarWallet();
  const { submitAudit, stakeAsAuditor, matchAuditor, loading } = useAPI();
  const { uploadMultipleFiles, uploading: ipfsUploading } = useIPFS();
  
  const [activeView, setActiveView] = useState('stake');
  const [files, setFiles] = useState([]);
  const [uploadedHashes, setUploadedHashes] = useState([]);
  const [auditForm, setAuditForm] = useState({
    factoryAddress: '',
    complianceCategory: 'labor',
    scoreDelta: 0,
    notes: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

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
    } catch (err) {
      console.error('Staking failed:', err);
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
    } catch (err) {
      console.error('Audit submission failed:', err);
      setSubmissionStatus('error');
    }
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
    </div>
  );

  const renderAuditView = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
      <h3 className="text-xl font-bold text-army-800 mb-4">
        Submit Audit Report
      </h3>

      {submissionStatus === 'success' && (
        <div className="mb-4 p-4 bg-army-50 border border-army-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-army-700" size={20} />
          <p className="text-army-800">Audit submitted successfully!</p>
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
            <div className="mt-4">
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
          )}
        </div>

        <button
          type="submit"
          disabled={loading || ipfsUploading || files.length === 0}
          className="w-full py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors disabled:bg-army-200 border-2 border-army-800"
        >
          {ipfsUploading ? 'Uploading to IPFS...' : loading ? 'Submitting...' : 'Submit Audit'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex gap-4">
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
      </div>

      {activeView === 'stake' ? renderStakeView() : renderAuditView()}
    </div>
  );
}
