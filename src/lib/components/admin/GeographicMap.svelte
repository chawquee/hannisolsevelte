<script>
	import { onMount } from 'svelte';
	
	export let geoData = [];
	export let totalVisitors = 0;
	
	let mapContainer;
	let selectedCountry = null;
	
	// Sample geographic data structure
	const defaultGeoData = [
		{ country: 'United States', code: 'US', visitors: 1250, percentage: 35.2, revenue: 485.50 },
		{ country: 'United Kingdom', code: 'GB', visitors: 890, percentage: 25.1, revenue: 324.75 },
		{ country: 'Germany', code: 'DE', visitors: 567, percentage: 16.0, revenue: 198.25 },
		{ country: 'Canada', code: 'CA', visitors: 432, percentage: 12.2, revenue: 156.80 },
		{ country: 'Australia', code: 'AU', visitors: 298, percentage: 8.4, revenue: 112.45 },
		{ country: 'France', code: 'FR', visitors: 156, percentage: 4.4, revenue: 67.20 },
		{ country: 'Japan', code: 'JP', visitors: 134, percentage: 3.8, revenue: 58.90 },
		{ country: 'Netherlands', code: 'NL', visitors: 98, percentage: 2.8, revenue: 42.15 },
		{ country: 'Others', code: 'XX', visitors: 245, percentage: 6.9, revenue: 89.30 }
	];
	
	$: displayData = geoData.length > 0 ? geoData : defaultGeoData;
	$: maxVisitors = Math.max(...displayData.map(d => d.visitors));
	
	onMount(() => {
		// Initialize world map visualization
		initializeMap();
	});
	
	function initializeMap() {
		// Simple SVG world map implementation
		// In production, you might use a library like D3.js or Leaflet
		console.log('Geographic map initialized');
	}
	
	function selectCountry(country) {
		selectedCountry = selectedCountry === country ? null : country;
	}
	
	function getCountryColor(visitors) {
		const intensity = visitors / maxVisitors;
		if (intensity > 0.8) return '#1e40af'; // Dark blue
		if (intensity > 0.6) return '#3b82f6'; // Blue
		if (intensity > 0.4) return '#60a5fa'; // Light blue
		if (intensity > 0.2) return '#93c5fd'; // Lighter blue
		return '#dbeafe'; // Very light blue
	}
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<div class="geographic-map">
	<div class="map-header">
		<h3 class="map-title">Geographic Distribution</h3>
		<div class="map-stats">
			<div class="stat-item">
				<span class="stat-value">{totalVisitors.toLocaleString()}</span>
				<span class="stat-label">Total Visitors</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{displayData.length}</span>
				<span class="stat-label">Countries</span>
			</div>
		</div>
	</div>
	
	<!-- World Map Visualization -->
	<div class="map-container" bind:this={mapContainer}>
		<div class="world-map">
			<svg viewBox="0 0 800 400" class="map-svg">
				<!-- Simplified world map paths -->
				<g class="countries">
					<!-- USA -->
					<path 
						d="M150 150 L300 150 L300 220 L150 220 Z" 
						class="country-path"
						style="fill: {getCountryColor(displayData.find(d => d.code === 'US')?.visitors || 0)}"
						on:click={() => selectCountry('US')}
					/>
					<!-- UK -->
					<path 
						d="M380 120 L420 120 L420 150 L380 150 Z" 
						class="country-path"
						style="fill: {getCountryColor(displayData.find(d => d.code === 'GB')?.visitors || 0)}"
						on:click={() => selectCountry('GB')}
					/>
					<!-- Germany -->
					<path 
						d="M430 130 L460 130 L460 160 L430 160 Z" 
						class="country-path"
						style="fill: {getCountryColor(displayData.find(d => d.code === 'DE')?.visitors || 0)}"
						on:click={() => selectCountry('DE')}
					/>
					<!-- Canada -->
					<path 
						d="M150 100 L300 100 L300 140 L150 140 Z" 
						class="country-path"
						style="fill: {getCountryColor(displayData.find(d => d.code === 'CA')?.visitors || 0)}"
						on:click={() => selectCountry('CA')}
					/>
					<!-- Australia -->
					<path 
						d="M650 280 L750 280 L750 340 L650 340 Z" 
						class="country-path"
						style="fill: {getCountryColor(displayData.find(d => d.code === 'AU')?.visitors || 0)}"
						on:click={() => selectCountry('AU')}
					/>
				</g>
				
				<!-- Country labels -->
				<g class="country-labels">
					<text x="225" y="185" class="country-label">USA</text>
					<text x="400" y="140" class="country-label">UK</text>
					<text x="445" y="150" class="country-label">DE</text>
					<text x="225" y="125" class="country-label">Canada</text>
					<text x="700" y="315" class="country-label">Australia</text>
				</g>
			</svg>
		</div>
		
		<!-- Map Legend -->
		<div class="map-legend">
			<div class="legend-title">Visitors</div>
			<div class="legend-scale">
				<div class="legend-item">
					<div class="legend-color" style="background: #dbeafe;"></div>
					<span>Low</span>
				</div>
				<div class="legend-item">
					<div class="legend-color" style="background: #93c5fd;"></div>
					<span>Medium</span>
				</div>
				<div class="legend-item">
					<div class="legend-color" style="background: #3b82f6;"></div>
					<span>High</span>
				</div>
				<div class="legend-item">
					<div class="legend-color" style="background: #1e40af;"></div>
					<span>Very High</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Country Statistics Table -->
	<div class="country-stats">
		<h4 class="stats-title">Top Countries</h4>
		<div class="stats-table">
			{#each displayData.slice(0, 8) as country}
				<div 
					class="country-row {selectedCountry === country.code ? 'selected' : ''}"
					on:click={() => selectCountry(country.code)}
				>
					<div class="country-info">
						<div class="country-flag">{country.code}</div>
						<div class="country-name">{country.country}</div>
					</div>
					<div class="country-metrics">
						<div class="metric">
							<span class="metric-value">{country.visitors.toLocaleString()}</span>
							<span class="metric-label">Visitors</span>
						</div>
						<div class="metric">
							<span class="metric-value">{country.percentage}%</span>
							<span class="metric-label">Share</span>
						</div>
						<div class="metric">
							<span class="metric-value">{formatCurrency(country.revenue)}</span>
							<span class="metric-label">Revenue</span>
						</div>
					</div>
					<div class="country-bar">
						<div 
							class="bar-fill" 
							style="width: {(country.visitors / maxVisitors) * 100}%; background: {getCountryColor(country.visitors)}"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.geographic-map {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.map-header {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.map-title {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
		margin: 0;
	}

	.map-stats {
		display: flex;
		gap: 24px;
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 24px;
		font-weight: bold;
		color: #2563eb;
	}

	.stat-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.map-container {
		padding: 24px;
		position: relative;
	}

	.world-map {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		position: relative;
	}

	.map-svg {
		width: 100%;
		height: 300px;
	}

	.country-path {
		stroke: #e5e7eb;
		stroke-width: 1;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.country-path:hover {
		stroke: #2563eb;
		stroke-width: 2;
		filter: brightness(1.1);
	}

	.country-label {
		fill: #374151;
		font-size: 12px;
		font-weight: 600;
		text-anchor: middle;
		pointer-events: none;
	}

	.map-legend {
		position: absolute;
		top: 40px;
		right: 40px;
		background: white;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.legend-title {
		font-size: 12px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 8px;
	}

	.legend-scale {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: #6b7280;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid #e5e7eb;
	}

	.country-stats {
		padding: 24px;
		border-top: 1px solid #f3f4f6;
	}

	.stats-title {
		font-size: 18px;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 16px;
	}

	.stats-table {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.country-row {
		display: grid;
		grid-template-columns: 2fr 3fr 1fr;
		gap: 16px;
		align-items: center;
		padding: 12px;
		border-radius: 8px;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.country-row:hover {
		background: #f8fafc;
	}

	.country-row.selected {
		background: #dbeafe;
		border: 1px solid #3b82f6;
	}

	.country-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.country-flag {
		background: #f3f4f6;
		color: #374151;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		min-width: 40px;
		text-align: center;
	}

	.country-name {
		font-weight: 600;
		color: #1f2937;
	}

	.country-metrics {
		display: flex;
		gap: 24px;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		display: block;
		font-weight: bold;
		color: #1f2937;
		font-size: 14px;
	}

	.metric-label {
		font-size: 11px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.country-bar {
		height: 6px;
		background: #f3f4f6;
		border-radius: 3px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 3px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.map-header {
			flex-direction: column;
			gap: 16px;
			text-align: center;
		}
		
		.map-stats {
			flex-direction: row;
			justify-content: center;
		}
		
		.country-row {
			grid-template-columns: 1fr;
			gap: 8px;
		}
		
		.country-metrics {
			justify-content: space-around;
		}
		
		.map-legend {
			position: relative;
			top: auto;
			right: auto;
			margin-top: 16px;
		}
	}
</style>