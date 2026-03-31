// Direct Freighter integration - no npm package needed
// Firefox extension injects window.freighterApi

export async function isFreighterInstalled() {
  // Check multiple possible API names
  if (window.freighterApi?.isConnected) {
    return true;
  }
  if (window.freighter?.isConnected) {
    return true;
  }
  if (window.stellar?.isConnected) {
    return true;
  }
  
  // Try to detect by checking if any wallet API exists
  return !!(
    window.freighterApi || 
    window.freighter || 
    window.stellar
  );
}

export async function isConnected() {
  try {
    const api = window.freighterApi || window.freighter || window.stellar;
    if (!api?.isConnected) return false;
    return await api.isConnected();
  } catch (e) {
    return false;
  }
}

export async function getPublicKey() {
  const api = window.freighterApi || window.freighter || window.stellar;
  if (!api?.getPublicKey) {
    throw new Error('Freighter not installed or not available');
  }
  return await api.getPublicKey();
}

export async function signTransaction(xdr, network) {
  const api = window.freighterApi || window.freighter || window.stellar;
  if (!api?.signTransaction) {
    throw new Error('Freighter not available');
  }
  return await api.signTransaction(xdr, { network });
}
