import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config.js';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerFactory = useCallback(async (factoryData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/factories/register', factoryData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFactories = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/factories', { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const matchAuditor = useCallback(async (factoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/matching/find-auditor', { factoryId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAudit = useCallback(async (auditData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/audits/submit', auditData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReputationScore = useCallback(async (factoryAddress) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/reputation/${factoryAddress}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stakeAsAuditor = useCallback(async (stakeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auditors/stake', stakeData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSDGMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/metrics/sdg');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFactoryDashboard = useCallback(async (factoryAddress) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/factories/dashboard/${factoryAddress}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createContactRequest = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContactStatus = useCallback(async (contactId, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/contacts/${contactId}`, { status });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAuditorDashboard = useCallback(async (auditorAddress) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/auditors/dashboard/${auditorAddress}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    registerFactory,
    getFactories,
    matchAuditor,
    submitAudit,
    getReputationScore,
    stakeAsAuditor,
    getSDGMetrics,
    getFactoryDashboard,
    createContactRequest,
    updateContactStatus,
    getAuditorDashboard,
  };
}
