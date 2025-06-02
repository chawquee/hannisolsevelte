import { browser } from '$app/environment';

// Geographic data interfaces
export interface GeolocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
  organization?: string;
  accuracy: 'high' | 'medium' | 'low';
  source: 'browser' | 'ip-api' | 'ipgeolocation' | 'cached';
}

export interface IPApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export interface BrowserGeolocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

// Geolocation configuration
const GEOLOCATION_CONFIG = {
  IP_API_URL: 'http://ip-api.com/json',
  IPGEOLOCATION_API_KEY: process.env.IPGEOLOCATION_API_KEY || '',
  IPGEOLOCATION_URL: 'https://api.ipgeolocation.io/ipgeo',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  BROWSER_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  DEBUG: false
};

// Cache for geolocation data
const geoCache = new Map<string, { data: GeolocationData; timestamp: number }>();

// Browser geolocation utilities
export const browserGeolocation = {
  // Check if geolocation is supported
  isSupported(): boolean {
    return browser && 'geolocation' in navigator;
  },

  // Get current position from browser
  async getCurrentPosition(options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  } = {}): Promise<BrowserGeolocation> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported');
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_CONFIG.BROWSER_TIMEOUT,
      maximumAge: 300000 // 5 minutes
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          });
        },
        (error) => {
          let errorMessage = 'Geolocation failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Geolocation permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Geolocation position unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Geolocation timeout';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        { ...defaultOptions, ...options }
      );
    });
  },

  // Watch position changes
  watchPosition(
    callback: (position: BrowserGeolocation) => void,
    errorCallback?: (error: Error) => void,
    options: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    } = {}
  ): number | null {
    if (!this.isSupported()) {
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_CONFIG.BROWSER_TIMEOUT,
      maximumAge: 60000 // 1 minute
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        });
      },
      (error) => {
        if (errorCallback) {
          errorCallback(new Error(error.message));
        }
      },
      { ...defaultOptions, ...options }
    );
  },

  // Clear watch
  clearWatch(watchId: number) {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
};

// IP-based geolocation utilities
export const ipGeolocation = {
  // Get geolocation from IP using ip-api.com (free)
  async getFromIPApi(ip?: string): Promise<GeolocationData> {
    const url = ip ? `${GEOLOCATION_CONFIG.IP_API_URL}/${ip}` : GEOLOCATION_CONFIG.IP_API_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`IP-API request failed: ${response.statusText}`);
    }

    const data: IPApiResponse = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('IP-API returned error status');
    }

    return {
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      regionCode: data.region,
      city: data.city,
      zipCode: data.zip || undefined,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      organization: data.org,
      accuracy: 'medium',
      source: 'ip-api'
    };
  },

  // Get geolocation from ipgeolocation.io (paid API with higher accuracy)
  async getFromIPGeolocation(ip?: string): Promise<GeolocationData> {
    if (!GEOLOCATION_CONFIG.IPGEOLOCATION_API_KEY) {
      throw new Error('IPGeolocation API key not configured');
    }

    const params = new URLSearchParams({
      apiKey: GEOLOCATION_CONFIG.IPGEOLOCATION_API_KEY,
      fields: 'geo,time_zone,isp'
    });

    if (ip) {
      params.append('ip', ip);
    }

    const response = await fetch(`${GEOLOCATION_CONFIG.IPGEOLOCATION_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`IPGeolocation request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      ip: data.ip,
      country: data.country_name,
      countryCode: data.country_code2,
      region: data.state_prov,
      regionCode: data.state_code,
      city: data.city,
      zipCode: data.zipcode || undefined,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timezone: data.time_zone?.name || '',
      isp: data.isp,
      organization: data.organization,
      accuracy: 'high',
      source: 'ipgeolocation'
    };
  },

  // Get geolocation with fallback providers
  async getWithFallback(ip?: string): Promise<GeolocationData> {
    const providers = [
      () => this.getFromIPGeolocation(ip),
      () => this.getFromIPApi(ip)
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        const result = await provider();
        if (GEOLOCATION_CONFIG.DEBUG) {
          console.log('Geolocation success:', result.source);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (GEOLOCATION_CONFIG.DEBUG) {
          console.warn('Geolocation provider failed:', lastError.message);
        }
      }
    }

    throw lastError || new Error('All geolocation providers failed');
  }
};

// Main geolocation service
export const geolocationService = {
  // Get comprehensive geolocation data
  async getGeolocation(options: {
    ip?: string;
    useBrowser?: boolean;
    useCache?: boolean;
    accuracy?: 'high' | 'medium' | 'low';
  } = {}): Promise<GeolocationData> {
    const { ip, useBrowser = false, useCache = true, accuracy = 'medium' } = options;
    
    // Generate cache key
    const cacheKey = ip || 'current_ip';
    
    // Check cache first
    if (useCache && geoCache.has(cacheKey)) {
      const cached = geoCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < GEOLOCATION_CONFIG.CACHE_DURATION) {
        return { ...cached.data, source: 'cached' };
      }
    }

    let geolocationData: GeolocationData;

    try {
      // Try browser geolocation first if requested and no IP specified
      if (useBrowser && !ip && browserGeolocation.isSupported()) {
        try {
          const browserPos = await browserGeolocation.getCurrentPosition({
            enableHighAccuracy: accuracy === 'high'
          });

          // Reverse geocode to get address info
          const addressData = await this.reverseGeocode(
            browserPos.latitude,
            browserPos.longitude
          );

          geolocationData = {
            ...addressData,
            latitude: browserPos.latitude,
            longitude: browserPos.longitude,
            accuracy: browserPos.accuracy < 100 ? 'high' : 'medium',
            source: 'browser'
          };
        } catch (browserError) {
          if (GEOLOCATION_CONFIG.DEBUG) {
            console.warn('Browser geolocation failed:', browserError);
          }
          // Fall back to IP geolocation
          geolocationData = await ipGeolocation.getWithFallback(ip);
        }
      } else {
        // Use IP geolocation
        geolocationData = await ipGeolocation.getWithFallback(ip);
      }

      // Cache the result
      if (useCache) {
        geoCache.set(cacheKey, {
          data: geolocationData,
          timestamp: Date.now()
        });
      }

      return geolocationData;
    } catch (error) {
      console.error('Geolocation failed:', error);
      
      // Return fallback data
      return {
        ip: ip || 'unknown',
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        regionCode: 'XX',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        accuracy: 'low',
        source: 'cached'
      };
    }
  },

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<Partial<GeolocationData>> {
    try {
      // Use a free reverse geocoding service (nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Hannisol-Solana-Checker'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        ip: 'browser',
        country: address.country || 'Unknown',
        countryCode: address.country_code?.toUpperCase() || 'XX',
        region: address.state || address.region || 'Unknown',
        regionCode: address.state_code || 'XX',
        city: address.city || address.town || address.village || 'Unknown',
        zipCode: address.postcode,
        timezone: await this.getTimezoneFromCoords(latitude, longitude)
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        ip: 'browser',
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        regionCode: 'XX',
        city: 'Unknown',
        timezone: 'UTC'
      };
    }
  },

  // Get timezone from coordinates
  async getTimezoneFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      // Use browser's Intl API if available
      if (browser && Intl.DateTimeFormat) {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      // Fallback to a timezone API
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=position&lat=${latitude}&lng=${longitude}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.zoneName || 'UTC';
      }
    } catch (error) {
      console.error('Timezone lookup failed:', error);
    }

    return 'UTC';
  },

  // Calculate distance between two points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Convert degrees to radians
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Get country flag emoji
  getCountryFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  },

  // Get country name from code
  getCountryName(countryCode: string): string {
    const countries: Record<string, string> = {
      'US': 'United States',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'AU': 'Australia',
      'NZ': 'New Zealand',
      'JP': 'Japan',
      'KR': 'South Korea',
      'CN': 'China',
      'IN': 'India',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'VE': 'Venezuela',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'EG': 'Egypt',
      'MA': 'Morocco',
      'KE': 'Kenya',
      'GH': 'Ghana',
      'TR': 'Turkey',
      'RU': 'Russia',
      'UA': 'Ukraine',
      'PL': 'Poland',
      'RO': 'Romania',
      'GR': 'Greece',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'AT': 'Austria',
      'CH': 'Switzerland',
      'BE': 'Belgium',
      'LU': 'Luxembourg',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'IS': 'Iceland',
      'MT': 'Malta',
      'CY': 'Cyprus'
    };

    return countries[countryCode.toUpperCase()] || countryCode;
  },

  // Clear geolocation cache
  clearCache() {
    geoCache.clear();
  },

  // Get cache statistics
  getCacheStats() {
    return {
      size: geoCache.size,
      entries: Array.from(geoCache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        country: value.data.country
      }))
    };
  }
};

// Export main geolocation object
export const geolocation = {
  browser: browserGeolocation,
  ip: ipGeolocation,
  service: geolocationService
};