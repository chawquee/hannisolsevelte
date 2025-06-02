<script>
	import Header from '$lib/components/layout/Header.svelte';
	import AddressInput from '$lib/components/checker/AddressInput.svelte';
	import ValidationResult from '$lib/components/checker/ValidationResult.svelte';
	import BalanceDisplay from '$lib/components/checker/BalanceDisplay.svelte';
	import TransactionHistory from '$lib/components/checker/TransactionHistory.svelte';
	import AdSidebar from '$lib/components/ads/AdSidebar.svelte';
</script>

<!-- Main Content Area -->
<div class="content-area">
	<Header />
	<AddressInput />
	
	<!-- Results Section -->
	<div class="results-section">
		<ValidationResult />
		<BalanceDisplay />
		<TransactionHistory />
	</div>
</div>

<!-- Sidebar -->
<AdSidebar />

<style>
	.content-area {
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.results-section {
		padding: 32px;
	}
</style>