<script>
	import { onMount } from 'svelte';
	
	export let adUnitId = 'a-ads-123456';
	export let adSize = 'banner';
	export let backgroundColor = '#f3f4f6';
	export let textColor = '#374151';
	
	let adContainer;
	let isLoaded = false;
	
	// A-ADS configurations
	const adConfigs = {
		banner: { width: '728px', height: '90px' },
		square: { width: '300px', height: '250px' },
		skyscraper: { width: '120px', height: '600px' },
		mobile: { width: '320px', height: '50px' }
	};
	
	$: currentConfig = adConfigs[adSize] || adConfigs.banner;
	
	onMount(() => {
		loadAadsScript();
	});
	
	function loadAadsScript() {
		// A-ADS uses iframe-based ads, no external script needed
		// Just initialize the ad directly
		initializeAad();
	}
	
	function initializeAad() {
		try {
			// A-ADS typically uses iframe embedding
			if (adContainer) {
				createAadsIframe();
				isLoaded = true;
			}
		} catch (error) {
			console.warn('A-ADS initialization failed:', error);
			showFallbackAd();
		}
	}
	
	function createAadsIframe() {
		const iframe = document.createElement('iframe');
		iframe.src = `https://a-ads.com/${adUnitId}?size=${adSize}`;
		iframe.width = parseInt(currentConfig.width);
		iframe.height = parseInt(currentConfig.height);
		iframe.frameBorder = '0';
		iframe.scrolling = 'no';
		iframe.style.border = 'none';
		
		// Clear container and add iframe
		adContainer.innerHTML = '';
		adContainer.appendChild(iframe);
	}
	
	function showFallbackAd() {
		isLoaded = false;
	}
	
	function handleAdClick() {
		// Track A-ADS click
		console.log('A-ADS ad clicked:', { adUnitId, adSize });
		
		// Analytics tracking
		fetch('/api/analytics/ad-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				network: 'a-ads',
				unitId: adUnitId,
				size: adSize,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
</script>

<div class="aads-container">
	{#if isLoaded}
		<div 
			bind:this={adContainer}
			class="aads-ad"
			style="width: {currentConfig.width}; height: {currentConfig.height};"
		></div>
	{:else}
		<!-- Fallback placeholder -->
		<div 
			class="aads-fallback"
			style="width: {currentConfig.width}; height: {currentConfig.height}; background-color: {backgroundColor}; color: {textColor};"
			on:click={handleAdClick}
		>
			<div class="fallback-content">
				<div class="fallback-icon">🎯</div>
				<div class="fallback-title">A-ADS</div>
				<div class="fallback-text">Crypto Ad Network</div>
				<div class="fallback-cpm">$0.50-$2.00 CPM</div>
				<div class="fallback-bitcoin">⚡ Instant Bitcoin Payments</div>
			</div>
			<div class="ad-badge">Bitcoin Ads</div>
		</div>
	{/if}
</div>

<style>
	.aads-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}

	.aads-ad {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.aads-fallback {
		background: linear-gradient(135deg, #fef9f1 0%, #fffcfa 100%);
		border: 2px dashed #f7931a;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #d1770e;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		min-height: 120px;
	}

	.aads-fallback:hover {
		background: linear-gradient(135deg, #fef8f0 0%, #fffaf6 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(247, 147, 26, 0.2);
		border-color: #b8650e;
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
		margin-bottom: 4px;
	}

	.fallback-bitcoin {
		font-size: 11px;
		opacity: 0.8;
		font-style: italic;
	}

	.ad-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(209, 119, 14, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.aads-fallback {
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
		.aads-fallback {
			min-height: 80px;
		}
		
		.fallback-title {
			font-size: 14px;
		}
		
		.fallback-text {
			font-size: 12px;
		}
		
		.fallback-bitcoin {
			display: none;
		}
	}
</style>