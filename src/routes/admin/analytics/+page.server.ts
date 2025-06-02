import type { PageServerLoad } from './$types';
import type { AnalyticsTimeRange } from '$lib/types/analytics';

export const load: PageServerLoad = async ({ cookies, url, parent }) => {
  // Get parent data (user, auth status, etc.)
  const { user } = await parent();
  
  const token = cookies.get('hannisol_auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Get time range from URL params or default to 7 days
  const timeRange = (url.searchParams.get('range') as AnalyticsTimeRange) || '7d';
  const exportFormat = url.searchParams.get('export');

  try {
    // Fetch comprehensive analytics data
    const [
      overviewData,
      trafficData,
      revenueData,
      searchData,
      geographicData,
      adPerformanceData,
      affiliateData,
      realTimeData,
      trendsData,
      cohortData
    ] = await Promise.allSettled([
      // Overview metrics
      fetch(`${url.origin}/api/analytics/overview?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Traffic analytics
      fetch(`${url.origin}/api/analytics/traffic?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Revenue analytics
      fetch(`${url.origin}/api/analytics/revenue?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Search analytics
      fetch(`${url.origin}/api/analytics/searches?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Geographic analytics
      fetch(`${url.origin}/api/analytics/geographic?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Ad performance
      fetch(`${url.origin}/api/analytics/ads?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Affiliate performance
      fetch(`${url.origin}/api/analytics/affiliates?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Real-time data
      fetch(`${url.origin}/api/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Trends data
      fetch(`${url.origin}/api/analytics/trends?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Cohort analysis
      fetch(`${url.origin}/api/analytics/cohorts?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null)
    ]);

    // Extract data from settled promises
    const extractData = (result: PromiseSettledResult<any>) => 
      result.status === 'fulfilled' ? result.value : null;

    const analytics = {
      overview: extractData(overviewData) || {
        totalVisitors: 0,
        uniqueVisitors: 0,
        totalPageViews: 0,
        totalSessions: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
        newVisitorRate: 0,
        returningVisitorRate: 0,
        totalRevenue: 0,
        totalSearches: 0,
        topPages: [],
        topReferrers: [],
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        browserBreakdown: []
      },

      traffic: extractData(trafficData) || {
        dailyVisitors: [],
        hourlyTraffic: [],
        trafficSources: [],
        referralSites: [],
        searchEngines: [],
        socialMedia: [],
        directTraffic: 0,
        organicTraffic: 0,
        referralTraffic: 0,
        socialTraffic: 0,
        campaignTraffic: 0
      },

      revenue: extractData(revenueData) || {
        totalRevenue: 0,
        adRevenue: 0,
        affiliateRevenue: 0,
        dailyRevenue: [],
        monthlyRevenue: [],
        revenueBySource: [],
        adNetworkPerformance: [],
        affiliatePerformance: [],
        revenuePerVisitor: 0,
        conversionValue: 0,
        topEarningPages: []
      },

      searches: extractData(searchData) || {
        totalSearches: 0,
        uniqueAddresses: 0,
        successfulSearches: 0,
        failedSearches: 0,
        avgSearchTime: 0,
        mostSearchedAddresses: [],
        searchesByTime: [],
        searchesByCountry: [],
        riskLevelDistribution: {},
        popularTokens: [],
        searchPatterns: []
      },

      geographic: extractData(geographicData) || {
        topCountries: [],
        topRegions: [],
        countryRevenue: [],
        regionRevenue: [],
        timezoneDist: [],
        continentBreakdown: {},
        cityBreakdown: []
      },

      adPerformance: extractData(adPerformanceData) || {
        totalImpressions: 0,
        totalClicks: 0,
        totalRevenue: 0,
        averageCTR: 0,
        averageCPM: 0,
        averageCPC: 0,
        networkPerformance: {
          'google-adsense': { impressions: 0, clicks: 0, revenue: 0, ctr: 0, cpm: 0 },
          'a-ads': { impressions: 0, clicks: 0, revenue: 0, ctr: 0, cpm: 0 },
          'coinzilla': { impressions: 0, clicks: 0, revenue: 0, ctr: 0, cpm: 0 },
          'media-net': { impressions: 0, clicks: 0, revenue: 0, ctr: 0, cpm: 0 }
        },
        topPerformingAds: [],
        adPositionPerformance: {},
        hourlyPerformance: []
      },

      affiliates: extractData(affiliateData) || {
        totalClicks: 0,
        totalConversions: 0,
        totalCommissions: 0,
        conversionRate: 0,
        avgCommissionValue: 0,
        programPerformance: {
          'amazon': { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 },
          'ledger': { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 },
          'vpn': { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 },
          'crypto-education': { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 }
        },
        topProducts: [],
        monthlyTrends: []
      },

      realTime: extractData(realTimeData) || {
        activeUsers: 0,
        currentSessions: 0,
        pagesPerSession: 0,
        avgSessionDuration: 0,
        topActivePages: [],
        recentSearches: [],
        liveRevenue: 0,
        serverStatus: 'healthy',
        activeCountries: []
      },

      trends: extractData(trendsData) || {
        trafficTrend: { direction: 'stable', percentage: 0, data: [] },
        revenueTrend: { direction: 'stable', percentage: 0, data: [] },
        searchTrend: { direction: 'stable', percentage: 0, data: [] },
        conversionTrend: { direction: 'stable', percentage: 0, data: [] },
        predictions: {
          nextMonthVisitors: 0,
          nextMonthRevenue: 0,
          nextMonthSearches: 0
        },
        seasonality: {},
        growth: {
          daily: 0,
          weekly: 0,
          monthly: 0
        }
      },

      cohorts: extractData(cohortData) || {
        newUsers: [],
        returningUsers: [],
        retentionRates: [],
        lifetimeValue: [],
        churnRate: 0,
        averageLifetime: 0
      }
    };

    // Calculate additional derived metrics
    analytics.derived = {
      totalUsers: analytics.overview.totalVisitors,
      engagementRate: analytics.overview.bounceRate > 0 ? 100 - analytics.overview.bounceRate : 0,
      revenueGrowth: calculateGrowthRate(analytics.revenue.dailyRevenue),
      trafficGrowth: calculateGrowthRate(analytics.traffic.dailyVisitors),
      searchGrowth: calculateGrowthRate(analytics.searches.searchesByTime),
      topPerformingMetrics: identifyTopMetrics(analytics),
      insights: generateInsights(analytics),
      alerts: generateAlerts(analytics)
    };

    // Handle export requests
    if (exportFormat) {
      return handleExport(analytics, exportFormat, timeRange);
    }

    return {
      analytics,
      timeRange,
      lastUpdated: new Date().toISOString(),
      availableRanges: [
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' },
        { value: 'all', label: 'All Time' }
      ]
    };

  } catch (error) {
    console.error('Failed to load analytics data:', error);
    
    // Return minimal fallback data
    return {
      analytics: getEmptyAnalytics(),
      timeRange,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load analytics data',
      availableRanges: [
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' },
        { value: 'all', label: 'All Time' }
      ]
    };
  }
};

// Helper function to calculate growth rate
function calculateGrowthRate(data: any[]): number {
  if (!data || data.length < 2) return 0;
  
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  if (!latest || !previous || !latest.value || !previous.value) return 0;
  
  return ((latest.value - previous.value) / previous.value) * 100;
}

// Helper function to identify top performing metrics
function identifyTopMetrics(analytics: any): any[] {
  const metrics = [];
  
  // Top traffic source
  if (analytics.traffic.trafficSources.length > 0) {
    const topSource = analytics.traffic.trafficSources[0];
    metrics.push({
      type: 'traffic_source',
      name: topSource.source,
      value: topSource.visitors,
      percentage: topSource.percentage
    });
  }
  
  // Top ad network
  const adNetworks = Object.entries(analytics.adPerformance.networkPerformance);
  if (adNetworks.length > 0) {
    const topAd = adNetworks.reduce((prev, curr) => 
      curr[1].revenue > prev[1].revenue ? curr : prev
    );
    metrics.push({
      type: 'ad_network',
      name: topAd[0],
      value: topAd[1].revenue,
      metric: 'revenue'
    });
  }
  
  // Top country
  if (analytics.geographic.topCountries.length > 0) {
    const topCountry = analytics.geographic.topCountries[0];
    metrics.push({
      type: 'country',
      name: topCountry.country,
      value: topCountry.visitors,
      percentage: topCountry.percentage
    });
  }
  
  return metrics;
}

// Helper function to generate insights
function generateInsights(analytics: any): string[] {
  const insights = [];
  
  // Traffic insights
  if (analytics.overview.bounceRate > 70) {
    insights.push('High bounce rate detected - consider improving page load times or content relevance');
  }
  
  if (analytics.overview.conversionRate > 5) {
    insights.push('Excellent conversion rate - current optimization strategies are working well');
  }
  
  // Revenue insights
  const adRevenue = analytics.revenue.adRevenue;
  const affiliateRevenue = analytics.revenue.affiliateRevenue;
  
  if (affiliateRevenue > adRevenue * 2) {
    insights.push('Affiliate revenue significantly outperforming ads - consider expanding affiliate programs');
  }
  
  // Search insights
  if (analytics.searches.failedSearches > analytics.searches.successfulSearches * 0.2) {
    insights.push('High search failure rate - investigate API issues or invalid address patterns');
  }
  
  return insights;
}

// Helper function to generate alerts
function generateAlerts(analytics: any): any[] {
  const alerts = [];
  
  // Performance alerts
  if (analytics.overview.bounceRate > 80) {
    alerts.push({
      type: 'warning',
      message: 'Bounce rate is unusually high',
      value: `${analytics.overview.bounceRate.toFixed(1)}%`,
      threshold: '70%'
    });
  }
  
  // Revenue alerts
  if (analytics.revenue.totalRevenue === 0) {
    alerts.push({
      type: 'error',
      message: 'No revenue recorded for selected period',
      action: 'Check ad network and affiliate configurations'
    });
  }
  
  return alerts;
}

// Helper function to handle data export
function handleExport(analytics: any, format: string, timeRange: string) {
  // This would generate and return export data
  // For now, return the analytics data with export flag
  return {
    analytics,
    timeRange,
    export: true,
    format,
    filename: `hannisol-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`
  };
}

// Helper function to return empty analytics structure
function getEmptyAnalytics() {
  return {
    overview: {
      totalVisitors: 0,
      uniqueVisitors: 0,
      totalPageViews: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0,
      newVisitorRate: 0,
      returningVisitorRate: 0,
      totalRevenue: 0,
      totalSearches: 0,
      topPages: [],
      topReferrers: [],
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      browserBreakdown: []
    },
    traffic: {
      dailyVisitors: [],
      hourlyTraffic: [],
      trafficSources: [],
      referralSites: [],
      searchEngines: [],
      socialMedia: [],
      directTraffic: 0,
      organicTraffic: 0,
      referralTraffic: 0,
      socialTraffic: 0,
      campaignTraffic: 0
    },
    revenue: {
      totalRevenue: 0,
      adRevenue: 0,
      affiliateRevenue: 0,
      dailyRevenue: [],
      monthlyRevenue: [],
      revenueBySource: [],
      adNetworkPerformance: [],
      affiliatePerformance: [],
      revenuePerVisitor: 0,
      conversionValue: 0,
      topEarningPages: []
    },
    searches: {
      totalSearches: 0,
      uniqueAddresses: 0,
      successfulSearches: 0,
      failedSearches: 0,
      avgSearchTime: 0,
      mostSearchedAddresses: [],
      searchesByTime: [],
      searchesByCountry: [],
      riskLevelDistribution: {},
      popularTokens: [],
      searchPatterns: []
    },
    geographic: {
      topCountries: [],
      topRegions: [],
      countryRevenue: [],
      regionRevenue: [],
      timezoneDist: [],
      continentBreakdown: {},
      cityBreakdown: []
    },
    adPerformance: {
      totalImpressions: 0,
      totalClicks: 0,
      totalRevenue: 0,
      averageCTR: 0,
      averageCPM: 0,
      averageCPC: 0,
      networkPerformance: {},
      topPerformingAds: [],
      adPositionPerformance: {},
      hourlyPerformance: []
    },
    affiliates: {
      totalClicks: 0,
      totalConversions: 0,
      totalCommissions: 0,
      conversionRate: 0,
      avgCommissionValue: 0,
      programPerformance: {},
      topProducts: [],
      monthlyTrends: []
    },
    realTime: {
      activeUsers: 0,
      currentSessions: 0,
      pagesPerSession: 0,
      avgSessionDuration: 0,
      topActivePages: [],
      recentSearches: [],
      liveRevenue: 0,
      serverStatus: 'unknown',
      activeCountries: []
    },
    trends: {
      trafficTrend: { direction: 'stable', percentage: 0, data: [] },
      revenueTrend: { direction: 'stable', percentage: 0, data: [] },
      searchTrend: { direction: 'stable', percentage: 0, data: [] },
      conversionTrend: { direction: 'stable', percentage: 0, data: [] },
      predictions: { nextMonthVisitors: 0, nextMonthRevenue: 0, nextMonthSearches: 0 },
      seasonality: {},
      growth: { daily: 0, weekly: 0, monthly: 0 }
    },
    cohorts: {
      newUsers: [],
      returningUsers: [],
      retentionRates: [],
      lifetimeValue: [],
      churnRate: 0,
      averageLifetime: 0
    },
    derived: {
      totalUsers: 0,
      engagementRate: 0,
      revenueGrowth: 0,
      trafficGrowth: 0,
      searchGrowth: 0,
      topPerformingMetrics: [],
      insights: [],
      alerts: []
    }
  };
}