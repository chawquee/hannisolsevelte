import { writable, derived, type Readable } from 'svelte/store';
import type { 
  AnalyticsData, 
  TrafficMetrics, 
  RevenueMetrics, 
  SearchAnalytics, 
  GeographicData,
  AdPerformance,
  AnalyticsTimeRange 
} from '$lib/types/analytics';

// Main analytics data store
export const analyticsData = writable<AnalyticsData>({
  traffic: {
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    trafficSources: [],
    deviceTypes: []
  },
  revenue: {
    totalRevenue: 0,
    adRevenue: 0,
    affiliateRevenue: 0,
    dailyRevenue: [],
    monthlyRevenue: [],
    revenueBySource: []
  },
  searches: {
    totalSearches: 0,
    uniqueAddresses: 0,
    mostSearchedAddresses: [],
    searchesByTime: [],
    searchesByRegion: [],
    avgSearchesPerUser: 0
  },
  geographic: {
    topCountries: [],
    topRegions: [],
    revenueByCountry: [],
    usersByTimezone: []
  },
  adPerformance: {
    totalImpressions: 0,
    totalClicks: 0,
    ctr: 0,
    cpm: 0,
    cpc: 0,
    adNetworkPerformance: [],
    topPerformingAds: []
  }
});

// Loading states
export const analyticsLoading = writable<boolean>(false);
export const analyticsError = writable<string | null>(null);

// Selected time range
export const selectedTimeRange = writable<AnalyticsTimeRange>('7d');

// Real-time metrics
export const realTimeMetrics = writable({
  activeUsers: 0,
  recentSearches: 0,
  currentRevenue: 0,
  serverStatus: 'healthy' as 'healthy' | 'warning' | 'error'
});

// Derived stores for specific metrics
export const trafficMetrics: Readable<TrafficMetrics> = derived(
  analyticsData,
  ($analyticsData) => $analyticsData.traffic
);

export const revenueMetrics: Readable<RevenueMetrics> = derived(
  analyticsData,
  ($analyticsData) => $analyticsData.revenue
);

export const searchMetrics: Readable<SearchAnalytics> = derived(
  analyticsData,
  ($analyticsData) => $analyticsData.searches
);

export const geographicMetrics: Readable<GeographicData> = derived(
  analyticsData,
  ($analyticsData) => $analyticsData.geographic
);

export const adMetrics: Readable<AdPerformance> = derived(
  analyticsData,
  ($analyticsData) => $analyticsData.adPerformance
);

// Dashboard summary metrics
export const dashboardSummary = derived(
  [analyticsData, realTimeMetrics],
  ([$analyticsData, $realTimeMetrics]) => ({
    totalVisitors: $analyticsData.traffic.totalVisitors,
    totalRevenue: $analyticsData.revenue.totalRevenue,
    totalSearches: $analyticsData.searches.totalSearches,
    activeUsers: $realTimeMetrics.activeUsers,
    conversionRate: $analyticsData.traffic.totalVisitors > 0 
      ? ($analyticsData.searches.totalSearches / $analyticsData.traffic.totalVisitors * 100)
      : 0,
    revenuePerVisitor: $analyticsData.traffic.totalVisitors > 0
      ? ($analyticsData.revenue.totalRevenue / $analyticsData.traffic.totalVisitors)
      : 0
  })
);

// Analytics Actions
export const analyticsActions = {
  // Fetch analytics data
  async fetchAnalytics(timeRange: AnalyticsTimeRange = '7d') {
    analyticsLoading.set(true);
    analyticsError.set(null);
    
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.statusText}`);
      }
      
      const data: AnalyticsData = await response.json();
      analyticsData.set(data);
      selectedTimeRange.set(timeRange);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      analyticsError.set(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      analyticsLoading.set(false);
    }
  },

  // Track page view
  async trackPageView(page: string, referrer?: string) {
    try {
      await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, referrer, timestamp: Date.now() })
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  // Track search event
  async trackSearch(address: string, resultType: string, userAgent?: string) {
    try {
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          resultType, 
          userAgent,
          timestamp: Date.now() 
        })
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  },

  // Track ad interaction
  async trackAdClick(adNetwork: string, adId: string, revenue?: number) {
    try {
      await fetch('/api/analytics/ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adNetwork, 
          adId, 
          revenue,
          timestamp: Date.now() 
        })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  },

  // Track affiliate conversion
  async trackAffiliateConversion(program: string, commissionValue: number) {
    try {
      await fetch('/api/analytics/affiliate-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          program, 
          commissionValue,
          timestamp: Date.now() 
        })
      });
    } catch (error) {
      console.error('Failed to track affiliate conversion:', error);
    }
  },

  // Update real-time metrics
  async updateRealTimeMetrics() {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (response.ok) {
        const data = await response.json();
        realTimeMetrics.set(data);
      }
    } catch (error) {
      console.error('Failed to update real-time metrics:', error);
    }
  },

  // Export analytics data
  async exportData(timeRange: AnalyticsTimeRange, format: 'csv' | 'json' = 'csv') {
    try {
      const response = await fetch(`/api/analytics/export?range=${timeRange}&format=${format}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hannisol-analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      analyticsError.set('Failed to export data');
    }
  },

  // Clear analytics data (reset store)
  clearData() {
    analyticsData.set({
      traffic: {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        topPages: [],
        trafficSources: [],
        deviceTypes: []
      },
      revenue: {
        totalRevenue: 0,
        adRevenue: 0,
        affiliateRevenue: 0,
        dailyRevenue: [],
        monthlyRevenue: [],
        revenueBySource: []
      },
      searches: {
        totalSearches: 0,
        uniqueAddresses: 0,
        mostSearchedAddresses: [],
        searchesByTime: [],
        searchesByRegion: [],
        avgSearchesPerUser: 0
      },
      geographic: {
        topCountries: [],
        topRegions: [],
        revenueByCountry: [],
        usersByTimezone: []
      },
      adPerformance: {
        totalImpressions: 0,
        totalClicks: 0,
        ctr: 0,
        cpm: 0,
        cpc: 0,
        adNetworkPerformance: [],
        topPerformingAds: []
      }
    });
    analyticsError.set(null);
  }
};

// Auto-refresh real-time metrics every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    analyticsActions.updateRealTimeMetrics();
  }, 30000);
}