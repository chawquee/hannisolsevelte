<script>
	export let address = '';
	export let resultData = null;
	export let shareId = null;
	
	let shareUrl = '';
	let copied = false;
	let showShareModal = false;

	// Generate shareable URL
	$: if (address && resultData) {
		shareUrl = `${window?.location?.origin || 'https://hannisol.com'}/share/${generateShareId()}`;
	}

	function generateShareId() {
		if (shareId) return shareId;
		// Generate a unique share ID (in production, save to database)
		return btoa(address + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
	}

	function shareTwitter() {
		const text = `🏛️ Checked this Solana address with Hannisol: ${address.substring(0, 8)}...${address.substring(-8)} 
		
✅ Status: ${resultData?.validation?.isValid ? 'Valid' : 'Invalid'}
💰 Balance: ${resultData?.accountInfo?.balance || 0} SOL
🔍 Risk Level: ${resultData?.riskAnalysis?.level || 'Unknown'}

#Solana #Crypto #DeFi #Security`;
		
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=Hannisol,SolanaAnalysis`;
		window.open(url, '_blank', 'width=600,height=400');
		trackShare('twitter');
	}

	function shareTelegram() {
		const text = `🏛️ Solana Address Analysis Results:

📍 Address: ${address.substring(0, 12)}...${address.substring(-12)}
✅ Status: ${resultData?.validation?.isValid ? 'Valid' : 'Invalid'}
💰 Balance: ${resultData?.accountInfo?.balance || 0} SOL
🔍 Risk Assessment: ${resultData?.riskAnalysis?.level || 'Unknown'}

🔗 Full Report: ${shareUrl}

Analyzed with Hannisol - "Navigating Crypto Like Hannibal Crossed the Alps"`;

		const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
		window.open(telegramUrl, '_blank');
		trackShare('telegram');
	}

	function shareWhatsApp() {
		const text = `🏛️ *Solana Address Analysis*

Address: \`${address.substring(0, 10)}...${address.substring(-10)}\`
Status: ${resultData?.validation?.isValid ? '✅ Valid' : '❌ Invalid'}
Balance: ${resultData?.accountInfo?.balance || 0} SOL
Risk Level: ${resultData?.riskAnalysis?.level || 'Unknown'}

Full analysis: ${shareUrl}

_Analyzed with Hannisol_`;

		const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
		window.open(whatsappUrl, '_blank');
		trackShare('whatsapp');
	}

	function shareDiscord() {
		const discordText = `🏛️ **Hannisol Solana Analysis Report**

**Address:** \`${address}\`
**Status:** ${resultData?.validation?.isValid ? '✅ Valid' : '❌ Invalid'}
**Balance:** ${resultData?.accountInfo?.balance || 0} SOL
**Risk Level:** ${resultData?.riskAnalysis?.level || 'Unknown'}

📊 **Full Analysis:** ${shareUrl}

*"Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps"*`;

		copyToClipboard(discordText);
		showNotification('Discord message copied! Paste it in your Discord channel.');
		trackShare('discord');
	}

	function shareReddit() {
		const title = `Solana Address Analysis: ${address.substring(0, 8)}...${address.substring(-8)} - ${resultData?.validation?.isValid ? 'Valid' : 'Invalid'}`;
		const text = `I just analyzed this Solana address using Hannisol and wanted to share the results:

**Address:** ${address}
**Status:** ${resultData?.validation?.isValid ? 'Valid ✅' : 'Invalid ❌'}
**Balance:** ${resultData?.accountInfo?.balance || 0} SOL
**Risk Assessment:** ${resultData?.riskAnalysis?.level || 'Unknown'}

**Full Analysis Report:** ${shareUrl}

Hannisol provides comprehensive Solana address validation, risk analysis, and security insights. Pretty useful tool for DYOR!`;

		const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
		window.open(redditUrl, '_blank');
		trackShare('reddit');
	}

	function copyLink() {
		copyToClipboard(shareUrl);
		showNotification('Share link copied to clipboard!');
		trackShare('copy_link');
	}

	function copyResults() {
		const formattedResults = `🏛️ HANNISOL SOLANA ADDRESS ANALYSIS

📍 Address: ${address}
📅 Analysis Date: ${new Date().toLocaleString()}

✅ VALIDATION RESULTS:
- Status: ${resultData?.validation?.isValid ? 'Valid' : 'Invalid'}
- Format: ${resultData?.validation?.format || 'Unknown'}
- Length: ${resultData?.validation?.length || 0} characters

💰 BALANCE & HOLDINGS:
- SOL Balance: ${resultData?.accountInfo?.balance || 0} SOL
- Token Count: ${resultData?.accountInfo?.tokenCount || 0}
- NFT Count: ${resultData?.accountInfo?.nftCount || 0}

📊 TRANSACTION ANALYSIS:
- Total Transactions: ${resultData?.accountInfo?.transactionCount || 0}
- Activity Level: ${getActivityLevel(resultData?.accountInfo?.transactionCount || 0)}

🔍 RISK ASSESSMENT:
- Risk Score: ${resultData?.riskAnalysis?.score || 'N/A'}/100
- Risk Level: ${resultData?.riskAnalysis?.level || 'Unknown'}
- Security Status: ${getSecurityStatus(resultData?.riskAnalysis?.score || 0)}

🔗 Full Report: ${shareUrl}

"Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps"`;

		copyToClipboard(formattedResults);
		showNotification('Analysis results copied to clipboard!');
		trackShare('copy_results');
	}

	function copyToClipboard(text) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(() => {
				copied = true;
				setTimeout(() => copied = false, 2000);
			});
		} else {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}

	function downloadReport() {
		const reportData = {
			analysis: {
				address,
				timestamp: new Date().toISOString(),
				...resultData
			},
			metadata: {
				analyzedBy: 'Hannisol',
				version: '1.0.0',
				shareUrl
			}
		};
		
		const dataStr = JSON.stringify(reportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		
		const link = document.createElement('a');
		link.href = URL.createObjectURL(dataBlob);
		link.download = `hannisol-analysis-${address.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
		link.click();
		
		trackShare('download');
	}

	function generateQRCode() {
		// Simple QR code generation (in production, use a proper QR library)
		const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
		window.open(qrUrl, '_blank');
		trackShare('qr_code');
	}

	function showNotification(message) {
		// Simple notification system
		const notification = document.createElement('div');
		notification.textContent = message;
		notification.style.cssText = `
			position: fixed; top: 20px; right: 20px; z-index: 1000;
			background: #059669; color: white; padding: 12px 20px;
			border-radius: 8px; font-weight: 600; font-size: 14px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.2);
			animation: slideIn 0.3s ease;
		`;
		
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.remove();
		}, 3000);
	}

	function trackShare(platform) {
		// Analytics tracking
		console.log('Share tracked:', { platform, address: address.substring(0, 8) + '...' });
		
		fetch('/api/analytics/share', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				platform,
				address,
				shareId: generateShareId(),
				timestamp: Date.now()
			})
		}).catch(err => console.log('Share tracking failed:', err));
	}

	function getActivityLevel(txCount) {
		if (txCount > 1000) return 'Very High';
		if (txCount > 500) return 'High';
		if (txCount > 100) return 'Medium';
		if (txCount > 10) return 'Low';
		return 'Very Low';
	}

	function getSecurityStatus(score) {
		if (score >= 80) return 'Excellent';
		if (score >= 60) return 'Good';
		if (score >= 40) return 'Fair';
		return 'Poor';
	}
</script>

{#if address && resultData}
	<div class="share-section">
		<div class="share-header">
			<h3 class="share-title">
				<svg class="share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
				</svg>
				Share Analysis Results
			</h3>
			<button class="expand-btn" on:click={() => showShareModal = !showShareModal}>
				{showShareModal ? 'Show Less' : 'Show More'}
			</button>
		</div>
		
		<!-- Primary Share Buttons -->
		<div class="share-buttons-primary">
			<button class="share-btn twitter" on:click={shareTwitter}>
				<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
				</svg>
				Twitter
			</button>

			<button class="share-btn telegram" on:click={shareTelegram}>
				<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
				</svg>
				Telegram
			</button>

			<button class="share-btn copy" on:click={copyLink}>
				<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
				</svg>
				{copied ? 'Copied!' : 'Copy Link'}
			</button>
		</div>

		{#if showShareModal}
			<!-- Extended Share Options -->
			<div class="share-extended">
				<div class="share-row">
					<h4 class="row-title">Social Platforms</h4>
					<div class="share-buttons-row">
						<button class="share-btn-small whatsapp" on:click={shareWhatsApp}>
							<span class="btn-emoji">💬</span>
							WhatsApp
						</button>
						
						<button class="share-btn-small discord" on:click={shareDiscord}>
							<span class="btn-emoji">🎮</span>
							Discord
						</button>
						
						<button class="share-btn-small reddit" on:click={shareReddit}>
							<span class="btn-emoji">🤖</span>
							Reddit
						</button>
					</div>
				</div>

				<div class="share-row">
					<h4 class="row-title">Export Options</h4>
					<div class="share-buttons-row">
						<button class="share-btn-small download" on:click={downloadReport}>
							<span class="btn-emoji">📄</span>
							Download JSON
						</button>
						
						<button class="share-btn-small copy-results" on:click={copyResults}>
							<span class="btn-emoji">📋</span>
							Copy Results
						</button>
						
						<button class="share-btn-small qr" on:click={generateQRCode}>
							<span class="btn-emoji">📱</span>
							QR Code
						</button>
					</div>
				</div>

				<!-- Share URL Display -->
				<div class="share-url-section">
					<label for="share-url" class="url-label">Share URL:</label>
					<div class="url-container">
						<input 
							id="share-url"
							type="text" 
							class="url-input" 
							value={shareUrl} 
							readonly 
						/>
						<button class="url-copy-btn" on:click={copyLink}>
							<svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.share-section {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border-radius: 16px;
		padding: 24px;
		margin: 24px 0;
		border: 1px solid #0ea5e9;
	}

	.share-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.share-title {
		color: #0c4a6e;
		font-weight: bold;
		margin: 0;
		font-size: 18px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.share-icon {
		width: 20px;
		height: 20px;
	}

	.expand-btn {
		background: #0ea5e9;
		color: white;
		border: none;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.expand-btn:hover {
		background: #0284c7;
	}

	.share-buttons-primary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 12px;
		margin-bottom: 16px;
	}

	.share-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
		text-decoration: none;
		justify-content: center;
		font-size: 14px;
	}

	.share-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.share-btn.twitter {
		background: #1DA1F2;
	}

	.share-btn.telegram {
		background: #0088cc;
	}

	.share-btn.copy {
		background: #6b7280;
	}

	.share-btn.copy:hover {
		background: #4b5563;
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	.share-extended {
		border-top: 1px solid #bae6fd;
		padding-top: 20px;
		margin-top: 16px;
	}

	.share-row {
		margin-bottom: 20px;
	}

	.row-title {
		font-size: 14px;
		font-weight: 600;
		color: #0c4a6e;
		margin-bottom: 8px;
	}

	.share-buttons-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.share-btn-small {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: white;
		border: 1px solid #bae6fd;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		color: #0c4a6e;
	}

	.share-btn-small:hover {
		background: #f0f9ff;
		border-color: #0ea5e9;
		transform: translateY(-1px);
	}

	.btn-emoji {
		font-size: 14px;
	}

	.share-url-section {
		background: rgba(255, 255, 255, 0.8);
		padding: 16px;
		border-radius: 8px;
		border: 1px solid #bae6fd;
	}

	.url-label {
		display: block;
		font-weight: 600;
		color: #0c4a6e;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.url-container {
		display: flex;
		gap: 8px;
	}

	.url-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #bae6fd;
		border-radius: 6px;
		background: white;
		font-size: 14px;
		color: #374151;
		font-family: monospace;
	}

	.url-copy-btn {
		padding: 8px;
		background: #0ea5e9;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.url-copy-btn:hover {
		background: #0284c7;
	}

	.copy-icon {
		width: 16px;
		height: 16px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.share-buttons-primary {
			grid-template-columns: 1fr;
		}
		
		.share-buttons-row {
			flex-direction: column;
		}
		
		.url-container {
			flex-direction: column;
		}
		
		.share-header {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>