<script>
	import { onMount } from 'svelte';
	
	export let searchData = [];
	export let loading = false;
	export let currentPage = 1;
	export let itemsPerPage = 10;
	export let totalItems = 0;
	
	let sortColumn = 'timestamp';
	let sortDirection = 'desc';
	let filterQuery = '';
	let selectedFilter = 'all';
	
	// Sample search data structure
	const sampleSearches = [
		{
			id: 1,
			ip_address: '192.168.1.100',
			solana_address: '5DF4DvKL8Z9V3RcB3gf3ZpG7H2M1N8K9P3Qc4R5T6Y',
			timestamp: '2024-06-02 14:30:25',
			country: 'United States',
			region: 'California',
			is_valid: true,
			balance: 1.25,
			token_count: 3,
			transaction_count: 158,
			user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
		},
		{
			id: 2,
			ip_address: '10.0.0.50',
			solana_address: '7GhI1jKlMnOpQ2RsT3UvW4XyZ5aB6cD9eF8gH1iJ2K',
			timestamp: '2024-06-02 14:25:18',
			country: 'United Kingdom',
			region: 'England',
			is_valid: true,
			balance: 0.85,
			token_count: 1,
			transaction_count: 45,
			user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
		},
		{
			id: 3,
			ip_address: '172.16.0.25',
			solana_address: 'invalid-address-format',
			timestamp: '2024-06-02 14:20:12',
			country: 'Germany',
			region: 'Bavaria',
			is_valid: false,
			balance: 0,
			token_count: 0,
			transaction_count: 0,
			user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
		}
	];
	
	$: displayData = searchData.length > 0 ? searchData : sampleSearches;
	$: filteredData = filterSearches(displayData);
	$: sortedData = sortSearches(filteredData);
	$: paginatedData = paginateData(sortedData);
	$: totalPages = Math.ceil(filteredData.length / itemsPerPage);
	
	function filterSearches(data) {
		let filtered = data;
		
		// Apply text filter
		if (filterQuery.trim()) {
			const query = filterQuery.toLowerCase();
			filtered = filtered.filter(search => 
				search.solana_address.toLowerCase().includes(query) ||
				search.ip_address.includes(query) ||
				search.country.toLowerCase().includes(query) ||
				search.region.toLowerCase().includes(query)
			);
		}
		
		// Apply status filter
		if (selectedFilter === 'valid') {
			filtered = filtered.filter(search => search.is_valid);
		} else if (selectedFilter === 'invalid') {
			filtered = filtered.filter(search => !search.is_valid);
		}
		
		return filtered;
	}
	
	function sortSearches(data) {
		return [...data].sort((a, b) => {
			let aVal = a[sortColumn];
			let bVal = b[sortColumn];
			
			// Handle different data types
			if (typeof aVal === 'string') {
				aVal = aVal.toLowerCase();
				bVal = bVal.toLowerCase();
			}
			
			if (sortDirection === 'asc') {
				return aVal > bVal ? 1 : -1;
			} else {
				return aVal < bVal ? 1 : -1;
			}
		});
	}
	
	function paginateData(data) {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return data.slice(start, end);
	}
	
	function handleSort(column) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}
	}
	
	function changePage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
	
	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleString();
	}
	
	function formatAddress(address) {
		if (address.length > 20) {
			return address.substring(0, 10) + '...' + address.substring(address.length - 10);
		}
		return address;
	}
	
	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => {
			// Show success message
			console.log('Copied to clipboard:', text);
		});
	}
	
	function exportToCSV() {
		const headers = ['ID', 'IP Address', 'Solana Address', 'Timestamp', 'Country', 'Region', 'Valid', 'Balance', 'Tokens', 'Transactions'];
		const csvData = [
			headers.join(','),
			...filteredData.map(row => [
				row.id,
				row.ip_address,
				row.solana_address,
				row.timestamp,
				row.country,
				row.region,
				row.is_valid,
				row.balance,
				row.token_count,
				row.transaction_count
			].join(','))
		].join('\n');
		
		const blob = new Blob([csvData], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `hannisol-searches-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="search-table">
	<div class="table-header">
		<div class="header-left">
			<h3 class="table-title">Search History</h3>
			<div class="table-count">
				{filteredData.length.toLocaleString()} searches
			</div>
		</div>
		<div class="header-right">
			<button class="export-btn" on:click={exportToCSV}>
				<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
				Export CSV
			</button>
		</div>
	</div>
	
	<!-- Filters -->
	<div class="table-filters">
		<div class="filter-group">
			<input 
				type="text" 
				class="filter-input"
				placeholder="Search addresses, IPs, countries..."
				bind:value={filterQuery}
			/>
		</div>
		<div class="filter-group">
			<select class="filter-select" bind:value={selectedFilter}>
				<option value="all">All Searches</option>
				<option value="valid">Valid Only</option>
				<option value="invalid">Invalid Only</option>
			</select>
		</div>
	</div>
	
	<!-- Table -->
	<div class="table-container">
		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading search data...</p>
			</div>
		{:else}
			<table class="data-table">
				<thead>
					<tr>
						<th class="sortable" on:click={() => handleSort('timestamp')}>
							Timestamp
							{#if sortColumn === 'timestamp'}
								<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th>IP Address</th>
						<th>Solana Address</th>
						<th>Location</th>
						<th class="sortable" on:click={() => handleSort('is_valid')}>
							Status
							{#if sortColumn === 'is_valid'}
								<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th class="sortable" on:click={() => handleSort('balance')}>
							Balance
							{#if sortColumn === 'balance'}
								<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody>
					{#each paginatedData as search}
						<tr class="table-row">
							<td class="timestamp-cell">
								{formatDate(search.timestamp)}
							</td>
							<td class="ip-cell">
								<span class="ip-address" on:click={() => copyToClipboard(search.ip_address)}>
									{search.ip_address}
								</span>
							</td>
							<td class="address-cell">
								<div class="address-container">
									<span 
										class="solana-address" 
										title={search.solana_address}
										on:click={() => copyToClipboard(search.solana_address)}
									>
										{formatAddress(search.solana_address)}
									</span>
									<button class="copy-btn" on:click={() => copyToClipboard(search.solana_address)}>
										<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
										</svg>
									</button>
								</div>
							</td>
							<td class="location-cell">
								<div class="location-info">
									<div class="country">{search.country}</div>
									<div class="region">{search.region}</div>
								</div>
							</td>
							<td class="status-cell">
								<span class="status-badge {search.is_valid ? 'valid' : 'invalid'}">
									{search.is_valid ? 'Valid' : 'Invalid'}
								</span>
							</td>
							<td class="balance-cell">
								{#if search.is_valid}
									<div class="balance-info">
										<div class="balance-amount">{search.balance} SOL</div>
										<div class="token-count">{search.token_count} tokens</div>
									</div>
								{:else}
									<span class="no-data">—</span>
								{/if}
							</td>
							<td class="details-cell">
								{#if search.is_valid}
									<div class="details-info">
										<div class="tx-count">{search.transaction_count} TXs</div>
									</div>
								{:else}
									<span class="no-data">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
	
	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="pagination">
			<button 
				class="page-btn" 
				disabled={currentPage === 1}
				on:click={() => changePage(currentPage - 1)}
			>
				Previous
			</button>
			
			{#each Array(Math.min(5, totalPages)) as _, i}
				{@const page = Math.max(1, currentPage - 2) + i}
				{#if page <= totalPages}
					<button 
						class="page-btn {page === currentPage ? 'active' : ''}"
						on:click={() => changePage(page)}
					>
						{page}
					</button>
				{/if}
			{/each}
			
			<button 
				class="page-btn" 
				disabled={currentPage === totalPages}
				on:click={() => changePage(currentPage + 1)}
			>
				Next
			</button>
		</div>
	{/if}
</div>

<style>
	.search-table {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.table-header {
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
		gap: 16px;
	}

	.table-title {
		font-size: 20px;
		font-weight: bold;
		color: #1f2937;
		margin: 0;
	}

	.table-count {
		background: #e0e7ff;
		color: #3730a3;
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
	}

	.export-btn {
		background: #2563eb;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: background 0.3s ease;
	}

	.export-btn:hover {
		background: #1d4ed8;
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	.table-filters {
		padding: 16px 24px;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.filter-group {
		flex: 1;
	}

	.filter-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.3s ease;
	}

	.filter-input:focus {
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.filter-select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		outline: none;
		background: white;
		cursor: pointer;
	}

	.table-container {
		overflow-x: auto;
	}

	.loading-state {
		padding: 40px;
		text-align: center;
		color: #6b7280;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #f3f4f6;
		border-top: 3px solid #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 16px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		background: #f9fafb;
		padding: 12px 16px;
		text-align: left;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
		white-space: nowrap;
	}

	.data-table th.sortable {
		cursor: pointer;
		user-select: none;
		transition: background 0.3s ease;
	}

	.data-table th.sortable:hover {
		background: #f3f4f6;
	}

	.sort-indicator {
		margin-left: 4px;
		color: #2563eb;
	}

	.data-table td {
		padding: 12px 16px;
		border-bottom: 1px solid #f3f4f6;
		vertical-align: top;
	}

	.table-row:hover {
		background: #f8fafc;
	}

	.timestamp-cell {
		font-size: 13px;
		color: #6b7280;
		min-width: 140px;
	}

	.ip-address {
		font-family: monospace;
		cursor: pointer;
		color: #2563eb;
		transition: color 0.3s ease;
	}

	.ip-address:hover {
		color: #1d4ed8;
		text-decoration: underline;
	}

	.address-container {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.solana-address {
		font-family: monospace;
		cursor: pointer;
		color: #7c3aed;
		transition: color 0.3s ease;
	}

	.solana-address:hover {
		color: #6d28d9;
		text-decoration: underline;
	}

	.copy-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 2px;
		border-radius: 3px;
		transition: all 0.3s ease;
	}

	.copy-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.location-info {
		font-size: 13px;
	}

	.country {
		font-weight: 600;
		color: #1f2937;
	}

	.region {
		color: #6b7280;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.valid {
		background: #dcfce7;
		color: #166534;
	}

	.status-badge.invalid {
		background: #fee2e2;
		color: #991b1b;
	}

	.balance-info {
		font-size: 13px;
	}

	.balance-amount {
		font-weight: 600;
		color: #1f2937;
	}

	.token-count {
		color: #6b7280;
	}

	.details-info {
		font-size: 13px;
	}

	.tx-count {
		color: #6b7280;
	}

	.no-data {
		color: #9ca3af;
		font-style: italic;
	}

	.pagination {
		padding: 16px 24px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		border-top: 1px solid #f3f4f6;
	}

	.page-btn {
		padding: 6px 12px;
		border: 1px solid #d1d5db;
		background: white;
		color: #374151;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.3s ease;
	}

	.page-btn:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #2563eb;
	}

	.page-btn.active {
		background: #2563eb;
		color: white;
		border-color: #2563eb;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.table-header {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}
		
		.table-filters {
			flex-direction: column;
		}
		
		.data-table {
			font-size: 12px;
		}
		
		.data-table th,
		.data-table td {
			padding: 8px;
		}
	}
</style>