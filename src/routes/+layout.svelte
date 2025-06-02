<script>
	import '../app.css';
</script>

<main class="main-container">
	<slot />
</main>

<style>
	.main-container {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 24px;
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
	}

	@media (max-width: 1024px) {
		.main-container {
			grid-template-columns: 1fr;
		}
	}
</style>