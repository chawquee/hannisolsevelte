import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, parent }) => {
  // Get parent data (user, auth status, etc.)
  const { user } = await parent();
  
  const token = cookies.get('hannisol_auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Fetch comprehensive dashboard data
    const [
      dashboardMetrics,
      recentSearches,
      revenueData,
      trafficOverview,
      topCountries,
      systemAlerts,
      performanceMetrics
    ] = await Promise.allSettled([
      // Dashboard overview metrics
      fetch(`${url.origin}/api/admin/dashboard/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Recent searches (last 24 hours)
      fetch(`${url.origin}/api/admin/searches/recent?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Revenue data (last 30 days)
      fetch(`${url.origin}/api/admin/revenue/overview?period=30d`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Traffic overview
      fetch(`${url.origin}/api/analytics/traffic?range=7d`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Top countries by traffic
      fetch(`${url.origin}/api/analytics/geographic/top-countries?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // System alerts and notifications
      fetch(`${url.origin}/api/admin/system/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Performance metrics
      fetch(`${url.origin}/api/admin/system/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null)
    ]);

    // Extract data from settled promises
    const extractData = (result: PromiseSettledResult<any>) => 
      result.status === 'fulfilled' ? result.value : null;

    const dashboardData = {
      metrics: extractData(dashboardMetrics) || {
        totalVisitors: 0,
        totalSearches: 0,
        totalRevenue: 0,
        activeUsers: 0,
        conversionRate: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topReferrers: [],
        revenueGrowth: 0,
        trafficGrowth: 0,
        searchGrowth: 0
      },
      recentSearches: extractData(recentSearches) || [],
      revenue: extractData(revenueData) || {
        totalRevenue: 0,
        adRevenue: 0,
        affiliateRevenue: 0,
        dailyRevenue: [],
        topPerformingAds: [],
        topAffiliatePrograms: []
      },
      traffic: extractData(trafficOverview) || {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        sessions: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        trafficSources: [],
        hourlyTraffic: []
      },
      topCountries: extractData(topCountries) || [],
      alerts: extractData(systemAlerts) || [],
      performance: extractData(performanceMetrics) || {
        apiResponseTime: 0,
        databaseResponseTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0,
        errorRate: 0
      }
    };

    // Calculate additional metrics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Add derived metrics
    dashboardData.derived = {
      revenuePerVisitor: dashboardData.metrics.totalVisitors > 0 
        ? dashboardData.metrics.totalRevenue / dashboardData.metrics.totalVisitors 
        : 0,
      searchesPerVisitor: dashboardData.metrics.totalVisitors > 0 
        ? dashboardData.metrics.totalSearches / dashboardData.metrics.totalVisitors 
        : 0,
      todayRevenue: dashboardData.revenue.dailyRevenue
        .filter((day: any) => new Date(day.date) >= todayStart)
        .reduce((sum: number, day: any) => sum + day.totalRevenue, 0),
      healthScore: calculateHealthScore(dashboardData.performance),
      trendsData: generateTrendsData(dashboardData)
    };

    return {
      dashboard: dashboardData,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    
    // Return minimal fallback data
    return {
      dashboard: {
        metrics: {
          totalVisitors: 0,
          totalSearches: 0,
          totalRevenue: 0,
          activeUsers: 0,
          conversionRate: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topReferrers: [],
          revenueGrowth: 0,
          trafficGrowth: 0,
          searchGrowth: 0
        },
        recentSearches: [],
        revenue: {
          totalRevenue: 0,
          adRevenue: 0,
          affiliateRevenue: 0,
          dailyRevenue: [],
          topPerformingAds: [],
          topAffiliatePrograms: []
        },
        traffic: {
          totalVisitors: 0,
          uniqueVisitors: 0,
          pageViews: 0,
          sessions: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          trafficSources: [],
          hourlyTraffic: []
        },
        topCountries: [],
        alerts: [
          {
            id: 'data_load_error',
            type: 'warning',
            message: 'Unable to load complete dashboard data',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          }
        ],
        performance: {
          apiResponseTime: 0,
          databaseResponseTime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          uptime: 0,
          errorRate: 0
        },
        derived: {
          revenuePerVisitor: 0,
          searchesPerVisitor: 0,
          todayRevenue: 0,
          healthScore: 0,
          trendsData: []
        }
      },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load dashboard data'
    };
  }
};

// Helper function to calculate system health score
function calculateHealthScore(performance: any): number {
  if (!performance) return 0;
  
  const scores = {
    responseTime: performance.apiResponseTime < 200 ? 100 : Math.max(0, 100 - (performance.apiResponseTime - 200) / 10),
    cpuUsage: Math.max(0, 100 - performance.cpuUsage),
    memoryUsage: Math.max(0, 100 - performance.memoryUsage),
    errorRate: Math.max(0, 100 - performance.errorRate * 100),
    uptime: performance.uptime > 99.5 ? 100 : performance.uptime
  };
  
  return Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length);
}

// Helper function to generate trends data
function generateTrendsData(data: any): any[] {
  const trends = [];
  
  if (data.revenue?.dailyRevenue?.length > 0) {
    trends.push({
      name: 'Revenue',
      data: data.revenue.dailyRevenue.slice(-7).map((day: any) => ({
        date: day.date,
        value: day.totalRevenue
      })),
      color: '#10b981',
      change: data.metrics.revenueGrowth
    });
  }
  
  if (data.traffic?.hourlyTraffic?.length > 0) {
    trends.push({
      name: 'Traffic',
      data: data.traffic.hourlyTraffic.slice(-24).map((hour: any) => ({
        date: hour.hour,
        value: hour.visitors
      })),
      color: '#3b82f6',
      change: data.metrics.trafficGrowth
    });
  }
  
  return trends;
}