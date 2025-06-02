// Main library barrel export file for Hannisol Solana Address Checker
// This file provides centralized access to all core functionality

// ===== STORES =====
// Authentication store
export { 
  authStore, 
  authLoading, 
  isAuthenticated, 
  currentUser, 
  isAdmin, 
  userPermissions, 
  authActions 
} from './stores/auth';

// Analytics store
export { 
  analyticsData, 
  analyticsLoading, 
  analyticsError, 
  selectedTimeRange, 
  realTimeMetrics, 
  trafficMetrics, 
  revenueMetrics, 
  searchMetrics, 
  geographicMetrics, 
  adMetrics, 
  dashboardSummary, 
  analyticsActions 
} from './stores/analytics';

// Search results store
export { 
  searchStore, 
  searchQuery, 
  searchHistory, 
  validationLoading, 
  balanceLoading, 
  transactionLoading, 
  riskAnalysisLoading, 
  communityDataLoading, 
  addressValidation, 
  balanceData, 
  transactionData, 
  riskAnalysisData, 
  communityData, 
  isValidAddress, 
  hasResults, 
  searchActions, 
  resetSearchQuery 
} from './stores/searchResults';

// ===== UTILITIES =====
// All utility functions and helpers
export {
  // Analytics utilities
  analytics,
  ga4,
  internalAnalytics,
  performanceTracker,
  behaviorTracker,
  analyticsUtils,

  // Authentication utilities
  authUtils,
  jwtUtils,
  passwordUtils,
  sessionUtils,
  roleUtils,
  securityUtils,
  cookieUtils,
  twoFactorUtils,

  // Geolocation utilities
  geolocation,
  browserGeolocation,
  ipGeolocation,
  geolocationService,

  // Sharing utilities
  sharing,
  contentGenerator,
  platformShares,
  sharingService,
  shareUtils,

  // Solana utilities
  solanaUtils,
  addressValidator,
  accountInfo,
  balanceUtils,
  transactionUtils,
  networkUtils,
  tokenUtils,
  performanceMonitor,
  formatSolAmount,
  formatTokenAmount,
  shortenAddress,

  // Validation utilities
  validation,
  sanitization,
  stringValidation,
  solanaValidation,
  numericValidation,
  formValidation,
  rateLimitValidation,
  isValidEmail,
  isValidSolanaAddress,
  sanitizeInput,
  VALIDATION_PATTERNS,

  // Common utilities
  commonUtils,
  colorUtils
} from './utils';

// ===== TYPES =====
// Analytics types
export type {
  AnalyticsTimeRange,
  TrafficMetrics,
  RevenueMetrics,
  SearchAnalytics,
  GeographicData,
  AdPerformance,
  AnalyticsData,
  RealTimeMetrics,
  AnalyticsApiResponse,
  DashboardWidget,
  AnalyticsFilter,
  CustomEvent,
  ABTest,
  CohortData
} from './types/analytics';

// Database types
export type {
  BaseEntity,
  User,
  UserProfile,
  UserSession,
  SearchRecord,
  PageView,
  UserSession_Analytics,
  AdImpression,
  AdClick,
  AdRevenue,
  AffiliateClick,
  AffiliateConversion,
  AffiliateRevenue,
  AddressAnalysisCache,
  SolanaAddressAnalysis,
  SystemConfig,
  ErrorLog,
  RateLimit,
  SharedContent,
  GeoIpCache,
  QueryFilter,
  QuerySort,
  QueryOptions,
  QueryResult,
  Migration,
  BackupInfo,
  DatabasePerformance
} from './types/database';

// Solana types
export type {
  SolanaAddressInfo,
  TokenBalance,
  SolBalance,
  NFTInfo,
  TransactionHistory,
  TransactionInstruction,
  RiskAnalysis,
  RiskFactor,
  SecurityCheck,
  TokenRiskAnalysis,
  CommunityData,
  SocialMediaMetrics,
  CommunityActivity,
  DeFiProtocolInfo,
  TokenMetadata,
  SearchResult,
  AddressInsight,
  RelatedAddress,
  SolanaNetworkInfo,
  RpcProvider,
  SearchOptions,
  ValidationResult,
  AddressMonitor,
  HistoricalBalance,
  HistoricalTransaction,
  SolanaError,
  SolanaApiResponse
} from './types/solana';

// ===== COMPONENTS =====
// Note: Svelte components are typically imported directly in .svelte files
// But we can export component references for programmatic use

// Common component props interfaces
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  value?: string | number;
  name?: string;
  id?: string;
  autocomplete?: string;
  maxlength?: number;
  minlength?: number;
  pattern?: string;
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  loading?: boolean;
}

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

// Chart component props
export interface ChartProps {
  data: any[];
  type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  width?: number;
  height?: number;
  responsive?: boolean;
  theme?: 'light' | 'dark';
  colors?: string[];
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

// Ad component props
export interface AdComponentProps {
  network: 'google-adsense' | 'a-ads' | 'coinzilla' | 'media-net';
  size?: 'banner' | 'leaderboard' | 'rectangle' | 'square' | 'skyscraper';
  position?: 'header' | 'sidebar' | 'content' | 'footer';
  responsive?: boolean;
  lazy?: boolean;
}

// Affiliate component props
export interface AffiliateProps {
  program: 'amazon' | 'ledger' | 'vpn' | 'crypto-education';
  productId?: string;
  customText?: string;
  showImage?: boolean;
  showPrice?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: 'card' | 'button' | 'banner' | 'text';
}

// Search component props
export interface AddressInputProps {
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  onSearch?: (address: string) => void;
  onValidate?: (address: string) => void;
  autoFocus?: boolean;
  maxHistory?: number;
}

export interface ValidationResultProps {
  result?: ValidationResult;
  loading?: boolean;
  showDetails?: boolean;
  compact?: boolean;
}

export interface BalanceDisplayProps {
  solBalance?: SolBalance;
  tokenBalances?: TokenBalance[];
  loading?: boolean;
  showChart?: boolean;
  showDetails?: boolean;
  currency?: 'USD' | 'EUR' | 'BTC' | 'ETH';
}

export interface TransactionHistoryProps {
  transactions?: TransactionHistory[];
  loading?: boolean;
  limit?: number;
  showPagination?: boolean;
  showFilters?: boolean;
  onTransactionClick?: (signature: string) => void;
}

export interface RiskAnalysisProps {
  riskData?: RiskAnalysis;
  loading?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  showRecommendations?: boolean;
}

export interface ShareButtonsProps {
  address: string;
  result?: SearchResult;
  platforms?: ('twitter' | 'telegram' | 'discord' | 'reddit' | 'linkedin' | 'whatsapp' | 'email' | 'clipboard')[];
  size?: 'sm' | 'md' | 'lg';
  style?: 'buttons' | 'icons' | 'dropdown';
  showLabels?: boolean;
}

// Admin component props
export interface RevenueChartProps {
  data?: RevenueMetrics;
  timeRange?: AnalyticsTimeRange;
  chartType?: 'line' | 'bar' | 'area';
  showComparison?: boolean;
  height?: number;
}

export interface TrafficChartProps {
  data?: TrafficMetrics;
  timeRange?: AnalyticsTimeRange;
  metric?: 'visitors' | 'pageviews' | 'sessions' | 'bounces';
  showDeviceBreakdown?: boolean;
  height?: number;
}

export interface GeographicMapProps {
  data?: GeographicData;
  metric?: 'visitors' | 'revenue' | 'searches';
  interactive?: boolean;
  showDetails?: boolean;
  height?: number;
}

export interface SearchTableProps {
  searches?: SearchRecord[];
  loading?: boolean;
  pagination?: boolean;
  filters?: boolean;
  exportable?: boolean;
  onAddressClick?: (address: string) => void;
}

// Layout component props
export interface HeaderProps {
  showNavigation?: boolean;
  showUserMenu?: boolean;
  showSearch?: boolean;
  sticky?: boolean;
  transparent?: boolean;
}

export interface FooterProps {
  showLinks?: boolean;
  showSocial?: boolean;
  showLegal?: boolean;
  compact?: boolean;
}

export interface NavigationProps {
  items?: Array<{
    href: string;
    label: string;
    icon?: string;
    active?: boolean;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'primary' | 'secondary' | 'minimal';
  showIcons?: boolean;
  collapsible?: boolean;
}

// ===== DATABASE =====
// Database connection and query utilities
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

export interface DatabaseConnection {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseTransaction {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// ===== CONSTANTS =====
// Application constants
export const APP_CONFIG = {
  name: 'Hannisol',
  fullName: 'Hannisol - Solana Address Checker',
  description: 'Comprehensive validation and analysis for Solana addresses',
  slogan: "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.",
  version: '1.0.0',
  author: 'Hannisol Team',
  website: 'https://hannisol.com',
  supportEmail: 'support@hannisol.com',
  
  // Social links
  social: {
    twitter: 'https://twitter.com/hannisol',
    telegram: 'https://t.me/hannisol',
    discord: 'https://discord.gg/hannisol',
    github: 'https://github.com/hannisol'
  },

  // Brand colors
  colors: {
    primary: '#7c3aed',
    secondary: '#ffd700',
    accent: {
      teal: '#00bcd4',
      orange: '#ff6b35',
      purple: '#7933ff'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },

  // API endpoints
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retries: 3
  },

  // Feature flags
  features: {
    analytics: true,
    ads: true,
    affiliates: true,
    sharing: true,
    darkMode: true,
    notifications: true,
    exportData: true,
    advancedRiskAnalysis: true,
    communityData: true,
    realTimeUpdates: true
  },

  // Limits and thresholds
  limits: {
    searchHistoryItems: 50,
    transactionHistoryItems: 100,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    rateLimitSearches: 60, // per hour
    rateLimitAPI: 1000, // per hour
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// Network configurations
export const SOLANA_CONFIG = {
  networks: {
    mainnet: {
      name: 'Mainnet Beta',
      rpcUrls: [
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana'
      ],
      explorerUrl: 'https://solscan.io',
      chainId: 101
    },
    devnet: {
      name: 'Devnet',
      rpcUrls: ['https://api.devnet.solana.com'],
      explorerUrl: 'https://solscan.io/?cluster=devnet',
      chainId: 103
    },
    testnet: {
      name: 'Testnet',
      rpcUrls: ['https://api.testnet.solana.com'],
      explorerUrl: 'https://solscan.io/?cluster=testnet',
      chainId: 102
    }
  },
  defaultNetwork: 'mainnet' as const,
  timeout: 30000,
  commitment: 'confirmed' as const
};

// Ad network configurations
export const AD_CONFIG = {
  networks: {
    'google-adsense': {
      name: 'Google AdSense',
      publisherId: process.env.GOOGLE_ADSENSE_PUBLISHER_ID || '',
      enabled: true
    },
    'a-ads': {
      name: 'A-ADS',
      enabled: true
    },
    'coinzilla': {
      name: 'Coinzilla',
      enabled: true
    },
    'media-net': {
      name: 'Media.net',
      publisherId: process.env.MEDIA_NET_PUBLISHER_ID || '',
      enabled: true
    }
  },
  refreshInterval: 30000, // 30 seconds
  viewabilityThreshold: 50 // 50% viewable
};

// Affiliate program configurations
export const AFFILIATE_CONFIG = {
  programs: {
    amazon: {
      name: 'Amazon Associates',
      tag: process.env.AMAZON_ASSOCIATE_TAG || '',
      enabled: true
    },
    ledger: {
      name: 'Ledger Affiliate',
      enabled: true
    },
    vpn: {
      name: 'VPN Services',
      enabled: true
    },
    'crypto-education': {
      name: 'Crypto Education',
      enabled: true
    }
  }
};

// ===== ERROR HANDLING =====
// Application-specific error classes
export class HannisolError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'HannisolError';
  }
}

export class ValidationError extends HannisolError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class SolanaError extends HannisolError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SOLANA_ERROR', 500, context);
    this.name = 'SolanaError';
  }
}

export class RateLimitError extends HannisolError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', 429, context);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends HannisolError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends HannisolError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

// ===== VERSION INFO =====
export const VERSION_INFO = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  gitCommit: process.env.GIT_COMMIT || 'unknown',
  environment: process.env.NODE_ENV || 'development'
} as const;

// Export everything as default for convenience
export default {
  // Stores
  stores: {
    auth: { authStore, authActions },
    analytics: { analyticsData, analyticsActions },
    search: { searchStore, searchActions }
  },
  
  // Utils
  utils: {
    analytics,
    auth: authUtils,
    geolocation,
    sharing,
    solana: solanaUtils,
    validation,
    common: commonUtils
  },
  
  // Config
  config: {
    app: APP_CONFIG,
    solana: SOLANA_CONFIG,
    ads: AD_CONFIG,
    affiliates: AFFILIATE_CONFIG
  },
  
  // Constants
  version: VERSION_INFO,
  
  // Errors
  errors: {
    HannisolError,
    ValidationError,
    SolanaError,
    RateLimitError,
    AuthenticationError,
    AuthorizationError
  }
};