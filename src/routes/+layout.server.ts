import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	// Get user's IP address for analytics
	const clientIP = request.headers.get('x-forwarded-for') || 
	                request.headers.get('x-real-ip') || 
	                'unknown';

	// Basic server-side data that all pages need
	return {
		timestamp: new Date().toISOString(),
		userIP: clientIP,
		userAgent: request.headers.get('user-agent') || 'unknown'
	};
};