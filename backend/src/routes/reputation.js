const express = require('express');
const { ReputationScore } = require('../models');

const router = express.Router();

// Get reputation score for a factory
router.get('/:factoryAddress', async (req, res) => {
  try {
    const { factoryAddress } = req.params;

    const score = await ReputationScore.findOne({
      where: { factory_address: factoryAddress },
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Reputation score not found',
      });
    }

    res.json({
      success: true,
      total_score: score.total_score,
      auditor_reputation_component: score.auditor_reputation_component,
      evidence_depth_component: score.evidence_depth_component,
      recency_component: score.recency_component,
      category_coverage_component: score.category_coverage_component,
      audit_count: score.audit_count,
      last_audit_timestamp: score.last_audit_timestamp,
      is_compliant: score.is_compliant,
    });
  } catch (error) {
    console.error('Get reputation score error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get top rated factories
router.get('/top/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;

    const scores = await ReputationScore.findAll({
      where: { is_compliant: true },
      order: [['total_score', 'DESC']],
      limit,
    });

    res.json(scores.map(s => ({
      factory_address: s.factory_address,
      total_score: s.total_score,
      audit_count: s.audit_count,
      is_compliant: s.is_compliant,
    })));
  } catch (error) {
    console.error('Get top factories error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
