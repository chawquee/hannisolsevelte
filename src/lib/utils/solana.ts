import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  AccountInfo
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  getMint
} from '@solana/spl-token';
import type { 
  SolanaAddressInfo, 
  TokenBalance, 
  SolBalance, 
  TransactionHistory, 
  ValidationResult,
  RpcProvider,
  SolanaNetworkInfo
} from '$lib/types/solana';

// RPC endpoint configuration
const RPC_ENDPOINTS = {
  mainnet: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://solana.publicnode.com'
  ],
  devnet: [
    'https://api.devnet.solana.com'
  ],
  testnet: [
    'https://api.testnet.solana.com'
  ]
};

// Connection management
class ConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private healthStatus: Map<string, boolean> = new Map();
  private lastHealthCheck: Map<string, number> = new Map();
  private currentEndpointIndex = 0;

  // Get healthy connection
  async getConnection(network: 'mainnet' | 'devnet' | 'testnet' = 'mainnet'): Promise<Connection> {
    const endpoints = RPC_ENDPOINTS[network];
    
    // Try to find a healthy connection
    for (let i = 0; i < endpoints.length; i++) {
      const endpointIndex = (this.currentEndpointIndex + i) % endpoints.length;
      const endpoint = endpoints[endpointIndex];
      
      if (await this.isEndpointHealthy(endpoint)) {
        this.currentEndpointIndex = endpointIndex;
        return this.getOrCreateConnection(endpoint);
      }
    }

    // If no healthy endpoint found, use the first one and hope for the best
    console.warn('No healthy RPC endpoints found, using fallback');
    return this.getOrCreateConnection(endpoints[0]);
  }

  // Get or create connection for endpoint
  private getOrCreateConnection(endpoint: string): Connection {
    if (!this.connections.has(endpoint)) {
      this.connections.set(endpoint, new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000
      }));
    }
    return this.connections.get(endpoint)!;
  }

  // Check endpoint health
  private async isEndpointHealthy(endpoint: string): Promise<boolean> {
    const lastCheck = this.lastHealthCheck.get(endpoint) || 0;
    const now = Date.now();
    
    // Check every 5 minutes
    if (now - lastCheck < 5 * 60 * 1000) {
      return this.healthStatus.get(endpoint) ?? false;
    }

    try {
      const connection = this.getOrCreateConnection(endpoint);
      const startTime = Date.now();
      
      await connection.getEpochInfo();
      
      const responseTime = Date.now() - startTime;
      const isHealthy = responseTime < 5000; // 5 second timeout
      
      this.healthStatus.set(endpoint, isHealthy);
      this.lastHealthCheck.set(endpoint, now);
      
      return isHealthy;
    } catch (error) {
      this.healthStatus.set(endpoint, false);
      this.lastHealthCheck.set(endpoint, now);
      return false;
    }
  }

  // Get all endpoint health status
  async getAllEndpointHealth(): Promise<RpcProvider[]> {
    const results: RpcProvider[] = [];
    
    for (const endpoint of RPC_ENDPOINTS.mainnet) {
      const startTime = Date.now();
      const isHealthy = await this.isEndpointHealthy(endpoint);
      const responseTime = Date.now() - startTime;
      
      results.push({
        name: new URL(endpoint).hostname,
        url: endpoint,
        isHealthy,
        responseTime,
        lastChecked: new Date().toISOString(),
        priority: 1
      });
    }
    
    return results.sort((a, b) => {
      if (a.isHealthy && !b.isHealthy) return -1;
      if (!a.isHealthy && b.isHealthy) return 1;
      return a.responseTime - b.responseTime;
    });
  }
}

const connectionManager = new ConnectionManager();

// Address validation utilities
export const addressValidator = {
  // Validate Solana address format
  validate(address: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!address) {
      errors.push('Address is required');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Remove whitespace
    const cleanAddress = address.trim();

    // Check length
    if (cleanAddress.length !== 32 && cleanAddress.length !== 44) {
      errors.push('Invalid address length. Solana addresses should be 44 characters (base58) or 32 bytes');
    }

    // Check base58 format
    try {
      const publicKey = new PublicKey(cleanAddress);
      
      // Additional checks
      if (publicKey.toBase58() !== cleanAddress) {
        errors.push('Invalid base58 encoding');
      }

      // Check for common mistakes
      if (cleanAddress.includes('0') || cleanAddress.includes('O')) {
        warnings.push('Address contains characters that might be confused (0/O)');
      }

      if (cleanAddress.toLowerCase() !== cleanAddress && cleanAddress.toUpperCase() !== cleanAddress) {
        warnings.push('Address contains mixed case - double-check for accuracy');
      }

    } catch (error) {
      errors.push('Invalid Solana address format');
      
      // Provide helpful suggestions
      if (cleanAddress.length < 44) {
        suggestions.push('Address appears too short - check for missing characters');
      } else if (cleanAddress.length > 44) {
        suggestions.push('Address appears too long - check for extra characters');
      }
      
      if (/[^1-9A-HJ-NP-Za-km-z]/.test(cleanAddress)) {
        suggestions.push('Address contains invalid characters - use only base58 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      format: errors.length === 0 ? 'base58' : 'invalid',
      checksumValid: errors.length === 0,
      network: 'mainnet'
    };
  },

  // Check if address is likely a token mint
  isLikelyTokenMint(address: string): boolean {
    try {
      const pubkey = new PublicKey(address);
      // Token mints are usually shorter and have specific patterns
      // This is a heuristic check
      return true; // Will be validated by actual mint account check
    } catch {
      return false;
    }
  },

  // Generate random valid address (for testing)
  generateRandom(): string {
    return PublicKey.unique().toBase58();
  }
};

// Account information utilities
export const accountInfo = {
  // Get comprehensive account information
  async getAccountInfo(address: string): Promise<SolanaAddressInfo> {
    const validation = addressValidator.validate(address);
    if (!validation.isValid) {
      throw new Error(`Invalid address: ${validation.errors.join(', ')}`);
    }

    const connection = await connectionManager.getConnection();
    const publicKey = new PublicKey(address);

    try {
      const accountInfo = await connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        return {
          address,
          isValid: true,
          format: 'base58',
          length: address.length,
          type: 'system_account',
          executable: false,
          dataSize: 0,
          rentEpoch: 0,
          lamports: 0
        };
      }

      // Determine account type
      let accountType = 'unknown';
      if (accountInfo.owner.equals(TOKEN_PROGRAM_ID) || accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        accountType = 'token_account';
      } else if (accountInfo.executable) {
        accountType = 'program_account';
      } else if (accountInfo.data.length === 80) {
        accountType = 'nonce_account';
      } else {
        accountType = 'system_account';
      }

      return {
        address,
        isValid: true,
        format: 'base58',
        length: address.length,
        type: accountType as any,
        owner: accountInfo.owner.toBase58(),
        executable: accountInfo.executable,
        dataSize: accountInfo.data.length,
        rentEpoch: accountInfo.rentEpoch || 0,
        lamports: accountInfo.lamports
      };

    } catch (error) {
      console.error('Failed to get account info:', error);
      throw new Error('Failed to fetch account information');
    }
  },

  // Check if account exists
  async exists(address: string): Promise<boolean> {
    try {
      const connection = await connectionManager.getConnection();
      const publicKey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch {
      return false;
    }
  }
};

// Balance utilities
export const balanceUtils = {
  // Get SOL balance
  async getSolBalance(address: string): Promise<SolBalance> {
    const connection = await connectionManager.getConnection();
    const publicKey = new PublicKey(address);

    try {
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;
      
      // Get SOL price (you'd integrate with a price API)
      const priceUsd = await this.getSolPrice();
      const usd = sol * priceUsd;

      return {
        lamports,
        sol,
        usd,
        priceUsd,
        changePercent24h: 0 // Would come from price API
      };
    } catch (error) {
      console.error('Failed to get SOL balance:', error);
      throw new Error('Failed to fetch SOL balance');
    }
  },

  // Get token balances
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const connection = await connectionManager.getConnection();
    const publicKey = new PublicKey(address);

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      const token2022Accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_2022_PROGRAM_ID
      });

      const allTokenAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
      const balances: TokenBalance[] = [];

      for (const tokenAccount of allTokenAccounts) {
        const accountData = tokenAccount.account.data as ParsedAccountData;
        const tokenInfo = accountData.parsed.info;

        // Skip accounts with zero balance
        if (tokenInfo.tokenAmount.amount === '0') continue;

        const balance: TokenBalance = {
          mint: tokenInfo.mint,
          amount: parseInt(tokenInfo.tokenAmount.amount),
          decimals: tokenInfo.tokenAmount.decimals,
          uiAmount: tokenInfo.tokenAmount.uiAmount || 0,
          symbol: undefined, // Would be filled by token metadata
          name: undefined,
          logoUri: undefined,
          priceUsd: undefined,
          valueUsd: undefined,
          changePercent24h: undefined
        };

        // Try to get token metadata
        try {
          const mintInfo = await getMint(connection, new PublicKey(tokenInfo.mint));
          // Additional metadata fetching would go here
        } catch (error) {
          console.warn(`Failed to get mint info for ${tokenInfo.mint}:`, error);
        }

        balances.push(balance);
      }

      return balances;
    } catch (error) {
      console.error('Failed to get token balances:', error);
      throw new Error('Failed to fetch token balances');
    }
  },

  // Get SOL price from API
  async getSolPrice(): Promise<number> {
    try {
      // This would integrate with a real price API like CoinGecko
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      return data.solana?.usd || 0;
    } catch (error) {
      console.error('Failed to get SOL price:', error);
      return 0;
    }
  }
};

// Transaction utilities
export const transactionUtils = {
  // Get transaction history
  async getTransactionHistory(address: string, limit: number = 50): Promise<TransactionHistory[]> {
    const connection = await connectionManager.getConnection();
    const publicKey = new PublicKey(address);

    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      const transactions: TransactionHistory[] = [];

      for (const signatureInfo of signatures) {
        try {
          const transaction = await connection.getParsedTransaction(signatureInfo.signature, {
            maxSupportedTransactionVersion: 0
          });

          if (!transaction) continue;

          const tx: TransactionHistory = {
            signature: signatureInfo.signature,
            blockTime: signatureInfo.blockTime || 0,
            slot: signatureInfo.slot,
            confirmationStatus: signatureInfo.confirmationStatus || 'confirmed',
            type: this.determineTransactionType(transaction),
            fee: transaction.meta?.fee || 0,
            status: transaction.meta?.err ? 'failed' : 'success',
            error: transaction.meta?.err ? JSON.stringify(transaction.meta.err) : undefined,
            instructions: []
          };

          // Parse instructions for more details
          if (transaction.transaction.message.instructions) {
            for (const instruction of transaction.transaction.message.instructions) {
              // Parse instruction details
              tx.instructions.push({
                programId: 'program' in instruction ? instruction.program : 'unknown',
                type: 'unknown',
                data: instruction,
                accounts: []
              });
            }
          }

          transactions.push(tx);
        } catch (error) {
          console.warn(`Failed to parse transaction ${signatureInfo.signature}:`, error);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  },

  // Determine transaction type from parsed transaction
  determineTransactionType(transaction: any): string {
    // This is a simplified version - you'd implement more sophisticated parsing
    const instructions = transaction.transaction.message.instructions;
    
    if (!instructions || instructions.length === 0) return 'unknown';

    // Check for common program IDs and instruction types
    for (const instruction of instructions) {
      const programId = 'program' in instruction ? instruction.program : instruction.programId;
      
      if (programId === TOKEN_PROGRAM_ID.toBase58() || programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
        return 'token_transfer';
      }
      
      if (programId === '11111111111111111111111111111111') {
        return 'transfer';
      }
    }

    return 'program_call';
  },

  // Get transaction details
  async getTransactionDetails(signature: string) {
    const connection = await connectionManager.getConnection();
    
    try {
      return await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });
    } catch (error) {
      console.error('Failed to get transaction details:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }
};

// Network utilities
export const networkUtils = {
  // Get network information
  async getNetworkInfo(): Promise<SolanaNetworkInfo> {
    const connection = await connectionManager.getConnection();

    try {
      const [epochInfo, blockHeight, version] = await Promise.all([
        connection.getEpochInfo(),
        connection.getBlockHeight(),
        connection.getVersion()
      ]);

      return {
        cluster: 'mainnet-beta',
        epochInfo: {
          epoch: epochInfo.epoch,
          slotIndex: epochInfo.slotIndex,
          slotsInEpoch: epochInfo.slotsInEpoch,
          absoluteSlot: epochInfo.absoluteSlot
        },
        blockHeight,
        blockTime: Date.now(), // Approximate
        version: version['solana-core'],
        health: 'ok'
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error('Failed to fetch network information');
    }
  },

  // Get cluster health
  async getClusterHealth(): Promise<string> {
    try {
      const connection = await connectionManager.getConnection();
      await connection.getEpochInfo();
      return 'ok';
    } catch (error) {
      return 'behind';
    }
  }
};

// Token utilities
export const tokenUtils = {
  // Get token metadata
  async getTokenMetadata(mintAddress: string) {
    // This would integrate with token metadata programs
    // For now, return basic structure
    return {
      mint: mintAddress,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 9,
      supply: 0,
      verified: false
    };
  },

  // Check if address is a token mint
  async isTokenMint(address: string): Promise<boolean> {
    try {
      const connection = await connectionManager.getConnection();
      const publicKey = new PublicKey(address);
      const mintInfo = await getMint(connection, publicKey);
      return mintInfo !== null;
    } catch {
      return false;
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Monitor RPC performance
  async monitorRpcPerformance(): Promise<{ endpoint: string; responseTime: number; success: boolean }[]> {
    const results = [];
    
    for (const endpoint of RPC_ENDPOINTS.mainnet) {
      const startTime = Date.now();
      let success = false;
      
      try {
        const connection = new Connection(endpoint);
        await connection.getEpochInfo();
        success = true;
      } catch (error) {
        console.warn(`RPC endpoint ${endpoint} failed:`, error);
      }
      
      const responseTime = Date.now() - startTime;
      results.push({ endpoint, responseTime, success });
    }
    
    return results;
  }
};

// Main Solana utilities export
export const solanaUtils = {
  address: addressValidator,
  account: accountInfo,
  balance: balanceUtils,
  transaction: transactionUtils,
  network: networkUtils,
  token: tokenUtils,
  performance: performanceMonitor,
  connection: connectionManager
};

// Helper functions
export const formatSolAmount = (lamports: number): string => {
  const sol = lamports / LAMPORTS_PER_SOL;
  if (sol < 0.001) return `${lamports} lamports`;
  if (sol < 1) return `${sol.toFixed(6)} SOL`;
  return `${sol.toFixed(4)} SOL`;
};

export const formatTokenAmount = (amount: number, decimals: number): string => {
  const divisor = Math.pow(10, decimals);
  const tokenAmount = amount / divisor;
  
  if (tokenAmount < 0.001) return `${amount} (raw)`;
  if (tokenAmount < 1) return tokenAmount.toFixed(6);
  if (tokenAmount < 1000) return tokenAmount.toFixed(4);
  if (tokenAmount < 1000000) return `${(tokenAmount / 1000).toFixed(2)}K`;
  return `${(tokenAmount / 1000000).toFixed(2)}M`;
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};