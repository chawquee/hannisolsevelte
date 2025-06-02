<script>
	export let affiliateId = 'LEDGER-AFFILIATE-ID';
	export let productId = 'nano-s-plus';
	export let displayStyle = 'banner'; // 'banner', 'card', 'button'
	
	// Ledger product configurations
	const products = {
		'nano-s-plus': {
			name: 'Ledger Nano S Plus',
			price: '$79',
			commission: '$24',
			image: '/images/ledger-nano-s-plus.jpg',
			features: ['Multi-currency support', 'Secure chip', 'USB-C']
		},
		'nano-x': {
			name: 'Ledger Nano X',
			price: '$149',
			commission: '$45',
			image: '/images/ledger-nano-x.jpg',
			features: ['Bluetooth', 'Large screen', '100+ apps']
		}
	};
	
	$: product = products[productId] || products['nano-s-plus'];
	$: affiliateUrl = `https://shop.ledger.com/products/${productId}?r=${affiliateId}`;
	
	function trackAffiliateClick() {
		// Track affiliate click for analytics
		console.log('Ledger affiliate clicked:', { productId, affiliateId });
		
		// Send to analytics API
		fetch('/api/analytics/affiliate-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				program: 'ledger',
				productId,
				affiliateId,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
</script>

<div class="ledger-affiliate {displayStyle}">
	{#if displayStyle === 'banner'}
		<a 
			href={affiliateUrl} 
			target="_blank" 
			rel="noopener noreferrer"
			class="affiliate-link banner-link"
			on:click={trackAffiliateClick}
		>
			<div class="banner-content">
				<div class="banner-icon">🔐</div>
				<div class="banner-text">
					<div class="banner-title">{product.name}</div>
					<div class="banner-subtitle">Hardware Wallet Security</div>
					<div class="banner-price">{product.price} - Earn {product.commission}</div>
				</div>
				<div class="banner-cta">Shop Now →</div>
			</div>
		</a>
	{:else if displayStyle === 'card'}
		<div class="affiliate-card">
			<div class="card-header">
				<div class="card-badge">🔐 Recommended</div>
			</div>
			<div class="card-body">
				<h3 class="card-title">{product.name}</h3>
				<p class="card-description">Secure your crypto with military-grade hardware security</p>
				<ul class="card-features">
					{#each product.features as feature}
						<li>✓ {feature}</li>
					{/each}
				</ul>
				<div class="card-pricing">
					<span class="card-price">{product.price}</span>
					<span class="card-commission">Earn {product.commission}</span>
				</div>
			</div>
			<div class="card-footer">
				<a 
					href={affiliateUrl} 
					target="_blank" 
					rel="noopener noreferrer"
					class="affiliate-btn card-btn"
					on:click={trackAffiliateClick}
				>
					Get Ledger Wallet
				</a>
			</div>
		</div>
	{:else if displayStyle === 'button'}
		<a 
			href={affiliateUrl} 
			target="_blank" 
			rel="noopener noreferrer"
			class="affiliate-btn button-style"
			on:click={trackAffiliateClick}
		>
			<span class="btn-icon">🔐</span>
			<span class="btn-text">Secure with Ledger</span>
			<span class="btn-commission">{product.commission}</span>
		</a>
	{/if}
	
	<div class="affiliate-disclosure">
		<small>Affiliate link - We earn commission on purchases</small>
	</div>
</div>

<style>
	.ledger-affiliate {
		margin: 16px 0;
	}

	.affiliate-link {
		text-decoration: none;
		color: inherit;
		display: block;
		transition: all 0.3s ease;
	}

	/* Banner Style */
	.banner-link {
		background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
		color: white;
		border-radius: 12px;
		padding: 20px;
		border: 2px solid #4b5563;
	}

	.banner-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(31, 41, 55, 0.3);
		border-color: #6b7280;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.banner-icon {
		font-size: 32px;
		flex-shrink: 0;
	}

	.banner-text {
		flex: 1;
	}

	.banner-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 4px;
	}

	.banner-subtitle {
		font-size: 14px;
		opacity: 0.8;
		margin-bottom: 4px;
	}

	.banner-price {
		font-size: 12px;
		color: #10b981;
		font-weight: 600;
	}

	.banner-cta {
		background: #10b981;
		color: white;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: bold;
		flex-shrink: 0;
	}

	/* Card Style */
	.affiliate-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.card-header {
		background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
		color: white;
		padding: 12px 20px;
		position: relative;
	}

	.card-badge {
		font-size: 14px;
		font-weight: bold;
	}

	.card-body {
		padding: 20px;
	}

	.card-title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 8px;
		color: #1f2937;
	}

	.card-description {
		color: #6b7280;
		margin-bottom: 16px;
		line-height: 1.5;
	}

	.card-features {
		list-style: none;
		margin-bottom: 16px;
	}

	.card-features li {
		color: #374151;
		margin-bottom: 4px;
		font-size: 14px;
	}

	.card-pricing {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.card-price {
		font-size: 24px;
		font-weight: bold;
		color: #1f2937;
	}

	.card-commission {
		background: #dcfce7;
		color: #166534;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
	}

	.card-footer {
		padding: 0 20px 20px;
	}

	.card-btn {
		width: 100%;
		text-align: center;
		padding: 16px;
		background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
		color: white;
		border-radius: 8px;
		font-weight: bold;
		text-decoration: none;
		display: block;
		transition: all 0.3s ease;
	}

	.card-btn:hover {
		background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
		transform: translateY(-1px);
	}

	/* Button Style */
	.button-style {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
		color: white;
		padding: 12px 20px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.button-style:hover {
		background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.3);
	}

	.btn-icon {
		font-size: 18px;
	}

	.btn-commission {
		background: #10b981;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
	}

	.affiliate-disclosure {
		text-align: center;
		margin-top: 8px;
		color: #6b7280;
		font-size: 11px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.banner-content {
			flex-direction: column;
			text-align: center;
		}
		
		.banner-cta {
			align-self: stretch;
		}
		
		.card-pricing {
			flex-direction: column;
			gap: 8px;
			align-items: stretch;
			text-align: center;
		}
	}
</style>