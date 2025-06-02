<script>
	let addressValue = '';

	function checkAddress() {
		console.log('Checking address:', addressValue);
		// Address checking logic will go here
	}
</script>

<div class="input-section">
	<div class="input-container">
		<input 
			type="text" 
			class="address-input" 
			placeholder="Enter Solana address to analyze... (e.g., 5DF4D...3RcB3gf3Z)"
			bind:value={addressValue}
		/>
		<button class="check-btn" on:click={checkAddress}>
			<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
			</svg>
			Check Address
		</button>
	</div>
</div>

<style>
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

	.icon {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 768px) {
		.input-container {
			flex-direction: column;
		}
		
		.address-input {
			width: 100%;
		}
	}
</style>