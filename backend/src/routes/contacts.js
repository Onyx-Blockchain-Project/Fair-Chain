const express = require('express');
const { ContactRequest, Factory } = require('../models');

const router = express.Router();

// Create a contact request (buyer → factory)
router.post('/', async (req, res) => {
  try {
    const { buyerAddress, factoryAddress, subject, message, buyerEmail, buyerCompany } = req.body;

    // Validate required fields
    if (!buyerAddress || !factoryAddress || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: buyerAddress, factoryAddress, subject, message'
      });
    }

    // Validate Stellar address format (starts with G and is 56 chars)
    const stellarAddressRegex = /^G[A-Z0-9]{55}$/;
    if (!stellarAddressRegex.test(buyerAddress) || !stellarAddressRegex.test(factoryAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Stellar wallet address format'
      });
    }

    // Check if factory exists
    const factory = await Factory.findOne({
      where: { wallet_address: factoryAddress }
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Create contact request
    const contactRequest = await ContactRequest.create({
      buyer_address: buyerAddress,
      factory_address: factoryAddress,
      subject,
      message,
      buyer_email: buyerEmail || null,
      buyer_company: buyerCompany || null,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Contact request sent successfully',
      data: contactRequest
    });
  } catch (error) {
    console.error('Error creating contact request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact request',
      error: error.message
    });
  }
});

// Get contact requests for a factory
router.get('/factory/:factoryAddress', async (req, res) => {
  try {
    const { factoryAddress } = req.params;
    const { status } = req.query;

    const where = { factory_address: factoryAddress };
    if (status) {
      where.status = status;
    }

    const contactRequests = await ContactRequest.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: contactRequests,
      count: contactRequests.length
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests',
      error: error.message
    });
  }
});

// Get contact requests sent by a buyer
router.get('/buyer/:buyerAddress', async (req, res) => {
  try {
    const { buyerAddress } = req.params;

    const contactRequests = await ContactRequest.findAll({
      where: { buyer_address: buyerAddress },
      order: [['createdAt', 'DESC']]
    });

    // Fetch factory details separately
    const factoriesWithDetails = await Promise.all(
      contactRequests.map(async (request) => {
        const factory = await Factory.findOne({
          where: { wallet_address: request.factory_address },
          attributes: ['name', 'location', 'product_type']
        });
        return {
          ...request.toJSON(),
          factory: factory || null
        };
      })
    );

    res.json({
      success: true,
      data: factoriesWithDetails,
      count: factoriesWithDetails.length
    });
  } catch (error) {
    console.error('Error fetching buyer contact requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests',
      error: error.message
    });
  }
});

// Update contact request status (responded/closed)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'RESPONDED', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, RESPONDED, or CLOSED'
      });
    }

    const updateData = { status };
    if (status === 'RESPONDED') {
      updateData.responded_at = new Date();
    }

    const [updatedCount] = await ContactRequest.update(updateData, {
      where: { id }
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    const updatedRequest = await ContactRequest.findByPk(id);

    res.json({
      success: true,
      message: 'Contact request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating contact request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact request',
      error: error.message
    });
  }
});

// Get contact request statistics for a factory
router.get('/stats/:factoryAddress', async (req, res) => {
  try {
    const { factoryAddress } = req.params;

    const stats = await ContactRequest.findAll({
      where: { factory_address: factoryAddress },
      attributes: ['status', [ContactRequest.sequelize.fn('COUNT', '*'), 'count']],
      group: ['status']
    });

    const totalRequests = await ContactRequest.count({
      where: { factory_address: factoryAddress }
    });

    res.json({
      success: true,
      data: {
        total: totalRequests,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: error.message
    });
  }
});

module.exports = router;
