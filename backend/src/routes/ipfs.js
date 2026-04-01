const express = require('express');
const multer = require('multer');
const simpleIPFSService = require('../services/simpleIPFSService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to IPFS (using Simple IPFS Service)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!simpleIPFSService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'IPFS service not available',
      });
    }

    const result = await simpleIPFSService.uploadFile(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      hash: result.hash,
      url: result.url,
      metadataUrl: result.metadataUrl,
      size: result.size,
      service: process.env.IPFS_SERVICE || 'mock',
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Upload multiple files using Simple IPFS Service
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    if (!simpleIPFSService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'IPFS service not available',
      });
    }

    const results = await simpleIPFSService.uploadMultipleFiles(req.files);

    res.json({
      success: true,
      uploads: results.map((result, index) => ({
        filename: req.files[index].originalname,
        hash: result?.hash || null,
        url: result?.url || null,
        metadataUrl: result?.metadataUrl || null,
        error: result ? null : 'Upload failed',
      })),
      service: process.env.IPFS_SERVICE || 'mock',
    });
  } catch (error) {
    console.error('IPFS multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
