// Contract configuration for FairChain frontend
// These values are loaded from .env file

export const STELLAR_CONFIG = {
  network: import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET',
  rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
};

export const CONTRACT_IDS = {
  factoryRegistry: import.meta.env.VITE_FACTORY_REGISTRY_CONTRACT_ID,
  auditorStaking: import.meta.env.VITE_AUDITOR_STAKING_CONTRACT_ID,
  auditNFT: import.meta.env.VITE_AUDIT_NFT_CONTRACT_ID,
  reputationOracle: import.meta.env.VITE_REPUTATION_ORACLE_CONTRACT_ID,
  rwaWrapper: import.meta.env.VITE_RWA_WRAPPER_CONTRACT_ID,
  disputeResolution: import.meta.env.VITE_DISPUTE_RESOLUTION_CONTRACT_ID,
};

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
};

// Verify all contract IDs are present
export const validateConfig = () => {
  const missing = Object.entries(CONTRACT_IDS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.warn('Missing contract IDs:', missing);
    return false;
  }
  return true;
};
