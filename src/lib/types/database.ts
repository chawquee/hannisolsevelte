// Base database types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User and authentication tables
export interface User extends BaseEntity {
  email: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  profileData?: UserProfile;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  dashboardPreferences: Record<string, any>;
}

export interface UserSession extends BaseEntity {
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

// Search and analytics tables
export interface SearchRecord extends BaseEntity {
  address: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  userAgent: string;
  sessionId?: string;
  searchDuration: number;
  resultType: 'success' | 'error' | 'invalid_address';
  errorMessage?: string;
  timestamp: Date;
}

export interface PageView extends BaseEntity {
  path: string;
  title?: string;
  referrer?: string;
  ipAddress: string;
  country?: string;
  region?: string;
  userAgent: string;
  sessionId?: string;
  viewDuration?: number;
  exitPage: boolean;
  timestamp: Date;
}

export interface UserSession_Analytics extends BaseEntity {
  sessionId: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  searches: number;
  totalDuration?: number;
  isReturningVisitor: boolean;
}

// Ad performance tables
export interface AdImpression extends BaseEntity {
  adId: string;
  adNetwork: 'google-adsense' | 'a-ads' | 'coinzilla' | 'media-net';
  adType: 'banner' | 'native' | 'video';
  adPosition: string;
  pageUrl: string;
  ipAddress: string;
  country?: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
}

export interface AdClick extends BaseEntity {
  impressionId?: string;
  adId: string;
  adNetwork: 'google-adsense' | 'a-ads' | 'coinzilla' | 'media-net';
  adType: 'banner' | 'native' | 'video';
  adPosition: string;
  pageUrl: string;
  clickUrl: string;
  ipAddress: string;
  country?: string;
  userAgent: string;
  sessionId?: string;
  revenue?: number;
  timestamp: Date;
}

export interface AdRevenue extends BaseEntity {
  adNetwork: 'google-adsense' | 'a-ads' | 'coinzilla' | 'media-net';
  date: Date;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  cpm: number;
  cpc: number;
  fillRate: number;
}

// Affiliate tracking tables
export interface AffiliateClick extends BaseEntity {
  affiliateProgram: 'amazon' | 'ledger' | 'vpn' | 'crypto-education';
  productId?: string;
  productName?: string;
  affiliateLink: string;
  pageUrl: string;
  ipAddress: string;
  country?: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
}

export interface AffiliateConversion extends BaseEntity {
  clickId?: string;
  affiliateProgram: 'amazon' | 'ledger' | 'vpn' | 'crypto-education';
  productId?: string;
  productName?: string;
  orderValue: number;
  commission: number;
  commissionRate: number;
  conversionTime: Date;
  ipAddress: string;
  country?: string;
}

export interface AffiliateRevenue extends BaseEntity {
  affiliateProgram: 'amazon' | 'ledger' | 'vpn' | 'crypto-education';
  date: Date;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
  avgCommission: number;
}

// Solana address analysis cache
export interface AddressAnalysisCache extends BaseEntity {
  address: string;
  analysisData: SolanaAddressAnalysis;
  lastUpdated: Date;
  cacheExpiry: Date;
  isValid: boolean;
  analysisVersion: string;
}

export interface SolanaAddressAnalysis {
  addressInfo: {
    isValid: boolean;
    format: string;
    length: number;
    type: string;
    owner?: string;
    executable: boolean;
    dataSize: number;
    rentEpoch: number;
  };
  balances: {
    solBalance: number;
    solBalanceUsd: number;
    tokenCount: number;
    nftCount: number;
    tokens: Array<{
      mint: string;
      amount: number;
      decimals: number;
      symbol?: string;
      name?: string;
      logoUri?: string;
    }>;
  };
  transactions: {
    totalTransactions: number;
    firstActivity?: Date;
    lastActivity?: Date;
    recentTransactions: Array<{
      signature: string;
      blockTime: Date;
      type: string;
      amount?: number;
      from?: string;
      to?: string;
    }>;
  };
  riskAnalysis: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    isKnownScam: boolean;
    hasSuspiciousActivity: boolean;
    riskFactors: Array<{
      factor: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  communityData?: {
    socialScore: number;
    communitySize: number;
    engagementRate: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    mentions: number;
    growthRate: number;
  };
}

// System configuration
export interface SystemConfig extends BaseEntity {
  key: string;
  value: string | number | boolean | object;
  description: string;
  category: 'general' | 'analytics' | 'ads' | 'security' | 'api';
  isPublic: boolean;
}

// Error logs
export interface ErrorLog extends BaseEntity {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: Record<string, any>;
  source: 'frontend' | 'backend' | 'api' | 'database';
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resolved: boolean;
  timestamp: Date;
}

// Rate limiting
export interface RateLimit extends BaseEntity {
  ipAddress: string;
  endpoint: string;
  requests: number;
  windowStart: Date;
  windowEnd: Date;
  isBlocked: boolean;
  blockReason?: string;
}

// Shared content (for sharing search results)
export interface SharedContent extends BaseEntity {
  shareId: string;
  address: string;
  analysisData: SolanaAddressAnalysis;
  viewCount: number;
  lastViewed?: Date;
  expiresAt?: Date;
  isPublic: boolean;
  createdByIp: string;
}

// Geographic IP data cache
export interface GeoIpCache extends BaseEntity {
  ipAddress: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zipCode?: string;
  timezone: string;
  isp?: string;
  organization?: string;
  cacheExpiry: Date;
}

// Database table relationships
export interface DatabaseRelations {
  // User relations
  users: {
    sessions: UserSession[];
    errorLogs: ErrorLog[];
  };

  // Search relations
  searchRecords: {
    session?: UserSession_Analytics;
    geoData?: GeoIpCache;
  };

  // Analytics relations
  sessions: {
    pageViews: PageView[];
    searches: SearchRecord[];
    adImpressions: AdImpression[];
    adClicks: AdClick[];
    affiliateClicks: AffiliateClick[];
  };

  // Ad relations
  adImpressions: {
    clicks?: AdClick[];
    session?: UserSession_Analytics;
  };

  adClicks: {
    impression?: AdImpression;
    session?: UserSession_Analytics;
  };

  // Affiliate relations
  affiliateClicks: {
    conversion?: AffiliateConversion;
    session?: UserSession_Analytics;
  };
}

// Database query types
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  value: any;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: QuerySort[];
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Database migration types
export interface Migration {
  version: string;
  name: string;
  description: string;
  up: string;
  down: string;
  appliedAt?: Date;
}

// Database backup types
export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  type: 'full' | 'incremental';
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

// Performance monitoring
export interface DatabasePerformance {
  queryTime: number;
  queryCount: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  cacheHitRate: number;
}