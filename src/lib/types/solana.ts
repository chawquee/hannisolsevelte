import { PublicKey } from '@solana/web3.js';

// Base Solana address information
export interface SolanaAddressInfo {
  address: string;
  isValid: boolean;
  format: 'base58' | 'invalid';
  length: number;
  type: 'system_account' | 'program_account' | 'token_account' | 'nonce_account' | 'unknown';
  owner?: string;
  executable: boolean;
  dataSize: number;
  rentEpoch: number;
  lamports: number;
}

// Token balance information
export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoUri?: string;
  priceUsd?: number;
  valueUsd?: number;
  changePercent24h?: number;
}

// SOL balance information
export interface SolBalance {
  lamports: number;
  sol: number;
  usd: number;
  priceUsd: number;
  changePercent24h: number;
}

// NFT information
export interface NFTInfo {
  mint: string;
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  collection?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  floorPrice?: number;
  lastSalePrice?: number;
  rarity?: {
    rank: number;
    score: number;
  };
}

// Transaction history
export interface TransactionHistory {
  signature: string;
  blockTime: number;
  slot: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  type: 'transfer' | 'token_transfer' | 'swap' | 'stake' | 'vote' | 'program_call' | 'unknown';
  amount?: number;
  amountUsd?: number;
  from?: string;
  to?: string;
  mint?: string;
  symbol?: string;
  fee: number;
  status: 'success' | 'failed';
  error?: string;
  instructions: TransactionInstruction[];
}

export interface TransactionInstruction {
  programId: string;
  type: string;
  data: any;
  accounts: string[];
}

// Risk analysis
export interface RiskAnalysis {
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: 'safe' | 'caution' | 'suspicious' | 'malicious';
  confidence: number; // 0-100
  
  // Risk factors
  isKnownScam: boolean;
  isBlacklisted: boolean;
  hasSuspiciousActivity: boolean;
  hasHighVolumeTransactions: boolean;
  hasUnusualPatterns: boolean;
  
  // Specific risk checks
  riskFactors: RiskFactor[];
  securityChecks: SecurityCheck[];
  
  // Token-specific risks (if applicable)
  tokenRisks?: TokenRiskAnalysis;
  
  // Recommendations
  recommendations: string[];
  warnings: string[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  impact: string;
  detected: boolean;
}

export interface SecurityCheck {
  check: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  details?: string;
}

export interface TokenRiskAnalysis {
  rugPullRisk: number; // 0-100
  liquidityLocked: boolean;
  ownershipRenounced: boolean;
  mintAuthorityActive: boolean;
  freezeAuthorityActive: boolean;
  topHoldersConcentration: number;
  liquidityPoolSize: number;
  volume24h: number;
  priceVolatility: number;
  socialScore: number;
}

// Community data
export interface CommunityData {
  socialScore: number; // 0-100
  communitySize: number;
  engagementRate: number;
  growthRate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -100 to 100
  
  // Social media presence
  socialMedia: {
    twitter?: SocialMediaMetrics;
    discord?: SocialMediaMetrics;
    telegram?: SocialMediaMetrics;
    reddit?: SocialMediaMetrics;
  };
  
  // Community metrics
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    mentions: number;
    totalInteractions: number;
  };
  
  // Trending data
  trending: {
    istrending: boolean;
    trendingScore: number;
    keywords: string[];
    hashtags: string[];
  };
  
  // Recent activity
  recentActivity: CommunityActivity[];
}

export interface SocialMediaMetrics {
  platform: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  verified: boolean;
  url?: string;
}

export interface CommunityActivity {
  type: 'mention' | 'post' | 'comment' | 'like' | 'share';
  platform: string;
  content: string;
  author: string;
  timestamp: string;
  engagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

// DeFi protocol information
export interface DeFiProtocolInfo {
  protocol: string;
  type: 'dex' | 'lending' | 'staking' | 'yield_farming' | 'nft_marketplace' | 'other';
  tvl: number; // Total Value Locked
  volume24h: number;
  users24h: number;
  isVerified: boolean;
  securityScore: number;
  auditStatus: 'audited' | 'unaudited' | 'partial';
  auditBy?: string[];
}

// Token metadata
export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  decimals: number;
  supply: number;
  creator?: string;
  verified: boolean;
  tags: string[];
  
  // Price data
  price: {
    usd: number;
    change24h: number;
    change7d: number;
    change30d: number;
    marketCap: number;
    volume24h: number;
  };
  
  // Token program info
  programId: string;
  authority?: string;
  freezeAuthority?: string;
  
  // Coingecko/CoinMarketCap data
  externalData?: {
    coingeckoId?: string;
    coinmarketcapId?: string;
    website?: string;
    whitepaper?: string;
    socialLinks?: Record<string, string>;
  };
}

// Complete search result
export interface SearchResult {
  address: string;
  searchId: string;
  timestamp: string;
  processingTime: number;
  
  // Core data
  addressInfo: SolanaAddressInfo;
  solBalance: SolBalance;
  balances: TokenBalance[];
  nfts: NFTInfo[];
  transactions: TransactionHistory[];
  
  // Analysis data
  riskAnalysis: RiskAnalysis;
  communityData?: CommunityData;
  defiData?: DeFiProtocolInfo[];
  tokenMetadata?: TokenMetadata;
  
  // Additional insights
  insights: AddressInsight[];
  relatedAddresses: RelatedAddress[];
  
  // Sharing and caching
  shareId?: string;
  cacheExpiry: string;
}

export interface AddressInsight {
  type: 'wallet_age' | 'transaction_patterns' | 'token_diversity' | 'defi_activity' | 'nft_activity';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  confidence: number;
  data?: any;
}

export interface RelatedAddress {
  address: string;
  relationship: 'frequent_sender' | 'frequent_receiver' | 'token_creator' | 'program_authority' | 'similar_pattern';
  confidence: number;
  transactionCount: number;
  totalValue: number;
}

// Solana network information
export interface SolanaNetworkInfo {
  cluster: 'mainnet-beta' | 'devnet' | 'testnet';
  epochInfo: {
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    absoluteSlot: number;
  };
  blockHeight: number;
  blockTime: number;
  version: string;
  health: 'ok' | 'behind' | 'unknown';
}

// RPC provider information
export interface RpcProvider {
  name: string;
  url: string;
  isHealthy: boolean;
  responseTime: number;
  lastChecked: string;
  priority: number;
}

// Search options
export interface SearchOptions {
  includeTransactions: boolean;
  includeTokens: boolean;
  includeNFTs: boolean;
  includeRiskAnalysis: boolean;
  includeCommunityData: boolean;
  includeDeFiData: boolean;
  transactionLimit: number;
  forceRefresh: boolean;
  cacheTimeout: number;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  format?: string;
  checksumValid?: boolean;
  network?: 'mainnet' | 'devnet' | 'testnet';
}

// Address monitoring (for future feature)
export interface AddressMonitor {
  id: string;
  address: string;
  userId?: string;
  alertTypes: ('balance_change' | 'new_transaction' | 'risk_level_change' | 'new_tokens')[];
  thresholds: {
    balanceChange: number;
    transactionValue: number;
    riskScore: number;
  };
  isActive: boolean;
  lastChecked: string;
  createdAt: string;
}

// Historical data
export interface HistoricalBalance {
  date: string;
  solBalance: number;
  solBalanceUsd: number;
  totalTokenValueUsd: number;
  totalValueUsd: number;
}

export interface HistoricalTransaction {
  date: string;
  incomingCount: number;
  outgoingCount: number;
  incomingValue: number;
  outgoingValue: number;
  netValue: number;
}

// Error types
export interface SolanaError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  retryable: boolean;
}

// API response wrapper
export interface SolanaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: SolanaError;
  metadata: {
    searchId: string;
    processingTime: number;
    cacheHit: boolean;
    rpcProvider: string;
    timestamp: string;
  };
}