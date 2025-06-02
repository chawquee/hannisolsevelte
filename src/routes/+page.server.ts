// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { db } from '$lib/database/connection';
import { z } from 'zod';

// Solana RPC endpoints (fallback chain)
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
];

// Request validation schema
const AddressSchema = z.object({
  address: z.string()
    .min(32, 'Address must be at least 32 characters')
    .max(44, 'Address must be at most 44 characters')
    .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid address format')
});

// Rate limiting for address checks
const searchLimits = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 100;
  
  const current = searchLimits.get(ip);
  
  if (!current || now - current.windowStart > windowMs) {
    searchLimits.set(ip, { count: 1, windowStart: now });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

async function getSolanaConnection(): Promise<Connection> {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      // Test the connection
      await connection.getSlot();
      return connection;
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }
  throw new Error('Unable to connect to any Solana RPC endpoint');
}

async function getAddressInfo(address: string) {
  const connection = await getSolanaConnection();
  const publicKey = new PublicKey(address);
  
  try {
    // Get account info
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    // Get balance
    const balance = await connection.getBalance(publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    
    // Get transaction signatures (recent)
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 });
    
    // Get token accounts
    let tokenAccounts = [];
    try {
      const tokenAccountsResponse = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      
      tokenAccounts = tokenAccountsResponse.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.amount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount
      }));
    } catch (error) {
      console.warn('Error fetching token accounts:', error);
    }
    
    // Analyze transactions for patterns
    let firstActivity = null;
    let lastActivity = null;
    let totalTransactions = signatures.length;
    
    if (signatures.length > 0) {
      firstActivity = new Date(signatures[signatures.length - 1].blockTime! * 1000).toISOString();
      lastActivity = new Date(signatures[0].blockTime! * 1000).toISOString();
    }
    
    // Calculate risk score (basic algorithm)
    let riskScore = 0;
    let riskFactors = [];
    
    // Risk factor: Very new account
    if (firstActivity && new Date(firstActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      riskScore += 2;
      riskFactors.push('new_account');
    }
    
    // Risk factor: High transaction volume in short time
    if (totalTransactions > 100 && firstActivity && 
        new Date(firstActivity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      riskScore += 3;
      riskFactors.push('high_activity');
    }
    
    // Risk factor: Zero balance
    if (balanceSOL === 0 && tokenAccounts.length === 0) {
      riskScore += 1;
      riskFactors.push('zero_balance');
    }
    
    // Risk factor: Suspicious patterns (placeholder)
    if (totalTransactions > 1000) {
      riskScore += 2;
      riskFactors.push('very_high_activity');
    }
    
    // Generate account type
    let accountType = 'Unknown';
    if (accountInfo) {
      if (accountInfo.executable) {
        accountType = 'Program Account';
      } else if (accountInfo.owner.equals(new PublicKey('11111111111111111111111111111112'))) {
        accountType = 'System Account';
      } else if (tokenAccounts.length > 0) {
        accountType = 'Token Account Owner';
      } else {
        accountType = 'Standard Account';
      }
    }
    
    return {
      validation: {
        isValid: true,
        format: 'Base58',
        length: address.length,
        type: accountType
      },
      balance: {
        sol: balanceSOL,
        usd: balanceSOL * 20, // Placeholder SOL price
        tokens: tokenAccounts.length,
        nfts: 0 // Placeholder
      },
      account: {
        owner: accountInfo?.owner.toString() || address,
        executable: accountInfo?.executable || false,
        lamports: balance,
        dataSize: accountInfo?.data.length || 0,
        rentEpoch: accountInfo?.rentEpoch || 0
      },
      transactions: {
        total: totalTransactions,
        firstActivity,
        lastActivity,
        recent: signatures.slice(0, 5).map(sig => ({
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : null,
          err: sig.err
        }))
      },
      risk: {
        score: Math.min(riskScore, 10),
        level: riskScore <= 2 ? 'Low' : riskScore <= 5 ? 'Medium' : 'High',
        factors: riskFactors
      },
      tokenAccounts,
      communityData: {
        sentiment: 'Neutral',
        mentions: Math.floor(Math.random() * 1000),
        trustScore: Math.max(1, 10 - riskScore)
      }
    };
    
  } catch (error) {
    console.error('Error fetching address info:', error);
    throw error;
  }
}

function logSearch(ip: string, address: string, userAgent: string, result: any) {
  try {
    const stmt = db.prepare(`
      INSERT INTO searches (
        ip_address, 
        address_searched, 
        timestamp, 
        user_agent,
        search_count,
        result_data,
        risk_score
      ) VALUES (?, ?, datetime('now'), ?, 1, ?, ?)
    `);
    
    stmt.run(
      ip, 
      address, 
      userAgent, 
      JSON.stringify(result),
      result.risk?.score || 0
    );
  } catch (error) {
    console.error('Error logging search:', error);
  }
}

function getGeoLocation(ip: string) {
  // Placeholder geolocation - integrate with real service
  const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'BR'];
  const regions = ['California', 'Ontario', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney', 'São Paulo'];
  
  const randomIndex = Math.floor(Math.random() * countries.length);
  
  return {
    country: countries[randomIndex],
    region: regions[randomIndex],
    city: 'Unknown'
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  // Get recent searches for this IP
  let recentSearches = [];
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT address_searched, timestamp
      FROM searches 
      WHERE ip_address = ? 
      AND address_searched IS NOT NULL
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    
    recentSearches = stmt.all(locals.clientIP) || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
  }
  
  // Get popular addresses
  let popularAddresses = [];
  try {
    const stmt = db.prepare(`
      SELECT 
        address_searched, 
        COUNT(*) as search_count,
        MAX(timestamp) as last_searched
      FROM searches 
      WHERE datetime(timestamp) >= datetime('now', '-24 hours')
      AND address_searched IS NOT NULL
      GROUP BY address_searched
      ORDER BY search_count DESC
      LIMIT 10
    `);
    
    popularAddresses = stmt.all() || [];
  } catch (error) {
    console.error('Error fetching popular addresses:', error);
  }
  
  return {
    recentSearches: recentSearches.map(search => ({
      address: search.address_searched,
      timestamp: search.timestamp
    })),
    popularAddresses: popularAddresses.map(addr => ({
      address: addr.address_searched,
      searchCount: addr.search_count,
      lastSearched: addr.last_searched
    }))
  };
};

export const actions: Actions = {
  checkAddress: async ({ request, locals }) => {
    const clientIP = locals.clientIP;
    const userAgent = locals.userAgent;
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return fail(429, {
        error: 'Rate limit exceeded. You can check up to 100 addresses per hour.',
        type: 'rate_limit'
      });
    }
    
    try {
      const formData = await request.formData();
      const address = formData.get('address')?.toString().trim();
      
      if (!address) {
        return fail(400, {
          error: 'Address is required',
          type: 'validation'
        });
      }
      
      // Validate address format
      const validation = AddressSchema.safeParse({ address });
      if (!validation.success) {
        return fail(400, {
          error: validation.error.errors[0].message,
          type: 'validation',
          address
        });
      }
      
      // Check if valid Solana address
      if (!isValidSolanaAddress(address)) {
        return fail(400, {
          error: 'Invalid Solana address format',
          type: 'validation',
          address
        });
      }
      
      // Get geolocation
      const location = getGeoLocation(clientIP);
      
      // Update geolocation in database if needed
      try {
        const updateStmt = db.prepare(`
          UPDATE searches 
          SET country = ?, region = ?, city = ?
          WHERE ip_address = ? AND country IS NULL
        `);
        
        updateStmt.run(location.country, location.region, location.city, clientIP);
      } catch (error) {
        console.error('Error updating geolocation:', error);
      }
      
      // Fetch address information
      const addressInfo = await getAddressInfo(address);
      
      // Log the search
      logSearch(clientIP, address, userAgent, addressInfo);
      
      return {
        success: true,
        address,
        data: addressInfo,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Address check error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid public key')) {
          return fail(400, {
            error: 'Invalid Solana address format',
            type: 'validation'
          });
        }
        
        if (error.message.includes('Unable to connect')) {
          return fail(503, {
            error: 'Solana network temporarily unavailable. Please try again later.',
            type: 'network'
          });
        }
      }
      
      return fail(500, {
        error: 'An unexpected error occurred while checking the address',
        type: 'server'
      });
    }
  },
  
  shareResults: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const address = formData.get('address')?.toString();
      const data = formData.get('data')?.toString();
      
      if (!address || !data) {
        return fail(400, { error: 'Missing required data' });
      }
      
      // Generate share ID
      const shareId = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
      
      // Store shared result
      const stmt = db.prepare(`
        INSERT INTO shared_results (
          share_id,
          address,
          result_data,
          created_at,
          expires_at,
          creator_ip
        ) VALUES (?, ?, ?, datetime('now'), datetime('now', '+7 days'), ?)
      `);
      
      stmt.run(shareId, address, data, locals.clientIP);
      
      return {
        success: true,
        shareId,
        shareUrl: `/share/${shareId}`
      };
      
    } catch (error) {
      console.error('Share error:', error);
      return fail(500, { error: 'Failed to create share' });
    }
  }
};