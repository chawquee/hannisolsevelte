<div class="card">
	<div class="card-header">
		<svg class="icon text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
		</svg>
		<h2 class="card-title">Balance & Holdings</h2>
	</div>
	<div class="card-content">
		<div class="balance-grid">
			<div>
				<h4 class="balance-title">SOL Balance</h4>
				<div class="balance-card">
					<div class="balance-amount">1.25 SOL</div>
					<div class="balance-usd">$24.75 USD</div>
				</div>
			</div>
			<div>
				<h4 class="balance-title">Token Holdings</h4>
				<div class="balance-card">
					<div class="token-row">
						<span>Tokens:</span>
						<span class="token-count">3</span>
					</div>
					<div class="token-row">
						<span>NFTs:</span>
						<span class="token-count">0</span>
					</div>
				</div>
			</div>
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

	.balance-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-bottom: 20px;
	}

	.balance-title {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
		color: #374151;
	}

	.balance-card {
		background: #f8fafc;
		padding: 16px;
		border-radius: 8px;
	}

	.balance-amount {
		font-size: 24px;
		font-weight: bold;
		color: #7c3aed;
	}

	.balance-usd {
		color: #6b7280;
		font-size: 16px;
	}

	.token-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.token-count {
		font-weight: 600;
	}

	.icon {
		width: 20px;
		height: 20px;
	}

	.text-blue { 
		color: #2563eb; 
	}
</style>