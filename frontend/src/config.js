// API Configuration
export const API_URL = 'http://localhost:3001/api';

// Stellar Configuration  
export const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET';
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
