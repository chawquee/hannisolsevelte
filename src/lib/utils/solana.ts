import { Connection, PublicKey } from '@solana/web3.js';

// Solana connection
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL);

export interface SolanaAccountInfo {
	address: string;
	isValid: boolean;
	balance: number;
	tokenCount: number;
	nftCount: number;
	transactionCount: number;
}

// Validate Solana address format
export function validateSolanaAddress(address: string): boolean {
	try {
		new PublicKey(address);
		return true;
	} catch {
		return false;
	}
}

// Get basic account information
export async function getAccountInfo(address: string): Promise<SolanaAccountInfo> {
	try {
		const publicKey = new PublicKey(address);
		const accountInfo = await connection.getAccountInfo(publicKey);
		const balance = await connection.getBalance(publicKey);
		
		// Get transaction count (simplified)
		const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
		
		return {
			address,
			isValid: true,
			balance: balance / 1000000000, // Convert lamports to SOL
			tokenCount: 0, // Will implement later
			nftCount: 0, // Will implement later
			transactionCount: signatures.length
		};
	} catch (error) {
		console.error('Error fetching account info:', error);
		return {
			address,
			isValid: false,
			balance: 0,
			tokenCount: 0,
			nftCount: 0,
			transactionCount: 0
		};
	}
}

// Get recent transactions
export async function getRecentTransactions(address: string, limit: number = 10) {
	try {
		const publicKey = new PublicKey(address);
		const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
		
		return signatures.map(sig => ({
			signature: sig.signature,
			slot: sig.slot,
			err: sig.err,
			memo: sig.memo,
			blockTime: sig.blockTime
		}));
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return [];
	}
}