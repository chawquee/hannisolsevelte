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

<style>
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

	@media (max-width: 768px) {
		.main-title {
			font-size: 36px;
		}
	}
</style>