<script>
	import { onMount } from 'svelte';
	
	export let revenueData = [];
	export let timeRange = '30d'; // '7d', '30d', '90d', '1y'
	export let chartType = 'line'; // 'line', 'bar', 'area'
	
	let chartContainer;
	let selectedMetric = 'total';
	
	// Sample revenue data
	const sampleData = [
		{ date: '2024-05-03', total: 45.75, adsense: 28.50, coinzilla: 12.25, aads: 3.50, affiliates: 1.50 },
		{ date: '2024-05-04', total: 52.30, adsense: 31.80, coinzilla: 14.75, aads: 4.25, affiliates: 1.50 },
		{ date: '2024-05-05', total: 38.90, adsense: 22.40, coinzilla: 11.50, aads: 3.00, affiliates: 2.00 },
		{ date: '2024-05-06', total: 67.85, adsense: 42.30, coinzilla: 18.55, aads: 4.50, affiliates: 2.50 },
		{ date: '2024-05-07', total: 71.20, adsense: 45.25, coinzilla: 19.95, aads: 3.75, affiliates: 2.25 },
		{ date: '2024-05-08', total: 59.45, adsense: 36.80, coinzilla: 16.40, aads: 4.25, affiliates: 2.00 },
		{ date: '2024-05-09', total: 48.60, adsense: 29.75, coinzilla: 13.85, aads: 3.50, affiliates: 1.50 },
		{ date: '2024-05-10', total: 73.90, adsense: 46.20, coinzilla: 20.70, aads: 4.75, affiliates: 2.25 },
		{ date: '2024-05-11', total: 82.15, adsense: 51.30, coinzilla: 22.85, aads: 5.25, affiliates: 2.75 },
		{ date: '2024-05-12', total: 76.50, adsense: 47.90, coinzilla: 21.60, aads: 4.50, affiliates: 2.50 },
		{ date: '2024-05-13', total: 64.75, adsense: 39.85, coinzilla: 18.40, aads: 4.00, affiliates: 2.50 },
		{ date: '2024-05-14', total: 55.30, adsense: 33.95, coinzilla: 15.35, aads: 3.75, affiliates: 2.25 },
		{ date: '2024-05-15', total: 89.40, adsense: 55.65, coinzilla: 24.75, aads: 5.50, affiliates: 3.50 },
		{ date: '2024-05-16', total: 92.80, adsense: 57.85, coinzilla: 26.45, aads: 5.25, affiliates: 3.25 },
		{ date: '2024-05-17', total: 78.65, adsense: 48.90, coinzilla: 22.25, aads: 4.75, affiliates: 2.75 }
	];
	
	$: displayData = revenueData.length > 0 ? revenueData : sampleData;
	$: totalRevenue = displayData.reduce((sum, day) => sum + day.total, 0);
	$: averageDaily = totalRevenue / displayData.length;
	$: bestDay = displayData.reduce((max, day) => day.total > max.total ? day : max, displayData[0]);
	$: chartHeight = 300;
	$: chartWidth = 800;
	
	const metrics = [
		{ key: 'total', label: 'Total Revenue', color: '#2563eb' },
		{ key: 'adsense', label: 'Google AdSense', color: '#4285f4' },
		{ key: 'coinzilla', label: 'Coinzilla', color: '#ff6b35' },
		{ key: 'aads', label: 'A-ADS', color: '#f7931a' },
		{ key: 'affiliates', label: 'Affiliates', color: '#10b981' }
	];
	
	$: selectedMetricData = metrics.find(m => m.key === selectedMetric);
	$: maxValue = Math.max(...displayData.map(d => d[selectedMetric]));
	$: chartPoints = generateChartPoints();
	
	function generateChartPoints() {
		const padding = 60;
		const width = chartWidth - padding * 2;
		const height = chartHeight - padding * 2;
		
		return displayData.map((item, index) => {
			const x = padding + (index / (displayData.length - 1)) * width;
			const y = padding + height - (item[selectedMetric] / maxValue) * height;
			return { x, y, value: item[selectedMetric], date: item.date };
		});
	}
	
	function formatCurrency(value) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	}
	
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric' 
		});
	}
	
	function generatePath() {
		if (chartPoints.length === 0) return '';
		
		let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
		
		for (let i = 1; i < chartPoints.length; i++) {
			if (chartType === 'line') {
				path += ` L ${chartPoints[i].x} ${chartPoints[i].y}`;
			} else if (chartType === 'area') {
				path += ` L ${chartPoints[i].x} ${chartPoints[i].y}`;
			}
		}
		
		if (chartType === 'area') {
			path += ` L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - 60}`;
			path += ` L ${chartPoints[0].x} ${chartHeight - 60} Z`;
		}
		
		return path;
	}
	
	onMount(() => {
		// Initialize chart animations
		console.log('Revenue chart initialized');
	});
</script>

<div class="revenue-chart">
	<div class="chart-header">
		<div class="header-left">
			<h3 class="chart-title">Revenue Analytics</h3>
			<div class="chart-stats">
				<div class="stat">
					<span class="stat-value">{formatCurrency(totalRevenue)}</span>
					<span class="stat-label">Total ({displayData.length}d)</span>
				</div>
				<div class="stat">
					<span class="stat-value">{formatCurrency(averageDaily)}</span>
					<span class="stat-label">Daily Average</span>
				</div>
				<div class="stat">
					<span class="stat-value">{formatCurrency(bestDay?.total || 0)}</span>
					<span class="stat-label">Best Day</span>
				</div>
			</div>
		</div>
		<div class="header-right">
			<div class="chart-controls">
				<select class="metric-select" bind:value={selectedMetric}>
					{#each metrics as metric}
						<option value={metric.key}>{metric.label}</option>
					{/each}
				</select>
				<div class="chart-type-buttons">
					<button 
						class="type-btn {chartType === 'line' ? 'active' : ''}"
						on:click={() => chartType = 'line'}
					>
						Line
					</button>
					<button 
						class="type-btn {chartType === 'area' ? 'active' : ''}"
						on:click={() => chartType = 'area'}
					>
						Area
					</button>
					<button 
						class="type-btn {chartType === 'bar' ? 'active' : ''}"
						on:click={() => chartType = 'bar'}
					>
						Bar
					</button>
				</div>
			</div>
		</div>
	</div>
	
	<div class="chart-container" bind:this={chartContainer}>
		<svg width={chartWidth} height={chartHeight} class="chart-svg">
			<!-- Grid lines -->
			<defs>
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" stroke-width="1"/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>
			
			<!-- Y-axis labels -->
			<g class="y-axis">
				{#each [0, 0.25, 0.5, 0.75, 1] as ratio}
					{@const yPos = 60 + (chartHeight - 120) * (1 - ratio)}
					{@const value = maxValue * ratio}
					<line x1="55" y1={yPos} x2={chartWidth - 60} y2={yPos} stroke="#e5e7eb" stroke-width="1"/>
					<text x="50" y={yPos + 4} class="axis-label" text-anchor="end">
						{formatCurrency(value)}
					</text>
				{/each}
			</g>
			
			<!-- X-axis labels -->
			<g class="x-axis">
				{#each displayData as item, index}
					{#if index % Math.ceil(displayData.length / 6) === 0}
						{@const xPos = 60 + (index / (displayData.length - 1)) * (chartWidth - 120)}
						<text x={xPos} y={chartHeight - 40} class="axis-label" text-anchor="middle">
							{formatDate(item.date)}
						</text>
					{/if}
				{/each}
			</g>
			
			<!-- Chart data -->
			{#if chartType === 'bar'}
				<g class="bars">
					{#each chartPoints as point, index}
						{@const barWidth = (chartWidth - 120) / displayData.length * 0.6}
						{@const barHeight = (chartHeight - 120) - (point.y - 60)}
						<rect
							x={point.x - barWidth / 2}
							y={point.y}
							width={barWidth}
							height={barHeight}
							fill={selectedMetricData?.color}
							opacity="0.7"
							class="bar-rect"
						/>
					{/each}
				</g>
			{:else}
				<!-- Line/Area chart -->
				<g class="chart-path">
					{#if chartType === 'area'}
						<path
							d={generatePath()}
							fill={selectedMetricData?.color}
							opacity="0.2"
							stroke="none"
						/>
					{/if}
					<path
						d={generatePath()}
						fill="none"
						stroke={selectedMetricData?.color}
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					
					<!-- Data points -->
					<g class="data-points">
						{#each chartPoints as point}
							<circle
								cx={point.x}
								cy={point.y}
								r="4"
								fill={selectedMetricData?.color}
								stroke="white"
								stroke-width="2"
								class="data-point"
							/>
						{/each}
					</g>
				</g>
			{/if}
		</svg>
		
		<!-- Tooltip (would be positioned dynamically) -->
		<div class="chart-tooltip" style="display: none;">
			<div class="tooltip-content">
				<div class="tooltip-date"></div>
				<div class="tooltip-value"></div>
			</div>
		</div>
	</div>
	
	<!-- Revenue Breakdown -->
	<div class="revenue-breakdown">
		<h4 class="breakdown-title">Revenue Sources</h4>
		<div class="breakdown-grid">
			{#each metrics.slice(1) as metric}
				{@const total = displayData.reduce((sum, day) => sum + day[metric.key], 0)}
				{@const percentage = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0}
				<div class="breakdown-item">
					<div class="breakdown-header">
						<div class="breakdown-color" style="background: {metric.color};"></div>
						<span class="breakdown-label">{metric.label}</span>
					</div>
					<div class="breakdown-stats">
						<div class="breakdown-amount">{formatCurrency(total)}</div>
						<div class="breakdown-percentage">{percentage.toFixed(1)}%</div>
					</div>
					<div class="breakdown-bar">
						<div 
							class="bar-fill" 
							style="width: {percentage}%; background: {metric.color};"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.revenue-chart {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.chart-header {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.chart-title {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
		margin: 0 0 12px 0;
	}

	.chart-stats {
		display: flex;
		gap: 24px;
	}

	.stat {
		text-align: left;
	}

	.stat-value {
		display: block;
		font-size: 18px;
		font-weight: bold;
		color: #2563eb;
	}

	.stat-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.chart-controls {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.metric-select {
		padding: 6px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		background: white;
		cursor: pointer;
	}

	.chart-type-buttons {
		display: flex;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		overflow: hidden;
	}

	.type-btn {
		padding: 6px 12px;
		border: none;
		background: white;
		color: #6b7280;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.type-btn:hover {
		background: #f9fafb;
	}

	.type-btn.active {
		background: #2563eb;
		color: white;
	}

	.chart-container {
		padding: 20px;
		position: relative;
	}

	.chart-svg {
		width: 100%;
		height: auto;
		max-width: 100%;
	}

	.axis-label {
		fill: #6b7280;
		font-size: 12px;
		font-family: system-ui, sans-serif;
	}

	.bar-rect {
		transition: opacity 0.3s ease;
		cursor: pointer;
	}

	.bar-rect:hover {
		opacity: 1 !important;
	}

	.data-point {
		cursor: pointer;
		transition: r 0.3s ease;
	}

	.data-point:hover {
		r: 6;
	}

	.chart-tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		pointer-events: none;
		z-index: 10;
	}

	.revenue-breakdown {
		padding: 24px;
		border-top: 1px solid #f3f4f6;
	}

	.breakdown-title {
		font-size: 16px;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 16px;
	}

	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
	}

	.breakdown-item {
		background: #f9fafb;
		border-radius: 8px;
		padding: 16px;
	}

	.breakdown-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.breakdown-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	.breakdown-label {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
	}

	.breakdown-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.breakdown-amount {
		font-size: 16px;
		font-weight: bold;
		color: #1f2937;
	}

	.breakdown-percentage {
		font-size: 14px;
		color: #6b7280;
		font-weight: 600;
	}

	.breakdown-bar {
		height: 4px;
		background: #e5e7eb;
		border-radius: 2px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 2px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.chart-header {
			flex-direction: column;
			gap: 16px;
			align-items: stretch;
		}
		
		.chart-stats {
			flex-direction: column;
			gap: 12px;
		}
		
		.chart-controls {
			flex-direction: column;
			align-items: stretch;
		}
		
		.breakdown-grid {
			grid-template-columns: 1fr;
		}
		
		.chart-svg {
			font-size: 10px;
		}
	}
</style>