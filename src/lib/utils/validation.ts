// Address validation utilities
export interface ValidationResult {
	isValid: boolean;
	format: string;
	length: number;
	type: string;
	errors: string[];
}

export function validateAddress(address: string): ValidationResult {
	const errors: string[] = [];
	
	// Check if address is provided
	if (!address || address.trim() === '') {
		errors.push('Address is required');
		return {
			isValid: false,
			format: 'Unknown',
			length: 0,
			type: 'Unknown',
			errors
		};
	}

	// Check length (Solana addresses are typically 44 characters)
	if (address.length !== 44) {
		errors.push('Invalid address length');
	}

	// Check format (Base58)
	const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
	if (!base58Regex.test(address)) {
		errors.push('Invalid Base58 format');
	}

	// Additional validation logic can be added here
	const isValid = errors.length === 0;

	return {
		isValid,
		format: 'Base58',
		length: address.length,
		type: isValid ? 'Solana Account' : 'Invalid',
		errors
	};
}

// IP validation for logging
export function validateIP(ip: string): boolean {
	const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipRegex.test(ip);
}

// Basic rate limiting check
export function checkRateLimit(ip: string, maxRequests: number = 10, timeWindow: number = 60000): boolean {
	// Simple in-memory rate limiting (in production, use Redis or database)
	const now = Date.now();
	// This is a simplified version - implement proper rate limiting in production
	return true;
}