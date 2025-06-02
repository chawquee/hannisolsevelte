// Time range options for analytics
export type AnalyticsTimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

// Traffic analytics types
export interface TrafficMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: PageMetric[];
  trafficSources: TrafficSource[];
  deviceTypes: DeviceMetric[];
}

export interface PageMetric {
  page: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  conversionRate: number;
}

export interface DeviceMetric {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  visitors: number;
  percentage: number;
  avgSessionDuration: number;
}

// Revenue analytics types
export interface RevenueMetrics {
  totalRevenue: number;
  adRevenue: number;
  affiliateRevenue: number;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  revenueBySource: RevenueSource[];
}

export interface DailyRevenue {
  date: string;
  adRevenue: number;
  affiliateRevenue: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  adRevenue: number;
  affiliateRevenue: number;
  totalRevenue: number;
  growth: number;
}

export interface RevenueSource {
  source: string;
  revenue: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Search analytics types
export interface SearchAnalytics {
  totalSearches: number;
  uniqueAddresses: number;
  mostSearchedAddresses: PopularAddress[];
  searchesByTime: SearchTimeMetric[];
  searchesByRegion: SearchRegionMetric[];
  avgSearchesPerUser: number;
}

export interface PopularAddress {
  address: string;
  searchCount: number;
  lastSearched: string;
  isHighRisk: boolean;
}

export interface SearchTimeMetric {
  hour: number;
  searches: number;
  date: string;
}

export interface SearchRegionMetric {
  country: string;
  countryCode: string;
  searches: number;
  percentage: number;
}

// Geographic analytics types
export interface GeographicData {
  topCountries: CountryMetric[];
  topRegions: RegionMetric[];
  revenueByCountry: CountryRevenue[];
  usersByTimezone: TimezoneMetric[];
}

export interface CountryMetric {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
  avgSessionDuration: number;
}

export interface RegionMetric {
  region: string;
  country: string;
  visitors: number;
  searches: number;
  revenue: number;
}

export interface CountryRevenue {
  country: string;
  countryCode: string;
  revenue: number;
  visitors: number;
  revenuePerVisitor: number;
}

export interface TimezoneMetric {
  timezone: string;
  users: number;
  peakHours: number[];
}

// Ad performance types
export interface AdPerformance {
  totalImpressions: number;
  totalClicks: number;
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
  cpc: number; // Cost per click
  adNetworkPerformance: AdNetworkMetric[];
  topPerformingAds: AdMetric[];
}

export interface AdNetworkMetric {
  network: 'google-adsense' | 'a-ads' | 'coinzilla' | 'media-net' | 'amazon-associates' | 'ledger' | 'vpn' | 'crypto-education';
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  cpm: number;
  fillRate: number;
}

export interface AdMetric {
  adId: string;
  adType: 'banner' | 'native' | 'affiliate';
  network: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  position: string;
}

// Main analytics data interface
export interface AnalyticsData {
  traffic: TrafficMetrics;
  revenue: RevenueMetrics;
  searches: SearchAnalytics;
  geographic: GeographicData;
  adPerformance: AdPerformance;
}

// Real-time analytics
export interface RealTimeMetrics {
  activeUsers: number;
  recentSearches: number;
  currentRevenue: number;
  serverStatus: 'healthy' | 'warning' | 'error';
  onlineVisitors: OnlineVisitor[];
  recentActivities: RecentActivity[];
}

export interface OnlineVisitor {
  id: string;
  country: string;
  currentPage: string;
  sessionDuration: number;
  isNewVisitor: boolean;
}

export interface RecentActivity {
  type: 'search' | 'page_view' | 'ad_click' | 'affiliate_click';
  description: string;
  timestamp: string;
  revenue?: number;
  country?: string;
}

// Analytics API response types
export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsData;
  metadata: {
    generatedAt: string;
    timeRange: AnalyticsTimeRange;
    totalRecords: number;
    cacheStatus: 'hit' | 'miss' | 'stale';
  };
}

export interface AnalyticsExportData {
  data: AnalyticsData;
  metadata: {
    exportedAt: string;
    timeRange: AnalyticsTimeRange;
    version: string;
  };
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'map';
  size: 'small' | 'medium' | 'large';
  data: any;
  config: WidgetConfig;
}

export interface WidgetConfig {
  refreshInterval: number;
  showTrend: boolean;
  colorScheme: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  dateRange?: AnalyticsTimeRange;
}

// Analytics filters
export interface AnalyticsFilter {
  timeRange: AnalyticsTimeRange;
  country?: string;
  trafficSource?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  adNetwork?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  searchResponseTime: number;
  uptimePercentage: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Alert types
export interface AnalyticsAlert {
  id: string;
  type: 'revenue_drop' | 'traffic_spike' | 'error_rate_high' | 'server_down' | 'ad_performance_low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  resolved: boolean;
  resolvedAt?: string;
  data: any;
}

// Custom event tracking
export interface CustomEvent {
  eventName: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// A/B testing types
export interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  startDate: string;
  endDate?: string;
  targetAudience: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  trafficPercentage: number;
  conversionRate: number;
  revenue: number;
  participants: number;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'revenue' | 'engagement';
  winnerVariant?: string;
  confidenceLevel: number;
}

// Cohort analysis
export interface CohortData {
  cohortMonth: string;
  cohortSize: number;
  retentionRates: number[];
  revenuePerUser: number[];
  totalRevenue: number;
}