import React, { useState } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import { useAPI } from '../../hooks/useAPI';
import { useIPFS } from '../../hooks/useIPFS';
import { 
  DollarSign, 
  FileText, 
  Upload, 
  Calculator, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Percent,
  TrendingUp,
  Shield
} from 'lucide-react';

export function TradeFinanceApplication() {
  const { publicKey, isConnected } = useWalletContext();
  const { requestLoan, getFactoryReputation, loading } = useAPI();
  const { uploadFile, uploading: ipfsUploading } = useIPFS();
  
  const [formData, setFormData] = useState({
    amount: '',
    invoiceDescription: '',
    buyerName: '',
    expectedPaymentDate: '',
  });
  
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceHash, setInvoiceHash] = useState('');
  const [reputationData, setReputationData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState(null);

  const INTEREST_RATE = 5; // 5% annual
  const LOAN_TERM = 90; // 90 days
  const COLLATERAL_RATIO = 150; // 150% of loan amount

  React.useEffect(() => {
    if (isConnected && publicKey) {
      loadReputationData();
    }
  }, [isConnected, publicKey]);

  const loadReputationData = async () => {
    try {
      const data = await getFactoryReputation(publicKey);
      setReputationData(data);
    } catch (err) {
      console.error('Failed to load reputation:', err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      const result = await uploadFile(file);
      setInvoiceHash(result.hash);
      setInvoiceFile(file);
    } catch (err) {
      console.error('File upload failed:', err);
      setError('Failed to upload invoice. Please try again.');
    }
  };

  const calculateLoanDetails = () => {
    const loanAmount = parseFloat(formData.amount) || 0;
    const collateralAmount = (loanAmount * COLLATERAL_RATIO) / 100;
    const interestAmount = (loanAmount * INTEREST_RATE * LOAN_TERM) / (365 * 100);
    const totalRepayment = loanAmount + interestAmount;

    return {
      loanAmount,
      collateralAmount,
      interestAmount,
      totalRepayment,
      monthlyPayment: totalRepayment / 3, // 3 months
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    if (!invoiceHash) {
      setError('Please upload your invoice document');
      return;
    }

    try {
      setSubmissionStatus('submitting');
      
      const loanData = {
        factory: publicKey,
        invoiceHash,
        amount: Math.floor(parseFloat(formData.amount) * 10000000), // Convert to stroops
        invoiceDescription: formData.invoiceDescription,
        buyerName: formData.buyerName,
        expectedPaymentDate: formData.expectedPaymentDate,
      };

      await requestLoan(loanData);
      setSubmissionStatus('success');
      
      // Reset form
      setFormData({
        amount: '',
        invoiceDescription: '',
        buyerName: '',
        expectedPaymentDate: '',
      });
      setInvoiceFile(null);
      setInvoiceHash('');
      setShowPreview(false);
      
    } catch (err) {
      console.error('Loan request failed:', err);
      setSubmissionStatus('error');
      setError(err.message || 'Failed to submit loan request');
    }
  };

  const isEligible = reputationData && reputationData.total_score >= 60;
  const loanDetails = calculateLoanDetails();

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <DollarSign className="mx-auto mb-4 text-army-400" size={48} />
          <h2 className="text-xl font-bold text-army-800 mb-2">Trade Finance Application</h2>
          <p className="text-army-600 mb-4">Please connect your Stellar wallet to apply for trade finance.</p>
        </div>
      </div>
    );
  }

  if (submissionStatus === 'success') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-army-800 mb-2">Loan Request Submitted!</h2>
          <p className="text-army-600 mb-6">
            Your trade finance application has been submitted to authorized lenders.
            You'll receive notification once a lender reviews and approves your request.
          </p>
          <div className="bg-army-50 rounded-lg p-4 mb-6 text-left border border-army-200">
            <h3 className="font-semibold text-army-800 mb-3">Application Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-army-600">Loan Amount:</span>
                <span className="font-medium text-army-800">{loanDetails.loanAmount} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-army-600">Collateral Required:</span>
                <span className="font-medium text-army-800">{loanDetails.collateralAmount} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-army-600">Interest Rate:</span>
                <span className="font-medium text-army-800">{INTEREST_RATE}% annually</span>
              </div>
              <div className="flex justify-between">
                <span className="text-army-600">Loan Term:</span>
                <span className="font-medium text-army-800">{LOAN_TERM} days</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSubmissionStatus(null)}
            className="px-6 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors border border-army-800"
          >
            Apply for Another Loan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-army-800 mb-2">Trade Finance Application</h2>
        <p className="text-army-600">
          Access working capital using your factory's reputation score as collateral.
        </p>
      </div>

      {/* Eligibility Check */}
      {reputationData && (
        <div className={`rounded-lg p-4 mb-6 border ${
          isEligible 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            {isEligible ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <AlertCircle className="text-yellow-600" size={24} />
            )}
            <div>
              <h3 className={`font-semibold ${isEligible ? 'text-green-800' : 'text-yellow-800'}`}>
                {isEligible ? 'Eligible for Trade Finance' : 'Not Currently Eligible'}
              </h3>
              <p className={`text-sm ${isEligible ? 'text-green-700' : 'text-yellow-700'}`}>
                {isEligible 
                  ? `Your reputation score of ${reputationData.total_score}/100 meets the minimum requirement of 60.`
                  : `Your reputation score of ${reputationData.total_score}/100 is below the minimum requirement of 60.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
              <FileText className="text-army-600" size={20} />
              Loan Application
            </h3>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-army-700 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Loan Amount (XLM)
                  </span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="100"
                  max="10000"
                  step="0.1"
                  disabled={!isEligible}
                  className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., 1000"
                />
                <p className="text-xs text-army-500 mt-1">
                  Minimum: 100 XLM, Maximum: 10,000 XLM
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-army-700 mb-2">
                  Invoice Upload *
                </label>
                <div className="border-2 border-dashed border-army-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    disabled={!isEligible || ipfsUploading}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label 
                    htmlFor="invoice-upload"
                    className={`cursor-pointer ${!isEligible || ipfsUploading ? 'cursor-not-allowed' : ''}`}
                  >
                    <Upload className="mx-auto mb-2 text-army-400" size={32} />
                    <p className="text-sm text-army-600">
                      {ipfsUploading ? 'Uploading...' : 'Click to upload invoice'}
                    </p>
                    <p className="text-xs text-army-500 mt-1">
                      PDF, JPG, PNG (Max 10MB)
                    </p>
                  </label>
                </div>
                
                {invoiceFile && (
                  <div className="mt-3 p-3 bg-army-50 rounded border border-army-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-army-800 truncate">{invoiceFile.name}</span>
                      <CheckCircle className="text-green-600" size={16} />
                    </div>
                    <p className="text-xs text-army-500 mt-1">IPFS Hash: {invoiceHash.slice(0, 20)}...</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-army-700 mb-2">
                  Invoice Description
                </label>
                <textarea
                  name="invoiceDescription"
                  value={formData.invoiceDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceDescription: e.target.value }))}
                  required
                  disabled={!isEligible}
                  rows={3}
                  className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  placeholder="Describe the goods/services, quantity, and terms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-army-700 mb-2">
                  Buyer Name
                </label>
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                  required
                  disabled={!isEligible}
                  className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Global Coffee Imports Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-army-700 mb-2">
                  Expected Payment Date
                </label>
                <input
                  type="date"
                  name="expectedPaymentDate"
                  value={formData.expectedPaymentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedPaymentDate: e.target.value }))}
                  required
                  disabled={!isEligible}
                  min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  max={new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-army-500 mt-1">
                  Must be between 30-180 days from today
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!isEligible || !formData.amount}
                  className="flex-1 py-3 bg-army-100 text-army-700 rounded-lg hover:bg-army-200 transition-colors font-medium border border-army-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <Calculator className="inline mr-2" size={18} />
                  Preview Terms
                </button>
                
                <button
                  type="submit"
                  disabled={!isEligible || loading || ipfsUploading || !invoiceHash}
                  className="flex-1 py-3 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800 disabled:bg-army-200 disabled:cursor-not-allowed"
                >
                  {submissionStatus === 'submitting' ? (
                    <>
                      <div className="inline w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="inline mr-2" size={18} />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loan Calculator & Terms */}
        <div className="space-y-6">
          {showPreview && formData.amount && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
              <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
                <Calculator className="text-army-600" size={20} />
                Loan Terms Preview
              </h3>
              
              <div className="space-y-4">
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-army-600">Principal Amount</span>
                    <span className="text-lg font-bold text-army-800">{loanDetails.loanAmount} XLM</span>
                  </div>
                </div>

                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-army-600 flex items-center gap-1">
                      <Percent size={14} />
                      Interest ({INTEREST_RATE}% p.a.)
                    </span>
                    <span className="text-lg font-bold text-army-800">{loanDetails.interestAmount.toFixed(2)} XLM</span>
                  </div>
                </div>

                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-army-600 flex items-center gap-1">
                      <Shield size={14} />
                      Collateral Required
                    </span>
                    <span className="text-lg font-bold text-army-800">{loanDetails.collateralAmount} XLM</span>
                  </div>
                  <p className="text-xs text-army-500">150% of loan amount</p>
                </div>

                <div className="border-t border-army-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-army-700">Total Repayment</span>
                    <span className="text-xl font-bold text-army-800">{loanDetails.totalRepayment.toFixed(2)} XLM</span>
                  </div>
                </div>

                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-army-600" size={16} />
                    <span className="text-sm text-army-600">Repayment Schedule</span>
                  </div>
                  <div className="text-sm text-army-700">
                    <div className="flex justify-between mb-1">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">{loanDetails.monthlyPayment.toFixed(2)} XLM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-medium">{LOAN_TERM} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <h3 className="text-lg font-semibold text-army-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-army-600" size={20} />
              How It Works
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-army-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-army-700">1</span>
                </div>
                <div>
                  <p className="text-sm text-army-700 font-medium">Submit Application</p>
                  <p className="text-xs text-army-600">Upload invoice and provide details</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-army-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-army-700">2</span>
                </div>
                <div>
                  <p className="text-sm text-army-700 font-medium">Lender Review</p>
                  <p className="text-xs text-army-600">Authorized lenders review your request</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-army-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-army-700">3</span>
                </div>
                <div>
                  <p className="text-sm text-army-700 font-medium">Receive Funds</p>
                  <p className="text-xs text-army-600">XLM transferred to your wallet</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-army-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-army-700">4</span>
                </div>
                <div>
                  <p className="text-sm text-army-700 font-medium">Repay Loan</p>
                  <p className="text-xs text-army-600">Repay with interest before due date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
