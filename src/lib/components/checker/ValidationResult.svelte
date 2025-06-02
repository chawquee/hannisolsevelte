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
				<span><strong>Format:</strong> Base58</span>
			</div>
			<div class="validation-item">
				<span><strong>Length:</strong> 44 characters</span>
			</div>
			<div class="validation-item">
				<span><strong>Type:</strong> Nonce Account</span>
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

<style>
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

	.text-green { 
		color: #059669; 
	}

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
</style>