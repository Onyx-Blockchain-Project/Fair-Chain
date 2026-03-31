class IPFSService {
  constructor() {
    this.client = null;
    console.log('IPFS service disabled - using NFT.Storage instead');
  }

  async uploadFile(fileBuffer, filename) {
    throw new Error('IPFS service disabled. Use NFT.Storage endpoint instead: /api/nftstorage/upload');
  }

  async uploadMultipleFiles(files) {
    throw new Error('IPFS service disabled. Use NFT.Storage endpoint instead: /api/nftstorage/upload-multiple');
  }

  getUrl(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
  }

  isAvailable() {
    return false;
  }
}

module.exports = new IPFSService();
