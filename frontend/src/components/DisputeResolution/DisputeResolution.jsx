import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import { useAPI } from '../../hooks/useAPI';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText,
  Calendar,
  Gavel,
  Vote,
  Clock,
  ExternalLink,
  MessageSquare,
  Scale
} from 'lucide-react';

export function DisputeResolution() {
  const { publicKey, isConnected } = useWalletContext();
  const { 
    fileDispute, 
    getDisputes, 
    submitVote, 
    getArbitratorDisputes,
    loading 
  } = useAPI();
  
  const [activeTab, setActiveTab] = useState('my-disputes');
  const [disputes, setDisputes] = useState([]);
  const [arbitratorDisputes, setArbitratorDisputes] = useState([]);
  const [showFileForm, setShowFileForm] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const [disputeForm, setDisputeForm] = useState({
    auditId: '',
    reason: '',
    description: '',
  });

  useEffect(() => {
    if (isConnected && publicKey) {
      loadData();
    }
  }, [isConnected, publicKey, activeTab]);

  const loadData = async () => {
    try {
      setError(null);
      
      if (activeTab === 'my-disputes') {
        const data = await getDisputes(publicKey);
        setDisputes(data || []);
      } else if (activeTab === 'arbitration') {
        const data = await getArbitratorDisputes(publicKey);
        setArbitratorDisputes(data || []);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
      setError('Failed to load dispute data');
    }
  };

  const handleFileDispute = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setSubmissionStatus('submitting');
      
      const disputeData = {
        auditId: disputeForm.auditId,
        challenger: publicKey,
        reason: disputeForm.reason,
        description: disputeForm.description,
      };

      await fileDispute(disputeData);
      setSubmissionStatus('success');
      setShowFileForm(false);
      setDisputeForm({ auditId: '', reason: '', description: '' });
      await loadData(); // Refresh data
      
      setTimeout(() => setSubmissionStatus(null), 3000);
    } catch (err) {
      console.error('Failed to file dispute:', err);
      setSubmissionStatus('error');
      setError(err.message || 'Failed to file dispute');
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  };

  const handleVote = async (disputeId, voteForChallenger) => {
    try {
      await submitVote({
        disputeId,
        arbitrator: publicKey,
        voteForChallenger,
      });
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to submit vote:', err);
      setError('Failed to submit vote');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: { color: 'yellow', text: 'Open', icon: Clock },
      VOTING: { color: 'blue', text: 'Voting', icon: Vote },
      RESOLVED: { color: 'green', text: 'Resolved', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.OPEN;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-50 text-${config.color}-800 border border-${config.color}-200`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const getResolutionBadge = (resolution) => {
    if (!resolution) return null;
    
    const resolutionConfig = {
      ChallengerWins: { color: 'green', text: 'Challenger Won', icon: CheckCircle },
      AuditorWins: { color: 'blue', text: 'Auditor Won', icon: Shield },
      SplitDecision: { color: 'yellow', text: 'Split Decision', icon: Scale },
    };

    const config = resolutionConfig[resolution];
    if (!config) return null;
    
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-50 text-${config.color}-800 border border-${config.color}-200`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-army-200">
          <Gavel className="mx-auto mb-4 text-army-400" size={48} />
          <h2 className="text-xl font-bold text-army-800 mb-2">Dispute Resolution</h2>
          <p className="text-army-600">Please connect your Stellar wallet to access dispute resolution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-army-800 mb-2">Dispute Resolution</h2>
        <p className="text-army-600">
          Fair and transparent dispute resolution through community arbitration.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={20} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {submissionStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 text-sm">
            {activeTab === 'my-disputes' ? 'Dispute filed successfully!' : 'Vote submitted successfully!'}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('my-disputes')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'my-disputes'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          My Disputes
        </button>
        <button
          onClick={() => setActiveTab('arbitration')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'arbitration'
              ? 'bg-army-700 text-white'
              : 'bg-white text-army-700 hover:bg-army-50 border border-army-200'
          }`}
        >
          Arbitration Panel
        </button>
      </div>

      {activeTab === 'my-disputes' && (
        <div className="space-y-6">
          {/* File New Dispute Button */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-army-800 mb-2">File a New Dispute</h3>
                <p className="text-army-600 text-sm">
                  Challenge an audit result you believe is unfair or inaccurate.
                </p>
              </div>
              <button
                onClick={() => setShowFileForm(true)}
                className="px-4 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800"
              >
                <AlertTriangle className="inline mr-2" size={18} />
                File Dispute
              </button>
            </div>
          </div>

          {/* Dispute List */}
          <div className="bg-white rounded-lg shadow-md border border-army-200">
            <div className="p-6 border-b border-army-200">
              <h3 className="text-lg font-semibold text-army-800">Your Disputes</h3>
            </div>
            
            {disputes.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto mb-4 text-army-400" size={48} />
                <p className="text-army-600">No disputes filed yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-army-200">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-army-800">
                            Dispute #{dispute.id}
                          </h4>
                          {getStatusBadge(dispute.status)}
                          {getResolutionBadge(dispute.resolution)}
                        </div>
                        
                        <div className="text-sm text-army-600 mb-3">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              Audit #{dispute.audit_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Filed {new Date(dispute.filed_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-army-700">{dispute.reason}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedDispute(dispute)}
                        className="flex items-center gap-1 px-3 py-1 text-army-700 hover:text-army-900 text-sm font-medium border border-army-300 rounded hover:bg-army-50"
                      >
                        <ExternalLink size={14} />
                        View Details
                      </button>
                    </div>

                    {/* Voting Progress */}
                    {dispute.status === 'VOTING' && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">Voting Progress</span>
                          <span className="text-sm text-blue-600">
                            {dispute.votes_for_challenger + dispute.votes_for_auditor} of 3 votes
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-600">Challenger:</span>
                            <div className="font-medium text-blue-800">{dispute.votes_for_challenger} votes</div>
                          </div>
                          <div>
                            <span className="text-blue-600">Auditor:</span>
                            <div className="font-medium text-blue-800">{dispute.votes_for_auditor} votes</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'arbitration' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-army-200">
            <h3 className="text-lg font-semibold text-army-800 mb-2">Arbitration Panel</h3>
            <p className="text-army-600 text-sm">
              As a trusted auditor, participate in resolving disputes between factories and auditors.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-army-200">
            <div className="p-6 border-b border-army-200">
              <h3 className="text-lg font-semibold text-army-800">Pending Arbitrations</h3>
            </div>
            
            {arbitratorDisputes.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto mb-4 text-army-400" size={48} />
                <p className="text-army-600">No disputes requiring your arbitration at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-army-200">
                {arbitratorDisputes.map((dispute) => {
                  const hasVoted = dispute.has_voted?.includes(publicKey);
                  
                  return (
                    <div key={dispute.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-army-800">
                              Dispute #{dispute.id}
                            </h4>
                            {getStatusBadge(dispute.status)}
                            {hasVoted && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                                <CheckCircle size={14} />
                                Voted
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-army-600 mb-3">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="flex items-center gap-1">
                                <FileText size={14} />
                                Audit #{dispute.audit_id}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Filed {new Date(dispute.filed_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-army-700">{dispute.reason}</p>
                          </div>
                        </div>
                      </div>

                      {/* Voting Interface */}
                      {dispute.status === 'VOTING' && !hasVoted && (
                        <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                          <h5 className="font-medium text-army-800 mb-3">Cast Your Vote</h5>
                          <p className="text-sm text-army-600 mb-4">
                            Review the evidence and cast your vote as an impartial arbitrator.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleVote(dispute.id, true)}
                              disabled={loading}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 font-medium text-sm"
                            >
                              <CheckCircle className="inline mr-2" size={16} />
                              Support Challenger
                            </button>
                            <button
                              onClick={() => handleVote(dispute.id, false)}
                              disabled={loading}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-medium text-sm"
                            >
                              <Shield className="inline mr-2" size={16} />
                              Support Auditor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {showFileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-army-800 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  File New Dispute
                </h3>
                <button
                  onClick={() => setShowFileForm(false)}
                  className="text-army-400 hover:text-army-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFileDispute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-army-700 mb-1">
                    Audit ID *
                  </label>
                  <input
                    type="text"
                    value={disputeForm.auditId}
                    onChange={(e) => setDisputeForm(prev => ({ ...prev, auditId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                    placeholder="Enter audit ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-army-700 mb-1">
                    Reason for Dispute *
                  </label>
                  <select
                    value={disputeForm.reason}
                    onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50"
                  >
                    <option value="">Select a reason</option>
                    <option value="Inaccurate scoring">Inaccurate scoring</option>
                    <option value="Missing evidence review">Missing evidence review</option>
                    <option value="Bias or conflict of interest">Bias or conflict of interest</option>
                    <option value="Procedural violations">Procedural violations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-army-700 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-army-300 rounded-lg focus:ring-2 focus:ring-army-500 focus:border-transparent bg-army-50 resize-none"
                    placeholder="Provide detailed explanation of why you dispute this audit..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFileForm(false)}
                    className="flex-1 py-2 bg-army-100 text-army-700 rounded-lg hover:bg-army-200 transition-colors font-medium border border-army-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || submissionStatus === 'submitting'}
                    className="flex-1 py-2 bg-army-700 text-white rounded-lg hover:bg-army-800 transition-colors font-medium border border-army-800 disabled:bg-army-300"
                  >
                    {submissionStatus === 'submitting' ? (
                      <>
                        <div className="inline w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Gavel className="inline mr-2" size={16} />
                        File Dispute
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-army-800 flex items-center gap-2">
                  <FileText size={20} />
                  Dispute #{selectedDispute.id} Details
                </h3>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-army-400 hover:text-army-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Dispute Overview */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Dispute Overview</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-army-600">Status:</span>
                      <div>{getStatusBadge(selectedDispute.status)}</div>
                    </div>
                    {selectedDispute.resolution && (
                      <div className="flex justify-between">
                        <span className="text-army-600">Resolution:</span>
                        <div>{getResolutionBadge(selectedDispute.resolution)}</div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-army-600">Filed Date:</span>
                      <span className="font-medium text-army-800">
                        {new Date(selectedDispute.filed_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedDispute.resolved_at && (
                      <div className="flex justify-between">
                        <span className="text-army-600">Resolved Date:</span>
                        <span className="font-medium text-army-800">
                          {new Date(selectedDispute.resolved_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Parties Involved</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-army-600">Challenger (Factory):</span>
                      <div className="font-mono text-army-800 text-xs mt-1">
                        {selectedDispute.challenger?.slice(0, 12)}...{selectedDispute.challenger?.slice(-8)}
                      </div>
                    </div>
                    <div>
                      <span className="text-army-600">Defendant (Auditor):</span>
                      <div className="font-mono text-army-800 text-xs mt-1">
                        {selectedDispute.defendant?.slice(0, 12)}...{selectedDispute.defendant?.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                  <h4 className="font-semibold text-army-800 mb-3">Dispute Reason</h4>
                  <p className="text-army-700 text-sm">{selectedDispute.reason}</p>
                </div>

                {/* Voting Results */}
                {selectedDispute.status === 'RESOLVED' && (
                  <div className="bg-army-50 rounded-lg p-4 border border-army-200">
                    <h4 className="font-semibold text-army-800 mb-3 flex items-center gap-2">
                      <Vote size={16} />
                      Voting Results
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-army-600">Votes for Challenger:</span>
                        <div className="font-medium text-army-800">{selectedDispute.votes_for_challenger}</div>
                      </div>
                      <div>
                        <span className="text-army-600">Votes for Auditor:</span>
                        <div className="font-medium text-army-800">{selectedDispute.votes_for_auditor}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
