<script>
	export let affiliateId = 'HANNISOL-VPN';
	export let vpnProvider = 'expressvpn'; // 'expressvpn', 'nordvpn', 'surfshark'
	export let displayFormat = 'banner'; // 'banner', 'card', 'compact'
	
	// VPN provider configurations
	const vpnProviders = {
		expressvpn: {
			name: 'ExpressVPN',
			tagline: 'Ultra-fast, secure VPN',
			price: '$6.67/mo',
			commission: '$40-100',
			features: ['94 countries', 'No logs', '24/7 support', '30-day guarantee'],
			logo: '🛡️',
			color: '#da020e',
			bgColor: '#fef2f2'
		},
		nordvpn: {
			name: 'NordVPN',
			tagline: 'Advanced VPN security',
			price: '$3.71/mo',
			commission: '$30-80',
			features: ['59 countries', 'Double VPN', 'Threat protection', '30-day refund'],
			logo: '🔒',
			color: '#4687ff',
			bgColor: '#eff6ff'
		},
		surfshark: {
			name: 'Surfshark',
			tagline: 'Unlimited device VPN',
			price: '$2.30/mo',
			commission: '$35-75',
			features: ['100+ countries', 'Unlimited devices', 'CleanWeb', '30-day guarantee'],
			logo: '🦈',
			color: '#ff6b35',
			bgColor: '#fff7ed'
		}
	};
	
	$: provider = vpnProviders[vpnProvider] || vpnProviders.expressvpn;
	$: affiliateUrl = generateAffiliateUrl(vpnProvider);
	
	function generateAffiliateUrl(provider) {
		const baseUrls = {
			expressvpn: `https://www.expressvpn.com/order?a_fid=${affiliateId}`,
			nordvpn: `https://nordvpn.com/?aff=${affiliateId}`,
			surfshark: `https://surfshark.com/?aff=${affiliateId}`
		};
		
		return baseUrls[provider] || baseUrls.expressvpn;
	}
	
	function trackVPNClick() {
		console.log('VPN affiliate clicked:', { provider: vpnProvider, affiliateId });
		
		// Analytics tracking
		fetch('/api/analytics/affiliate-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				program: 'vpn',
				provider: vpnProvider,
				affiliateId,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
</script>

<div class="vpn-affiliate {displayFormat}" style="--provider-color: {provider.color}; --provider-bg: {provider.bgColor};">
	{#if displayFormat === 'banner'}
		<a 
			href={affiliateUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="vpn-banner"
			on:click={trackVPNClick}
		>
			<div class="banner-content">
				<div class="banner-left">
					<div class="banner-logo">{provider.logo}</div>
					<div class="banner-text">
						<h3 class="banner-title">{provider.name}</h3>
						<p class="banner-subtitle">{provider.tagline}</p>
						<div class="banner-price">{provider.price} • Earn {provider.commission}</div>
					</div>
				</div>
				<div class="banner-right">
					<div class="banner-cta">Get VPN →</div>
				</div>
			</div>
		</a>
	{:else if displayFormat === 'card'}
		<div class="vpn-card">
			<div class="card-header">
				<div class="card-logo">{provider.logo}</div>
				<div class="card-title-section">
					<h3 class="card-title">{provider.name}</h3>
					<p class="card-tagline">{provider.tagline}</p>
				</div>
				<div class="card-badge">Recommended</div>
			</div>
			
			<div class="card-body">
				<div class="card-pricing">
					<div class="card-price">{provider.price}</div>
					<div class="card-commission">Earn {provider.commission}</div>
				</div>
				
				<ul class="card-features">
					{#each provider.features as feature}
						<li>✓ {feature}</li>
					{/each}
				</ul>
			</div>
			
			<div class="card-footer">
				<a 
					href={affiliateUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="card-button"
					on:click={trackVPNClick}
				>
					Get {provider.name}
				</a>
			</div>
		</div>
	{:else if displayFormat === 'compact'}
		<a 
			href={affiliateUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="vpn-compact"
			on:click={trackVPNClick}
		>
			<div class="compact-icon">{provider.logo}</div>
			<div class="compact-text">
				<span class="compact-name">{provider.name}</span>
				<span class="compact-price">{provider.price}</span>
			</div>
			<div class="compact-commission">{provider.commission}</div>
		</a>
	{/if}
	
	<div class="vpn-disclosure">
		<small>🔗 VPN Affiliate Partnership - Privacy protection recommended for crypto users</small>
	</div>
</div>

<style>
	.vpn-affiliate {
		margin: 16px 0;
	}

	/* Banner Format */
	.vpn-banner {
		background: var(--provider-bg);
		border: 2px solid var(--provider-color);
		border-radius: 12px;
		padding: 20px;
		text-decoration: none;
		color: inherit;
		display: block;
		transition: all 0.3s ease;
	}

	.vpn-banner:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		background: color-mix(in srgb, var(--provider-bg) 90%, white 10%);
	}

	.banner-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.banner-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.banner-logo {
		font-size: 32px;
		flex-shrink: 0;
	}

	.banner-title {
		font-size: 20px;
		font-weight: bold;
		color: var(--provider-color);
		margin: 0 0 4px 0;
	}

	.banner-subtitle {
		font-size: 14px;
		color: #6b7280;
		margin: 0 0 4px 0;
	}

	.banner-price {
		font-size: 12px;
		font-weight: 600;
		color: var(--provider-color);
	}

	.banner-cta {
		background: var(--provider-color);
		color: white;
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	/* Card Format */
	.vpn-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.card-header {
		background: var(--provider-bg);
		padding: 20px;
		border-bottom: 1px solid var(--provider-color);
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.card-logo {
		font-size: 40px;
		flex-shrink: 0;
	}

	.card-title-section {
		flex: 1;
	}

	.card-title {
		font-size: 22px;
		font-weight: bold;
		color: var(--provider-color);
		margin: 0 0 4px 0;
	}

	.card-tagline {
		color: #6b7280;
		margin: 0;
		font-size: 14px;
	}

	.card-badge {
		background: var(--provider-color);
		color: white;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.card-body {
		padding: 20px;
	}

	.card-pricing {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 16px;
		border-bottom: 1px solid #f3f4f6;
	}

	.card-price {
		font-size: 24px;
		font-weight: bold;
		color: var(--provider-color);
	}

	.card-commission {
		background: #dcfce7;
		color: #166534;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: bold;
	}

	.card-features {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.card-features li {
		color: #374151;
		margin-bottom: 6px;
		font-size: 14px;
	}

	.card-footer {
		padding: 0 20px 20px;
	}

	.card-button {
		display: block;
		width: 100%;
		background: var(--provider-color);
		color: white;
		text-align: center;
		padding: 16px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	.card-button:hover {
		background: color-mix(in srgb, var(--provider-color) 90%, black 10%);
		transform: translateY(-1px);
	}

	/* Compact Format */
	.vpn-compact {
		background: var(--provider-bg);
		border: 1px solid var(--provider-color);
		border-radius: 8px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
	}

	.vpn-compact:hover {
		background: color-mix(in srgb, var(--provider-bg) 90%, white 10%);
		transform: translateX(4px);
	}

	.compact-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.compact-text {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.compact-name {
		font-weight: bold;
		color: var(--provider-color);
	}

	.compact-price {
		font-size: 12px;
		color: #6b7280;
	}

	.compact-commission {
		background: var(--provider-color);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.vpn-disclosure {
		text-align: center;
		margin-top: 8px;
		color: #6b7280;
		font-size: 11px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.banner-content {
			flex-direction: column;
			gap: 16px;
			text-align: center;
		}
		
		.banner-left {
			flex-direction: column;
		}
		
		.card-header {
			flex-direction: column;
			text-align: center;
		}
		
		.card-pricing {
			flex-direction: column;
			gap: 8px;
			text-align: center;
		}
	}
</style>