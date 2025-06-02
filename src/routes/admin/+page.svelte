<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  let refreshInterval: NodeJS.Timeout;
  let isRefreshing = false;

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Format number with K/M suffixes
  function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  }

  // Format percentage
  function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // Get growth indicator
  function getGrowthIndicator(value: number): { icon: string; color: string; text: string } {
    if (value > 0) {
      return { icon: '📈', color: '#10b981', text: `+${value.toFixed(1)}%` };
    } else if (value < 0) {
      return { icon: '📉', color: '#ef4444', text: `${value.toFixed(1)}%` };
    } else {
      return { icon: '➡️', color: '#6b7280', text: '0%' };
    }
  }

  // Get health score color
  function getHealthColor(score: number): string {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  }

  // Refresh dashboard data
  async function refreshData() {
    isRefreshing = true;
    try {
      const response = await fetch(window.location.href, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      isRefreshing = false;
    }
  }

  // Auto-refresh every 30 seconds
  onMount(() => {
    refreshInterval = setInterval(refreshData, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  $: dashboard = data.dashboard;
  $: metrics = dashboard.metrics;
  $: revenue = dashboard.revenue;
  $: traffic = dashboard.traffic;
  $: alerts = dashboard.alerts;
  $: performance = dashboard.performance;
  $: derived = dashboard.derived;
</script>

<svelte:head>
  <title>Admin Dashboard - Hannisol</title>
</svelte:head>

<div class="dashboard">
  <!-- Dashboard Header -->
  <div class="dashboard-header">
    <div class="header-content">
      <div class="header-text">
        <h1>Dashboard Overview</h1>
        <p>Monitor your Solana address checker performance and revenue</p>
      </div>
      <div class="header-actions">
        <span class="last-updated">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
        <button 
          class="refresh-btn" 
          on:click={refreshData} 
          disabled={isRefreshing}
        >
          <span class="refresh-icon" class:spinning={isRefreshing}>🔄</span>
          Refresh
        </button>
      </div>
    </div>
  </div>

  <!-- Alert Bar -->
  {#if alerts.length > 0}
    <div class="alerts-container">
      {#each alerts.slice(0, 3) as alert}
        <div class="alert alert-{alert.severity || 'medium'}">
          <span class="alert-icon">
            {#if alert.type === 'error'}⚠️{:else if alert.type === 'warning'}🔔{:else}ℹ️{/if}
          </span>
          <span class="alert-message">{alert.message}</span>
          <span class="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Key Metrics Grid -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">👥</span>
        <span class="metric-label">Total Visitors</span>
      </div>
      <div class="metric-value">{formatNumber(metrics.totalVisitors)}</div>
      <div class="metric-change">
        {#if metrics.trafficGrowth !== undefined}
          {@const growth = getGrowthIndicator(metrics.trafficGrowth)}
          <span class="growth-indicator" style="color: {growth.color}">
            {growth.icon} {growth.text}
          </span>
        {/if}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">🔍</span>
        <span class="metric-label">Total Searches</span>
      </div>
      <div class="metric-value">{formatNumber(metrics.totalSearches)}</div>
      <div class="metric-change">
        {#if metrics.searchGrowth !== undefined}
          {@const growth = getGrowthIndicator(metrics.searchGrowth)}
          <span class="growth-indicator" style="color: {growth.color}">
            {growth.icon} {growth.text}
          </span>
        {/if}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">💰</span>
        <span class="metric-label">Total Revenue</span>
      </div>
      <div class="metric-value">{formatCurrency(metrics.totalRevenue)}</div>
      <div class="metric-change">
        {#if metrics.revenueGrowth !== undefined}
          {@const growth = getGrowthIndicator(metrics.revenueGrowth)}
          <span class="growth-indicator" style="color: {growth.color}">
            {growth.icon} {growth.text}
          </span>
        {/if}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">📊</span>
        <span class="metric-label">Conversion Rate</span>
      </div>
      <div class="metric-value">{formatPercentage(metrics.conversionRate)}</div>
      <div class="metric-stats">
        <span>{formatNumber(derived.searchesPerVisitor)} searches/visitor</span>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">⚡</span>
        <span class="metric-label">Active Users</span>
      </div>
      <div class="metric-value">{metrics.activeUsers}</div>
      <div class="metric-stats">
        <span>Online now</span>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-icon">🎯</span>
        <span class="metric-label">System Health</span>
      </div>
      <div class="metric-value" style="color: {getHealthColor(derived.healthScore)}">
        {derived.healthScore}%
      </div>
      <div class="metric-stats">
        <span>All systems operational</span>
      </div>
    </div>
  </div>

  <!-- Charts and Data Grid -->
  <div class="charts-grid">
    <!-- Revenue Chart -->
    <div class="chart-card">
      <div class="card-header">
        <h3>Revenue Overview</h3>
        <div class="chart-actions">
          <button class="chart-btn" on:click={() => goto('/admin/revenue')}>
            View Details
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="revenue-breakdown">
          <div class="revenue-item">
            <span class="revenue-label">Ad Revenue</span>
            <span class="revenue-value">{formatCurrency(revenue.adRevenue)}</span>
            <span class="revenue-percent">
              {revenue.totalRevenue > 0 ? Math.round((revenue.adRevenue / revenue.totalRevenue) * 100) : 0}%
            </span>
          </div>
          <div class="revenue-item">
            <span class="revenue-label">Affiliate Revenue</span>
            <span class="revenue-value">{formatCurrency(revenue.affiliateRevenue)}</span>
            <span class="revenue-percent">
              {revenue.totalRevenue > 0 ? Math.round((revenue.affiliateRevenue / revenue.totalRevenue) * 100) : 0}%
            </span>
          </div>
          <div class="revenue-item total">
            <span class="revenue-label">Total Revenue</span>
            <span class="revenue-value">{formatCurrency(revenue.totalRevenue)}</span>
            <span class="revenue-percent">100%</span>
          </div>
        </div>
        <div class="today-revenue">
          <span class="today-label">Today's Revenue</span>
          <span class="today-value">{formatCurrency(derived.todayRevenue)}</span>
        </div>
      </div>
    </div>

    <!-- Traffic Overview -->
    <div class="chart-card">
      <div class="card-header">
        <h3>Traffic Overview</h3>
        <div class="chart-actions">
          <button class="chart-btn" on:click={() => goto('/admin/analytics')}>
            View Analytics
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="traffic-stats">
          <div class="traffic-item">
            <span class="traffic-label">Page Views</span>
            <span class="traffic-value">{formatNumber(traffic.pageViews)}</span>
          </div>
          <div class="traffic-item">
            <span class="traffic-label">Sessions</span>
            <span class="traffic-value">{formatNumber(traffic.sessions)}</span>
          </div>
          <div class="traffic-item">
            <span class="traffic-label">Bounce Rate</span>
            <span class="traffic-value">{formatPercentage(traffic.bounceRate)}</span>
          </div>
          <div class="traffic-item">
            <span class="traffic-label">Avg. Session</span>
            <span class="traffic-value">{Math.round(traffic.avgSessionDuration / 60)}min</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Searches -->
    <div class="table-card">
      <div class="card-header">
        <h3>Recent Searches</h3>
        <div class="chart-actions">
          <button class="chart-btn" on:click={() => goto('/admin/searches')}>
            View All
          </button>
        </div>
      </div>
      <div class="table-content">
        {#if dashboard.recentSearches.length > 0}
          <div class="search-list">
            {#each dashboard.recentSearches.slice(0, 8) as search}
              <div class="search-item">
                <div class="search-info">
                  <span class="search-address">
                    {search.address.substring(0, 6)}...{search.address.substring(search.address.length - 6)}
                  </span>
                  <span class="search-country">
                    {search.country ? `${search.country}` : 'Unknown'}
                  </span>
                </div>
                <div class="search-meta">
                  <span class="search-result" class:success={search.resultType === 'success'}>
                    {search.resultType}
                  </span>
                  <span class="search-time">
                    {new Date(search.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <span class="empty-icon">🔍</span>
            <span class="empty-text">No recent searches</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Top Countries -->
    <div class="table-card">
      <div class="card-header">
        <h3>Top Countries</h3>
        <div class="chart-actions">
          <span class="period-label">Last 7 days</span>
        </div>
      </div>
      <div class="table-content">
        {#if dashboard.topCountries.length > 0}
          <div class="countries-list">
            {#each dashboard.topCountries.slice(0, 5) as country}
              <div class="country-item">
                <div class="country-info">
                  <span class="country-flag">
                    {country.countryCode === 'US' ? '🇺🇸' : 
                     country.countryCode === 'GB' ? '🇬🇧' : 
                     country.countryCode === 'DE' ? '🇩🇪' : 
                     country.countryCode === 'FR' ? '🇫🇷' : 
                     country.countryCode === 'CA' ? '🇨🇦' : '🌍'}
                  </span>
                  <span class="country-name">{country.country}</span>
                </div>
                <div class="country-stats">
                  <span class="country-visitors">{formatNumber(country.visitors)}</span>
                  <span class="country-percent">{formatPercentage(country.percentage)}</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <span class="empty-icon">🌍</span>
            <span class="empty-text">No country data</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- System Performance -->
  <div class="performance-section">
    <div class="performance-header">
      <h3>System Performance</h3>
      <div class="performance-score" style="color: {getHealthColor(derived.healthScore)}">
        Health Score: {derived.healthScore}%
      </div>
    </div>
    <div class="performance-grid">
      <div class="perf-item">
        <span class="perf-label">API Response</span>
        <span class="perf-value">{performance.apiResponseTime}ms</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">Database</span>
        <span class="perf-value">{performance.databaseResponseTime}ms</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">CPU Usage</span>
        <span class="perf-value">{formatPercentage(performance.cpuUsage)}</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">Memory</span>
        <span class="perf-value">{formatPercentage(performance.memoryUsage)}</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">Uptime</span>
        <span class="perf-value">{formatPercentage(performance.uptime)}</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">Error Rate</span>
        <span class="perf-value">{formatPercentage(performance.errorRate)}</span>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="quick-actions-section">
    <h3>Quick Actions</h3>
    <div class="actions-grid">
      <button class="action-card" on:click={() => goto('/admin/analytics')}>
        <span class="action-icon">📊</span>
        <span class="action-label">View Analytics</span>
        <span class="action-description">Detailed traffic & revenue analysis</span>
      </button>
      <button class="action-card" on:click={() => goto('/admin/searches')}>
        <span class="action-icon">🔍</span>
        <span class="action-label">Search History</span>
        <span class="action-description">Browse all address searches</span>
      </button>
      <button class="action-card" on:click={() => goto('/')}>
        <span class="action-icon">🌐</span>
        <span class="action-label">View Site</span>
        <span class="action-description">Check the live website</span>
      </button>
      <button class="action-card" on:click={() => goto('/admin/system')}>
        <span class="action-icon">⚙️</span>
        <span class="action-label">System Settings</span>
        <span class="action-description">Configure system parameters</span>
      </button>
    </div>
  </div>
</div>

<style>
  .dashboard {
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard-header {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-text h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .header-text p {
    color: #6b7280;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .last-updated {
    font-size: 14px;
    color: #9ca3af;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .refresh-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .refresh-icon {
    transition: transform 0.5s ease;
  }

  .refresh-icon.spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .alerts-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
  }

  .alert-high {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .alert-medium {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    color: #92400e;
  }

  .alert-low {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }

  .alert-time {
    margin-left: auto;
    font-size: 12px;
    opacity: 0.7;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .metric-icon {
    font-size: 20px;
  }

  .metric-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  .metric-value {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }

  .metric-change {
    font-size: 14px;
  }

  .metric-stats {
    font-size: 12px;
    color: #9ca3af;
  }

  .growth-indicator {
    font-weight: 500;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .chart-card, .table-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
  }

  .card-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .chart-btn {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chart-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .chart-content, .table-content {
    padding: 24px;
  }

  .revenue-breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .revenue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .revenue-item.total {
    border-bottom: none;
    padding-top: 16px;
    margin-top: 8px;
    border-top: 2px solid #e5e7eb;
    font-weight: 600;
  }

  .revenue-label {
    color: #6b7280;
    font-size: 14px;
  }

  .revenue-value {
    font-weight: 600;
    color: #111827;
  }

  .revenue-percent {
    font-size: 12px;
    color: #9ca3af;
    min-width: 40px;
    text-align: right;
  }

  .today-revenue {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .today-label {
    color: #6b7280;
    font-size: 14px;
  }

  .today-value {
    font-weight: 700;
    color: #7c3aed;
    font-size: 16px;
  }

  .traffic-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .traffic-item {
    text-align: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .traffic-label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .traffic-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .search-list, .countries-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .search-item, .country-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .search-item:last-child, .country-item:last-child {
    border-bottom: none;
  }

  .search-info, .country-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .search-address {
    font-family: monospace;
    font-size: 14px;
    color: #111827;
    font-weight: 500;
  }

  .search-country, .country-name {
    font-size: 12px;
    color: #6b7280;
  }

  .search-meta, .country-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .search-result {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f3f4f6;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 500;
  }

  .search-result.success {
    background: #dcfce7;
    color: #166534;
  }

  .search-time {
    font-size: 11px;
    color: #9ca3af;
  }

  .country-info {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .country-flag {
    font-size: 18px;
  }

  .country-visitors {
    font-weight: 600;
    color: #111827;
  }

  .country-percent {
    font-size: 12px;
    color: #6b7280;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px;
    color: #9ca3af;
  }

  .empty-icon {
    font-size: 24px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 14px;
  }

  .performance-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
  }

  .performance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .performance-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .performance-score {
    font-size: 16px;
    font-weight: 600;
  }

  .performance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .perf-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .perf-label {
    font-size: 12px;
    color: #6b7280;
  }

  .perf-value {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .quick-actions-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
  }

  .quick-actions-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 20px 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .action-card:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  .action-icon {
    font-size: 24px;
  }

  .action-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .action-description {
    font-size: 12px;
    color: #6b7280;
  }

  .period-label {
    font-size: 12px;
    color: #9ca3af;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .dashboard {
      padding: 0 8px;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .charts-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .traffic-stats {
      grid-template-columns: 1fr;
    }

    .performance-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>