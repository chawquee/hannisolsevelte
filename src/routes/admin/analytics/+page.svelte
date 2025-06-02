<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;

  let selectedTimeRange = data.timeRange;
  let selectedView = 'overview'; // overview, traffic, revenue, searches, geographic, ads, affiliates
  let isRefreshing = false;
  let autoRefreshInterval: NodeJS.Timeout;
  let showExportMenu = false;

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

  // Format duration in seconds to readable format
  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
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

  // Get country flag emoji
  function getCountryFlag(countryCode: string): string {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳',
      'BR': '🇧🇷', 'MX': '🇲🇽', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱'
    };
    return flags[countryCode] || '🌍';
  }

  // Change time range
  async function changeTimeRange(range: string) {
    selectedTimeRange = range;
    goto(`/admin/analytics?range=${range}`, { replaceState: true });
  }

  // Refresh data
  async function refreshData() {
    isRefreshing = true;
    try {
      const response = await fetch(`/admin/analytics?range=${selectedTimeRange}`, {
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

  // Export data
  async function exportData(format: string) {
    try {
      const response = await fetch(`/admin/analytics?range=${selectedTimeRange}&export=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hannisol-analytics-${selectedTimeRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
    showExportMenu = false;
  }

  // Auto-refresh every 2 minutes
  onMount(() => {
    autoRefreshInterval = setInterval(refreshData, 120000);
  });

  onDestroy(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  });

  $: analytics = data.analytics;
  $: overview = analytics.overview;
  $: traffic = analytics.traffic;
  $: revenue = analytics.revenue;
  $: searches = analytics.searches;
  $: geographic = analytics.geographic;
  $: adPerformance = analytics.adPerformance;
  $: affiliates = analytics.affiliates;
  $: realTime = analytics.realTime;
  $: trends = analytics.trends;
  $: derived = analytics.derived;
</script>

<svelte:head>
  <title>Analytics Dashboard - Hannisol Admin</title>
</svelte:head>

<div class="analytics-dashboard">
  <!-- Dashboard Header -->
  <div class="analytics-header">
    <div class="header-content">
      <div class="header-info">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive performance metrics and insights</p>
        <div class="last-updated">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </div>
      
      <div class="header-controls">
        <!-- Time Range Selector -->
        <div class="time-range-selector">
          <label for="timeRange">Time Range:</label>
          <select 
            id="timeRange" 
            bind:value={selectedTimeRange} 
            on:change={(e) => changeTimeRange(e.target.value)}
          >
            {#each data.availableRanges as range}
              <option value={range.value}>{range.label}</option>
            {/each}
          </select>
        </div>

        <!-- Export Menu -->
        <div class="export-container">
          <button 
            class="export-btn" 
            on:click={() => showExportMenu = !showExportMenu}
          >
            📥 Export
          </button>
          {#if showExportMenu}
            <div class="export-menu">
              <button on:click={() => exportData('csv')}>CSV</button>
              <button on:click={() => exportData('json')}>JSON</button>
              <button on:click={() => exportData('pdf')}>PDF</button>
            </div>
          {/if}
        </div>

        <!-- Refresh Button -->
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

  <!-- View Selector -->
  <div class="view-selector">
    <div class="view-tabs">
      <button 
        class="view-tab" 
        class:active={selectedView === 'overview'}
        on:click={() => selectedView = 'overview'}
      >
        📊 Overview
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'traffic'}
        on:click={() => selectedView = 'traffic'}
      >
        👥 Traffic
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'revenue'}
        on:click={() => selectedView = 'revenue'}
      >
        💰 Revenue
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'searches'}
        on:click={() => selectedView = 'searches'}
      >
        🔍 Searches
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'geographic'}
        on:click={() => selectedView = 'geographic'}
      >
        🌍 Geographic
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'ads'}
        on:click={() => selectedView = 'ads'}
      >
        📱 Ads
      </button>
      <button 
        class="view-tab" 
        class:active={selectedView === 'affiliates'}
        on:click={() => selectedView = 'affiliates'}
      >
        🤝 Affiliates
      </button>
    </div>
  </div>

  <!-- Alerts Section -->
  {#if derived.alerts && derived.alerts.length > 0}
    <div class="alerts-section">
      {#each derived.alerts as alert}
        <div class="alert alert-{alert.type}">
          <span class="alert-icon">
            {#if alert.type === 'error'}⚠️{:else if alert.type === 'warning'}🔔{:else}ℹ️{/if}
          </span>
          <span class="alert-message">{alert.message}</span>
          {#if alert.value}
            <span class="alert-value">{alert.value}</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Real-time Metrics Bar -->
  <div class="realtime-bar">
    <div class="realtime-metrics">
      <div class="realtime-item">
        <span class="rt-icon">👥</span>
        <span class="rt-value">{realTime.activeUsers}</span>
        <span class="rt-label">Active Users</span>
      </div>
      <div class="realtime-item">
        <span class="rt-icon">⚡</span>
        <span class="rt-value">{realTime.currentSessions}</span>
        <span class="rt-label">Live Sessions</span>
      </div>
      <div class="realtime-item">
        <span class="rt-icon">💰</span>
        <span class="rt-value">{formatCurrency(realTime.liveRevenue)}</span>
        <span class="rt-label">Today's Revenue</span>
      </div>
      <div class="realtime-item">
        <span class="rt-icon">🎯</span>
        <span class="rt-value" style="color: {realTime.serverStatus === 'healthy' ? '#10b981' : '#ef4444'}">
          {realTime.serverStatus === 'healthy' ? '●' : '●'}
        </span>
        <span class="rt-label">System Status</span>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="analytics-content">
    <!-- Overview Tab -->
    {#if selectedView === 'overview'}
      <div class="overview-section">
        <!-- Key Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">👥</span>
              <span class="metric-label">Total Visitors</span>
            </div>
            <div class="metric-value">{formatNumber(overview.totalVisitors)}</div>
            <div class="metric-change">
              {@const growth = getGrowthIndicator(derived.trafficGrowth)}
              <span class="growth-indicator" style="color: {growth.color}">
                {growth.icon} {growth.text}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">📄</span>
              <span class="metric-label">Page Views</span>
            </div>
            <div class="metric-value">{formatNumber(overview.totalPageViews)}</div>
            <div class="metric-stats">
              <span>{(overview.totalPageViews / overview.totalSessions || 0).toFixed(1)} per session</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">💰</span>
              <span class="metric-label">Revenue</span>
            </div>
            <div class="metric-value">{formatCurrency(overview.totalRevenue)}</div>
            <div class="metric-change">
              {@const growth = getGrowthIndicator(derived.revenueGrowth)}
              <span class="growth-indicator" style="color: {growth.color}">
                {growth.icon} {growth.text}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">🔍</span>
              <span class="metric-label">Searches</span>
            </div>
            <div class="metric-value">{formatNumber(overview.totalSearches)}</div>
            <div class="metric-change">
              {@const growth = getGrowthIndicator(derived.searchGrowth)}
              <span class="growth-indicator" style="color: {growth.color}">
                {growth.icon} {growth.text}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">⏱️</span>
              <span class="metric-label">Avg Session</span>
            </div>
            <div class="metric-value">{formatDuration(overview.avgSessionDuration)}</div>
            <div class="metric-stats">
              <span>{formatPercentage(overview.bounceRate)} bounce rate</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">🎯</span>
              <span class="metric-label">Conversion Rate</span>
            </div>
            <div class="metric-value">{formatPercentage(overview.conversionRate)}</div>
            <div class="metric-stats">
              <span>{formatCurrency(revenue.revenuePerVisitor)} per visitor</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Device Breakdown</h3>
            </div>
            <div class="chart-content">
              <div class="device-stats">
                <div class="device-item">
                  <span class="device-icon">💻</span>
                  <span class="device-label">Desktop</span>
                  <span class="device-value">{formatPercentage(overview.deviceBreakdown.desktop)}</span>
                </div>
                <div class="device-item">
                  <span class="device-icon">📱</span>
                  <span class="device-label">Mobile</span>
                  <span class="device-value">{formatPercentage(overview.deviceBreakdown.mobile)}</span>
                </div>
                <div class="device-item">
                  <span class="device-icon">📱</span>
                  <span class="device-label">Tablet</span>
                  <span class="device-value">{formatPercentage(overview.deviceBreakdown.tablet)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Top Pages</h3>
            </div>
            <div class="chart-content">
              <div class="top-pages-list">
                {#each overview.topPages.slice(0, 5) as page}
                  <div class="page-item">
                    <span class="page-path">{page.path}</span>
                    <span class="page-views">{formatNumber(page.views)}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Insights Section -->
        {#if derived.insights && derived.insights.length > 0}
          <div class="insights-section">
            <h3>📈 Key Insights</h3>
            <div class="insights-list">
              {#each derived.insights as insight}
                <div class="insight-item">
                  <span class="insight-icon">💡</span>
                  <span class="insight-text">{insight}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Traffic Tab -->
    {#if selectedView === 'traffic'}
      <div class="traffic-section">
        <div class="traffic-overview">
          <div class="traffic-metrics">
            <div class="traffic-metric">
              <span class="tm-label">Direct Traffic</span>
              <span class="tm-value">{formatPercentage(traffic.directTraffic)}</span>
            </div>
            <div class="traffic-metric">
              <span class="tm-label">Organic Search</span>
              <span class="tm-value">{formatPercentage(traffic.organicTraffic)}</span>
            </div>
            <div class="traffic-metric">
              <span class="tm-label">Referral</span>
              <span class="tm-value">{formatPercentage(traffic.referralTraffic)}</span>
            </div>
            <div class="traffic-metric">
              <span class="tm-label">Social Media</span>
              <span class="tm-value">{formatPercentage(traffic.socialTraffic)}</span>
            </div>
          </div>
        </div>

        <div class="traffic-tables">
          <div class="table-card">
            <h3>Traffic Sources</h3>
            <div class="table-content">
              {#each traffic.trafficSources.slice(0, 10) as source}
                <div class="table-row">
                  <span class="source-name">{source.source}</span>
                  <span class="source-visitors">{formatNumber(source.visitors)}</span>
                  <span class="source-percent">{formatPercentage(source.percentage)}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Referral Sites</h3>
            <div class="table-content">
              {#each traffic.referralSites.slice(0, 10) as site}
                <div class="table-row">
                  <span class="site-name">{site.domain}</span>
                  <span class="site-visitors">{formatNumber(site.visitors)}</span>
                  <span class="site-percent">{formatPercentage(site.percentage)}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Revenue Tab -->
    {#if selectedView === 'revenue'}
      <div class="revenue-section">
        <div class="revenue-overview">
          <div class="revenue-breakdown">
            <div class="revenue-item">
              <span class="rev-label">Ad Revenue</span>
              <span class="rev-value">{formatCurrency(revenue.adRevenue)}</span>
              <span class="rev-percent">
                {revenue.totalRevenue > 0 ? Math.round((revenue.adRevenue / revenue.totalRevenue) * 100) : 0}%
              </span>
            </div>
            <div class="revenue-item">
              <span class="rev-label">Affiliate Revenue</span>
              <span class="rev-value">{formatCurrency(revenue.affiliateRevenue)}</span>
              <span class="rev-percent">
                {revenue.totalRevenue > 0 ? Math.round((revenue.affiliateRevenue / revenue.totalRevenue) * 100) : 0}%
              </span>
            </div>
            <div class="revenue-item total">
              <span class="rev-label">Total Revenue</span>
              <span class="rev-value">{formatCurrency(revenue.totalRevenue)}</span>
              <span class="rev-percent">100%</span>
            </div>
          </div>
        </div>

        <div class="revenue-tables">
          <div class="table-card">
            <h3>Top Earning Pages</h3>
            <div class="table-content">
              {#each revenue.topEarningPages.slice(0, 8) as page}
                <div class="table-row">
                  <span class="page-path">{page.path}</span>
                  <span class="page-revenue">{formatCurrency(page.revenue)}</span>
                  <span class="page-views">{formatNumber(page.views)} views</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Revenue by Source</h3>
            <div class="table-content">
              {#each revenue.revenueBySource as source}
                <div class="table-row">
                  <span class="source-name">{source.source}</span>
                  <span class="source-revenue">{formatCurrency(source.revenue)}</span>
                  <span class="source-percent">{formatPercentage(source.percentage)}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Searches Tab -->
    {#if selectedView === 'searches'}
      <div class="searches-section">
        <div class="searches-overview">
          <div class="search-metrics">
            <div class="search-metric">
              <span class="sm-label">Total Searches</span>
              <span class="sm-value">{formatNumber(searches.totalSearches)}</span>
            </div>
            <div class="search-metric">
              <span class="sm-label">Unique Addresses</span>
              <span class="sm-value">{formatNumber(searches.uniqueAddresses)}</span>
            </div>
            <div class="search-metric">
              <span class="sm-label">Success Rate</span>
              <span class="sm-value">
                {searches.totalSearches > 0 ? formatPercentage((searches.successfulSearches / searches.totalSearches) * 100) : '0%'}
              </span>
            </div>
            <div class="search-metric">
              <span class="sm-label">Avg Search Time</span>
              <span class="sm-value">{formatDuration(searches.avgSearchTime)}</span>
            </div>
          </div>
        </div>

        <div class="searches-tables">
          <div class="table-card">
            <h3>Most Searched Addresses</h3>
            <div class="table-content">
              {#each searches.mostSearchedAddresses.slice(0, 10) as address}
                <div class="table-row">
                  <span class="address-hash">
                    {address.address.substring(0, 6)}...{address.address.substring(address.address.length - 6)}
                  </span>
                  <span class="address-count">{address.searchCount} searches</span>
                  <span class="address-risk" class:high-risk={address.isHighRisk}>
                    {address.isHighRisk ? '⚠️ High Risk' : '✅ Normal'}
                  </span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Searches by Country</h3>
            <div class="table-content">
              {#each searches.searchesByCountry.slice(0, 10) as country}
                <div class="table-row">
                  <span class="country-info">
                    <span class="country-flag">{getCountryFlag(country.countryCode)}</span>
                    <span class="country-name">{country.country}</span>
                  </span>
                  <span class="country-searches">{formatNumber(country.searches)}</span>
                  <span class="country-percent">{formatPercentage(country.percentage)}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Geographic Tab -->
    {#if selectedView === 'geographic'}
      <div class="geographic-section">
        <div class="geo-tables">
          <div class="table-card">
            <h3>Top Countries</h3>
            <div class="table-content">
              {#each geographic.topCountries.slice(0, 15) as country}
                <div class="table-row">
                  <span class="country-info">
                    <span class="country-flag">{getCountryFlag(country.countryCode)}</span>
                    <span class="country-name">{country.country}</span>
                  </span>
                  <span class="country-visitors">{formatNumber(country.visitors)}</span>
                  <span class="country-revenue">{formatCurrency(country.revenue || 0)}</span>
                  <span class="country-percent">{formatPercentage(country.percentage)}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Revenue by Country</h3>
            <div class="table-content">
              {#each geographic.countryRevenue.slice(0, 10) as country}
                <div class="table-row">
                  <span class="country-info">
                    <span class="country-flag">{getCountryFlag(country.countryCode)}</span>
                    <span class="country-name">{country.country}</span>
                  </span>
                  <span class="country-revenue">{formatCurrency(country.revenue)}</span>
                  <span class="country-rpm">{formatCurrency(country.revenuePerVisitor)} RPV</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Ads Tab -->
    {#if selectedView === 'ads'}
      <div class="ads-section">
        <div class="ads-overview">
          <div class="ad-metrics">
            <div class="ad-metric">
              <span class="am-label">Total Impressions</span>
              <span class="am-value">{formatNumber(adPerformance.totalImpressions)}</span>
            </div>
            <div class="ad-metric">
              <span class="am-label">Total Clicks</span>
              <span class="am-value">{formatNumber(adPerformance.totalClicks)}</span>
            </div>
            <div class="ad-metric">
              <span class="am-label">Average CTR</span>
              <span class="am-value">{formatPercentage(adPerformance.averageCTR)}</span>
            </div>
            <div class="ad-metric">
              <span class="am-label">Average CPM</span>
              <span class="am-value">{formatCurrency(adPerformance.averageCPM)}</span>
            </div>
          </div>
        </div>

        <div class="ads-tables">
          <div class="table-card">
            <h3>Network Performance</h3>
            <div class="table-content">
              {#each Object.entries(adPerformance.networkPerformance) as [network, data]}
                <div class="table-row">
                  <span class="network-name">
                    {#if network === 'google-adsense'}Google AdSense
                    {:else if network === 'a-ads'}A-ADS
                    {:else if network === 'coinzilla'}Coinzilla
                    {:else if network === 'media-net'}Media.net
                    {:else}{network}{/if}
                  </span>
                  <span class="network-revenue">{formatCurrency(data.revenue)}</span>
                  <span class="network-ctr">{formatPercentage(data.ctr)}</span>
                  <span class="network-cpm">{formatCurrency(data.cpm)}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Top Performing Ads</h3>
            <div class="table-content">
              {#each adPerformance.topPerformingAds.slice(0, 8) as ad}
                <div class="table-row">
                  <span class="ad-id">{ad.adId}</span>
                  <span class="ad-network">{ad.network}</span>
                  <span class="ad-revenue">{formatCurrency(ad.revenue)}</span>
                  <span class="ad-ctr">{formatPercentage(ad.ctr)}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Affiliates Tab -->
    {#if selectedView === 'affiliates'}
      <div class="affiliates-section">
        <div class="affiliates-overview">
          <div class="affiliate-metrics">
            <div class="affiliate-metric">
              <span class="afm-label">Total Clicks</span>
              <span class="afm-value">{formatNumber(affiliates.totalClicks)}</span>
            </div>
            <div class="affiliate-metric">
              <span class="afm-label">Conversions</span>
              <span class="afm-value">{formatNumber(affiliates.totalConversions)}</span>
            </div>
            <div class="affiliate-metric">
              <span class="afm-label">Conversion Rate</span>
              <span class="afm-value">{formatPercentage(affiliates.conversionRate)}</span>
            </div>
            <div class="affiliate-metric">
              <span class="afm-label">Total Commissions</span>
              <span class="afm-value">{formatCurrency(affiliates.totalCommissions)}</span>
            </div>
          </div>
        </div>

        <div class="affiliates-tables">
          <div class="table-card">
            <h3>Program Performance</h3>
            <div class="table-content">
              {#each Object.entries(affiliates.programPerformance) as [program, data]}
                <div class="table-row">
                  <span class="program-name">
                    {#if program === 'amazon'}Amazon Associates
                    {:else if program === 'ledger'}Ledger Affiliate
                    {:else if program === 'vpn'}VPN Services
                    {:else if program === 'crypto-education'}Crypto Education
                    {:else}{program}{/if}
                  </span>
                  <span class="program-revenue">{formatCurrency(data.revenue)}</span>
                  <span class="program-clicks">{formatNumber(data.clicks)}</span>
                  <span class="program-conversions">{formatNumber(data.conversions)}</span>
                  <span class="program-rate">{formatPercentage(data.conversionRate)}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card">
            <h3>Top Products</h3>
            <div class="table-content">
              {#each affiliates.topProducts.slice(0, 8) as product}
                <div class="table-row">
                  <span class="product-name">{product.name}</span>
                  <span class="product-program">{product.program}</span>
                  <span class="product-revenue">{formatCurrency(product.revenue)}</span>
                  <span class="product-conversions">{product.conversions}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .analytics-dashboard {
    max-width: 1400px;
    margin: 0 auto;
  }

  .analytics-header {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
  }

  .header-info h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .header-info p {
    color: #6b7280;
    margin: 0 0 12px 0;
  }

  .last-updated {
    font-size: 14px;
    color: #9ca3af;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .time-range-selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .time-range-selector label {
    font-size: 14px;
    color: #6b7280;
  }

  .time-range-selector select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    font-size: 14px;
  }

  .export-container {
    position: relative;
  }

  .export-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .export-btn:hover {
    background: #e5e7eb;
  }

  .export-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
    margin-top: 4px;
    min-width: 120px;
  }

  .export-menu button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .export-menu button:hover {
    background: #f3f4f6;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    border: none;
    border-radius: 6px;
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

  .refresh-icon.spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .view-selector {
    background: white;
    border-radius: 12px;
    padding: 6px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .view-tabs {
    display: flex;
    gap: 4px;
    overflow-x: auto;
  }

  .view-tab {
    background: none;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .view-tab:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .view-tab.active {
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
  }

  .alerts-section {
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

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .alert-warning {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    color: #92400e;
  }

  .alert-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }

  .realtime-bar {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    color: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .realtime-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 24px;
  }

  .realtime-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .rt-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .rt-value {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .rt-label {
    font-size: 12px;
    opacity: 0.8;
  }

  .analytics-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
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

  .metric-change,
  .metric-stats {
    font-size: 14px;
    color: #9ca3af;
  }

  .growth-indicator {
    font-weight: 500;
  }

  .charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .chart-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .chart-header {
    background: white;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .chart-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .chart-content {
    padding: 20px;
  }

  .device-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .device-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .device-icon {
    font-size: 18px;
    width: 24px;
  }

  .device-label {
    flex: 1;
    color: #374151;
  }

  .device-value {
    font-weight: 600;
    color: #111827;
  }

  .top-pages-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .page-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .page-item:last-child {
    border-bottom: none;
  }

  .page-path {
    font-family: monospace;
    font-size: 13px;
    color: #374151;
  }

  .page-views {
    font-weight: 600;
    color: #111827;
    font-size: 14px;
  }

  .insights-section {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 12px;
    padding: 20px;
    margin-top: 24px;
  }

  .insights-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0c4a6e;
    margin: 0 0 16px 0;
  }

  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .insight-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .insight-icon {
    font-size: 16px;
    margin-top: 2px;
  }

  .insight-text {
    color: #0c4a6e;
    font-size: 14px;
    line-height: 1.5;
  }

  /* Traffic Section Styles */
  .traffic-overview {
    margin-bottom: 24px;
  }

  .traffic-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .traffic-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .tm-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .tm-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .traffic-tables {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  /* Revenue Section Styles */
  .revenue-overview {
    margin-bottom: 24px;
  }

  .revenue-breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .revenue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .revenue-item.total {
    border-bottom: none;
    border-top: 2px solid #d1d5db;
    padding-top: 16px;
    margin-top: 8px;
    font-weight: 600;
  }

  .rev-label {
    color: #6b7280;
    font-size: 14px;
  }

  .rev-value {
    font-weight: 600;
    color: #111827;
  }

  .rev-percent {
    font-size: 12px;
    color: #9ca3af;
    min-width: 50px;
    text-align: right;
  }

  .revenue-tables {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  /* Search Section Styles */
  .searches-overview {
    margin-bottom: 24px;
  }

  .search-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .search-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .sm-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .sm-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .searches-tables {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  /* Common Table Styles */
  .table-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .table-card h3 {
    background: white;
    padding: 16px 20px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-content {
    padding: 20px;
  }

  .table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .country-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .country-flag {
    font-size: 16px;
  }

  .country-name {
    color: #374151;
  }

  .address-hash {
    font-family: monospace;
    font-size: 13px;
    color: #374151;
  }

  .address-risk.high-risk {
    color: #dc2626;
    font-weight: 600;
  }

  /* Ad and Affiliate specific styles */
  .ads-overview,
  .affiliates-overview {
    margin-bottom: 24px;
  }

  .ad-metrics,
  .affiliate-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .ad-metric,
  .affiliate-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .am-label,
  .afm-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .am-value,
  .afm-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .ads-tables,
  .affiliates-tables {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header-controls {
      flex-wrap: wrap;
    }

    .metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .traffic-tables,
    .revenue-tables,
    .searches-tables,
    .ads-tables,
    .affiliates-tables {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .analytics-header,
    .analytics-content {
      padding: 16px;
    }

    .view-tabs {
      flex-wrap: wrap;
    }

    .realtime-metrics {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .traffic-metrics,
    .search-metrics,
    .ad-metrics,
    .affiliate-metrics {
      grid-template-columns: repeat(2, 1fr);
    }

    .table-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style>