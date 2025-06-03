// src/app.d.ts
import { SupabaseClient, Session } from '@supabase/supabase-js'
import type { Database } from './lib/database.types'

declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
			code?: string;
			details?: any;
		}
		
		interface Locals {
			clientIP: string;
			userAgent: string;
			adminUser?: {
				email: string;
				role: string;
				id?: string;
			};
			session?: Session;
			supabase?: SupabaseClient<Database>;
		}
		
		interface PageData {
			user?: {
				ip: string;
				region?: {
					country: string;
					region: string;
					city?: string;
				};
				recentSearches: Array<{
					address: string;
					timestamp: string;
				}>;
			};
			
			auth: {
				isAdmin: boolean;
				adminUser?: {
					email: string;
					role: string;
				};
			};
			
			config: {
				maintenanceMode: boolean;
				cookieConsent: boolean;
				adConfig: {
					adsense: boolean;
					medianet: boolean;
					coinzilla: boolean;
					aads: boolean;
				};
				featureFlags: {
					enableSharing: boolean;
					enableRiskAnalysis: boolean;
					enableCommunityData: boolean;
					enableAdvancedAnalytics: boolean;
					enableBetaFeatures: boolean;
				};
			};
			
			stats: {
				searches24h: number;
				uniqueVisitors24h: number;
				totalSearches: number;
				uniqueAddresses: number;
				revenue30d: number;
			};
			
			ui: {
				announcement?: {
					message: string;
					type: 'info' | 'warning' | 'success' | 'error';
					expires_at?: string;
				};
				currentPath: string;
				seoData: {
					title: string;
					description: string;
					keywords: string;
					ogImage: string;
					canonicalUrl: string;
				};
			};
			
			performance?: {
				avg_response_time: number;
				error_count: number;
				total_requests: number;
			};
			
			brand: {
				name: string;
				slogan: string;
				logoUrl: string;
				colors: {
					primary: string;
					secondary: string;
					accent: string;
					success: string;
					warning: string;
					error: string;
				};
			};
			
			timestamp: string;
		}
		
		interface PageState {
			search?: {
				address: string;
				results?: SolanaAddressAnalysis;
			};
		}
		
		interface Platform {}
	}
}

// Solana Address Analysis Types
export interface SolanaAddressAnalysis {
	validation: {
		isValid: boolean;
		format: string;
		length: number;
		type: string;
	};
	
	balance: {
		sol: number;
		usd: number;
		tokens: number;
		nfts: number;
	};
	
	account: {
		owner: string;
		executable: boolean;
		lamports: number;
		dataSize: number;
		rentEpoch: number;
	};
	
	transactions: {
		total: number;
		firstActivity?: string;
		lastActivity?: string;
		recent: Array<{
			signature: string;
			slot: number;
			blockTime?: string;
			err: any;
		}>;
	};
	
	risk: {
		score: number;
		level: 'Low' | 'Medium' | 'High';
		factors: string[];
	};
	
	tokenAccounts: Array<{
		mint: string;
		amount: string;
		decimals: number;
		uiAmount: number;
	}>;
	
	communityData: {
		sentiment: string;
		mentions: number;
		trustScore: number;
	};
}

// Database Types
export interface SearchRecord {
	id: number;
	ip_address: string;
	address_searched: string;
	timestamp: string;
	country?: string;
	region?: string;
	city?: string;
	user_agent?: string;
	search_count: number;
	result_data?: string;
	risk_score?: number;
	is_flagged?: boolean;
	is_blocked?: boolean;
}

export interface RevenueRecord {
	id: number;
	source: string;
	amount_usd: number;
	original_amount: number;
	original_currency: string;
	type: 'ad_revenue' | 'affiliate_commission' | 'other';
	description?: string;
	timestamp: string;
	metadata?: string;
}

export interface SharedResult {
	id: number;
	share_id: string;
	address: string;
	result_data: string;
	view_count: number;
	is_public: boolean;
	allow_comments: boolean;
	is_active: boolean;
	password_protected: boolean;
	created_at: string;
	expires_at: string;
	creator_ip: string;
}

export interface AnalyticsData {
	traffic: {
		current: {
			totalVisits: number;
			uniqueVisitors: number;
			activeDays: number;
			avgPagesPerVisit: number;
			bounceRate: number;
		};
		growth: {
			visitsGrowth: number;
			visitorsGrowth: number;
		};
		timeline: Array<{
			period: string;
			visits: number;
			unique_visitors: number;
			unique_addresses: number;
		}>;
	};
	
	searches: {
		summary: {
			total_searches: number;
			unique_addresses: number;
			avg_address_length: number;
			error_searches: number;
		};
		popular: Array<{
			address_searched: string;
			search_count: number;
			unique_searchers: number;
			last_searched: string;
		}>;
		frequency: Array<{
			search_count: number;
			users: number;
		}>;
	};
	
	revenue: {
		breakdown: Array<{
			source: string;
			total_revenue: number;
			transactions: number;
			avg_transaction: number;
			type: string;
		}>;
		metrics: {
			totalRevenue: number;
			revenuePerVisitor: number;
			transactions: number;
		};
	};
	
	geographic: {
		detailed: Array<{
			country: string;
			region: string;
			visits: number;
			unique_visitors: number;
			searches: number;
			avg_searches_per_visitor: number;
		}>;
		countries: Array<{
			country: string;
			visits: number;
			unique_visitors: number;
			percentage: number;
		}>;
	};
	
	devices: {
		types: Array<{
			device_type: string;
			visits: number;
			unique_visitors: number;
			avg_searches: number;
		}>;
		browsers: Array<{
			browser: string;
			visits: number;
			unique_visitors: number;
		}>;
	};
	
	performance: {
		peakHours: Array<{
			hour: string;
			visits: number;
			unique_visitors: number;
			avg_searches: number;
		}>;
		dayOfWeek: Array<{
			day_of_week: string;
			day_name: string;
			visits: number;
			unique_visitors: number;
		}>;
		avgSessionDuration: number;
		multiPageSessions: number;
	};
}

// Form Action Results
export interface FormActionResult {
	success?: boolean;
	error?: string;
	type?: 'validation' | 'network' | 'server' | 'rate_limit';
	address?: string;
	data?: SolanaAddressAnalysis;
	timestamp?: string;
	shareId?: string;
	shareUrl?: string;
}

// Cookie Preferences
export interface CookiePreferences {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
	functional: boolean;
}

// Environment Variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production' | 'test';
			PUBLIC_SITE_URL: string;
			JWT_SECRET: string;
			ADMIN_EMAIL: string;
			ADMIN_PASSWORD_HASH: string;
			DATABASE_URL: string;
			SOLANA_RPC_URL: string;
			SOLANA_RPC_URL_BACKUP: string;
			GOOGLE_ANALYTICS_ID?: string;
			ADSENSE_CLIENT_ID?: string;
			ADSENSE_SLOT_ID?: string;
			MEDIA_NET_SITE_ID?: string;
			COINZILLA_ZONE_ID?: string;
			AADS_ZONE_ID?: string;
			IP_GEOLOCATION_API_KEY?: string;
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_USER?: string;
			SMTP_PASS?: string;
			SENTRY_DSN?: string;
			CLOUDFLARE_ZONE_ID?: string;
			CLOUDFLARE_API_TOKEN?: string;
		}
	}
}

// Window Extensions
declare global {
	interface Window {
		dataLayer: any[];
		gtag: (...args: any[]) => void;
		adsbygoogle: any[];
		fs: {
			readFile: (path: string, options?: { encoding?: string }) => Promise<any>;
		};
	}
}

// Utility Types
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
	[K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
	[K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// API Response Types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	timestamp: string;
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
		pages?: number;
	};
}

export interface ApiError {
	error: string;
	code?: string;
	details?: any;
	timestamp: string;
}

// Component Props Types
export interface BaseComponentProps {
	class?: string;
	style?: string;
	id?: string;
}

export interface ButtonProps extends BaseComponentProps {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	loading?: boolean;
	type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
	type?: string;
	placeholder?: string;
	value?: string;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	label?: string;
}

export interface CardProps extends BaseComponentProps {
	title?: string;
	subtitle?: string;
	actions?: boolean;
}

export {};