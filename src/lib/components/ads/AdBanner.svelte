<script>
	export let adType = 'banner'; // 'banner', 'square', 'leaderboard'
	export let adNetwork = 'generic';
	export let adContent = 'Advertisement';
	export let adUrl = '#';
	export let revenue = '$0.00';
	
	// Ad banner configurations
	const adConfigs = {
		banner: { width: '100%', height: '250px' },
		square: { width: '300px', height: '250px' },
		leaderboard: { width: '100%', height: '90px' },
		small: { width: '100%', height: '120px' }
	};

	$: adStyle = adConfigs[adType] || adConfigs.banner;

	function handleAdClick() {
		// Track ad click for analytics
		console.log('Ad clicked:', { adNetwork, adType });
		
		// In production, send to analytics API
		fetch('/api/analytics/ad-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				network: adNetwork,
				type: adType,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics tracking failed:', err));
	}
</script>

<div 
	class="ad-banner {adType}" 
	style="width: {adStyle.width}; height: {adStyle.height};"
>
	<a 
		href={adUrl} 
		class="ad-link" 
		target="_blank" 
		rel="noopener noreferrer"
		on:click={handleAdClick}
	>
		<div class="ad-content">
			<div class="ad-network">{adNetwork.toUpperCase()}</div>
			<div class="ad-text">{adContent}</div>
			<div class="ad-revenue">{revenue}</div>
		</div>
	</a>
	
	<div class="ad-label">Advertisement</div>
</div>

<style>
	.ad-banner {
		background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
		border: 2px dashed #d1d5db;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.ad-banner:hover {
		border-color: #a855f7;
		background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
	}

	.ad-banner.small {
		height: 120px;
	}

	.ad-banner.leaderboard {
		height: 90px;
	}

	.ad-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		text-decoration: none;
		color: inherit;
	}

	.ad-content {
		text-align: center;
	}

	.ad-network {
		font-size: 18px;
		margin-bottom: 8px;
		font-weight: bold;
	}

	.ad-text {
		font-size: 16px;
		margin-bottom: 4px;
	}

	.ad-revenue {
		font-size: 12px;
		opacity: 0.7;
	}

	.ad-label {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(107, 114, 128, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.ad-banner {
			height: 120px !important;
		}
		
		.ad-network {
			font-size: 16px;
		}
		
		.ad-text {
			font-size: 14px;
		}
	}

	/* Different ad network color schemes */
	.ad-banner[data-network="adsense"] {
		border-color: #4285f4;
	}

	.ad-banner[data-network="adsense"]:hover {
		border-color: #1a73e8;
		background: linear-gradient(135deg, #e8f0fe 0%, #f8fbff 100%);
	}

	.ad-banner[data-network="coinzilla"] {
		border-color: #ff6b35;
	}

	.ad-banner[data-network="coinzilla"]:hover {
		border-color: #e55a2b;
		background: linear-gradient(135deg, #fff4f1 0%, #fffaf9 100%);
	}

	.ad-banner[data-network="a-ads"] {
		border-color: #f7931a;
	}

	.ad-banner[data-network="a-ads"]:hover {
		border-color: #d1770e;
		background: linear-gradient(135deg, #fef9f1 0%, #fffcfa 100%);
	}
</style>