const { NFTStorage, File } = require('nft.storage');

class NFTStorageService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    const apiKey = process.env.NFT_STORAGE_API_KEY;
    
    if (!apiKey) {
      console.warn('NFT_STORAGE_API_KEY not configured');
      return;
    }

    try {
      this.client = new NFTStorage({ token: apiKey });
      console.log('NFT.Storage client initialized');
    } catch (error) {
      console.error('Failed to initialize NFT.Storage client:', error);
    }
  }

  async uploadFile(fileBuffer, filename, metadata = {}) {
    if (!this.client) {
      throw new Error('NFT.Storage client not initialized');
    }

    try {
      const file = new File([fileBuffer], filename, { type: this.getMimeType(filename) });
      
      const nft = {
        image: file,
        name: metadata.name || filename,
        description: metadata.description || `FairChain audit evidence: ${filename}`,
        properties: {
          platform: 'FairChain',
          type: 'audit_evidence',
          timestamp: new Date().toISOString(),
          ...metadata.properties,
        },
      };

      const cid = await this.client.store(nft);

      return {
        hash: cid.ipnft,
        url: `https://ipfs.io/ipfs/${cid.ipnft}`,
        metadataUrl: `https://ipfs.io/ipfs/${cid.url}`,
        filename,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('NFT.Storage upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files, metadata = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(
          file.buffer, 
          file.originalname,
          { ...metadata, name: file.originalname }
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        results.push(null);
      }
    }

    return results;
  }

  async uploadBlob(data, filename) {
    if (!this.client) {
      throw new Error('NFT.Storage client not initialized');
    }

    try {
      const blob = new Blob([data], { type: this.getMimeType(filename) });
      const cid = await this.client.storeBlob(blob);

      return {
        hash: cid,
        url: `https://ipfs.io/ipfs/${cid}`,
        filename,
      };
    } catch (error) {
      console.error('NFT.Storage blob upload failed:', error);
      throw error;
    }
  }

  async checkStatus(cid) {
    if (!this.client) {
      throw new Error('NFT.Storage client not initialized');
    }

    try {
      const status = await this.client.status(cid);
      return status;
    } catch (error) {
      console.error('Failed to check NFT.Storage status:', error);
      throw error;
    }
  }

  getUrl(cid, path = '') {
    const baseUrl = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
    return path 
      ? `${baseUrl}/${cid}/${path}`
      : `${baseUrl}/${cid}`;
  }

  getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  isAvailable() {
    return this.client !== null;
  }
}

module.exports = new NFTStorageService();
