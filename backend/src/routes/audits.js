const express = require('express');
const { Audit, ReputationScore, Factory } = require('../models');

const router = express.Router();

// Submit a new audit
router.post('/submit', async (req, res) => {
  try {
    const {
      auditor,
      factory: factoryAddress,
      ipfsHashes,
      complianceCategory,
      scoreDelta,
      geolocation,
    } = req.body;

    const factory = await Factory.findOne({
      where: { wallet_address: factoryAddress },
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    const audit = await Audit.create({
      factory_address: factoryAddress,
      auditor_address: auditor,
      ipfs_hashes: ipfsHashes,
      compliance_category: complianceCategory,
      score_delta: scoreDelta,
      geolocation,
    });

    await updateReputationScore(factoryAddress);

    res.status(201).json({
      success: true,
      audit: {
        id: audit.id,
        token_id: audit.token_id,
        factory_address: audit.factory_address,
        compliance_category: audit.compliance_category,
      },
      message: 'Audit submitted successfully',
    });
  } catch (error) {
    console.error('Audit submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get audits for a factory
router.get('/factory/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const audits = await Audit.findAll({
      where: {
        factory_address: walletAddress,
        is_active: true,
      },
      order: [['created_at', 'DESC']],
    });

    res.json(audits.map(a => ({
      id: a.id,
      token_id: a.token_id,
      auditor_address: a.auditor_address,
      compliance_category: a.compliance_category,
      score_delta: a.score_delta,
      ipfs_hashes: a.ipfs_hashes,
      created_at: a.created_at,
    })));
  } catch (error) {
    console.error('Get factory audits error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get audits by auditor
router.get('/auditor/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const audits = await Audit.findAll({
      where: {
        auditor_address: walletAddress,
        is_active: true,
      },
      order: [['created_at', 'DESC']],
    });

    res.json(audits.map(a => ({
      id: a.id,
      token_id: a.token_id,
      factory_address: a.factory_address,
      compliance_category: a.compliance_category,
      score_delta: a.score_delta,
      created_at: a.created_at,
    })));
  } catch (error) {
    console.error('Get auditor audits error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

async function updateReputationScore(factoryAddress) {
  try {
    const audits = await Audit.findAll({
      where: {
        factory_address: factoryAddress,
        is_active: true,
      },
    });

    if (audits.length === 0) return;

    const totalScore = audits.reduce((sum, a) => sum + a.score_delta, 0);
    const avgScore = Math.max(0, Math.min(100, 50 + totalScore / audits.length));

    const [score, created] = await ReputationScore.findOrCreate({
      where: { factory_address: factoryAddress },
      defaults: {
        factory_address: factoryAddress,
        total_score: avgScore,
        auditor_reputation_component: 40,
        evidence_depth_component: 25,
        recency_component: 20,
        category_coverage_component: 15,
        audit_count: audits.length,
        is_compliant: avgScore >= 80,
      },
    });

    if (!created) {
      await score.update({
        total_score: avgScore,
        audit_count: audits.length,
        is_compliant: avgScore >= 80,
        calculated_at: new Date(),
      });
    }
  } catch (error) {
    console.error('Update reputation score error:', error);
  }
}

module.exports = router;
