const express = require('express');
const matchingService = require('../services/matchingService');

const router = express.Router();

// Find best auditor for a factory
router.post('/find-auditor', async (req, res) => {
  try {
    const { factoryId } = req.body;

    const matches = await matchingService.findBestAuditor(factoryId);

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available auditors found',
      });
    }

    res.json({
      success: true,
      matches: matches.map(m => ({
        auditor: {
          id: m.auditor.id,
          wallet_address: m.auditor.wallet_address,
          geo_region: m.auditor.geo_region,
          reputation_score: m.auditor.reputation_score,
          audit_count: m.auditor.audit_count,
        },
        match_score: Math.round(m.score * 100) / 100,
        breakdown: m.breakdown,
      })),
    });
  } catch (error) {
    console.error('Find auditor error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
