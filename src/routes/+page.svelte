<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  export let data;
  export let form;
  
  let searchAddress = '';
  let isLoading = false;
  let showShareModal = false;
  let shareUrl = '';
  let showRecentSearches = false;
  
  // Reactive statements
  $: hasResults = form?.success && form?.data;
  $: hasError = form?.error;
  $: searchResults = hasResults ? form.data : null;
  
  onMount(() => {
    // Auto-focus search input
    const searchInput = document.getElementById('address-input');
    if (searchInput) {
      searchInput.focus();
    }
    
    // Handle URL parameters for shared results
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedAddress = urlParams.get('address');
      if (sharedAddress) {
        searchAddress = sharedAddress;
      }
    }
  });
  
  function handleSubmit() {
    isLoading = true;
  }
  
  function handleResult({ result, update }) {
    isLoading = false;
    update();
  }
  
  function selectRecentSearch(address: string) {
    searchAddress = address;
    showRecentSearches = false;
  }
  
  function copyToClipboard(text: string) {
    if (browser) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy', 'error');
      });
    }
  }
  
  function shareResults() {
    if (!searchResults) return;
    
    shareUrl = `${window.location.origin}/?address=${encodeURIComponent(form.address)}`;
    showShareModal = true;
  }
  
  function shareToTwitter() {
    const text = `I just analyzed Solana address ${form.address} on @Hannisol - check it out!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  }
  
  function shareToTelegram() {
    const text = `Solana address analysis: ${form.address}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
  
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (browser) {
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }
  
  function formatSOL(amount: number): string {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }
  
  function formatUSD(amount: number): string {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }
  
  function getRiskColor(level: string): string {
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
  
  function getRiskBgColor(level: string): string {
    switch (level) {
      case 'Low': return 'bg-green-50 border-green-200';
      case 'Medium': return 'bg-yellow-50 border-yellow-200';
      case 'High': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }
</script>

<svelte:head>
  <title>Hannisol - Solana Address Checker & Validator</title>
  <meta name="description" content="Validate Solana addresses, check balances, analyze transactions, and assess risks. Professional-grade blockchain analysis tools." />
  <meta name="keywords" content="solana address checker, blockchain validator, crypto analysis, solana wallet checker" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <div class="main-container">
    <!-- Main Content Area -->
    <div class="content-area">
      <!-- Header Section -->
      <div class="header">
        <div class="logo-container">
          <div class="logo">
            <div class="logo-h">H</div>
          </div>
        </div>
        <div class="brand-name">HANNISOL</div>
        <h1 class="main-title">Solana Address Checker</h1>
        <p class="subtitle">Comprehensive validation and analysis for Solana addresses</p>
        <p class="slogan">"Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps."</p>
      </div>

      <!-- Input Section -->
      <div class="input-section">
        <form 
          method="POST" 
          action="?/checkAddress"
          use:enhance={{
            onSubmit: handleSubmit,
            onResult: handleResult
          }}
        >
          <div class="input-container">
            <div class="flex-1 relative">
              <input 
                id="address-input"
                name="address"
                type="text" 
                bind:value={searchAddress}
                class="address-input"
                placeholder="Enter Solana address to analyze... (e.g., 5DF4D...3RcB3gf3Z)"
                required
                disabled={isLoading}
              />
              
              <!-- Recent Searches Dropdown -->
              {#if data.recentSearches.length > 0}
                <button 
                  type="button"
                  on:click={() => showRecentSearches = !showRecentSearches}
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
                
                {#if showRecentSearches}
                  <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    <div class="p-3 border-b border-gray-200">
                      <h3 class="text-sm font-semibold text-gray-700">Recent Searches</h3>
                    </div>
                    {#each data.recentSearches as search}
                      <button 
                        type="button"
                        on:click={() => selectRecentSearch(search.address)}
                        class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div class="font-mono text-sm">{search.address}</div>
                        <div class="text-xs text-gray-500">{new Date(search.timestamp).toLocaleDateString()}</div>
                      </button>
                    {/each}
                  </div>
                {/if}
              {/if}
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || !searchAddress.trim()}
              class="check-btn"
            >
              {#if isLoading}
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              {:else}
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Check Address
              {/if}
            </button>
          </div>
        </form>
        
        <!-- Error Display -->
        {#if hasError}
          <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-red-800 font-medium">{form.error}</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Results Section -->
      {#if hasResults}
        <div class="results-section">
          <!-- Address Validation Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 class="card-title">Address Validation</h2>
            </div>
            <div class="card-content">
              <div class="validation-grid">
                <div class="validation-item">
                  <svg class="icon text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span><strong>Status:</strong> Valid</span>
                </div>
                <div class="validation-item">
                  <span><strong>Format:</strong> {searchResults.validation.format}</span>
                </div>
                <div class="validation-item">
                  <span><strong>Length:</strong> {searchResults.validation.length} characters</span>
                </div>
                <div class="validation-item">
                  <span><strong>Type:</strong> {searchResults.validation.type}</span>
                </div>
              </div>
              <div class="success-banner">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <strong>Note:</strong> Valid Solana address
              </div>
            </div>
          </div>

          <!-- Balance & Holdings Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <h2 class="card-title">Balance & Holdings</h2>
            </div>
            <div class="card-content">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px;">
                <div>
                  <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #374151;">SOL Balance</h4>
                  <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">{formatSOL(searchResults.balance.sol)} SOL</div>
                    <div style="color: #6b7280; font-size: 16px;">{formatUSD(searchResults.balance.usd)}</div>
                  </div>
                </div>
                <div>
                  <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #374151;">Token Holdings</h4>
                  <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span>Tokens:</span>
                      <span style="font-weight: 600;">{searchResults.balance.tokens}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>NFTs:</span>
                      <span style="font-weight: 600;">{searchResults.balance.nfts}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction Analysis Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <h2 class="card-title">Transaction Analysis</h2>
            </div>
            <div class="card-content">
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value text-blue">{searchResults.transactions.total}</div>
                  <div class="metric-label">Total Transactions</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value text-green">
                    {searchResults.transactions.firstActivity ? 
                      new Date(searchResults.transactions.firstActivity).toLocaleDateString() : 'N/A'}
                  </div>
                  <div class="metric-label">First Activity</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value text-purple">
                    {searchResults.transactions.lastActivity ? 
                      new Date(searchResults.transactions.lastActivity).toLocaleDateString() : 'N/A'}
                  </div>
                  <div class="metric-label">Last Activity</div>
                </div>
              </div>
              
              {#if searchResults.transactions.recent.length > 0}
                <h4 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0; color: #374151;">Recent Transactions</h4>
                <div style="space-y: 12px;">
                  {#each searchResults.transactions.recent as tx}
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-weight: 600;">Type: Transaction</div>
                          <div style="font-size: 14px; color: #6b7280;">Signature: {tx.signature.substring(0, 8)}...{tx.signature.substring(-8)}</div>
                        </div>
                        <div style="text-align: right;">
                          <div style="font-weight: 600;">{tx.err ? 'Failed' : 'Success'}</div>
                          <div style="font-size: 14px; color: #6b7280;">
                            {tx.blockTime ? new Date(tx.blockTime).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <!-- Account Details & Security Analysis Cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div class="card">
              <div class="card-header">
                <svg class="icon text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h2 class="card-title">Account Details</h2>
              </div>
              <div class="card-content">
                <div style="space-y: 12px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #6b7280;">Owner:</span>
                    <span style="font-weight: 600;">{searchResults.account.owner.substring(0, 8)}...{searchResults.account.owner.substring(-8)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #6b7280;">Executable:</span>
                    <span style="font-weight: 600;">{searchResults.account.executable ? 'Yes' : 'No'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #6b7280;">Data Size:</span>
                    <span style="font-weight: 600;">{searchResults.account.dataSize} bytes</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #6b7280;">Rent Epoch:</span>
                    <span style="font-weight: 600;">{searchResults.account.rentEpoch}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <svg class="icon text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <h2 class="card-title">Security Analysis</h2>
              </div>
              <div class="card-content">
                <div style="space-y: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #6b7280;">Risk Level:</span>
                    <span style="font-weight: 600;" class="{getRiskColor(searchResults.risk.level)}">{searchResults.risk.level}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #6b7280;">Known Scam:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg class="icon text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span style="font-weight: 600; color: #059669;">No</span>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="color: #6b7280;">Suspicious Activity:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg class="icon text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span style="font-weight: 600; color: #059669;">None</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Analysis Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <h2 class="card-title">Risk Assessment</h2>
            </div>
            <div class="card-content">
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value text-yellow">{searchResults.risk.score}/10</div>
                  <div class="metric-label">Risk Score</div>
                </div>
                <div class="metric-card">
                  <div style="background: {getRiskBgColor(searchResults.risk.level)}; color: {getRiskColor(searchResults.risk.level)}; padding: 8px 16px; border-radius: 9999px; font-weight: bold; font-size: 18px;">{searchResults.risk.level}</div>
                  <div class="metric-label">Risk Level</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value text-green">{searchResults.communityData.trustScore}/10</div>
                  <div class="metric-label">Trust Score</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
                <div>
                  <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #374151;">Risk Factors</h4>
                  <div style="space-y: 8px;">
                    {#if searchResults.risk.factors.length > 0}
                      {#each searchResults.risk.factors as factor}
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                          <span>{factor.replace('_', ' ').charAt(0).toUpperCase() + factor.replace('_', ' ').slice(1)}:</span>
                          <span style="color: #d97706; font-weight: 600;">Detected</span>
                        </div>
                      {/each}
                    {:else}
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <span>Risk Factors:</span>
                        <span style="color: #059669; font-weight: 600;">None Detected</span>
                      </div>
                    {/if}
                  </div>
                </div>
                <div>
                  <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #374151;">Assessment</h4>
                  <div class="p-4 {getRiskBgColor(searchResults.risk.level)} rounded-lg">
                    <p class="text-sm">
                      {#if searchResults.risk.level === 'Low'}
                        This address appears to have low risk based on our analysis. Normal trading patterns detected.
                      {:else if searchResults.risk.level === 'Medium'}
                        This address shows some potential risk factors that warrant caution. Exercise normal due diligence.
                      {:else}
                        This address has multiple risk factors. Exercise extreme caution and conduct thorough research.
                      {/if}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Community Data Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h2 class="card-title">Community Data</h2>
            </div>
            <div class="card-content">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: #eef2ff; border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="color: #4f46e5; font-size: 24px; font-weight: bold;">{searchResults.communityData.mentions}</div>
                  <div style="color: #6b7280; font-size: 14px;">Community Mentions</div>
                </div>
                <div style="background: #eff6ff; border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="color: #2563eb; font-size: 24px; font-weight: bold;">{searchResults.communityData.sentiment}</div>
                  <div style="color: #6b7280; font-size: 14px;">Sentiment</div>
                </div>
                <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="color: #059669; font-size: 24px; font-weight: bold;">{searchResults.communityData.trustScore}/10</div>
                  <div style="color: #6b7280; font-size: 14px;">Community Trust</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Results Card -->
          <div class="card">
            <div class="card-header">
              <svg class="icon text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <h2 class="card-title">Share Analysis</h2>
            </div>
            <div class="card-content">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">Share Results</h3>
                  <p style="color: #6b7280;">Share this analysis with others or save for later reference</p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                  <button 
                    on:click={shareResults}
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                    Share
                  </button>
                  
                  <button 
                    on:click={() => copyToClipboard(window.location.href)}
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Welcome/Stats Section when no results -->
        <div class="results-section">
          <div class="text-center py-12">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Welcome to Hannisol</h3>
            <p class="text-lg text-gray-600 mb-8">Enter a Solana address above to begin comprehensive analysis</p>
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">{data.parent.stats.searches24h.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Searches Today</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{data.parent.stats.uniqueVisitors24h.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Active Users</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{data.parent.stats.totalSearches.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Total Searches</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">{data.parent.stats.uniqueAddresses.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Addresses Analyzed</div>
              </div>
            </div>
            
            <!-- Popular Addresses -->
            {#if data.popularAddresses.length > 0}
              <div class="mt-12">
                <h4 class="text-xl font-semibold text-gray-900 mb-6">Popular Addresses Today</h4>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {#each data.popularAddresses.slice(0, 6) as addr}
                    <button 
                      on:click={() => selectRecentSearch(addr.address)}
                      class="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
                    >
                      <div class="font-mono text-sm font-medium">{addr.address.substring(0, 16)}...</div>
                      <div class="text-xs text-gray-500 mt-1">{addr.searchCount} searches today</div>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Sidebar with Ad Banners -->
    <div class="sidebar">
      <div class="ad-banner">
        <div>
          <div style="font-size: 18px; margin-bottom: 8px;">🎯 A-ADS</div>
          <div>Crypto Ad Network</div>
          <div style="font-size: 12px; opacity: 0.7;">$0.50-$2.00 CPM</div>
        </div>
      </div>
      
      <div class="ad-banner">
        <div>
          <div style="font-size: 18px; margin-bottom: 8px;">💰 Coinzilla</div>
          <div>Premium Crypto Ads</div>
          <div style="font-size: 12px; opacity: 0.7;">$1-$5 CPM</div>
        </div>
      </div>
      
      <div class="ad-banner">
        <div>
          <div style="font-size: 18px; margin-bottom: 8px;">📱 Google AdSense</div>
          <div>Main Revenue Stream</div>
          <div style="font-size: 12px; opacity: 0.7;">$0.20-$2.00 CPC</div>
        </div>
      </div>
      
      <div class="ad-banner small">
        <div>
          <div style="font-size: 16px; margin-bottom: 4px;">🌐 Media.net</div>
          <div style="font-size: 14px;">Yahoo/Bing Network</div>
        </div>
      </div>
      
      <div class="ad-banner small">
        <div>
          <div style="font-size: 16px; margin-bottom: 4px;">🛒 Amazon Associates</div>
          <div style="font-size: 14px;">Security Hardware</div>
        </div>
      </div>
      
      <div class="ad-banner small">
        <div>
          <div style="font-size: 16px; margin-bottom: 4px;">🔐 Ledger Affiliate</div>
          <div style="font-size: 14px;">$20-$28 per sale</div>
        </div>
      </div>
      
      <!-- Popular Addresses in Sidebar -->
      {#if data.popularAddresses.length > 0 && !hasResults}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Trending Today</h3>
          <div class="space-y-3">
            {#each data.popularAddresses.slice(0, 5) as addr}
              <button 
                on:click={() => selectRecentSearch(addr.address)}
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="font-mono text-sm">{addr.address.substring(0, 12)}...</div>
                <div class="text-xs text-gray-500">{addr.searchCount} searches</div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Share Modal -->
{#if showShareModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">Share Results</h3>
          <button 
            on:click={() => showShareModal = false}
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Share URL</label>
            <div class="flex gap-2">
              <input 
                type="text" 
                value={shareUrl}
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button 
                on:click={() => copyToClipboard(shareUrl)}
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button 
              on:click={shareToTwitter}
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
              Twitter
            </button>
            
            <button 
              on:click={shareToTelegram}
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Times:wght@400;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .main-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }

  .content-area {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

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

  .header {
    background: white;
    color: #1f2937;
    padding: 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid #e5e7eb;
  }

  .logo-container {
    position: relative;
    z-index: 2;
    margin-bottom: 16px;
  }

  .logo {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 32px rgba(255, 215, 0, 0.3);
    border: 4px solid rgba(255, 255, 255, 0.2);
  }

  .logo-h {
    font-size: 48px;
    font-weight: bold;
    color: #000;
    position: relative;
  }

  .logo-h::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 8px;
    background: linear-gradient(90deg, #00bcd4 0%, #7933ff 100%);
  }

  .brand-name {
    font-family: "Times", "Georgia", serif;
    letter-spacing: 3px;
    font-weight: 400;
    font-size: 24px;
    color: #1f2937;
    margin-bottom: 12px;
    position: relative;
    z-index: 2;
  }

  .main-title {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    position: relative;
    z-index: 2;
    color: #111827;
  }

  .subtitle {
    font-size: 18px;
    opacity: 0.8;
    position: relative;
    z-index: 2;
    color: #374151;
  }

  .slogan {
    font-family: "Times", "Georgia", serif;
    font-style: italic;
    font-size: 16px;
    opacity: 0.7;
    margin-top: 12px;
    position: relative;
    z-index: 2;
    color: #6b7280;
  }

  .input-section {
    padding: 32px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }

  .input-container {
    display: flex;
    gap: 16px;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .address-input {
    flex: 1;
    padding: 16px 20px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease;
    background: #f9fafb;
  }

  .address-input:focus {
    border-color: #7c3aed;
    background: white;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
  }

  .check-btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  }

  .check-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
  }

  .check-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .results-section {
    padding: 32px;
  }

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

  .validation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .validation-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .text-green { color: #059669; }
  .text-blue { color: #2563eb; }
  .text-purple { color: #7c3aed; }
  .text-yellow { color: #d97706; }

  .success-banner {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    border: 1px solid #86efac;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #166534;
    font-weight: 600;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .metric-card {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border: 1px solid #e5e7eb;
  }

  .metric-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .metric-label {
    color: #6b7280;
    font-size: 14px;
  }

  @media (max-width: 1024px) {
    .main-container {
      grid-template-columns: 1fr;
    }
    
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
    .main-title {
      font-size: 36px;
    }
    
    .input-container {
      flex-direction: column;
    }
    
    .address-input {
      width: 100%;
    }
    
    .sidebar {
      grid-template-columns: 1fr;
    }
  }
</style>