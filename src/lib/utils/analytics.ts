import type { AnalyticsTimeRange, CustomEvent } from '$lib/types/analytics';

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with actual GA4 ID
  TRACK_PAGE_VIEWS: true,
  TRACK_CLICKS: true,
  TRACK_SEARCHES: true,
  TRACK_ERRORS: true,
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 5000, // 5 seconds
  DEBUG: false
};

// Event queue for batching
let eventQueue: CustomEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Google Analytics 4 integration
export const ga4 = {
  // Initialize GA4
  init(measurementId: string = ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    if (typeof window === 'undefined') return;

    // Load GA4 script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      page_title: 'Hannisol - Solana Address Checker',
      page_location: window.location.href,
      custom_map: {
        custom_parameter_1: 'address_search',
        custom_parameter_2: 'risk_level'
      }
    });
  },

  // Track page view
  pageView(page: string, title?: string) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: page
    });

    if (ANALYTICS_CONFIG.DEBUG) {
      console.log('GA4 Page View:', { page, title });
    }
  },

  // Track custom event
  event(eventName: string, parameters: Record<string, any> = {}) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', eventName, {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label,
      value: parameters.value,
      custom_parameter_1: parameters.address,
      custom_parameter_2: parameters.riskLevel,
      ...parameters
    });

    if (ANALYTICS_CONFIG.DEBUG) {
      console.log('GA4 Event:', eventName, parameters);
    }
  },

  // Track search
  search(searchTerm: string, results: number = 0) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'search', {
      search_term: searchTerm,
      event_category: 'solana_search',
      event_label: 'address_checker',
      custom_parameter_1: searchTerm,
      value: results
    });
  },

  // Track conversion (ad click, affiliate click)
  conversion(type: 'ad_click' | 'affiliate_click', value: number = 0, currency: string = 'USD') {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'purchase', {
      transaction_id: `${type}_${Date.now()}`,
      value: value,
      currency: currency,
      event_category: 'monetization',
      event_label: type
    });
  }
};

// Internal analytics tracking
export const internalAnalytics = {
  // Track page view to internal system
  async trackPageView(page: string, referrer?: string, additionalData?: Record<string, any>) {
    const event: CustomEvent = {
      eventName: 'page_view',
      category: 'navigation',
      label: page,
      customData: {
        referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href,
        ...additionalData
      },
      timestamp: Date.now()
    };

    await this.trackEvent(event);
  },

  // Track search event
  async trackSearch(
    address: string, 
    resultType: 'success' | 'error' | 'invalid', 
    duration: number,
    additionalData?: Record<string, any>
  ) {
    const event: CustomEvent = {
      eventName: 'address_search',
      category: 'search',
      label: resultType,
      value: duration,
      customData: {
        address: this.hashAddress(address), // Hash for privacy
        resultType,
        duration,
        userAgent: navigator.userAgent,
        ...additionalData
      },
      timestamp: Date.now()
    };

    await this.trackEvent(event);

    // Also track in GA4
    ga4.search(this.hashAddress(address), resultType === 'success' ? 1 : 0);
  },

  // Track ad interaction
  async trackAdClick(
    adNetwork: string, 
    adId: string, 
    position: string, 
    revenue?: number
  ) {
    const event: CustomEvent = {
      eventName: 'ad_click',
      category: 'monetization',
      label: adNetwork,
      value: revenue || 0,
      customData: {
        adNetwork,
        adId,
        position,
        revenue,
        pageUrl: window.location.href
      },
      timestamp: Date.now()
    };

    await this.trackEvent(event);

    // Track conversion in GA4
    if (revenue) {
      ga4.conversion('ad_click', revenue);
    }
  },

  // Track affiliate click
  async trackAffiliateClick(
    program: string, 
    productId: string, 
    commission?: number
  ) {
    const event: CustomEvent = {
      eventName: 'affiliate_click',
      category: 'monetization',
      label: program,
      value: commission || 0,
      customData: {
        program,
        productId,
        commission,
        pageUrl: window.location.href
      },
      timestamp: Date.now()
    };

    await this.trackEvent(event);

    // Track conversion in GA4
    if (commission) {
      ga4.conversion('affiliate_click', commission);
    }
  },

  // Track error
  async trackError(error: Error, context?: Record<string, any>) {
    const event: CustomEvent = {
      eventName: 'error',
      category: 'error',
      label: error.name,
      customData: {
        errorMessage: error.message,
        errorStack: error.stack,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      timestamp: Date.now()
    };

    await this.trackEvent(event);
  },

  // Track custom event
  async trackEvent(event: CustomEvent) {
    // Add to queue for batching
    eventQueue.push(event);

    // Start flush timer if not already running
    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        this.flushEvents();
      }, ANALYTICS_CONFIG.FLUSH_INTERVAL);
    }

    // Flush immediately if queue is full
    if (eventQueue.length >= ANALYTICS_CONFIG.BATCH_SIZE) {
      this.flushEvents();
    }
  },

  // Flush events to server
  async flushEvents() {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue = [];

    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });

      if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Analytics events flushed:', events.length);
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to queue on failure
      eventQueue.unshift(...events);
    }
  },

  // Hash address for privacy
  hashAddress(address: string): string {
    if (address.length <= 8) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
};

// Performance tracking
export const performanceTracker = {
  // Track page load performance
  trackPageLoad() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
        connectTime: navigation.connectEnd - navigation.connectStart,
        responseTime: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domComplete - navigation.domLoading
      };

      internalAnalytics.trackEvent({
        eventName: 'page_performance',
        category: 'performance',
        customData: metrics,
        timestamp: Date.now()
      });
    }
  },

  // Track API response time
  async trackApiCall(endpoint: string, startTime: number, success: boolean, error?: string) {
    const duration = Date.now() - startTime;

    await internalAnalytics.trackEvent({
      eventName: 'api_call',
      category: 'performance',
      label: endpoint,
      value: duration,
      customData: {
        endpoint,
        duration,
        success,
        error
      },
      timestamp: Date.now()
    });
  }
};

// User behavior tracking
export const behaviorTracker = {
  // Track scroll depth
  trackScrollDepth() {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const checkpoints = [25, 50, 75, 90, 100];
    const triggered = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        checkpoints.forEach(checkpoint => {
          if (scrollPercent >= checkpoint && !triggered.has(checkpoint)) {
            triggered.add(checkpoint);
            
            ga4.event('scroll', {
              event_category: 'engagement',
              event_label: `${checkpoint}%`,
              value: checkpoint
            });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  },

  // Track time on page
  trackTimeOnPage() {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    let isActive = true;
    let totalActiveTime = 0;
    let lastActiveTime = startTime;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActive) {
          totalActiveTime += Date.now() - lastActiveTime;
          isActive = false;
        }
      } else {
        if (!isActive) {
          lastActiveTime = Date.now();
          isActive = true;
        }
      }
    };

    const handleBeforeUnload = () => {
      if (isActive) {
        totalActiveTime += Date.now() - lastActiveTime;
      }

      internalAnalytics.trackEvent({
        eventName: 'time_on_page',
        category: 'engagement',
        value: totalActiveTime,
        customData: {
          totalTime: Date.now() - startTime,
          activeTime: totalActiveTime,
          page: window.location.pathname
        },
        timestamp: Date.now()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
};

// Utility functions
export const analyticsUtils = {
  // Format numbers for display
  formatNumber(num: number, decimals: number = 0): string {
    if (num === 0) return '0';
    if (num < 1000) return num.toFixed(decimals);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  },

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  },

  // Calculate time range dates
  getTimeRangeDates(range: AnalyticsTimeRange): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2021); // Hannisol launch year
        break;
    }

    return { start, end };
  },

  // Calculate growth percentage
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Generate chart colors (matching brand colors)
  getChartColors(): string[] {
    return [
      '#7c3aed', // Primary purple
      '#ffd700', // Hannisol gold
      '#00bcd4', // Teal accent
      '#ff6b35', // Orange accent
      '#10b981', // Success green
      '#f59e0b', // Warning yellow
      '#ef4444', // Error red
      '#6b7280'  // Gray
    ];
  }
};

// Initialize analytics on load
if (typeof window !== 'undefined') {
  // Initialize GA4
  ga4.init();

  // Track initial page load
  window.addEventListener('load', () => {
    performanceTracker.trackPageLoad();
  });

  // Set up behavior tracking
  document.addEventListener('DOMContentLoaded', () => {
    behaviorTracker.trackScrollDepth();
    behaviorTracker.trackTimeOnPage();
  });

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    internalAnalytics.flushEvents();
  });
}

// Export main analytics object
export const analytics = {
  ga4,
  internal: internalAnalytics,
  performance: performanceTracker,
  behavior: behaviorTracker,
  utils: analyticsUtils
};