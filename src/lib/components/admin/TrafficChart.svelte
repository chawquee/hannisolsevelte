<script>
	import { onMount } from 'svelte';
	
	export let trafficData = [];
	export let timeRange = '7d'; // '24h', '7d', '30d'
	export let showComparison = true;
	
	let chartContainer;
	let selectedMetric = 'visitors';
	let hoveredPoint = null;
	
	// Sample traffic data
	const sampleData = [
		{ 
			date: '2024-05-27', 
			hour: null,
			visitors: 1245, 
			pageViews: 3890, 
			searches: 892, 
			bounceRate: 32.5, 
			avgSessionDuration: 245,
			newVisitors: 789,
			returningVisitors: 456
		},
		{ 
			date: '2024-05-28', 
			hour: null,
			visitors: 1356, 
			pageViews: 4120, 
			searches: 967, 
			bounceRate: 28.3, 
			avgSessionDuration: 267,
			newVisitors: 834,
			returningVisitors: 522
		},
		{ 
			date: '2024-05-29', 
			hour: null,
			visitors: 1189, 
			pageViews: 3654, 
			searches: 823, 
			bounceRate: 35.7, 
			avgSessionDuration: 221,
			newVisitors: 712,
			returningVisitors: 477
		},
		{ 
			date: '2024-05-30', 
			hour: null,
			visitors: 1498, 
			pageViews: 4567, 
			searches: 1045, 
			bounceRate: 25.1, 
			avgSessionDuration: 298,
			newVisitors: 923,
			returningVisitors: 575
		},
		{ 
			date: '2024-05-31', 
			hour: null,
			visitors: 1632, 
			pageViews: 4890, 
			searches: 1134, 
			bounceRate: 22.8, 
			avgSessionDuration: 312,
			newVisitors: 987,
			returningVisitors: 645
		},
		{ 
			date: '2024-06-01', 
			hour: null,
			visitors: 1423, 
			pageViews: 4234, 
			searches: 991, 
			bounceRate: 29.4, 
			avgSessionDuration: 276,
			newVisitors: 856,
			returningVisitors: 567
		},
		{ 
			date: '2024-06-02', 
			hour: null,
			visitors: 1567, 
			pageViews: 4677, 
			searches: 1078, 
			bounceRate: 24.6, 
			avgSessionDuration: 289,
			newVisitors: 934,
			returningVisitors: 633
		}
	];
	
	$: displayData = trafficData.length > 0 ? trafficData : sampleData;
	$: totalVisitors = displayData.reduce((sum, day) => sum + day.visitors, 0);
	$: totalPageViews = displayData.reduce((sum, day) => sum + day.pageViews, 0);
	$: totalSearches = displayData.reduce((sum, day) => sum + day.searches, 0);
	$: avgBounceRate = displayData.reduce((sum, day) => sum + day.bounceRate, 0) / displayData.length;
	$: chartHeight = 280;
	$: chartWidth = 800;
	
	const metrics = [
		{ key: 'visitors', label: 'Visitors', color: '#2563eb', format: 'number' },
		{ key: 'pageViews', label: 'Page Views', color: '#7c3aed', format: 'number' },
		{ key: 'searches', label: 'Searches', color: '#059669', format: 'number' },
		{ key: 'bounceRate', label: 'Bounce Rate', color: '#dc2626', format: 'percentage' },
		{ key: 'avgSessionDuration', label: 'Session Duration', color: '#f59e0b', format: 'duration' }
	];
	
	$: selectedMetricData = metrics.find(m => m.key === selectedMetric);
	$: maxValue = Math.max(...displayData.map(d => d[selectedMetric]));
	$: minValue = Math.min(...displayData.map(d => d[selectedMetric]));
	$: chartPoints = generateChartPoints();
	
	function generateChartPoints() {
		const padding = { top: 40, right: 60, bottom: 60, left: 80 };
		const width = chartWidth - padding.left - padding.right;
		const height = chartHeight - padding.top - padding.bottom;
		
		return displayData.map((item, index) => {
			const x = padding.left + (index / (displayData.length - 1)) * width;
			const y = padding.top + height - ((item[selectedMetric] - minValue) / (maxValue - minValue)) * height;
			return { 
				x, 
				y, 
				value: item[selectedMetric], 
				date: item.date,
				data: item
			};
		});
	}
	
	function formatValue(value, format) {
		switch(format) {
			case 'percentage':
				return `${value.toFixed(1)}%`;
			case 'duration':
				const minutes = Math.floor(value / 60);
				const seconds = value % 60;
				return `${minutes}:${seconds.toString().padStart(2, '0')}`;
			case 'number':
			default:
				return value.toLocaleString();
		}
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
		
		// Create smooth curves using quadratic bezier curves
		for (let i = 1; i < chartPoints.length; i++) {
			const prev = chartPoints[i - 1];
			const curr = chartPoints[i];
			const cpx = prev.x + (curr.x - prev.x) / 2;
			path += ` Q ${cpx} ${prev.y} ${curr.x} ${curr.y}`;
		}
		
		return path;
	}
	
	function generateAreaPath() {
		if (chartPoints.length === 0) return '';
		
		const linePath = generatePath();
		const lastPoint = chartPoints[chartPoints.length - 1];
		const firstPoint = chartPoints[0];
		
		return `${linePath} L ${lastPoint.x} ${chartHeight - 60} L ${firstPoint.x} ${chartHeight - 60} Z`;
	}
	
	function handleMouseMove(event) {
		const rect = chartContainer.getBoundingClientRect();
		const x = event.clientX - rect.left;
		
		// Find closest point
		let closestPoint = null;
		let minDistance = Infinity;
		
		chartPoints.forEach(point => {
			const distance = Math.abs(point.x - x);
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		});
		
		if (minDistance < 30) { // Within 30px
			hoveredPoint = closestPoint;
		} else {
			hoveredPoint = null;
		}
	}
	
	function handleMouseLeave() {
		hoveredPoint = null;
	}
	
	onMount(() => {
		console.log('Traffic chart initialized');
	});
</script>

<div class="traffic-chart">
	<div class="chart-header">
		<div class="header-left">
			<h3 class="chart-title">Traffic Analytics</h3>
			<div class="time-range-selector">
				<button 
					class="range-btn {timeRange === '24h' ? 'active' : ''}"
					on:click={() => timeRange = '24h'}
				>
					24H
				</button>
				<button 
					class="range-btn {timeRange === '7d' ? 'active' : ''}"
					on:click={() => timeRange = '7d'}
				>
					7D
				</button>
				<button 
					class="range-btn {timeRange === '30d' ? 'active' : ''}"
					on:click={() => timeRange = '30d'}
				>
					30D
				</button>
			</div>
		</div>
		<div class="header-right">
			<select class="metric-select" bind:value={selectedMetric}>
				{#each metrics as metric}
					<option value={metric.key}>{metric.label}</option>
				{/each}
			</select>
		</div>
	</div>
	
	<!-- Key Metrics -->
	<div class="metrics-overview">
		<div class="metric-card">
			<div class="metric-icon">👥</div>
			<div class="metric-info">
				<div class="metric-value">{totalVisitors.toLocaleString()}</div>
				<div class="metric-label">Total Visitors</div>
			</div>
		</div>
		<div class="metric-card">
			<div class="metric-icon">📄</div>
			<div class="metric-info">
				<div class="metric-value">{totalPageViews.toLocaleString()}</div>
				<div class="metric-label">Page Views</div>
			</div>
		</div>
		<div class="metric-card">
			<div class="metric-icon">🔍</div>
			<div class="metric-info">
				<div class="metric-value">{totalSearches.toLocaleString()}</div>
				<div class="metric-label">Searches</div>
			</div>
		</div>
		<div class="metric-card">
			<div class="metric-icon">📊</div>
			<div class="metric-info">
				<div class="metric-value">{avgBounceRate.toFixed(1)}%</div>
				<div class="metric-label">Avg Bounce Rate</div>
			</div>
		</div>
	</div>
	
	<!-- Chart Container -->
	<div 
		class="chart-container" 
		bind:this={chartContainer}
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
	>
		<svg width={chartWidth} height={chartHeight} class="chart-svg">
			<!-- Grid Lines -->
			<defs>
				<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style="stop-color:{selectedMetricData?.color};stop-opacity:0.3" />
					<stop offset="100%" style="stop-color:{selectedMetricData?.color};stop-opacity:0.05" />
				</linearGradient>
			</defs>
			
			<!-- Background Grid -->
			<g class="grid">
				{#each [0, 0.25, 0.5, 0.75, 1] as ratio}
					{@const yPos = 40 + (chartHeight - 100) * ratio}
					<line 
						x1="80" 
						y1={yPos} 
						x2={chartWidth - 60} 
						y2={yPos} 
						stroke="#f3f4f6" 
						stroke-width="1"
					/>
				{/each}
			</g>
			
			<!-- Y-axis Labels -->
			<g class="y-axis">
				{#each [0, 0.25, 0.5, 0.75, 1] as ratio}
					{@const yPos = 40 + (chartHeight - 100) * (1 - ratio)}
					{@const value = minValue + (maxValue - minValue) * ratio}
					<text x="70" y={yPos + 4} class="axis-label" text-anchor="end">
						{formatValue(value, selectedMetricData?.format)}
					</text>
				{/each}
			</g>
			
			<!-- X-axis Labels -->
			<g class="x-axis">
				{#each displayData as item, index}
					{@const xPos = 80 + (index / (displayData.length - 1)) * (chartWidth - 140)}
					<text x={xPos} y={chartHeight - 20} class="axis-label" text-anchor="middle">
						{formatDate(item.date)}
					</text>
				{/each}
			</g>
			
			<!-- Area Fill -->
			<path
				d={generateAreaPath()}
				fill="url(#areaGradient)"
				opacity="0.6"
			/>
			
			<!-- Main Line -->
			<path
				d={generatePath()}
				fill="none"
				stroke={selectedMetricData?.color}
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			
			<!-- Data Points -->
			<g class="data-points">
				{#each chartPoints as point, index}
					<circle
						cx={point.x}
						cy={point.y}
						r={hoveredPoint === point ? 6 : 4}
						fill={selectedMetricData?.color}
						stroke="white"
						stroke-width="2"
						class="data-point"
						style="cursor: pointer;"
					/>
					
					<!-- Hover Line -->
					{#if hoveredPoint === point}
						<line
							x1={point.x}
							y1="40"
							x2={point.x}
							y2={chartHeight - 60}
							stroke={selectedMetricData?.color}
							stroke-width="1"
							stroke-dasharray="4,4"
							opacity="0.5"
						/>
					{/if}
				{/each}
			</g>
		</svg>
		
		<!-- Tooltip -->
		{#if hoveredPoint}
			<div 
				class="chart-tooltip"
				style="left: {hoveredPoint.x}px; top: {hoveredPoint.y - 80}px;"
			>
				<div class="tooltip-header">
					<div class="tooltip-date">{formatDate(hoveredPoint.date)}</div>
				</div>
				<div class="tooltip-content">
					<div class="tooltip-metric">
						<span class="tooltip-label">{selectedMetricData?.label}:</span>
						<span class="tooltip-value" style="color: {selectedMetricData?.color}">
							{formatValue(hoveredPoint.value, selectedMetricData?.format)}
						</span>
					</div>
					<div class="tooltip-details">
						<div class="detail-item">
							<span>Visitors:</span>
							<span>{hoveredPoint.data.visitors.toLocaleString()}</span>
						</div>
						<div class="detail-item">
							<span>Page Views:</span>
							<span>{hoveredPoint.data.pageViews.toLocaleString()}</span>
						</div>
						<div class="detail-item">
							<span>Searches:</span>
							<span>{hoveredPoint.data.searches.toLocaleString()}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Traffic Sources Breakdown -->
	<div class="traffic-sources">
		<h4 class="sources-title">Traffic Sources</h4>
		<div class="sources-grid">
			<div class="source-item">
				<div class="source-header">
					<div class="source-icon">🔍</div>
					<span class="source-label">Organic Search</span>
				</div>
				<div class="source-stats">
					<div class="source-percentage">68.5%</div>
					<div class="source-visitors">4,892 visitors</div>
				</div>
			</div>
			
			<div class="source-item">
				<div class="source-header">
					<div class="source-icon">🔗</div>
					<span class="source-label">Direct</span>
				</div>
				<div class="source-stats">
					<div class="source-percentage">18.3%</div>
					<div class="source-visitors">1,308 visitors</div>
				</div>
			</div>
			
			<div class="source-item">
				<div class="source-header">
					<div class="source-icon">📱</div>
					<span class="source-label">Social Media</span>
				</div>
				<div class="source-stats">
					<div class="source-percentage">8.7%</div>
					<div class="source-visitors">622 visitors</div>
				</div>
			</div>
			
			<div class="source-item">
				<div class="source-header">
					<div class="source-icon">🎯</div>
					<span class="source-label">Referral</span>
				</div>
				<div class="source-stats">
					<div class="source-percentage">4.5%</div>
					<div class="source-visitors">322 visitors</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.traffic-chart {
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
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.chart-title {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
		margin: 0;
	}

	.time-range-selector {
		display: flex;
		background: white;
		border-radius: 6px;
		border: 1px solid #d1d5db;
		overflow: hidden;
	}

	.range-btn {
		padding: 6px 12px;
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.range-btn.active {
		background: #2563eb;
		color: white;
	}

	.range-btn:hover:not(.active) {
		background: #f9fafb;
	}

	.metric-select {
		padding: 6px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		background: white;
		cursor: pointer;
	}

	.metrics-overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		padding: 20px 24px;
		border-bottom: 1px solid #f3f4f6;
	}

	.metric-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: #f9fafb;
		border-radius: 8px;
	}

	.metric-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.metric-value {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
		line-height: 1;
	}

	.metric-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
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
		font-size: 11px;
		font-family: system-ui, sans-serif;
	}

	.data-point {
		transition: r 0.3s ease;
	}

	.chart-tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 12px;
		border-radius: 8px;
		font-size: 12px;
		pointer-events: none;
		z-index: 10;
		min-width: 160px;
		transform: translateX(-50%);
	}

	.tooltip-header {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 6px;
		margin-bottom: 6px;
	}

	.tooltip-date {
		font-weight: bold;
		font-size: 13px;
	}

	.tooltip-metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.tooltip-label {
		color: #d1d5db;
	}

	.tooltip-value {
		font-weight: bold;
	}

	.tooltip-details {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		padding-top: 6px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		margin-bottom: 2px;
		color: #d1d5db;
	}

	.traffic-sources {
		padding: 24px;
		border-top: 1px solid #f3f4f6;
	}

	.sources-title {
		font-size: 16px;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 16px;
	}

	.sources-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.source-item {
		background: #f9fafb;
		border-radius: 8px;
		padding: 16px;
		border: 1px solid #e5e7eb;
	}

	.source-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.source-icon {
		font-size: 16px;
	}

	.source-label {
		font-weight: 600;
		color: #374151;
		font-size: 14px;
	}

	.source-percentage {
		font-size: 20px;
		font-weight: bold;
		color: #2563eb;
		line-height: 1;
	}

	.source-visitors {
		font-size: 12px;
		color: #6b7280;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.chart-header {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}
		
		.header-left {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}
		
		.metrics-overview {
			grid-template-columns: 1fr;
		}
		
		.sources-grid {
			grid-template-columns: 1fr;
		}
		
		.chart-svg {
			font-size: 10px;
		}
	}
</style>