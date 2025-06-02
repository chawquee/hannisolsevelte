// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				username: string;
				isAdmin: boolean;
			};
		}
		interface PageData {
			timestamp?: string;
			userIP?: string;
			userAgent?: string;
			searchPerformed?: boolean;
			searchResults?: any;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};