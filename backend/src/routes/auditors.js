const express = require('express');
const { Auditor } = require('../models');

const router = express.Router();

// Stake as auditor
router.post('/stake', async (req, res) => {
  try {
    const { auditor, amount, geoRegion } = req.body;

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
    });

    res.status(201).json({
      success: true,
      auditor: {
        id: newAuditor.id,
        wallet_address: newAuditor.wallet_address,
        stake_amount: newAuditor.stake_amount,
        geo_region: newAuditor.geo_region,
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

module.exports = router;
