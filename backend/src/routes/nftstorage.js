const express = require('express');
const multer = require('multer');
const nftStorageService = require('../services/nftStorageService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload single file to NFT.Storage
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!nftStorageService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'NFT.Storage service not available - check API key configuration',
      });
    }

    const metadata = {
      name: req.body.name || req.file.originalname,
      description: req.body.description || 'FairChain audit evidence',
      properties: req.body.properties ? JSON.parse(req.body.properties) : {},
    };

    const result = await nftStorageService.uploadFile(
      req.file.buffer, 
      req.file.originalname,
      metadata
    );

    res.json({
      success: true,
      cid: result.hash,
      url: result.url,
      metadataUrl: result.metadataUrl,
      filename: result.filename,
      size: result.size,
      service: 'nft.storage',
    });
  } catch (error) {
    console.error('NFT.Storage upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Upload multiple files to NFT.Storage
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    if (!nftStorageService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'NFT.Storage service not available - check API key configuration',
      });
    }

    const metadata = {
      description: req.body.description || 'FairChain audit evidence batch',
      properties: req.body.properties ? JSON.parse(req.body.properties) : {},
    };

    const results = await nftStorageService.uploadMultipleFiles(req.files, metadata);

    res.json({
      success: true,
      uploads: results.map((result, index) => ({
        filename: req.files[index].originalname,
        cid: result?.hash || null,
        url: result?.url || null,
        metadataUrl: result?.metadataUrl || null,
        error: result ? null : 'Upload failed',
      })),
      service: 'nft.storage',
    });
  } catch (error) {
    console.error('NFT.Storage multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Check NFT.Storage status
router.get('/status/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!nftStorageService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'NFT.Storage service not available',
      });
    }

    const status = await nftStorageService.checkStatus(cid);

    res.json({
      success: true,
      cid,
      status,
    });
  } catch (error) {
    console.error('NFT.Storage status check error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get NFT.Storage config status
router.get('/config', async (req, res) => {
  res.json({
    available: nftStorageService.isAvailable(),
    service: 'nft.storage',
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs',
  });
});

module.exports = router;
