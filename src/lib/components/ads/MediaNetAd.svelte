<script>
	import { onMount } from 'svelte';
	
	export let cid = 'XXXXXXX';
	export let crid = 'XXXXXXX';
	export let adSize = 'medium'; // 'small', 'medium', 'large'
	export let responsive = true;
	
	let adContainer;
	let isLoaded = false;
	
	// Media.net ad size configurations
	const adSizes = {
		small: { width: '300px', height: '250px' },
		medium: { width: '728px', height: '90px' },
		large: { width: '970px', height: '250px' },
		mobile: { width: '320px', height: '50px' }
	};
	
	$: currentSize = adSizes[adSize] || adSizes.medium;
	
	onMount(() => {
		loadMediaNetScript();
	});
	
	function loadMediaNetScript() {
		// Check if Media.net script is already loaded
		if (window._mNHandle) {
			initializeAd();
			return;
		}
		
		// Load Media.net script
		const script = document.createElement('script');
		script.id = 'mNCC';
		script.language = 'javascript';
		script.async = true;
		script.src = `//contextual.media.net/nmedianet.js?cid=${cid}`;
		
		script.onload = () => {
			initializeAd();
		};
		
		script.onerror = () => {
			console.warn('Failed to load Media.net script');
			showFallbackAd();
		};
		
		document.head.appendChild(script);
	}
	
	function initializeAd() {
		try {
			if (window._mNHandle && adContainer) {
				// Create Media.net ad container
				const adDiv = document.createElement('div');
				adDiv.id = `media-net-${crid}`;
				adDiv.setAttribute('data-cid', cid);
				adDiv.setAttribute('data-crid', crid);
				
				adContainer.appendChild(adDiv);
				
				// Initialize Media.net ad
				window._mNHandle.queue = window._mNHandle.queue || [];
				window._mNHandle.queue.push(function () {
					window._mNDetails.loadTag(crid, cid);
				});
				
				isLoaded = true;
			}
		} catch (error) {
			console.warn('Media.net initialization failed:', error);
			showFallbackAd();
		}
	}
	
	function showFallbackAd() {
		isLoaded = false;
	}
	
	function handleAdClick() {
		// Track Media.net ad click
		console.log('Media.net ad clicked:', { cid, crid, adSize });
		
		// Analytics tracking
		fetch('/api/analytics/ad-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				network: 'media-net',
				cid,
				crid,
				size: adSize,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
</script>

<div class="medianet-container">
	{#if isLoaded}
		<div 
			bind:this={adContainer}
			class="medianet-ad"
			style="width: {currentSize.width}; height: {currentSize.height};"
		></div>
	{:else}
		<!-- Fallback placeholder -->
		<div 
			class="medianet-fallback"
			style="width: {currentSize.width}; height: {currentSize.height};"
			on:click={handleAdClick}
		>
			<div class="fallback-content">
				<div class="fallback-icon">🌐</div>
				<div class="fallback-title">Media.net</div>
				<div class="fallback-text">Yahoo/Bing Network</div>
				<div class="fallback-cpc">$0.30-$1.50 CPC</div>
				<div class="fallback-powered">Powered by Yahoo & Bing</div>
			</div>
			<div class="ad-badge">Contextual</div>
		</div>
	{/if}
</div>

<style>
	.medianet-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}

	.medianet-ad {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.medianet-fallback {
		background: linear-gradient(135deg, #f0f4ff 0%, #f8faff 100%);
		border: 2px dashed #4f46e5;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #3730a3;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		min-height: 120px;
	}

	.medianet-fallback:hover {
		background: linear-gradient(135deg, #eef2ff 0%, #f5f7ff 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
		border-color: #312e81;
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

	.fallback-cpc {
		font-size: 12px;
		opacity: 0.7;
		margin-bottom: 4px;
	}

	.fallback-powered {
		font-size: 10px;
		opacity: 0.6;
		font-style: italic;
	}

	.ad-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(55, 48, 163, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.medianet-fallback {
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
		.medianet-fallback {
			min-height: 80px;
		}
		
		.fallback-title {
			font-size: 14px;
		}
		
		.fallback-text {
			font-size: 12px;
		}
		
		.fallback-powered {
			display: none;
		}
	}
</style>