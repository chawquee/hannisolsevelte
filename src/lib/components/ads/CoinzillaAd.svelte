<script>
	import { onMount } from 'svelte';
	
	export let zoneId = 'C-123456789';
	export let adSize = 'banner'; // 'banner', 'square', 'leaderboard'
	export let customStyle = '';
	
	let adContainer;
	let isLoaded = false;
	
	// Coinzilla ad configurations
	const adSizes = {
		banner: { width: '728px', height: '90px' },
		square: { width: '300px', height: '250px' },
		leaderboard: { width: '970px', height: '250px' },
		mobile: { width: '320px', height: '50px' }
	};
	
	$: currentSize = adSizes[adSize] || adSizes.banner;
	
	onMount(() => {
		loadCoinzillaScript();
	});
	
	function loadCoinzillaScript() {
		// Check if Coinzilla script is already loaded
		if (window.coinzilla_display) {
			initializeAd();
			return;
		}
		
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://coinzillatag.com/lib/display.js';
		
		script.onload = () => {
			initializeAd();
		};
		
		script.onerror = () => {
			console.warn('Failed to load Coinzilla script');
			showFallbackAd();
		};
		
		document.head.appendChild(script);
	}
	
	function initializeAd() {
		try {
			if (window.coinzilla_display && adContainer) {
				window.coinzilla_display.push({
					c_id: zoneId,
					c_width: parseInt(currentSize.width),
					c_height: parseInt(currentSize.height)
				});
				isLoaded = true;
			}
		} catch (error) {
			console.warn('Coinzilla initialization failed:', error);
			showFallbackAd();
		}
	}
	
	function showFallbackAd() {
		isLoaded = false;
	}
	
	function handleAdClick() {
		// Track Coinzilla ad click
		console.log('Coinzilla ad clicked:', { zoneId, adSize });
		
		// Analytics tracking
		fetch('/api/analytics/ad-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				network: 'coinzilla',
				zoneId,
				size: adSize,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
</script>

<div class="coinzilla-container" style={customStyle}>
	{#if isLoaded}
		<div 
			bind:this={adContainer}
			class="coinzilla-ad"
			data-zone={zoneId}
			style="width: {currentSize.width}; height: {currentSize.height};"
		></div>
	{:else}
		<!-- Fallback placeholder -->
		<div 
			class="coinzilla-fallback"
			style="width: {currentSize.width}; height: {currentSize.height};"
			on:click={handleAdClick}
		>
			<div class="fallback-content">
				<div class="fallback-icon">💰</div>
				<div class="fallback-title">Coinzilla</div>
				<div class="fallback-text">Premium Crypto Ads</div>
				<div class="fallback-cpm">$1-$5 CPM</div>
			</div>
			<div class="ad-badge">Sponsored</div>
		</div>
	{/if}
</div>

<style>
	.coinzilla-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}

	.coinzilla-ad {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.coinzilla-fallback {
		background: linear-gradient(135deg, #fff4f1 0%, #fffaf9 100%);
		border: 2px dashed #ff6b35;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #e55a2b;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		min-height: 120px;
	}

	.coinzilla-fallback:hover {
		background: linear-gradient(135deg, #fff0ed 0%, #fff8f7 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
		border-color: #d1470a;
	}

	.fallback-content {
		text-align: center;
	}

	.fallback-icon {
		font-size: 24px;
		margin-bottom: 8px;
	}

	.fallback-title {
		font-size: 18px;
		margin-bottom: 8px;
		font-weight: bold;
	}

	.fallback-text {
		font-size: 16px;
		margin-bottom: 4px;
	}

	.fallback-cpm {
		font-size: 12px;
		opacity: 0.7;
	}

	.ad-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(229, 90, 43, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.coinzilla-fallback {
			min-height: 100px;
		}
		
		.fallback-icon {
			font-size: 20px;
		}
		
		.fallback-title {
			font-size: 16px;
		}
		
		.fallback-text {
			font-size: 14px;
		}
	}

	@media (max-width: 480px) {
		.coinzilla-fallback {
			min-height: 80px;
		}
		
		.fallback-title {
			font-size: 14px;
		}
		
		.fallback-text {
			font-size: 12px;
		}
	}
</style>