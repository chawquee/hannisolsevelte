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
				<div class="metric-value text-blue">158</div>
				<div class="metric-label">Total Transactions</div>
			</div>
			<div class="metric-card">
				<div class="metric-value text-green">2021/08/31</div>
				<div class="metric-label">First Activity</div>
			</div>
			<div class="metric-card">
				<div class="metric-value text-purple">2024/12/30</div>
				<div class="metric-label">Last Activity</div>
			</div>
		</div>
		
		<h4 class="transactions-title">Recent Transactions</h4>
		<div class="transactions-list">
			<div class="transaction-item">
				<div>
					<div class="transaction-type">Type: Transfer</div>
					<div class="transaction-signature">Signature: 5DF4D...3RcB3gf3Z</div>
				</div>
				<div class="transaction-details">
					<div class="transaction-amount">0.1 SOL</div>
					<div class="transaction-time">2 hours ago</div>
				</div>
			</div>
			<div class="transaction-item">
				<div>
					<div class="transaction-type">Type: Transfer</div>
					<div class="transaction-signature">Signature: 5DF4D...3RcB3gf3Z</div>
				</div>
				<div class="transaction-details">
					<div class="transaction-amount">0.1 SOL</div>
					<div class="transaction-time">4 hours ago</div>
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

	.transactions-title {
		font-size: 18px;
		font-weight: 600;
		margin: 24px 0 16px 0;
		color: #374151;
	}

	.transactions-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.transaction-item {
		background: #f9fafb;
		padding: 16px;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.transaction-type {
		font-weight: 600;
	}

	.transaction-signature {
		font-size: 14px;
		color: #6b7280;
	}

	.transaction-details {
		text-align: right;
	}

	.transaction-amount {
		font-weight: 600;
	}

	.transaction-time {
		font-size: 14px;
		color: #6b7280;
	}

	.icon {
		width: 20px;
		height: 20px;
	}

	.text-blue { color: #2563eb; }
	.text-green { color: #059669; }
	.text-purple { color: #7c3aed; }
</style>