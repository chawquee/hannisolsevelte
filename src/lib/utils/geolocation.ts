// IP Geolocation utilities

export interface GeolocationData {
	ip: string;
	country: string;
	region: string;
	city: string;
	latitude: number;
	longitude: number;
	timezone: string;
	isp: string;
}

// Extract client IP from request
export function getClientIP(request: Request): string {
	// Check various headers for real IP
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIP = request.headers.get('x-real-ip');
	const cfConnectingIP = request.headers.get('cf-connecting-ip');
	
	if (forwardedFor) {
		// X-Forwarded-For can contain multiple IPs, take the first one
		return forwardedFor.split(',')[0].trim();
	}
	
	if (realIP) {
		return realIP;
	}
	
	if (cfConnectingIP) {
		return cfConnectingIP;
	}
	
	// Fallback for development
	return 'unknown';
}

// Get geolocation data from IP (using free services)
export async function getGeolocation(ip: string): Promise<Partial<GeolocationData>> {
	// Skip geolocation for local/unknown IPs
	if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
		return {
			ip,
			country: 'Unknown',
			region: 'Unknown',
			city: 'Unknown',
			latitude: 0,
			longitude: 0,
			timezone: 'UTC',
			isp: 'Unknown'
		};
	}

	try {
		// Using ip-api.com (free service with 45 requests/minute limit)
		const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon,timezone,isp`);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.status === 'fail') {
			console.warn('Geolocation API error:', data.message);
			return getFallbackGeolocation(ip);
		}

		return {
			ip,
			country: data.country || 'Unknown',
			region: data.regionName || 'Unknown',
			city: data.city || 'Unknown',
			latitude: data.lat || 0,
			longitude: data.lon || 0,
			timezone: data.timezone || 'UTC',
			isp: data.isp || 'Unknown'
		};

	} catch (error) {
		console.warn('Geolocation lookup failed:', error);
		return getFallbackGeolocation(ip);
	}
}

// Fallback geolocation data
function getFallbackGeolocation(ip: string): Partial<GeolocationData> {
	return {
		ip,
		country: 'Unknown',
		region: 'Unknown',
		city: 'Unknown',
		latitude: 0,
		longitude: 0,
		timezone: 'UTC',
		isp: 'Unknown'
	};
}

// Alternative geolocation service (backup)
export async function getGeolocationAlternative(ip: string): Promise<Partial<GeolocationData>> {
	try {
		// Using ipify.org + ipapi.co as backup
		const response = await fetch(`https://ipapi.co/${ip}/json/`);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.error) {
			console.warn('Alternative geolocation error:', data.reason);
			return getFallbackGeolocation(ip);
		}

		return {
			ip,
			country: data.country_name || 'Unknown',
			region: data.region || 'Unknown',
			city: data.city || 'Unknown',
			latitude: parseFloat(data.latitude) || 0,
			longitude: parseFloat(data.longitude) || 0,
			timezone: data.timezone || 'UTC',
			isp: data.org || 'Unknown'
		};

	} catch (error) {
		console.warn('Alternative geolocation failed:', error);
		return getFallbackGeolocation(ip);
	}
}

// Get country code from IP (lightweight)
export async function getCountryCode(ip: string): Promise<string> {
	try {
		const response = await fetch(`https://ipapi.co/${ip}/country/`);
		
		if (response.ok) {
			const countryCode = await response.text();
			return countryCode.trim().toUpperCase();
		}
		
		return 'XX';
	} catch (error) {
		console.warn('Country code lookup failed:', error);
		return 'XX';
	}
}

// Check if IP is from a known VPN/proxy service
export function isVPNIP(geoData: Partial<GeolocationData>): boolean {
	if (!geoData.isp) return false;
	
	const vpnIndicators = [
		'vpn', 'proxy', 'tor', 'hosting', 'datacenter', 
		'cloud', 'server', 'virtual', 'dedicated'
	];
	
	const isp = geoData.isp.toLowerCase();
	return vpnIndicators.some(indicator => isp.includes(indicator));
}

// Validate IP address format
export function isValidIP(ip: string): boolean {
	// IPv4 regex
	const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	
	// IPv6 regex (simplified)
	const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
	
	return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Get timezone from coordinates
export function getTimezoneFromCoords(latitude: number, longitude: number): string {
	// This is a simplified timezone detection
	// In production, you might want to use a proper timezone API
	
	const timezones = [
		{ name: 'America/New_York', lat: 40.7128, lng: -74.0060 },
		{ name: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437 },
		{ name: 'Europe/London', lat: 51.5074, lng: -0.1278 },
		{ name: 'Europe/Paris', lat: 48.8566, lng: 2.3522 },
		{ name: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503 },
		{ name: 'Asia/Shanghai', lat: 31.2304, lng: 121.4737 },
		{ name: 'Australia/Sydney', lat: -33.8688, lng: 151.2093 }
	];
	
	let closestTimezone = 'UTC';
	let minDistance = Infinity;
	
	for (const tz of timezones) {
		const distance = Math.sqrt(
			Math.pow(latitude - tz.lat, 2) + Math.pow(longitude - tz.lng, 2)
		);
		
		if (distance < minDistance) {
			minDistance = distance;
			closestTimezone = tz.name;
		}
	}
	
	return closestTimezone;
}

// Rate limiting for geolocation requests
const geoCache = new Map<string, { data: Partial<GeolocationData>; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getCachedGeolocation(ip: string): Promise<Partial<GeolocationData>> {
	// Check cache first
	const cached = geoCache.get(ip);
	const now = Date.now();
	
	if (cached && (now - cached.timestamp) < CACHE_DURATION) {
		return cached.data;
	}
	
	// Get fresh data
	const geoData = await getGeolocation(ip);
	
	// Cache the result
	geoCache.set(ip, { data: geoData, timestamp: now });
	
	// Clean old cache entries periodically
	if (geoCache.size > 1000) {
		cleanGeoCache();
	}
	
	return geoData;
}

// Clean expired cache entries
function cleanGeoCache(): void {
	const now = Date.now();
	
	for (const [ip, entry] of geoCache.entries()) {
		if ((now - entry.timestamp) > CACHE_DURATION) {
			geoCache.delete(ip);
		}
	}
}

// Get user's approximate location for analytics
export async function getVisitorLocation(request: Request): Promise<{
	ip: string;
	country: string;
	region: string;
	timezone: string;
}> {
	const ip = getClientIP(request);
	const geoData = await getCachedGeolocation(ip);
	
	return {
		ip,
		country: geoData.country || 'Unknown',
		region: geoData.region || 'Unknown',
		timezone: geoData.timezone || 'UTC'
	};
}