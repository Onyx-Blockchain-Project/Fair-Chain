import React, { useState, useCallback } from 'react';
import { useStellarWallet } from '../../hooks/useStellarWallet';
import { useAPI } from '../../hooks/useAPI';
import { useIPFS } from '../../hooks/useIPFS';
import { useDropzone } from 'react-dropzone';
import { MapPin, Users, Package, CheckCircle, AlertCircle, Upload, FileText, X } from 'lucide-react';

export function FactoryRegistration({ onRegistrationSuccess }) {
  const { publicKey, isConnected } = useStellarWallet();
  const { registerFactory, loading, error } = useAPI();
  const { uploadMultipleFiles, uploading: ipfsUploading, error: ipfsError } = useIPFS();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    productType: 'coffee',
    employeeCount: '',
    latitude: '',
    longitude: '',
    certifications: [],
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [profileNFT, setProfileNFT] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [certificationFiles, setCertificationFiles] = useState([]);
  const [uploadedCertifications, setUploadedCertifications] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setCertificationFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 5,
  });

  const productTypes = [
    { value: 'coffee', label: 'Coffee' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'manufacturing', label: 'Manufacturing' },
  ];

  const locations = [
    { value: 'Sidama', label: 'Sidama' },
    { value: 'Yirgacheffe', label: 'Yirgacheffe' },
    { value: 'Jimma', label: 'Jimma' },
    { value: 'Harrar', label: 'Harrar' },
    { value: 'Addis Ababa', label: 'Addis Ababa' },
    { value: 'Dire Dawa', label: 'Dire Dawa' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificationUpload = async () => {
    if (certificationFiles.length === 0) return;

    try {
      const results = await uploadMultipleFiles(certificationFiles);
      const hashes = results.map(r => r.hash);
      setUploadedCertifications(hashes);
      setFormData(prev => ({
        ...prev,
        certifications: hashes
      }));
      return results;
    } catch (err) {
      console.error('Certification upload failed:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    // Upload certifications first if files exist
    if (certificationFiles.length > 0 && uploadedCertifications.length === 0) {
      await handleCertificationUpload();
    }

    try {
      const factoryData = {
        owner: publicKey,
        walletAddress: publicKey,
        name: formData.name,
        location: formData.location,
        productType: formData.productType,
        employeeCount: parseInt(formData.employeeCount),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        certifications: uploadedCertifications,
      };

      const result = await registerFactory(factoryData);
      setRegistrationResult(result);
      setProfileNFT(result.profileNFT);
      setSubmitted(true);
      
      // Redirect to dashboard after 3 seconds
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 border-2 border-army-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-army-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-army-300">
            <CheckCircle className="text-army-700" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-army-800 mb-2">
            {registrationResult?.message.includes('updated') ? 'Factory Updated Successfully!' : 'Factory Registered Successfully!'}
          </h2>
          <p className="text-army-600 mb-6">
            {registrationResult?.message.includes('updated') 
              ? 'Your factory profile has been updated on the Stellar blockchain.'
              : 'Your factory profile has been created on the Stellar blockchain.'
            }
          </p>
          
          {profileNFT && (
            <div className="bg-army-50 rounded-lg p-4 mb-6 text-left border border-army-200">
              <h3 className="font-semibold text-army-800 mb-3">Profile NFT Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-army-600">Token ID:</span>
                  <span className="font-mono text-army-800">{profileNFT.token_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-army-600">Metadata Hash:</span>
                  <span className="font-mono text-xs text-army-800">{profileNFT.metadata_hash?.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-army-600">Minted At:</span>
                  <span className="text-army-800">{new Date(profileNFT.minted_at * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setSubmitted(false);
              setRegistrationResult(null);
              setFormData({
                name: '',
                location: '',
                productType: 'coffee',
                employeeCount: '',
                latitude: '',
                longitude: '',
                certifications: [],
              });
              setCertificationFiles([]);
              setUploadedCertifications([]);
            }}
            className="px-6 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors border border-army-800"
          >
            Register Another Factory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
        <h2 className="text-2xl font-bold text-army-800 mb-2">
          Register Your Factory
        </h2>
        <p className="text-army-600 mb-6">
          Create your on-chain factory profile to access compliance verification and trade finance.
        </p>

        {!isConnected && (
          <div className="mb-6 p-4 bg-army-50 border border-army-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-army-600" size={20} />
            <p className="text-army-700 text-sm">
              Please connect your Stellar wallet to register your factory.
            </p>
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
              Factory Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
              placeholder="e.g., Sidama Coffee Cooperative"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Location
              </span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            >
              <option value="">Select a region</option>
              {locations.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              <span className="flex items-center gap-2">
                <Package size={16} />
                Product Type
              </span>
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
            >
              {productTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              <span className="flex items-center gap-2">
                <Users size={16} />
                Number of Employees
              </span>
            </label>
            <input
              type="number"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
              placeholder="e.g., 50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-army-700 mb-2">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="0.0001"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                placeholder="e.g., 6.8128"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-army-700 mb-2">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="0.0001"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                placeholder="e.g., 38.4482"
              />
            </div>
          </div>

          {/* Certification Upload Section */}
          <div>
            <label className="block text-sm font-medium text-army-700 mb-2">
              <span className="flex items-center gap-2">
                <FileText size={16} />
                Certification Documents (Optional)
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
                  : 'Drag & drop certification documents, or click to select'}
              </p>
              <p className="text-xs text-army-500 mt-1">
                Max 5 files (PDF, JPG, PNG) - ISO, Fair Trade, Organic, etc.
              </p>
            </div>

            {certificationFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-army-700 mb-2">
                  Selected files ({certificationFiles.length}):
                </p>
                <div className="space-y-2">
                  {certificationFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-army-50 px-3 py-2 rounded text-sm border border-army-200">
                      <span className="truncate text-army-800">{file.name}</span>
                      <button
                        onClick={() => setCertificationFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {uploadedCertifications.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ {uploadedCertifications.length} certification(s) uploaded to storage
                    </p>
                  </div>
                )}

                {ipfsError && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-800">
                      ⚠ Upload Error: {ipfsError}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isConnected || (certificationFiles.length > 0 && uploadedCertifications.length === 0)}
            className={`w-full py-3 rounded-lg font-medium transition-colors border-2 ${
              loading || !isConnected || (certificationFiles.length > 0 && uploadedCertifications.length === 0)
                ? 'bg-army-100 text-army-400 cursor-not-allowed border-army-200'
                : 'bg-army-700 text-white hover:bg-army-800 border-army-800'
            }`}
          >
            {loading ? 'Registering...' : 'Register Factory'}
          </button>
        </form>
      </div>
    </div>
  );
}
