<script>
	export let amazonTag = 'hannisol-20';
	export let productCategory = 'security';
	export let displayType = 'grid'; // 'grid', 'list', 'single'
	
	// Amazon affiliate products related to crypto security
	const securityProducts = [
		{
			asin: 'B08DKT1M2T',
			title: 'Hardware Wallet Storage Case',
			price: '$19.99',
			commission: '3-8%',
			rating: 4.5,
			image: '/images/wallet-case.jpg',
			category: 'Storage'
		},
		{
			asin: 'B07FNGBM5K',
			title: 'Cryptocurrency Security Book',
			price: '$24.99',
			commission: '4-10%',
			rating: 4.7,
			image: '/images/crypto-book.jpg',
			category: 'Education'
		},
		{
			asin: 'B08HLBJ9Z1',
			title: 'USB Hardware Security Key',
			price: '$39.99',
			commission: '3-6%',
			rating: 4.8,
			image: '/images/security-key.jpg',
			category: 'Hardware'
		}
	];
	
	$: products = securityProducts;
	
	function getAmazonUrl(asin) {
		return `https://amazon.com/dp/${asin}?tag=${amazonTag}`;
	}
	
	function trackAmazonClick(product) {
		console.log('Amazon affiliate clicked:', { asin: product.asin, category: product.category });
		
		// Analytics tracking
		fetch('/api/analytics/affiliate-click', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				program: 'amazon',
				asin: product.asin,
				category: product.category,
				price: product.price,
				timestamp: Date.now()
			})
		}).catch(err => console.log('Analytics failed:', err));
	}
	
	function renderStars(rating) {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		let stars = '';
		
		for (let i = 0; i < fullStars; i++) {
			stars += '⭐';
		}
		if (hasHalfStar) {
			stars += '⭐';
		}
		
		return stars;
	}
</script>

<div class="amazon-affiliate {displayType}">
	<div class="affiliate-header">
		<h3 class="affiliate-title">
			🛒 Recommended Security Products
		</h3>
		<div class="amazon-badge">
			Amazon Associates
		</div>
	</div>
	
	{#if displayType === 'grid'}
		<div class="products-grid">
			{#each products as product}
				<div class="product-card">
					<a 
						href={getAmazonUrl(product.asin)}
						target="_blank"
						rel="noopener noreferrer"
						class="product-link"
						on:click={() => trackAmazonClick(product)}
					>
						<div class="product-image">
							<div class="image-placeholder">📦</div>
							<div class="product-category">{product.category}</div>
						</div>
						<div class="product-info">
							<h4 class="product-title">{product.title}</h4>
							<div class="product-rating">
								{renderStars(product.rating)} ({product.rating})
							</div>
							<div class="product-pricing">
								<span class="product-price">{product.price}</span>
								<span class="product-commission">{product.commission}</span>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else if displayType === 'list'}
		<div class="products-list">
			{#each products as product}
				<a 
					href={getAmazonUrl(product.asin)}
					target="_blank"
					rel="noopener noreferrer"
					class="product-item"
					on:click={() => trackAmazonClick(product)}
				>
					<div class="item-icon">📦</div>
					<div class="item-details">
						<div class="item-title">{product.title}</div>
						<div class="item-meta">
							{product.category} • {renderStars(product.rating)} • {product.price}
						</div>
					</div>
					<div class="item-commission">{product.commission}</div>
				</a>
			{/each}
		</div>
	{:else if displayType === 'single'}
		<div class="single-product">
			{#each products.slice(0, 1) as product}
				<a 
					href={getAmazonUrl(product.asin)}
					target="_blank"
					rel="noopener noreferrer"
					class="single-link"
					on:click={() => trackAmazonClick(product)}
				>
					<div class="single-content">
						<div class="single-icon">🛒</div>
						<div class="single-text">
							<div class="single-title">{product.title}</div>
							<div class="single-subtitle">{product.category} • {product.price}</div>
						</div>
						<div class="single-cta">
							Shop Amazon →
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
	
	<div class="affiliate-disclosure">
		<small>
			🔗 As an Amazon Associate, we earn from qualifying purchases. 
			Prices and availability subject to change.
		</small>
	</div>
</div>

<style>
	.amazon-affiliate {
		background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
		border-radius: 16px;
		padding: 20px;
		margin: 20px 0;
		border: 1px solid #fb923c;
	}

	.affiliate-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.affiliate-title {
		color: #c2410c;
		font-weight: bold;
		font-size: 18px;
		margin: 0;
	}

	.amazon-badge {
		background: #ff9500;
		color: white;
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: bold;
	}

	/* Grid Layout */
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 16px;
	}

	.product-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.product-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.product-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.product-image {
		background: #f3f4f6;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		font-size: 32px;
	}

	.product-category {
		position: absolute;
		top: 8px;
		right: 8px;
		background: #ff9500;
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: bold;
	}

	.product-info {
		padding: 12px;
	}

	.product-title {
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 8px;
		color: #1f2937;
		line-height: 1.3;
	}

	.product-rating {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 8px;
	}

	.product-pricing {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.product-price {
		font-weight: bold;
		color: #b45309;
	}

	.product-commission {
		background: #dcfce7;
		color: #166534;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: bold;
	}

	/* List Layout */
	.products-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.product-item {
		background: white;
		border-radius: 8px;
		padding: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
	}

	.product-item:hover {
		background: #fefbf3;
		transform: translateX(4px);
	}

	.item-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.item-details {
		flex: 1;
	}

	.item-title {
		font-weight: bold;
		color: #1f2937;
		margin-bottom: 2px;
	}

	.item-meta {
		font-size: 12px;
		color: #6b7280;
	}

	.item-commission {
		background: #dcfce7;
		color: #166534;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		flex-shrink: 0;
	}

	/* Single Product Layout */
	.single-product {
		margin-bottom: 16px;
	}

	.single-link {
		background: white;
		border-radius: 12px;
		padding: 16px;
		display: block;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
	}

	.single-link:hover {
		background: #fefbf3;
		transform: translateY(-1px);
	}

	.single-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.single-icon {
		font-size: 32px;
		flex-shrink: 0;
	}

	.single-text {
		flex: 1;
	}

	.single-title {
		font-weight: bold;
		color: #1f2937;
		margin-bottom: 4px;
	}

	.single-subtitle {
		font-size: 14px;
		color: #6b7280;
	}

	.single-cta {
		background: #ff9500;
		color: white;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.affiliate-disclosure {
		text-align: center;
		color: #92400e;
		font-size: 11px;
		border-top: 1px solid #fed7aa;
		padding-top: 12px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.products-grid {
			grid-template-columns: 1fr;
		}
		
		.single-content {
			flex-direction: column;
			text-align: center;
		}
		
		.affiliate-header {
			flex-direction: column;
			gap: 8px;
		}
	}
</style>