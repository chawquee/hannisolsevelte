import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Server configuration
	server: {
		port: 5173,
		host: true,
		fs: {
			allow: ['..']
		}
	},

	// Build configuration
	build: {
		target: 'es2020',
		sourcemap: true
	},

	// Optimizations
	optimizeDeps: {
		include: ['@solana/web3.js', '@solana/spl-token', 'better-sqlite3']
	},

	// Define global constants
	define: {
		global: 'globalThis'
	},

	// CSS configuration
	css: {
		postcss: './postcss.config.js'
	}
});