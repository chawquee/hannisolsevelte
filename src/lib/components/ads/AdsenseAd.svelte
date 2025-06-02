<script>
	import { onMount } from 'svelte';
	
	export let adSlot = '1234567890';
	export let adFormat = 'auto';
	export let adSize = { width: 320, height: 50 };
	export let responsive = true;
	
	let adContainer;
	let isAdLoaded = false;
	
	onMount(() => {
		// Load Google AdSense script if not already loaded
		if (!window.adsbygoogle) {
			loadAdSenseScript();
		} else {
			initializeAd();
		}
	});
	
	function loadAdSenseScript() {
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
		script.crossOrigin = 'anonymous';
		
		script.onload = () => {
			initializeAd();
		};
		
		script.onerror = () => {
			console.warn('Failed to load AdSense script');
			showFallbackAd();
		};
		
		document.head.appendChild(script);
	}
	
	function initializeAd() {
		try {
			if (window.adsbygoogle && adContainer) {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
				isAdLoaded = true;
			}
		} catch (error) {
			console.warn('AdSense initialization failed:', error);
			showFallbackAd();
		}
	}
	
	function showFallbackAd() {
		// Show placeholder ad when AdSense fails to load
		isAdLoaded = false;
	}
</script>

<div class="adsense-container">
	{#if isAdLoaded}
		<ins 
			bind:this={adContainer}
			class="adsbygoogle"
			style="display:block"
			data-ad-client="ca-pub-XXXXXXXXXX"
			data-ad-slot={adSlot}
			data-ad-format={adFormat}
			data-full-width-responsive={responsive}
		></ins>
	{:else}
		<!-- Fallback placeholder ad -->
		<div class="fallback-ad" style="width: {adSize.width}px; height: {adSize.height}px;">
			<div class="fallback-content">
				<div class="fallback-title">📱 Google AdSense</div>
				<div class="fallback-text">Main Revenue Stream</div>
				<div class="fallback-cpc">$0.20-$2.00 CPC</div>
			</div>
			<div class="ad-badge">Ad</div>
		</div>
	{/if}
</div>

<style>
	.adsense-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}

	.adsbygoogle {
		display: block;
		text-align: center;
	}

	.fallback-ad {
		background: linear-gradient(135deg, #e8f0fe 0%, #f8fbff 100%);
		border: 2px dashed #4285f4;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #1a73e8;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		min-height: 120px;
	}

	.fallback-ad:hover {
		background: linear-gradient(135deg, #e3f2fd 0%, #f3f9ff 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
	}

	.fallback-content {
		text-align: center;
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

	.fallback-cpc {
		font-size: 12px;
		opacity: 0.7;
	}

	.ad-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(26, 115, 232, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.fallback-ad {
			min-height: 100px;
		}
		
		.fallback-title {
			font-size: 16px;
		}
		
		.fallback-text {
			font-size: 14px;
		}
	}

	@media (max-width: 480px) {
		.fallback-ad {
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