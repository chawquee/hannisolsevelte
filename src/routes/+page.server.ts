import type { PageServerLoad, Actions } from './$types';
import { validateSolanaAddress, getAccountInfo } from '$lib/utils/solana';
import { validateAddress } from '$lib/utils/validation';

export const load: PageServerLoad = async () => {
	// Initial page load data
	return {
		searchPerformed: false,
		searchResults: null
	};
};

export const actions: Actions = {
	checkAddress: async ({ request }) => {
		const data = await request.formData();
		const address = data.get('address') as string;

		if (!address) {
			return {
				success: false,
				error: 'Address is required'
			};
		}

		// Validate address format
		const validation = validateAddress(address);
		
		if (!validation.isValid) {
			return {
				success: false,
				error: 'Invalid Solana address format',
				validation
			};
		}

		try {
			// Get account information from Solana
			const accountInfo = await getAccountInfo(address);
			
			// Log search (will implement database logging later)
			console.log('Address search:', {
				address,
				isValid: accountInfo.isValid,
				balance: accountInfo.balance
			});

			return {
				success: true,
				searchResults: {
					address,
					validation,
					accountInfo,
					timestamp: new Date().toISOString()
				}
			};

		} catch (error) {
			console.error('Address check error:', error);
			return {
				success: false,
				error: 'Failed to fetch address information'
			};
		}
	}
};