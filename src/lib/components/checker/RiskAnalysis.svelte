<script>
	export let riskData = {
		score: 65,
		level: 'Medium',
		factors: ['Ownership not renounced', 'Mint authority active'],
		volume24h: 1200000,
		liquidityLocked: true,
		ownershipRenounced: false,
		mintAuthority: true,
		freezeAuthority: false,
		topHoldersPercentage: 45,
		liquidityPoolPercentage: 30,
		devWalletPercentage: 15
	};

	$: riskColor = getRiskColor(riskData.level);
	$: riskBgColor = getRiskBgColor(riskData.level);

	function getRiskColor(level) {
		switch(level) {
			case 'Low': return '#059669';
			case 'Medium': return '#d97706';
			case 'High': return '#dc2626';
			case 'Very High': return '#991b1b';
			default: return '#6b7280';
		}
	}

	function getRiskBgColor(level) {
		switch(level) {
			case 'Low': return '#dcfce7';
			case 'Medium': return '#fef3c7';
			case 'High': return '#fee2e2';
			case 'Very High': return '#fecaca';
			default: return '#f3f4f6';
		}
	}

	function formatVolume(volume) {
		if (volume >= 1000000) {
			return `$${(volume / 1000000).toFixed(1)}M`;
		}
		return `$${(volume / 1000).toFixed(0)}K`;
	}
</script>

<div class="card">
	<div class="card-header">
		<svg class="icon text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
		</svg>
		<h2 class="card-title">Rug Pull Risk Analysis</h2>
	</div>
	<div class="card-content">
		<!-- Risk Score Overview -->
		<div class="risk-overview">
			<div class="risk-score-container">
				<div class="risk-score" style="color: {riskColor}">
					{riskData.score}/100
				</div>
				<div class="risk-level" style="background: {riskBgColor}; color: {riskColor}">
					{riskData.level} Risk
				</div>
			</div>
			<div class="volume-info">
				<div class="volume-amount">{formatVolume(riskData.volume24h)}</div>
				<div class="volume-label">24h Volume</div>
			</div>
		</div>

		<!-- Risk Factors Grid -->
		<div class="risk-factors-grid">
			<div class="risk-factor">
				<div class="factor-header">
					<span class="factor-label">Liquidity Locked</span>
					<span class="factor-status {riskData.liquidityLocked ? 'safe' : 'warning'}">
						{riskData.liquidityLocked ? '✓ Yes' : '✗ No'}
					</span>
				</div>
				<div class="factor-description">
					{riskData.liquidityLocked ? 'Liquidity is locked and cannot be removed' : 'Liquidity can be removed by developers'}
				</div>
			</div>

			<div class="risk-factor">
				<div class="factor-header">
					<span class="factor-label">Ownership Renounced</span>
					<span class="factor-status {riskData.ownershipRenounced ? 'safe' : 'danger'}">
						{riskData.ownershipRenounced ? '✓ Yes' : '✗ No'}
					</span>
				</div>
				<div class="factor-description">
					{riskData.ownershipRenounced ? 'Contract ownership has been renounced' : 'Developers still control the contract'}
				</div>
			</div>

			<div class="risk-factor">
				<div class="factor-header">
					<span class="factor-label">Mint Authority</span>
					<span class="factor-status {riskData.mintAuthority ? 'warning' : 'safe'}">
						{riskData.mintAuthority ? '⚠ Active' : '✓ Disabled'}
					</span>
				</div>
				<div class="factor-description">
					{riskData.mintAuthority ? 'New tokens can be minted' : 'Token supply is fixed'}
				</div>
			</div>

			<div class="risk-factor">
				<div class="factor-header">
					<span class="factor-label">Freeze Authority</span>
					<span class="factor-status {riskData.freezeAuthority ? 'danger' : 'safe'}">
						{riskData.freezeAuthority ? '✗ Active' : '✓ Disabled'}
					</span>
				</div>
				<div class="factor-description">
					{riskData.freezeAuthority ? 'Accounts can be frozen' : 'No freeze functionality'}
				</div>
			</div>
		</div>

		<!-- Token Distribution Chart -->
		<div class="distribution-section">
			<h4 class="section-title">Token Distribution</h4>
			<div class="distribution-chart">
				<div class="distribution-visual">
					<svg viewBox="0 0 200 200" class="pie-chart">
						<!-- Top Holders -->
						<circle
							cx="100" cy="100" r="80"
							fill="none"
							stroke="#7c3aed"
							stroke-width="20"
							stroke-dasharray="{(riskData.topHoldersPercentage / 100) * 502.65} 502.65"
							stroke-dashoffset="125.66"
							transform="rotate(-90 100 100)"
						/>
						<!-- Liquidity Pool -->
						<circle
							cx="100" cy="100" r="80"
							fill="none"
							stroke="#2563eb"
							stroke-width="20"
							stroke-dasharray="{(riskData.liquidityPoolPercentage / 100) * 502.65} 502.65"
							stroke-dashoffset="{125.66 - (riskData.topHoldersPercentage / 100) * 502.65}"
							transform="rotate(-90 100 100)"
						/>
						<!-- Dev Wallet -->
						<circle
							cx="100" cy="100" r="80"
							fill="none"
							stroke="#059669"
							stroke-width="20"
							stroke-dasharray="{(riskData.devWalletPercentage / 100) * 502.65} 502.65"
							stroke-dashoffset="{125.66 - ((riskData.topHoldersPercentage + riskData.liquidityPoolPercentage) / 100) * 502.65}"
							transform="rotate(-90 100 100)"
						/>
						<text x="100" y="105" text-anchor="middle" class="chart-center-text">
							Token
						</text>
						<text x="100" y="120" text-anchor="middle" class="chart-center-text">
							Distribution
						</text>
					</svg>
				</div>
				<div class="distribution-legend">
					<div class="legend-item">
						<div class="legend-color" style="background-color: #7c3aed;"></div>
						<div class="legend-info">
							<span class="legend-label">Top 10 Holders</span>
							<span class="legend-value">{riskData.topHoldersPercentage}%</span>
						</div>
					</div>
					<div class="legend-item">
						<div class="legend-color" style="background-color: #2563eb;"></div>
						<div class="legend-info">
							<span class="legend-label">Liquidity Pool</span>
							<span class="legend-value">{riskData.liquidityPoolPercentage}%</span>
						</div>
					</div>
					<div class="legend-item">
						<div class="legend-color" style="background-color: #059669;"></div>
						<div class="legend-info">
							<span class="legend-label">Dev Wallet</span>
							<span class="legend-value">{riskData.devWalletPercentage}%</span>
						</div>
					</div>
					<div class="legend-item">
						<div class="legend-color" style="background-color: #e5e7eb;"></div>
						<div class="legend-info">
							<span class="legend-label">Others</span>
							<span class="legend-value">{100 - riskData.topHoldersPercentage - riskData.liquidityPoolPercentage - riskData.devWalletPercentage}%</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Risk Summary -->
		<div class="risk-summary">
			<h4 class="section-title">Risk Assessment Summary</h4>
			<div class="summary-content">
				<div class="summary-text">
					<p>
						This token shows <strong style="color: {riskColor}">{riskData.level.toLowerCase()} risk</strong> 
						characteristics based on our analysis. 
						{#if riskData.factors.length > 0}
							Key concerns include {riskData.factors.join(', ').toLowerCase()}.
						{/if}
					</p>
					<p>
						The token maintains a 24-hour trading volume of {formatVolume(riskData.volume24h)}, 
						which indicates {riskData.volume24h > 1000000 ? 'good' : 'moderate'} market activity.
					</p>
					<p class="disclaimer">
						⚠️ <strong>Disclaimer:</strong> This analysis is for informational purposes only. 
						Always conduct your own research and consider multiple factors before making investment decisions.
						Past performance does not guarantee future results.
					</p>
				</div>
				
				<!-- Risk Recommendation -->
				<div class="risk-recommendation">
					<div class="recommendation-header">
						<div class="recommendation-icon" style="color: {riskColor}">
							{#if riskData.level === 'Low'}
								✅
							{:else if riskData.level === 'Medium'}
								⚠️
							{:else}
								🚨
							{/if}
						</div>
						<div class="recommendation-title">Recommendation</div>
					</div>
					<div class="recommendation-text">
						{#if riskData.level === 'Low'}
							This token appears to have good security practices in place. However, always verify independently.
						{:else if riskData.level === 'Medium'}
							Exercise caution with this token. Consider the risk factors carefully before investing.
						{:else}
							High risk detected. We strongly recommend thorough due diligence before any investment.
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		margin-bottom: 24px;
		border: 1px solid #f1f5f9;
		overflow: hidden;
	}

	.card-header {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-title {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
	}

	.card-content {
		padding: 24px;
	}

	.risk-overview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-bottom: 32px;
		padding: 20px;
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
		border-radius: 16px;
		border: 1px solid #f59e0b;
	}

	.risk-score-container {
		text-align: center;
	}

	.risk-score {
		font-size: 48px;
		font-weight: bold;
		line-height: 1;
		margin-bottom: 8px;
	}

	.risk-level {
		display: inline-block;
		padding: 8px 16px;
		border-radius: 9999px;
		font-weight: bold;
		font-size: 14px;
	}

	.volume-info {
		text-align: center;
	}

	.volume-amount {
		font-size: 32px;
		font-weight: bold;
		color: #059669;
		line-height: 1;
		margin-bottom: 8px;
	}

	.volume-label {
		color: #6b7280;
		font-size: 14px;
	}

	.risk-factors-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 16px;
		margin-bottom: 32px;
	}

	.risk-factor {
		background: #f9fafb;
		border-radius: 12px;
		padding: 16px;
		border: 1px solid #e5e7eb;
	}

	.factor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.factor-label {
		font-weight: 600;
		color: #374151;
	}

	.factor-status {
		font-weight: bold;
		font-size: 14px;
		padding: 4px 8px;
		border-radius: 6px;
	}

	.factor-status.safe {
		color: #059669;
		background: #dcfce7;
	}

	.factor-status.warning {
		color: #d97706;
		background: #fef3c7;
	}

	.factor-status.danger {
		color: #dc2626;
		background: #fee2e2;
	}

	.factor-description {
		font-size: 12px;
		color: #6b7280;
		line-height: 1.4;
	}

	.distribution-section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		color: #374151;
	}

	.distribution-chart {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 24px;
		align-items: center;
	}

	.pie-chart {
		width: 200px;
		height: 200px;
	}

	.chart-center-text {
		fill: #6b7280;
		font-size: 12px;
		font-weight: 600;
	}

	.distribution-legend {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.legend-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
	}

	.legend-label {
		font-size: 14px;
		color: #374151;
	}

	.legend-value {
		font-weight: 600;
		color: #1f2937;
	}

	.risk-summary {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e7eb;
	}

	.summary-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 24px;
	}

	.summary-text {
		color: #374151;
		line-height: 1.6;
	}

	.summary-text p {
		margin-bottom: 12px;
	}

	.summary-text p:last-child {
		margin-bottom: 0;
	}

	.disclaimer {
		font-size: 12px;
		color: #6b7280;
		background: #fef3c7;
		padding: 12px;
		border-radius: 8px;
		border-left: 4px solid #f59e0b;
	}

	.risk-recommendation {
		background: white;
		border-radius: 8px;
		padding: 16px;
		border: 1px solid #e5e7eb;
	}

	.recommendation-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.recommendation-icon {
		font-size: 20px;
	}

	.recommendation-title {
		font-weight: 600;
		color: #1f2937;
	}

	.recommendation-text {
		font-size: 14px;
		color: #6b7280;
		line-height: 1.5;
	}

	.icon {
		width: 20px;
		height: 20px;
	}

	.text-yellow {
		color: #d97706;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.risk-overview {
			grid-template-columns: 1fr;
		}
		
		.risk-factors-grid {
			grid-template-columns: 1fr;
		}
		
		.distribution-chart {
			grid-template-columns: 1fr;
			text-align: center;
		}
		
		.summary-content {
			grid-template-columns: 1fr;
		}
	}
</style>