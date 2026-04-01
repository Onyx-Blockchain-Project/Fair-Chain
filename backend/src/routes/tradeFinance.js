const express = require('express');
const { TradeFinance, Reputation } = require('../models');
const router = express.Router();

// Get all loans for a factory
router.get('/factory/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const loans = await TradeFinance.findAll({
      where: { factory_address: walletAddress },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: loans.map(loan => ({
        id: loan.id,
        factory: loan.factory_address,
        lender: loan.lender_address,
        amount: loan.amount,
        collateral_amount: loan.collateral_amount,
        interest_rate: 5, // 5% fixed rate
        term_days: 90,
        status: loan.status,
        created_at: loan.created_at,
        due_at: loan.approved_at ? new Date(loan.approved_at.getTime() + 90 * 24 * 60 * 60 * 1000) : null,
        reputation_score: loan.reputation_score || 0,
        invoice_hash: loan.invoice_hash,
      }))
    });
  } catch (error) {
    console.error('Error fetching factory loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans',
      error: error.message
    });
  }
});

// Get all loans for a lender
router.get('/lender/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const loans = await TradeFinance.findAll({
      where: { lender_address: walletAddress },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: loans.map(loan => ({
        id: loan.id,
        factory: loan.factory_address,
        lender: loan.lender_address,
        amount: loan.amount,
        collateral_amount: loan.collateral_amount,
        interest_rate: 5,
        term_days: 90,
        status: loan.status,
        created_at: loan.created_at,
        due_at: loan.approved_at ? new Date(loan.approved_at.getTime() + 90 * 24 * 60 * 60 * 1000) : null,
        reputation_score: loan.reputation_score || 0,
        invoice_hash: loan.invoice_hash,
      }))
    });
  } catch (error) {
    console.error('Error fetching lender loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans',
      error: error.message
    });
  }
});

// Request a new loan
router.post('/request', async (req, res) => {
  try {
    const {
      factory,
      invoiceHash,
      amount,
      invoiceDescription,
      buyerName,
      expectedPaymentDate
    } = req.body;

    // Convert amount from XLM to stroops if needed
    const loanAmount = typeof amount === 'string' ? parseFloat(amount) * 10000000 : amount;

    // Get factory reputation
    const reputation = await Reputation.findOne({
      where: { factory_address: factory }
    });

    if (!reputation || reputation.total_score < 60) {
      return res.status(400).json({
        success: false,
        message: 'Factory reputation score is too low for financing'
      });
    }

    // Check for existing active loans
    const existingLoan = await TradeFinance.findOne({
      where: {
        factory_address: factory,
        status: 'APPROVED'
      }
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: 'Factory already has an active loan'
      });
    }

    // Create loan request
    const loan = await TradeFinance.create({
      factory_address: factory,
      lender_address: null, // Will be set when approved
      amount: loanAmount,
      invoice_hash: invoiceHash,
      invoice_description: invoiceDescription,
      buyer_name: buyerName,
      expected_payment_date: expectedPaymentDate,
      status: 'PENDING',
      reputation_score: reputation.total_score,
      collateral_amount: Math.floor(loanAmount * 1.5), // 150% collateral
    });

    res.status(201).json({
      success: true,
      message: 'Loan request submitted successfully',
      data: {
        id: loan.id,
        status: loan.status,
        amount: loan.amount,
        collateral_amount: loan.collateral_amount,
        created_at: loan.created_at
      }
    });
  } catch (error) {
    console.error('Error requesting loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request loan',
      error: error.message
    });
  }
});

// Approve a loan (for authorized lenders)
router.post('/approve/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { lender } = req.body;

    const loan = await TradeFinance.findByPk(loanId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in pending status'
      });
    }

    // Update loan status
    await loan.update({
      lender_address: lender,
      status: 'APPROVED',
      approved_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Loan approved successfully',
      data: {
        id: loan.id,
        status: loan.status,
        approved_at: loan.approved_at,
        due_at: new Date(loan.approved_at.getTime() + 90 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve loan',
      error: error.message
    });
  }
});

// Repay a loan
router.post('/repay/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await TradeFinance.findByPk(loanId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in active status'
      });
    }

    // Update loan status
    await loan.update({
      status: 'REPAID',
      released_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Loan repaid successfully',
      data: {
        id: loan.id,
        status: loan.status,
        released_at: loan.released_at
      }
    });
  } catch (error) {
    console.error('Error repaying loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to repay loan',
      error: error.message
    });
  }
});

// Get pending loan requests (for lenders)
router.get('/pending', async (req, res) => {
  try {
    const loans = await TradeFinance.findAll({
      where: { status: 'PENDING' },
      include: [{
        model: Reputation,
        as: 'reputation'
      }],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: loans.map(loan => ({
        id: loan.id,
        factory: loan.factory_address,
        amount: loan.amount,
        collateral_amount: loan.collateral_amount,
        reputation_score: loan.reputation_score || 0,
        invoice_hash: loan.invoice_hash,
        invoice_description: loan.invoice_description,
        buyer_name: loan.buyer_name,
        expected_payment_date: loan.expected_payment_date,
        created_at: loan.created_at,
      }))
    });
  } catch (error) {
    console.error('Error fetching pending loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending loans',
      error: error.message
    });
  }
});

// Check loan eligibility
router.post('/eligibility', async (req, res) => {
  try {
    const { factory, amount } = req.body;

    // Get factory reputation
    const reputation = await Reputation.findOne({
      where: { factory_address: factory }
    });

    if (!reputation) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'No reputation score found'
      });
    }

    // Check reputation score
    if (reputation.total_score < 60) {
      return res.json({
        success: true,
        eligible: false,
        reason: `Reputation score ${reputation.total_score} is below minimum requirement of 60`
      });
    }

    // Check for existing active loans
    const existingLoan = await TradeFinance.findOne({
      where: {
        factory_address: factory,
        status: 'APPROVED'
      }
    });

    if (existingLoan) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'Factory already has an active loan'
      });
    }

    // Check amount limits
    const loanAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (loanAmount < 100 || loanAmount > 10000) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'Loan amount must be between 100 and 10,000 XLM'
      });
    }

    res.json({
      success: true,
      eligible: true,
      reputation_score: reputation.total_score,
      collateral_required: Math.floor(loanAmount * 1.5),
      interest_rate: 5,
      term_days: 90
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

// Get lender pool statistics
router.get('/pool/stats', async (req, res) => {
  try {
    const stats = await TradeFinance.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_loans'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total_amount'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN status = "APPROVED" THEN amount ELSE 0 END')), 'active_loans'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN status = "REPAID" THEN amount ELSE 0 END')), 'repaid_loans'],
      ],
      raw: true
    });

    const defaultRate = await TradeFinance.count({
      where: { status: 'DEFAULTED' }
    });

    const totalLoans = await TradeFinance.count();

    const poolStats = {
      total_loans: parseInt(stats[0].total_loans) || 0,
      total_amount: parseInt(stats[0].total_amount) || 0,
      active_loans: parseInt(stats[0].active_loans) || 0,
      repaid_loans: parseInt(stats[0].repaid_loans) || 0,
      default_rate: totalLoans > 0 ? (defaultRate / totalLoans) * 100 : 0,
      interest_earned: 0, // Would be calculated from actual repayments
    };

    res.json({
      success: true,
      data: poolStats
    });
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pool statistics',
      error: error.message
    });
  }
});

module.exports = router;
