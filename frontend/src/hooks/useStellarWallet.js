import { useState, useEffect, useCallback } from 'react';

// MOCK MODE: Set to true for testing without Freighter extension
// In mock mode, wallet appears connected with a test address
const USE_MOCK_WALLET = true; // Toggle this to true for testing
const MOCK_PUBLIC_KEY = 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H';

// Helper to find Freighter API across different browsers
const getFreighterApi = () => {
  // Try all possible API names
  return window.freighterApi || 
         window.freighter || 
         window.stellar || 
         window.wallet;
};

const isFreighterAvailable = () => {
  const api = getFreighterApi();
  return !!api && typeof api.getPublicKey === 'function';
};

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [freighterAvailable, setFreighterAvailable] = useState(false);

  // Check if Freighter is available in browser
  useEffect(() => {
    // MOCK MODE: Skip Freighter detection and use mock wallet
    if (USE_MOCK_WALLET) {
      console.log('🧪 MOCK WALLET MODE ENABLED');
      console.log('Using test address:', MOCK_PUBLIC_KEY);
      setFreighterAvailable(true);
      setPublicKey(MOCK_PUBLIC_KEY);
      setIsConnected(true);
      return;
    }
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkFreighter = () => {
      attempts++;
      
      if (isFreighterAvailable()) {
        console.log('✅ Freighter detected');
        setFreighterAvailable(true);
        
        // Check if already connected
        const api = getFreighterApi();
        if (api?.isConnected) {
          api.isConnected().then(connected => {
            if (connected && api.getPublicKey) {
              api.getPublicKey().then(key => {
                setPublicKey(key);
                setIsConnected(true);
                console.log('✅ Already connected:', key);
              }).catch(console.error);
            }
          }).catch(console.error);
        }
      } else if (attempts < maxAttempts) {
        console.log(`⏳ Freighter check ${attempts}/${maxAttempts}`);
        setTimeout(checkFreighter, 1000);
      } else {
        console.log('❌ Freighter not detected after max attempts');
        console.log('Available window APIs:', Object.keys(window).filter(k => 
          k.toLowerCase().includes('freighter') || 
          k.toLowerCase().includes('stellar') ||
          k.toLowerCase().includes('wallet')
        ));
        // Enable mock mode automatically when Freighter not found
        console.log('💡 Tip: Set USE_MOCK_WALLET = true for testing without extension');
      }
    };
    
    // Initial check after delay
    setTimeout(checkFreighter, 500);
  }, []);

  useEffect(() => {
    if (freighterAvailable) {
      checkConnection();
    }
  }, [freighterAvailable]);

  const checkConnection = async () => {
    try {
      const api = getFreighterApi();
      if (!api) return;
      
      if (api.isConnected) {
        const connected = await api.isConnected();
        if (connected && api.getPublicKey) {
          const key = await api.getPublicKey();
          setPublicKey(key);
          setIsConnected(true);
          console.log('Already connected:', key);
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // MOCK MODE: Simulate connection
      if (USE_MOCK_WALLET) {
        console.log('🧪 MOCK: Simulating wallet connection...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setPublicKey(MOCK_PUBLIC_KEY);
        setIsConnected(true);
        console.log('🧪 MOCK: Connected with', MOCK_PUBLIC_KEY);
        setIsConnecting(false);
        return;
      }
      
      const api = getFreighterApi();
      
      if (!api) {
        throw new Error('Freighter wallet not detected. Please install the extension and refresh the page.');
      }

      if (!api.getPublicKey) {
        throw new Error('Freighter API not available. Extension may not be fully loaded.');
      }
      
      // This triggers the Freighter popup
      const key = await api.getPublicKey();
      
      if (key) {
        setPublicKey(key);
        setIsConnected(true);
        console.log('Successfully connected:', key);
      } else {
        throw new Error('No public key returned from wallet');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
    // Note: Freighter doesn't have a disconnect method, user must disconnect from extension
  }, []);

  return {
    publicKey,
    isConnected,
    isConnecting,
    error,
    freighterAvailable,
    isMock: USE_MOCK_WALLET,
    connect,
    disconnect
  };
}

export function useSoroban() {
  const [server] = useState(() => new SorobanRpc.Server(RPC_URL));

  const submitTransaction = useCallback(async (contractId, method, params = [], sourceKey) => {
    try {
      const account = await server.getAccount(sourceKey);
      
      const contract = new SorobanRpc.Contract(contractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      const signedXDR = await freighter.signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      const signedTransaction = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
      const result = await server.sendTransaction(signedTransaction);
      
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }, [server]);

  const simulateTransaction = useCallback(async (contractId, method, params = []) => {
    try {
      const contract = new SorobanRpc.Contract(contractId);
      
      const transaction = new TransactionBuilder(
        { accountId: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', sequence: '0' },
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(contract.call(method, ...params))
        .setTimeout(0)
        .build();

      const result = await server.simulateTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Simulation error:', error);
      throw error;
    }
  }, [server]);

  return {
    server,
    submitTransaction,
    simulateTransaction
  };
}
