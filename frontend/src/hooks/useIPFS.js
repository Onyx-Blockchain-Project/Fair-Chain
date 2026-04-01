import { useState, useCallback } from 'react';
import axios from 'axios';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useIPFS() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpload, setLastUpload] = useState(null);

  const uploadFile = useCallback(async (file) => {
    setUploading(true);
    setError(null);

    try {
      console.log('Uploading file to NFT.Storage:', file.name, 'Size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/ipfs/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const result = {
          hash: response.data.hash,
          url: response.data.url,
          metadataUrl: response.data.metadataUrl,
          size: response.data.size,
        };
        
        console.log('File uploaded successfully to NFT.Storage:', result.hash);
        setLastUpload(result);
        return result;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('NFT.Storage upload error:', err);
      const errorMessage = `Failed to upload to NFT.Storage: ${err.response?.data?.message || err.message}`;
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files) => {
    setUploading(true);
    setError(null);

    try {
      console.log('Uploading multiple files to NFT.Storage:', files.length);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/api/ipfs/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const results = response.data.uploads.map(upload => ({
          hash: upload.hash,
          url: upload.url,
          metadataUrl: upload.metadataUrl,
          size: upload.size,
          name: upload.filename,
          error: upload.error,
        }));

        console.log('Multiple files uploaded successfully to NFT.Storage:', results.length);
        return results.filter(r => !r.error); // Only return successful uploads
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Multiple files upload error:', err);
      const errorMessage = `Failed to upload files to NFT.Storage: ${err.response?.data?.message || err.message}`;
      setError(errorMessage);
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
    lastUpload,
    isAvailable: true, // Always available when using backend NFT.Storage
  };
}
