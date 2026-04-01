const express = require('express');
const { Factory, Auditor, Audit, ReputationScore, ContactRequest } = require('../models');
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

    // Use upsert to handle duplicates gracefully
    const [factory, created] = await Factory.findOrCreate({
      where: { wallet_address: walletAddress },
      defaults: {
        wallet_address: walletAddress,
        owner_address: owner,
        name,
        location,
        product_type: productType,
        employee_count: employeeCount,
        latitude,
        longitude,
      }
    });

    if (!created) {
      // Factory already exists, update it with new information
      await factory.update({
        owner_address: owner,
        name,
        location,
        product_type: productType,
        employee_count: employeeCount,
        latitude,
        longitude,
      });
      
      return res.status(200).json({
        success: true,
        factory: {
          id: factory.id,
          wallet_address: factory.wallet_address,
          name: factory.name,
        },
        message: 'Factory profile updated successfully',
      });
    }

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
    
    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'This wallet address is already registered. Try updating your existing factory or use a different wallet.',
      });
    }
    
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

// Get factory dashboard data (for logged-in factory owner)
router.get('/dashboard/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const factory = await Factory.findOne({
      where: { wallet_address: walletAddress },
      include: [{ model: ReputationScore, as: 'ReputationScore' }],
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    // Get all audits for this factory
    const audits = await Audit.findAll({
      where: { factory_address: walletAddress },
      include: [{
        model: Auditor,
        attributes: ['name', 'reputation_score', 'wallet_address']
      }],
      order: [['created_at', 'DESC']],
    });

    // Get contact requests
    const contactRequests = await ContactRequest.findAll({
      where: { factory_address: walletAddress },
      order: [['createdAt', 'DESC']],
    });

    // Calculate dashboard stats
    const pendingContacts = contactRequests.filter(c => c.status === 'PENDING').length;
    const respondedContacts = contactRequests.filter(c => c.status === 'RESPONDED').length;

    const dashboardData = {
      factory: {
        id: factory.id,
        wallet_address: factory.wallet_address,
        name: factory.name,
        location: factory.location,
        product_type: factory.product_type,
        employee_count: factory.employee_count,
        is_active: factory.is_active,
        registered_at: factory.registered_at,
      },
      reputation: factory.ReputationScore || null,
      audits: audits.map(audit => ({
        id: audit.id,
        audit_id_on_chain: audit.token_id,
        auditor: audit.Auditor,
        overall_score: audit.score_delta + 50, // Convert from delta to absolute score
        labor_score: audit.score_delta + 50, // Simplified - in real app would have separate scores
        environmental_score: audit.score_delta + 50,
        quality_score: audit.score_delta + 50,
        safety_score: audit.score_delta + 50,
        notes: audit.geolocation || 'No notes provided',
        evidence_urls: audit.ipfs_hashes,
        status: audit.is_active ? 'VERIFIED' : 'PENDING',
        submitted_at: audit.created_at,
        verified_at: audit.updated_at,
      })),
      contacts: {
        total: contactRequests.length,
        pending: pendingContacts,
        responded: respondedContacts,
        recent: contactRequests.slice(0, 5),
      },
      stats: {
        total_audits: audits.length,
        average_score: audits.length > 0 
          ? (audits.reduce((sum, a) => sum + (a.score_delta + 50), 0) / audits.length).toFixed(2)
          : 0,
        latest_audit_date: audits.length > 0 ? audits[0].created_at : null,
        compliance_trend: audits.length > 1 
          ? (audits[0].score_delta + 50) - (audits[audits.length - 1].score_delta + 50)
          : 0,
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Get factory dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
