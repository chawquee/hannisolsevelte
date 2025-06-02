<div class="sidebar">
	<div class="ad-banner">
		<div>
			<div class="ad-title">🎯 A-ADS</div>
			<div>Crypto Ad Network</div>
			<div class="ad-cpm">$0.50-$2.00 CPM</div>
		</div>
	</div>
	
	<div class="ad-banner">
		<div>
			<div class="ad-title">💰 Coinzilla</div>
			<div>Premium Crypto Ads</div>
			<div class="ad-cpm">$1-$5 CPM</div>
		</div>
	</div>
	
	<div class="ad-banner">
		<div>
			<div class="ad-title">📱 Google AdSense</div>
			<div>Main Revenue Stream</div>
			<div class="ad-cpm">$0.20-$2.00 CPC</div>
		</div>
	</div>
	
	<div class="ad-banner small">
		<div>
			<div class="ad-title-small">🌐 Media.net</div>
			<div class="ad-description">Yahoo/Bing Network</div>
		</div>
	</div>
	
	<div class="ad-banner small">
		<div>
			<div class="ad-title-small">🛒 Amazon Associates</div>
			<div class="ad-description">Security Hardware</div>
		</div>
	</div>
	
	<div class="ad-banner small">
		<div>
			<div class="ad-title-small">🔐 Ledger Affiliate</div>
			<div class="ad-description">$20-$28 per sale</div>
		</div>
	</div>
	
	<div class="ad-banner small">
		<div>
			<div class="ad-title-small">🛡️ VPN Services</div>
			<div class="ad-description">$30-$100 signup</div>
		</div>
	</div>
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.ad-banner {
		background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
		border: 2px dashed #d1d5db;
		border-radius: 12px;
		height: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
	}

	.ad-banner:hover {
		border-color: #a855f7;
		background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
	}

	.ad-banner.small {
		height: 120px;
	}

	.ad-title {
		font-size: 18px;
		margin-bottom: 8px;
	}

	.ad-title-small {
		font-size: 16px;
		margin-bottom: 4px;
	}

	.ad-description {
		font-size: 14px;
	}

	.ad-cpm {
		font-size: 12px;
		opacity: 0.7;
	}

	@media (max-width: 1024px) {
		.sidebar {
			order: -1;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 16px;
		}
		
		.ad-banner {
			height: 120px;
		}
	}

	@media (max-width: 768px) {
		.sidebar {
			grid-template-columns: 1fr;
		}
	}
</style>