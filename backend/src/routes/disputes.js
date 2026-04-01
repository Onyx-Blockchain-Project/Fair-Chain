const express = require('express');
const { Dispute, Audit, Auditor, Factory } = require('../models');
const router = express.Router();

// Get all disputes for a user (as challenger or defendant)
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const disputes = await Dispute.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { plaintiff: walletAddress },
          { defendant: walletAddress }
        ]
      },
      include: [
        {
          model: Audit,
          as: 'audit',
          include: [
            {
              model: Auditor,
              as: 'auditor',
              attributes: ['name', 'wallet_address']
            },
            {
              model: Factory,
              as: 'factory',
              attributes: ['name', 'wallet_address']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: disputes.map(dispute => ({
        id: dispute.id,
        audit_id: dispute.audit_id,
        plaintiff: dispute.plaintiff,
        defendant: dispute.defendant,
        reason: dispute.reason,
        status: dispute.status,
        resolution: dispute.decision,
        votes_for_challenger: dispute.votes_for_challenger || 0,
        votes_for_auditor: dispute.votes_for_auditor || 0,
        has_voted: dispute.has_voted ? JSON.parse(dispute.has_voted) : [],
        created_at: dispute.created_at,
        resolved_at: dispute.resolved_at,
        slash_amount: dispute.bond,
        audit: dispute.audit ? {
          id: dispute.audit.id,
          overall_score: dispute.audit.overall_score,
          submitted_at: dispute.audit.submitted_at,
          auditor: dispute.audit.auditor,
          factory: dispute.audit.factory
        } : null
      }))
    });
  } catch (error) {
    console.error('Error fetching user disputes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error.message
    });
  }
});

// Get disputes available for arbitration (for top auditors)
router.get('/arbitration/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Check if user is a top auditor (reputation score > 800)
    const auditor = await Auditor.findOne({
      where: { wallet_address: walletAddress }
    });

    if (!auditor || auditor.reputation_score < 800) {
      return res.json({
        success: true,
        data: []
      });
    }

    const disputes = await Dispute.findAll({
      where: { status: 'OPEN' },
      include: [
        {
          model: Audit,
          as: 'audit',
          include: [
            {
              model: Auditor,
              as: 'auditor',
              attributes: ['name', 'wallet_address', 'reputation_score']
            },
            {
              model: Factory,
              as: 'factory',
              attributes: ['name', 'wallet_address']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: disputes.map(dispute => ({
        id: dispute.id,
        audit_id: dispute.audit_id,
        plaintiff: dispute.plaintiff,
        defendant: dispute.defendant,
        reason: dispute.reason,
        status: dispute.status,
        votes_for_challenger: dispute.votes_for_challenger || 0,
        votes_for_auditor: dispute.votes_for_auditor || 0,
        has_voted: dispute.has_voted ? JSON.parse(dispute.has_voted) : [],
        created_at: dispute.created_at,
        audit: dispute.audit ? {
          id: dispute.audit.id,
          overall_score: dispute.audit.overall_score,
          submitted_at: dispute.audit.submitted_at,
          auditor: dispute.audit.auditor,
          factory: dispute.audit.factory
        } : null
      }))
    });
  } catch (error) {
    console.error('Error fetching arbitration disputes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch arbitration disputes',
      error: error.message
    });
  }
});

// File a new dispute
router.post('/file', async (req, res) => {
  try {
    const { auditId, challenger, reason, description } = req.body;

    // Verify audit exists
    const audit = await Audit.findByPk(auditId, {
      include: [
        {
          model: Auditor,
          as: 'auditor'
        },
        {
          model: Factory,
          as: 'factory'
        }
      ]
    });

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit not found'
      });
    }

    // Check if dispute already exists for this audit
    const existingDispute = await Dispute.findOne({
      where: { audit_id: auditId }
    });

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        message: 'Dispute already exists for this audit'
      });
    }

    // Create dispute
    const dispute = await Dispute.create({
      audit_id: auditId,
      plaintiff: challenger,
      defendant: audit.auditor.wallet_address,
      reason: reason,
      bond: 1000000000, // 100 XLM bond in stroops
      status: 'OPEN',
    });

    // Update audit status
    await audit.update({
      status: 'DISPUTED'
    });

    res.status(201).json({
      success: true,
      message: 'Dispute filed successfully',
      data: {
        id: dispute.id,
        audit_id: dispute.audit_id,
        plaintiff: dispute.plaintiff,
        defendant: dispute.defendant,
        reason: dispute.reason,
        status: dispute.status,
        created_at: dispute.created_at
      }
    });
  } catch (error) {
    console.error('Error filing dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to file dispute',
      error: error.message
    });
  }
});

// Submit vote for arbitration
router.post('/vote', async (req, res) => {
  try {
    const { disputeId, arbitrator, voteForChallenger } = req.body;

    const dispute = await Dispute.findByPk(disputeId);
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is not open for voting'
      });
    }

    // Check if arbitrator is eligible (top auditor)
    const auditorRecord = await Auditor.findOne({
      where: { wallet_address: arbitrator }
    });

    if (!auditorRecord || auditorRecord.reputation_score < 800) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to arbitrate disputes'
      });
    }

    // Parse existing votes
    const hasVoted = dispute.has_voted ? JSON.parse(dispute.has_voted) : [];
    
    if (hasVoted.includes(arbitrator)) {
      return res.status(400).json({
        success: false,
        message: 'Already voted on this dispute'
      });
    }

    // Add vote
    hasVoted.push(arbitrator);
    
    const votesForChallenger = dispute.votes_for_challenger || 0;
    const votesForAuditor = dispute.votes_for_auditor || 0;
    
    const newVotesForChallenger = voteForChallenger ? votesForChallenger + 1 : votesForChallenger;
    const newVotesForAuditor = voteForChallenger ? votesForAuditor : votesForAuditor + 1;

    // Update dispute
    await dispute.update({
      has_voted: JSON.stringify(hasVoted),
      votes_for_challenger: newVotesForChallenger,
      votes_for_auditor: newVotesForAuditor,
    });

    // Check if dispute should be resolved (need 3 votes)
    if (hasVoted.length >= 3) {
      let decision = 'SPLIT';
      
      if (newVotesForChallenger >= 2) {
        decision = 'PLAINTIFF_WIN';
      } else if (newVotesForAuditor >= 2) {
        decision = 'DEFENDANT_WIN';
      }

      await dispute.update({
        status: 'RESOLVED',
        decision: decision,
        resolved_at: new Date(),
      });

      // Update audit status based on decision
      const audit = await Audit.findByPk(dispute.audit_id);
      if (audit) {
        if (decision === 'PLAINTIFF_WIN') {
          await audit.update({
            status: 'REJECTED'
          });
        } else {
          await audit.update({
            status: 'VERIFIED'
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Vote submitted successfully',
      data: {
        dispute_id: dispute.id,
        votes_for_challenger: newVotesForChallenger,
        votes_for_auditor: newVotesForAuditor,
        total_votes: hasVoted.length,
        status: dispute.status
      }
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit vote',
      error: error.message
    });
  }
});

// Get dispute details
router.get('/:disputeId', async (req, res) => {
  try {
    const { disputeId } = req.params;
    
    const dispute = await Dispute.findByPk(disputeId, {
      include: [
        {
          model: Audit,
          as: 'audit',
          include: [
            {
              model: Auditor,
              as: 'auditor',
              attributes: ['name', 'wallet_address', 'reputation_score']
            },
            {
              model: Factory,
              as: 'factory',
              attributes: ['name', 'wallet_address']
            }
          ]
        }
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: dispute.id,
        audit_id: dispute.audit_id,
        plaintiff: dispute.plaintiff,
        defendant: dispute.defendant,
        reason: dispute.reason,
        status: dispute.status,
        decision: dispute.decision,
        votes_for_challenger: dispute.votes_for_challenger || 0,
        votes_for_auditor: dispute.votes_for_auditor || 0,
        has_voted: dispute.has_voted ? JSON.parse(dispute.has_voted) : [],
        bond: dispute.bond,
        created_at: dispute.created_at,
        resolved_at: dispute.resolved_at,
        audit: dispute.audit
      }
    });
  } catch (error) {
    console.error('Error fetching dispute details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute details',
      error: error.message
    });
  }
});

// Get dispute statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Dispute.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_disputes'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "OPEN" THEN 1 END')), 'open_disputes'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "RESOLVED" THEN 1 END')), 'resolved_disputes'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN decision = "PLAINTIFF_WIN" THEN 1 END')), 'challenger_wins'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN decision = "DEFENDANT_WIN" THEN 1 END')), 'auditor_wins'],
      ],
      raw: true
    });

    const disputeStats = {
      total_disputes: parseInt(stats[0].total_disputes) || 0,
      open_disputes: parseInt(stats[0].open_disputes) || 0,
      resolved_disputes: parseInt(stats[0].resolved_disputes) || 0,
      challenger_wins: parseInt(stats[0].challenger_wins) || 0,
      auditor_wins: parseInt(stats[0].auditor_wins) || 0,
      split_decisions: (parseInt(stats[0].resolved_disputes) || 0) - (parseInt(stats[0].challenger_wins) || 0) - (parseInt(stats[0].auditor_wins) || 0),
    };

    res.json({
      success: true,
      data: disputeStats
    });
  } catch (error) {
    console.error('Error fetching dispute statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute statistics',
      error: error.message
    });
  }
});

module.exports = router;
