const { SorobanRpc, TransactionBuilder, Networks, BASE_FEE, xdr } = require('@stellar/stellar-sdk');

class StellarService {
  constructor() {
    this.server = new SorobanRpc.Server(process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org');
    this.networkPassphrase = process.env.STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;
    this.contractIds = {
      factoryRegistry: process.env.FACTORY_REGISTRY_CONTRACT_ID,
      auditorStaking: process.env.AUDITOR_STAKING_CONTRACT_ID,
      auditNFT: process.env.AUDIT_NFT_CONTRACT_ID,
      reputationOracle: process.env.REPUTATION_ORACLE_CONTRACT_ID,
      rwaWrapper: process.env.RWA_WRAPPER_CONTRACT_ID,
      disputeResolution: process.env.DISPUTE_RESOLUTION_CONTRACT_ID,
    };
  }

  async submitTransaction(contractId, method, params, sourceKeypair) {
    try {
      const account = await this.server.getAccount(sourceKeypair.publicKey());
      
      const contract = new SorobanRpc.Contract(contractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      
      const result = await this.server.sendTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction submission failed:', error);
      throw error;
    }
  }

  async simulateTransaction(contractId, method, params) {
    try {
      const contract = new SorobanRpc.Contract(contractId);
      
      const transaction = new TransactionBuilder(
        { accountId: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', sequence: '0' },
        {
          fee: BASE_FEE,
          networkPassphrase: this.networkPassphrase,
        }
      )
        .addOperation(contract.call(method, ...params))
        .setTimeout(0)
        .build();

      const result = await this.server.simulateTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction simulation failed:', error);
      throw error;
    }
  }

  async getFactory(walletAddress) {
    if (!this.contractIds.factoryRegistry) {
      throw new Error('Factory registry contract not configured');
    }

    const result = await this.simulateTransaction(
      this.contractIds.factoryRegistry,
      'get_factory',
      [xdr.ScVal.scvObject(xdr.ScObject.scoVec([xdr.ScVal.scvSymbol(walletAddress)]))]
    );

    return result;
  }

  async getReputationScore(factoryAddress) {
    if (!this.contractIds.reputationOracle) {
      throw new Error('Reputation oracle contract not configured');
    }

    const result = await this.simulateTransaction(
      this.contractIds.reputationOracle,
      'get_reputation_score',
      [xdr.ScVal.scvObject(xdr.ScObject.scoVec([xdr.ScVal.scvSymbol(factoryAddress)]))]
    );

    return result;
  }

  async getTransactionStatus(txHash) {
    try {
      const result = await this.server.getTransaction(txHash);
      return result;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  isConfigured() {
    return Object.values(this.contractIds).some(id => id && id.length > 0);
  }
}

module.exports = new StellarService();
