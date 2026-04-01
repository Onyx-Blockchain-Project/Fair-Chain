const express = require('express');
const { Auditor, Audit, Factory } = require('../models');

const router = express.Router();

// Stake as auditor
router.post('/stake', async (req, res) => {
  try {
    const { auditor, amount, geoRegion } = req.body;

    if (!auditor || !amount || !geoRegion) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: auditor, amount, geoRegion',
      });
    }

    const existingAuditor = await Auditor.findOne({
      where: { wallet_address: auditor },
    });

    if (existingAuditor) {
      return res.status(400).json({
        success: false,
        message: 'Auditor already staked',
      });
    }

    const newAuditor = await Auditor.create({
      wallet_address: auditor,
      stake_amount: amount,
      geo_region: geoRegion,
      name: req.body.name,
      email: req.body.email,
    });

    res.status(201).json({
      success: true,
      auditor: {
        id: newAuditor.id,
        wallet_address: newAuditor.wallet_address,
        stake_amount: newAuditor.stake_amount,
        geo_region: newAuditor.geo_region,
        name: newAuditor.name,
        email: newAuditor.email,
        reputation_score: newAuditor.reputation_score,
      },
      message: 'Auditor staked successfully',
    });
  } catch (error) {
    console.error('Auditor staking error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all auditors
router.get('/', async (req, res) => {
  try {
    const { region, minReputation } = req.query;

    const whereClause = { is_active: true };
    if (region) whereClause.geo_region = region;
    if (minReputation) whereClause.reputation_score = { [require('sequelize').Op.gte]: minReputation };

    const auditors = await Auditor.findAll({
      where: whereClause,
      order: [['reputation_score', 'DESC']],
    });

    res.json(auditors.map(a => ({
      id: a.id,
      wallet_address: a.wallet_address,
      geo_region: a.geo_region,
      reputation_score: a.reputation_score,
      audit_count: a.audit_count,
      stake_amount: a.stake_amount,
    })));
  } catch (error) {
    console.error('Get auditors error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get auditor by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const auditor = await Auditor.findOne({
      where: { wallet_address: walletAddress },
    });

    if (!auditor) {
      return res.status(404).json({
        success: false,
        message: 'Auditor not found',
      });
    }

    res.json({
      success: true,
      auditor: {
        id: auditor.id,
        wallet_address: auditor.wallet_address,
        geo_region: auditor.geo_region,
        reputation_score: auditor.reputation_score,
        audit_count: auditor.audit_count,
        stake_amount: auditor.stake_amount,
        is_active: auditor.is_active,
      },
    });
  } catch (error) {
    console.error('Get auditor error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get auditor dashboard data (profile + audit history)
router.get('/dashboard/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const auditor = await Auditor.findOne({
      where: { wallet_address: walletAddress },
    });

    if (!auditor) {
      return res.status(404).json({
        success: false,
        message: 'Auditor not found. Please stake first to become an auditor.',
      });
    }

    // Get all audits submitted by this auditor
    const audits = await Audit.findAll({
      where: { auditor_address: walletAddress },
      include: [{
        model: Factory,
        attributes: ['name', 'location', 'product_type']
      }],
      order: [['created_at', 'DESC']],
    });

    // Calculate stats
    const totalAudits = audits.length;
    const averageScore = totalAudits > 0 
      ? (audits.reduce((sum, a) => sum + (a.score_delta + 50), 0) / totalAudits).toFixed(2)
      : 0;
    const verifiedAudits = audits.filter(a => a.is_active).length;
    const pendingAudits = audits.filter(a => !a.is_active).length;

    // Calculate earnings (simplified: 10 XLM per audit)
    const estimatedEarnings = totalAudits * 10;

    const dashboardData = {
      auditor: {
        id: auditor.id,
        wallet_address: auditor.wallet_address,
        name: auditor.name,
        email: auditor.email,
        geo_region: auditor.geo_region,
        reputation_score: auditor.reputation_score,
        audit_count: auditor.audit_count,
        staked_amount: auditor.staked_amount || auditor.stake_amount,
        is_active: auditor.is_active,
        created_at: auditor.createdAt,
      },
      audits: audits.map(audit => ({
        id: audit.id,
        audit_id_on_chain: audit.token_id,
        factory: audit.Factory,
        overall_score: audit.score_delta + 50, // Convert from delta to absolute score
        labor_score: audit.score_delta + 50, // Simplified - in real app would have separate scores
        environmental_score: audit.score_delta + 50,
        quality_score: audit.score_delta + 50,
        safety_score: audit.score_delta + 50,
        notes: audit.geolocation || 'No notes provided',
        status: audit.is_active ? 'VERIFIED' : 'PENDING',
        submitted_at: audit.created_at,
        verified_at: audit.updated_at,
        evidence_count: audit.ipfs_hashes ? audit.ipfs_hashes.length : 0,
      })),
      stats: {
        total_audits: totalAudits,
        verified_audits: verifiedAudits,
        pending_audits: pendingAudits,
        average_score: averageScore,
        estimated_earnings: estimatedEarnings,
        reputation_tier: getReputationTier(auditor.reputation_score),
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get auditor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper function to determine reputation tier
function getReputationTier(score) {
  if (score >= 90) return { tier: 'Elite', color: 'gold', benefits: '2x earnings multiplier' };
  if (score >= 75) return { tier: 'Expert', color: 'purple', benefits: '1.5x earnings multiplier' };
  if (score >= 60) return { tier: 'Verified', color: 'blue', benefits: 'Standard earnings' };
  if (score >= 40) return { tier: 'Junior', color: 'green', benefits: 'Training mode' };
  return { tier: 'New', color: 'gray', benefits: 'Complete audits to earn reputation' };
}

module.exports = router;
