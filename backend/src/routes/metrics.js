const express = require('express');
const { Factory, Auditor, Audit, ReputationScore } = require('../models');

const router = express.Router();

// Get SDG metrics
router.get('/sdg', async (req, res) => {
  try {
    const [factoryCount, auditorCount, auditCount, compliantCount] = await Promise.all([
      Factory.count({ where: { is_active: true } }),
      Auditor.count({ where: { is_active: true } }),
      Audit.count({ where: { is_active: true } }),
      ReputationScore.count({ where: { is_compliant: true } }),
    ]);

    const totalRevenue = factoryCount * 10000;
    const tradeFinanceUnlocked = compliantCount * 50000;
    const jobsSupported = factoryCount * 25;

    const metrics = {
      economic: {
        factories_registered: factoryCount,
        auditors_registered: auditorCount,
        audits_completed: auditCount,
        sme_revenue_growth: 23,
        jobs_supported: jobsSupported,
        trade_finance_unlocked: tradeFinanceUnlocked,
      },
      environmental: {
        co2_reduction_tons: Math.floor(auditCount * 0.34),
        waste_reduction_percent: 18,
        water_usage_optimized: 45,
        sustainable_factories: compliantCount,
      },
      social: {
        female_led_factories: Math.floor(factoryCount * 0.34),
        female_led_percent: 34,
        wage_compliance_rate: 94,
        safety_incidents_reduced: Math.floor(auditCount * 0.15),
      },
    };

    res.json(metrics);
  } catch (error) {
    console.error('Get SDG metrics error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      Factory.count({ where: { is_active: true } }),
      Auditor.count({ where: { is_active: true } }),
      Audit.count({ where: { is_active: true } }),
      ReputationScore.sum('total_score'),
      Factory.findAll({
        attributes: ['location', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
        group: ['location'],
        raw: true,
      }),
    ]);

    res.json({
      totalFactories: stats[0],
      totalAuditors: stats[1],
      totalAudits: stats[2],
      avgReputation: stats[3] ? Math.round(stats[3] / stats[0]) : 0,
      regionalDistribution: stats[4],
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
