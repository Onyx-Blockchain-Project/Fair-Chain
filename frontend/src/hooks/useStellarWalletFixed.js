import { useState, useEffect, useCallback } from 'react';

// COMPREHENSIVE WALLET DETECTION AND CONNECTION
// This handles Freighter, manual input, and provides fallbacks

// Multiple detection methods for maximum compatibility
const detectFreighter = () => {
  const checks = [
    () => window.freighterApi,
    () => window.freighter,
    () => window.stellar,
    () => window.freighter?.api,
    () => window.stellar?.freighter,
    () => globalThis.freighterApi,
    () => globalThis.freighter,
  ];
  
  for (const check of checks) {
    try {
      const result = check();
      if (result && typeof result === 'object') {
        console.log('✅ Freighter detected via:', check.toString());
        return result;
      }
    } catch (e) {
      // Continue checking
    }
  }
  
  return null;
};

// Wait for extension to inject
const waitForFreighter = (timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const freighter = detectFreighter();
      if (freighter) {
        resolve(freighter);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
};

// Test if we can actually call methods
const testFreighterAPI = (api) => {
  return api && (
    typeof api.getPublicKey === 'function' ||
    typeof api.isConnected === 'function' ||
    typeof api.connect === 'function'
  );
};

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [freighterAvailable, setFreighterAvailable] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);

  // Manual wallet address input
  const connectManual = useCallback((address) => {
    if (!address) {
      setError('Wallet address is required');
      return false;
    }
    
    if (!address.startsWith('G') || address.length !== 56) {
      setError('Invalid Stellar address. Must start with "G" and be 56 characters');
      return false;
    }
    
    setPublicKey(address);
    setIsConnected(true);
    setManualMode(true);
    setError(null);
    console.log('✅ Manual wallet connected:', address);
    return true;
  }, []);

  // Enhanced Freighter detection
  useEffect(() => {
    let mounted = true;
    
    const detect = async () => {
      console.log('🔍 Starting comprehensive Freighter detection...');
      
      // Try immediate detection
      let freighter = detectFreighter();
      
      if (!freighter) {
        console.log('⏳ Waiting for Freighter to inject...');
        freighter = await waitForFreighter(3000);
      }
      
      if (mounted) {
        if (freighter && testFreighterAPI(freighter)) {
          console.log('✅ Freighter API detected and functional');
          setFreighterAvailable(true);
          setError(null);
          
          // Try to get current connection status
          try {
            if (typeof freighter.isConnected === 'function') {
              const connected = await freighter.isConnected();
              if (connected && typeof freighter.getPublicKey === 'function') {
                const key = await freighter.getPublicKey();
                if (key) {
                  setPublicKey(key);
                  setIsConnected(true);
                  console.log('✅ Already connected to:', key);
                }
              }
            }
          } catch (e) {
            console.log('Could not check connection status:', e.message);
          }
        } else {
          console.log('❌ Freighter not detected or not functional');
          setFreighterAvailable(false);
          setDetectionComplete(true);
        }
        
        setDetectionComplete(true);
      }
    };
    
    detect();
    
    // Also listen for extension injection
    const handleExtensionInjection = () => {
      if (!detectionComplete) {
        setTimeout(detect, 100);
      }
    };
    
    // Multiple event listeners for different browsers
    window.addEventListener('load', handleExtensionInjection);
    document.addEventListener('DOMContentLoaded', handleExtensionInjection);
    
    return () => {
      mounted = false;
      window.removeEventListener('load', handleExtensionInjection);
      document.removeEventListener('DOMContentLoaded', handleExtensionInjection);
    };
  }, [detectionComplete]);

  // Connect to Freighter
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🔗 Attempting to connect to Freighter...');
      
      // Try to detect again if not already detected
      let freighter = detectFreighter();
      
      if (!freighter) {
        console.log('⏳ Waiting for Freighter...');
        freighter = await waitForFreighter(2000);
      }
      
      if (!freighter) {
        throw new Error(
          'Freighter wallet not detected. Please:\n' +
          '1. Install Freighter from https://www.freighter.app\n' +
          '2. Enable the extension in your browser\n' +
          '3. Refresh this page\n' +
          '4. Try using the Manual button as an alternative'
        );
      }
      
      if (!testFreighterAPI(freighter)) {
        throw new Error('Freighter extension found but API not available. Try refreshing the page.');
      }
      
      // Try different connection methods
      let key;
      try {
        if (typeof freighter.getPublicKey === 'function') {
          key = await freighter.getPublicKey();
        } else if (typeof freighter.connect === 'function') {
          const result = await freighter.connect();
          key = result?.address || result?.publicKey;
        } else if (typeof freighter.requestAccess === 'function') {
          const result = await freighter.requestAccess();
          key = result?.address || result?.publicKey;
        } else {
          throw new Error('No connection method available in Freighter API');
        }
      } catch (popupError) {
        if (popupError.message.includes('rejected') || popupError.message.includes('denied')) {
          throw new Error('Connection was rejected. Please try again and approve the connection.');
        }
        throw popupError;
      }
      
      if (!key) {
        throw new Error('No public key returned from wallet');
      }
      
      setPublicKey(key);
      setIsConnected(true);
      setManualMode(false);
      console.log('✅ Successfully connected to:', key);
      
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setManualMode(false);
    setError(null);
    console.log('🔌 Wallet disconnected');
  }, []);

  return {
    publicKey,
    isConnected,
    isConnecting,
    error,
    freighterAvailable,
    manualMode,
    detectionComplete,
    connect,
    disconnect,
    connectManual
  };
}
