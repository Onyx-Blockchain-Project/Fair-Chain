import { useState, useCallback } from 'react';
import { create } from 'ipfs-http-client';

// Use Vite's import.meta.env instead of process.env
const projectId = import.meta.env.VITE_INFURA_PROJECT_ID || '';
const projectSecret = import.meta.env.VITE_INFURA_SECRET || '';

const IPFS_CONFIG = {
  url: 'https://ipfs.infura.io:5001',
  headers: projectId && projectSecret ? {
    authorization: 'Basic ' + btoa(projectId + ':' + projectSecret),
  } : undefined,
};

let ipfsClient = null;

try {
  ipfsClient = create(IPFS_CONFIG);
} catch (error) {
  console.warn('IPFS client initialization failed:', error);
}

export function useIPFS() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!ipfsClient) {
      setError('IPFS client not available');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      const added = await ipfsClient.add(file);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      
      return {
        hash: added.path,
        url,
        size: added.size,
      };
    } catch (err) {
      setError(err.message || 'Failed to upload to IPFS');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files) => {
    if (!ipfsClient) {
      setError('IPFS client not available');
      return [];
    }

    setUploading(true);
    setError(null);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const added = await ipfsClient.add(file);
          return {
            hash: added.path,
            url: `https://ipfs.io/ipfs/${added.path}`,
            size: added.size,
            name: file.name,
          };
        })
      );

      return results;
    } catch (err) {
      setError(err.message || 'Failed to upload files to IPFS');
      return [];
    } finally {
      setUploading(false);
    }
  }, []);

  const getFileUrl = useCallback((hash) => {
    return `https://ipfs.io/ipfs/${hash}`;
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    getFileUrl,
    uploading,
    error,
    isAvailable: !!ipfsClient,
  };
}
