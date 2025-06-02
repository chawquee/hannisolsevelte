import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAccountInfo, getRecentTransactions } from '$lib/utils/solana';
import { validateAddress } from '$lib/utils/validation';
import { logSearch } from '$lib/database/queries';
import { getClientIP, getGeolocation } from '$lib/utils/geolocation';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { address } = await request.json();
		
		if (!address) {
			return json({ error: 'Address is required' }, { status: 400 });
		}

		// Get client information for logging
		const clientIP = getClientIP(request);
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const geoData = await getGeolocation(clientIP);

		// Validate address format
		const validation = validateAddress(address);
		
		if (!validation.isValid) {
			// Log failed search
			await logSearch({
				ip_address: clientIP,
				solana_address: address,
				user_agent: userAgent,
				country: geoData.country,
				region: geoData.region,
				is_valid: false,
				balance: 0,
				token_count: 0,
				transaction_count: 0
			});

			return json({ 
				success: false, 
				error: 'Invalid address format',
				validation 
			});
		}

		// Get comprehensive account data
		const [accountInfo, recentTransactions] = await Promise.all([
			getAccountInfo(address),
			getRecentTransactions(address, 10)
		]);

		// Calculate risk score (simplified)
		const riskScore = calculateRiskScore(accountInfo, recentTransactions);

		// Prepare response data
		const searchResults = {
			address,
			validation,
			accountInfo,
			recentTransactions,
			riskAnalysis: {
				score: riskScore,
				level: getRiskLevel(riskScore),
				factors: getRiskFactors(accountInfo, recentTransactions)
			},
			timestamp: new Date().toISOString()
		};

		// Log successful search
		await logSearch({
			ip_address: clientIP,
			solana_address: address,
			user_agent: userAgent,
			country: geoData.country,
			region: geoData.region,
			is_valid: true,
			balance: accountInfo.balance,
			token_count: accountInfo.tokenCount,
			transaction_count: accountInfo.transactionCount
		});

		return json({ 
			success: true, 
			data: searchResults 
		});

	} catch (error) {
		console.error('Search API error:', error);
		return json({ 
			error: 'Internal server error' 
		}, { status: 500 });
	}
};

// Risk calculation functions
function calculateRiskScore(accountInfo: any, transactions: any[]): number {
	let score = 50; // Base score

	// Balance factor
	if (accountInfo.balance > 10) score += 10;
	if (accountInfo.balance > 100) score += 10;

	// Transaction history factor
	if (transactions.length > 50) score += 10;
	if (transactions.length > 200) score += 10;

	// Account age factor (if available)
	// Add more sophisticated scoring logic here

	return Math.min(100, Math.max(0, score));
}

function getRiskLevel(score: number): string {
	if (score >= 80) return 'Low';
	if (score >= 60) return 'Medium';
	if (score >= 40) return 'High';
	return 'Very High';
}

function getRiskFactors(accountInfo: any, transactions: any[]): string[] {
	const factors = [];
	
	if (accountInfo.balance < 1) factors.push('Low balance');
	if (transactions.length < 10) factors.push('Limited transaction history');
	if (accountInfo.tokenCount === 0) factors.push('No token holdings');
	
	return factors;
}