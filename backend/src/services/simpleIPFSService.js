// Simple IPFS Service for development
// Can be easily switched to production services

class SimpleIPFSService {
  constructor() {
    this.gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
    this.service = process.env.IPFS_SERVICE || 'mock'; // 'mock', 'pinata', 'infura'
    console.log(`IPFS Service: ${this.service}`);
  }

  async uploadFile(fileBuffer, filename, metadata = {}) {
    switch (this.service) {
      case 'pinata':
        return this.uploadToPinata(fileBuffer, filename, metadata);
      case 'infura':
        return this.uploadToInfura(fileBuffer, filename, metadata);
      default:
        return this.mockUpload(fileBuffer, filename, metadata);
    }
  }

  async uploadMultipleFiles(files, metadata = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.originalname, {
          ...metadata,
          name: file.originalname
        });
        results.push({
          hash: result.hash,
          url: result.url,
          metadataUrl: result.metadataUrl,
          size: result.size,
          name: file.originalname,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        results.push(null);
      }
    }

    return results.filter(r => r !== null);
  }

  async mockUpload(fileBuffer, filename, metadata = {}) {
    // Generate a realistic-looking IPFS hash
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = `bafybei${timestamp}${random}`;
    
    return {
      hash,
      url: `${this.gateway}/${hash}`,
      metadataUrl: `${this.gateway}/${hash}`,
      filename,
      size: fileBuffer.length,
    };
  }

  async uploadToPinata(fileBuffer, filename, metadata = {}) {
    const FormData = require('form-data');
    const axios = require('axios');

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename,
      contentType: this.getMimeType(filename),
    });

    if (Object.keys(metadata).length > 0) {
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || filename,
        keyvalues: metadata,
      }));
    }

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_KEY,
          ...formData.getHeaders(),
        },
      });

      return {
        hash: response.data.IpfsHash,
        url: `${this.gateway}/${response.data.IpfsHash}`,
        metadataUrl: `${this.gateway}/${response.data.IpfsHash}`,
        filename,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('Pinata upload failed:', error);
      throw error;
    }
  }

  async uploadToInfura(fileBuffer, filename, metadata = {}) {
    // Implementation for Infura IPFS
    // This would require the ipfs-http-client package
    throw new Error('Infura IPFS not implemented yet');
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
      'txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  getUrl(hash, path = '') {
    return path 
      ? `${this.gateway}/${hash}/${path}`
      : `${this.gateway}/${hash}`;
  }

  isAvailable() {
    return true; // Always available
  }
}

module.exports = new SimpleIPFSService();
