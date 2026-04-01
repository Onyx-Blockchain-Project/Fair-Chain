import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import { useAPI } from '../../hooks/useAPI';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  FileText,
  Percent,
  Shield,
  ArrowUpRight,
  Eye
} from 'lucide-react';

export function LoanStatus() {
  const { publicKey, isConnected } = useWalletContext();
  const { getFactoryLoans, repayLoan, loading } = useAPI();
  
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [repaymentStatus, setRepaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadLoans();
    }
  }, [isConnected, publicKey]);

  const loadLoans = async () => {
    try {
      setError(null);
      const data = await getFactoryLoans(publicKey);
      setLoans(data || []);
    } catch (err) {
      console.error('Failed to load loans:', err);
      setError('Failed to load loan data');
    }
  };

  const handleRepayment = async (loanId) => {
    try {
      setRepaymentStatus('processing');
      await repayLoan(loanId);
      setRepaymentStatus('success');
      await loadLoans(); // Refresh loan data
      setTimeout(() => setRepaymentStatus(null), 3000);
    } catch (err) {
      console.error('Repayment failed:', err);
      setRepaymentStatus('error');
      setError(err.message || 'Repayment failed');
      setTimeout(() => setRepaymentStatus(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'yellow', text: 'Pending Review', icon: Clock },
      ACTIVE: { color: 'blue', text: 'Active', icon: TrendingUp },
      REPAID: { color: 'green', text: 'Repaid', icon: CheckCircle },
      DEFAULTED: { color: 'red', text: 'Defaulted', icon: AlertCircle },
      LIQUIDATED: { color: 'red', text: 'Liquidated', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-50 text-${config.color}-800 border border-${config.color}-200`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate * 1000);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount) => {
    return (amount / 10000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <DollarSign className="mx-auto mb-4 text-army-400" size={48} />
          <h2 className="text-xl font-bold text-army-800 mb-2">Loan Status</h2>
          <p className="text-army-600">Please connect your Stellar wallet to view your loans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-army-800 mb-2">Your Trade Finance Loans</h2>
        <p className="text-army-600">Track and manage your active trade finance facilities.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {repaymentStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 text-sm">Loan repaid successfully!</p>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <FileText className="mx-auto mb-4 text-army-400" size={48} />
          <h3 className="text-lg font-semibold text-army-800 mb-2">No Loans Found</h3>
          <p className="text-army-600 mb-4">
            You haven't applied for any trade finance loans yet.
          </p>
          <button className="px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors border border-army-800">
            Apply for Your First Loan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loan Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-army-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-army-600" size={20} />
                <span className="text-sm text-army-600">Total Borrowed</span>
              </div>
              <div className="text-2xl font-bold text-army-800">
                {formatCurrency(loans.reduce((sum, loan) => sum + loan.amount, 0))} XLM
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-army-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-army-600" size={20} />
                <span className="text-sm text-army-600">Active Loans</span>
              </div>
              <div className="text-2xl font-bold text-army-800">
                {loans.filter(loan => loan.status === 'ACTIVE').length}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-army-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-army-600" size={20} />
                <span className="text-sm text-army-600">Repaid Loans</span>
              </div>
              <div className="text-2xl font-bold text-army-800">
                {loans.filter(loan => loan.status === 'REPAID').length}
              </div>
            </div>
          </div>

          {/* Loan List */}
          <div className="bg-white rounded-lg shadow-md border border-army-200">
            <div className="p-6 border-b border-army-200">
              <h3 className="text-lg font-semibold text-army-800">Loan History</h3>
            </div>
            
            <div className="divide-y divide-army-200">
              {loans.map((loan) => {
                const daysUntilDue = loan.due_at ? getDaysUntilDue(loan.due_at) : null;
                const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && loan.status === 'ACTIVE';
                
                return (
                  <div key={loan.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-army-800">
                            Loan #{loan.id}
                          </h4>
                          {getStatusBadge(loan.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-army-500">Amount:</span>
                            <span className="ml-2 font-medium text-army-800">
                              {formatCurrency(loan.amount)} XLM
                            </span>
                          </div>
                          <div>
                            <span className="text-army-500">Interest:</span>
                            <span className="ml-2 font-medium text-army-800">
                              {loan.interest_rate / 100}%
                            </span>
                          </div>
                          <div>
                            <span className="text-army-500">Term:</span>
                            <span className="ml-2 font-medium text-army-800">
                              {loan.term_days} days
                            </span>
                          </div>
                          <div>
                            <span className="text-army-500">Applied:</span>
                            <span className="ml-2 font-medium text-army-800">
                              {new Date(loan.created_at * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-army-700 hover:text-army-900 text-sm font-medium border border-army-300 rounded hover:bg-army-50"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </div>

                    {loan.status === 'ACTIVE' && (
                      <div className={`rounded-lg p-4 border ${
                        isOverdue 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className={isOverdue ? 'text-red-600' : 'text-blue-600'} size={16} />
                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-800' : 'text-blue-800'}`}>
                              {isOverdue ? 'Overdue' : 'Due Date'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${isOverdue ? 'text-red-800' : 'text-blue-800'}`}>
                              {new Date(loan.due_at * 1000).toLocaleDateString()}
                            </div>
                            <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                              {isOverdue 
                                ? `${Math.abs(daysUntilDue)} days overdue`
                                : `${daysUntilDue} days remaining`
                              }
                            </div>
                          </div>
                        </div>
                        
                        {!isOverdue && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <button
                              onClick={() => handleRepayment(loan.id)}
                              disabled={loading || repaymentStatus === 'processing'}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-sm"
                            >
                              {repaymentStatus === 'processing' ? (
                                <>
                                  <div className="inline w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="inline mr-2" size={16} />
                                  Repay Loan Now
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loan Details Modal */}
      {showDetails && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-army-800 flex items-center gap-2">
                  <FileText size={20} />
                  Loan #{selectedLoan.id} Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-army-400 hover:text-army-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Loan Overview */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Loan Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-army-600">Principal Amount:</span>
                      <div className="font-medium text-army-800">
                        {formatCurrency(selectedLoan.amount)} XLM
                      </div>
                    </div>
                    <div>
                      <span className="text-army-600">Interest Rate:</span>
                      <div className="font-medium text-army-800">
                        {selectedLoan.interest_rate / 100}% annually
                      </div>
                    </div>
                    <div>
                      <span className="text-army-600">Collateral:</span>
                      <div className="font-medium text-army-800">
                        {formatCurrency(selectedLoan.collateral_amount)} XLM
                      </div>
                    </div>
                    <div>
                      <span className="text-army-600">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(selectedLoan.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repayment Schedule */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Repayment Schedule</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-army-600">Application Date:</span>
                      <span className="font-medium text-army-800">
                        {new Date(selectedLoan.created_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-army-600">Due Date:</span>
                      <span className="font-medium text-army-800">
                        {new Date(selectedLoan.due_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-army-600">Term Length:</span>
                      <span className="font-medium text-army-800">
                        {selectedLoan.term_days} days
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-army-300">
                      <span className="text-army-700 font-medium">Total Repayment:</span>
                      <span className="font-bold text-army-800">
                        {formatCurrency(selectedLoan.amount + (selectedLoan.amount * selectedLoan.interest_rate / 10000))} XLM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Invoice Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-army-600">Invoice Hash:</span>
                      <span className="font-mono text-army-800 text-xs">
                        {selectedLoan.invoice_hash?.slice(0, 20)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-army-600">Lender:</span>
                      <span className="font-medium text-army-800">
                        {selectedLoan.lender?.slice(0, 8)}...{selectedLoan.lender?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reputation Score at Time of Application */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Credit Assessment
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-army-600">Reputation Score at Application:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-army-800">
                        {selectedLoan.reputation_score}/100
                      </span>
                      <div className="w-16 bg-army-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-army-600 rounded-full"
                          style={{ width: `${selectedLoan.reputation_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
