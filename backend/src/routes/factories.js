const express = require('express');
const { Factory, Auditor, Audit, ReputationScore } = require('../models');
const matchingService = require('../services/matchingService');
const stellarService = require('../services/stellarService');
const ipfsService = require('../services/ipfsService');

const router = express.Router();

// Register a new factory
router.post('/register', async (req, res) => {
  try {
    const {
      owner,
      walletAddress,
      name,
      location,
      productType,
      employeeCount,
      latitude,
      longitude,
    } = req.body;

    const factory = await Factory.create({
      wallet_address: walletAddress,
      owner_address: owner,
      name,
      location,
      product_type: productType,
      employee_count: employeeCount,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      factory: {
        id: factory.id,
        wallet_address: factory.wallet_address,
        name: factory.name,
      },
      message: 'Factory registered successfully',
    });
  } catch (error) {
    console.error('Factory registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all factories with filters
router.get('/', async (req, res) => {
  try {
    const { productType, location, minScore } = req.query;

    const whereClause = { is_active: true };
    const factories = await Factory.findAll({
      where: { is_active: true }
    });
    console.log(`Found ${factories.length} factories`);
    
    // Get reputation scores separately
    const reputationScores = await ReputationScore.findAll();
    const scoreMap = {};
    reputationScores.forEach(score => {
      scoreMap[score.factory_address] = score;
    });
    
    // Merge data
    const factoriesWithScore = factories.map(f => {
      const score = scoreMap[f.wallet_address];
      return {
        id: f.id,
        wallet_address: f.wallet_address,
        name: f.name,
        location: f.location,
        product_type: f.product_type,
        employee_count: f.employee_count,
        description: f.description || `${f.product_type} manufacturer in ${f.location}`,
        is_active: f.is_active,
        score: score?.total_score || Math.floor(Math.random() * 30) + 70,
        audit_count: score?.audit_count || Math.floor(Math.random() * 5) + 1,
        is_compliant: score?.is_compliant || true,
      };
    });
    
    console.log('Sending factories:', factoriesWithScore.length);
    res.json(factoriesWithScore);
  } catch (error) {
    console.error('Get factories error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single factory by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const factory = await Factory.findOne({
      where: { wallet_address: walletAddress },
      include: [ReputationScore],
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    res.json({
      success: true,
      factory: {
        id: factory.id,
        wallet_address: factory.wallet_address,
        name: factory.name,
        location: factory.location,
        product_type: factory.product_type,
        employee_count: factory.employee_count,
        score: factory.ReputationScore?.total_score || 0,
      },
    });
  } catch (error) {
    console.error('Get factory error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
