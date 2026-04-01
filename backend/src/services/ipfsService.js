// Legacy IPFS Service - using Simple IPFS Service instead
// This file is kept for compatibility but delegates to Simple IPFS Service

const simpleIPFSService = require('./simpleIPFSService');

class IPFSService {
  constructor() {
    this.client = null;
    console.log('IPFS service delegating to Simple IPFS Service');
  }

  async uploadFile(fileBuffer, filename) {
    return simpleIPFSService.uploadFile(fileBuffer, filename);
  }

  async uploadMultipleFiles(files) {
    return simpleIPFSService.uploadMultipleFiles(files);
  }

  getUrl(hash) {
    return simpleIPFSService.getUrl(hash);
  }

  isAvailable() {
    return simpleIPFSService.isAvailable();
  }
}

module.exports = new IPFSService();
