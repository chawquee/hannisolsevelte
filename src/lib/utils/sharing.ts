import { browser } from '$app/environment';
import type { SearchResult } from '$lib/types/solana';

// Sharing platform configurations
const SHARING_PLATFORMS = {
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    baseUrl: 'https://twitter.com/intent/tweet',
    color: '#1da1f2'
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    baseUrl: 'https://t.me/share/url',
    color: '#0088cc'
  },
  discord: {
    name: 'Discord',
    icon: '💬',
    baseUrl: 'https://discord.com/channels/@me',
    color: '#5865f2'
  },
  reddit: {
    name: 'Reddit',
    icon: '📱',
    baseUrl: 'https://reddit.com/submit',
    color: '#ff4500'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    baseUrl: 'https://www.linkedin.com/sharing/share-offsite',
    color: '#0077b5'
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
    color: '#1877f2'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💚',
    baseUrl: 'https://wa.me',
    color: '#25d366'
  },
  email: {
    name: 'Email',
    icon: '📧',
    baseUrl: 'mailto:',
    color: '#6b7280'
  }
};

// Share data interface
export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: string;
  hashtags?: string[];
  via?: string;
}

export interface ShareOptions {
  platform: keyof typeof SHARING_PLATFORMS;
  data: ShareData;
  width?: number;
  height?: number;
  openInNewWindow?: boolean;
}

export interface ShareResult {
  success: boolean;
  platform: string;
  error?: string;
  shareId?: string;
}

// Generate share content for Solana address results
export const contentGenerator = {
  // Generate share content for address analysis
  generateAddressShare(address: string, result: SearchResult): ShareData {
    const shortAddress = this.shortenAddress(address);
    const riskLevel = result.riskAnalysis.riskLevel;
    const solBalance = result.solBalance.sol.toFixed(2);
    
    const title = `🔍 Hannisol Solana Address Analysis - ${shortAddress}`;
    
    let text = `Check out this Solana address analysis:\n\n`;
    text += `📍 Address: ${shortAddress}\n`;
    text += `💰 SOL Balance: ${solBalance} SOL\n`;
    text += `🛡️ Risk Level: ${this.formatRiskLevel(riskLevel)}\n`;
    text += `🪙 Tokens: ${result.balances.length}\n`;
    
    if (result.transactions.length > 0) {
      text += `📊 Transactions: ${result.transactions.length}\n`;
    }
    
    text += `\nAnalyzed with Hannisol - Solana Address Checker`;

    return {
      title,
      text,
      url: window.location.href,
      hashtags: ['Solana', 'Crypto', 'Blockchain', 'Analysis', 'Hannisol'],
      via: 'HannisolChecker'
    };
  },

  // Generate share content for risk analysis
  generateRiskShare(address: string, riskAnalysis: any): ShareData {
    const shortAddress = this.shortenAddress(address);
    const riskLevel = riskAnalysis.riskLevel;
    const score = riskAnalysis.overallScore;
    
    const title = `⚠️ Solana Address Risk Analysis - ${shortAddress}`;
    
    let text = `🛡️ Solana Security Check Results:\n\n`;
    text += `📍 Address: ${shortAddress}\n`;
    text += `📊 Risk Score: ${score}/100\n`;
    text += `🚨 Risk Level: ${this.formatRiskLevel(riskLevel)}\n`;
    
    if (riskAnalysis.isKnownScam) {
      text += `⚠️ Known Scam: Yes\n`;
    }
    
    text += `\n🔍 Stay safe with Hannisol address checker`;

    return {
      title,
      text,
      url: window.location.href,
      hashtags: ['SolanaSecurity', 'CryptoSafety', 'ScamAlert', 'Hannisol'],
      via: 'HannisolChecker'
    };
  },

  // Generate community-focused share content
  generateCommunityShare(address: string, communityData: any): ShareData {
    const shortAddress = this.shortenAddress(address);
    
    const title = `🌟 Solana Community Analysis - ${shortAddress}`;
    
    let text = `📈 Solana Community Insights:\n\n`;
    text += `📍 Address: ${shortAddress}\n`;
    text += `👥 Community Size: ${this.formatNumber(communityData.communitySize)}\n`;
    text += `💬 Engagement: ${communityData.engagementRate}%\n`;
    text += `📊 Social Score: ${communityData.socialScore}/100\n`;
    text += `😊 Sentiment: ${this.formatSentiment(communityData.sentiment)}\n`;
    
    text += `\n🚀 Discover more with Hannisol`;

    return {
      title,
      text,
      url: window.location.href,
      hashtags: ['SolanaCommunity', 'CryptoAnalytics', 'Blockchain', 'Hannisol'],
      via: 'HannisolChecker'
    };
  },

  // Utility functions
  shortenAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  },

  formatRiskLevel(level: string): string {
    const levels: Record<string, string> = {
      low: '🟢 Low',
      medium: '🟡 Medium',
      high: '🔴 High',
      critical: '⛔ Critical'
    };
    return levels[level] || level;
  },

  formatSentiment(sentiment: string): string {
    const sentiments: Record<string, string> = {
      positive: '😊 Positive',
      neutral: '😐 Neutral',
      negative: '😞 Negative'
    };
    return sentiments[sentiment] || sentiment;
  },

  formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  }
};

// Platform-specific sharing functions
export const platformShares = {
  // Share to Twitter
  twitter(data: ShareData): string {
    const params = new URLSearchParams({
      text: data.text,
      url: data.url
    });

    if (data.hashtags) {
      params.append('hashtags', data.hashtags.join(','));
    }

    if (data.via) {
      params.append('via', data.via);
    }

    return `${SHARING_PLATFORMS.twitter.baseUrl}?${params}`;
  },

  // Share to Telegram
  telegram(data: ShareData): string {
    const params = new URLSearchParams({
      url: data.url,
      text: data.text
    });

    return `${SHARING_PLATFORMS.telegram.baseUrl}?${params}`;
  },

  // Share to Reddit
  reddit(data: ShareData): string {
    const params = new URLSearchParams({
      url: data.url,
      title: data.title,
      text: data.text
    });

    return `${SHARING_PLATFORMS.reddit.baseUrl}?${params}`;
  },

  // Share to LinkedIn
  linkedin(data: ShareData): string {
    const params = new URLSearchParams({
      url: data.url,
      title: data.title,
      summary: data.text
    });

    return `${SHARING_PLATFORMS.linkedin.baseUrl}?${params}`;
  },

  // Share to Facebook
  facebook(data: ShareData): string {
    const params = new URLSearchParams({
      u: data.url,
      quote: data.text
    });

    return `${SHARING_PLATFORMS.facebook.baseUrl}?${params}`;
  },

  // Share to WhatsApp
  whatsapp(data: ShareData): string {
    const message = `${data.text}\n\n${data.url}`;
    return `${SHARING_PLATFORMS.whatsapp.baseUrl}?text=${encodeURIComponent(message)}`;
  },

  // Share via Email
  email(data: ShareData): string {
    const params = new URLSearchParams({
      subject: data.title,
      body: `${data.text}\n\n${data.url}`
    });

    return `${SHARING_PLATFORMS.email.baseUrl}?${params}`;
  },

  // Copy to clipboard
  async clipboard(data: ShareData): Promise<boolean> {
    if (!browser || !navigator.clipboard) {
      return false;
    }

    try {
      const content = `${data.title}\n\n${data.text}\n\n${data.url}`;
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
};

// Main sharing service
export const sharingService = {
  // Share to specific platform
  async share(options: ShareOptions): Promise<ShareResult> {
    const { platform, data, width = 600, height = 400, openInNewWindow = true } = options;

    try {
      // Handle special cases
      if (platform === 'email') {
        window.location.href = platformShares.email(data);
        return { success: true, platform };
      }

      // Handle clipboard
      if (platform === 'clipboard') {
        const success = await platformShares.clipboard(data);
        return { success, platform, error: success ? undefined : 'Clipboard not supported' };
      }

      // Handle Discord (special case - copy link)
      if (platform === 'discord') {
        const success = await platformShares.clipboard({
          ...data,
          text: `${data.text}\n\n${data.url}`
        });
        return { 
          success, 
          platform, 
          error: success ? undefined : 'Failed to copy Discord share link' 
        };
      }

      // Get platform share URL
      const shareUrl = this.getPlatformUrl(platform, data);
      
      if (openInNewWindow && browser) {
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        window.open(
          shareUrl,
          `share_${platform}`,
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
      } else if (browser) {
        window.open(shareUrl, '_blank');
      }

      return { success: true, platform };
    } catch (error) {
      console.error(`Failed to share to ${platform}:`, error);
      return { 
        success: false, 
        platform, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Get platform share URL
  getPlatformUrl(platform: keyof typeof SHARING_PLATFORMS, data: ShareData): string {
    switch (platform) {
      case 'twitter':
        return platformShares.twitter(data);
      case 'telegram':
        return platformShares.telegram(data);
      case 'reddit':
        return platformShares.reddit(data);
      case 'linkedin':
        return platformShares.linkedin(data);
      case 'facebook':
        return platformShares.facebook(data);
      case 'whatsapp':
        return platformShares.whatsapp(data);
      case 'email':
        return platformShares.email(data);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  },

  // Check if Web Share API is supported
  isNativeShareSupported(): boolean {
    return browser && 'share' in navigator;
  },

  // Use native Web Share API if available
  async nativeShare(data: ShareData): Promise<ShareResult> {
    if (!this.isNativeShareSupported()) {
      return { success: false, platform: 'native', error: 'Web Share API not supported' };
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });

      return { success: true, platform: 'native' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, platform: 'native', error: 'Share cancelled by user' };
      }
      
      return { 
        success: false, 
        platform: 'native', 
        error: error instanceof Error ? error.message : 'Share failed' 
      };
    }
  },

  // Generate shareable link for address analysis
  async generateShareableLink(address: string, options: {
    includeAnalysis?: boolean;
    expiresInDays?: number;
  } = {}): Promise<{ shareId: string; shareUrl: string }> {
    const { includeAnalysis = true, expiresInDays = 7 } = options;

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          includeAnalysis,
          expiresInDays
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate shareable link');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      throw error;
    }
  },

  // Get available sharing platforms
  getAvailablePlatforms(): Array<{
    key: keyof typeof SHARING_PLATFORMS;
    name: string;
    icon: string;
    color: string;
  }> {
    return Object.entries(SHARING_PLATFORMS).map(([key, platform]) => ({
      key: key as keyof typeof SHARING_PLATFORMS,
      name: platform.name,
      icon: platform.icon,
      color: platform.color
    }));
  },

  // Track share events
  async trackShare(platform: string, address: string, success: boolean) {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform,
          address: contentGenerator.shortenAddress(address),
          success,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to track share event:', error);
    }
  }
};

// Sharing utilities
export const shareUtils = {
  // Create social media meta tags
  createMetaTags(data: ShareData): string {
    return `
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.text}" />
      <meta property="og:url" content="${data.url}" />
      <meta property="og:type" content="website" />
      ${data.image ? `<meta property="og:image" content="${data.image}" />` : ''}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${data.title}" />
      <meta name="twitter:description" content="${data.text}" />
      ${data.image ? `<meta name="twitter:image" content="${data.image}" />` : ''}
      ${data.via ? `<meta name="twitter:site" content="@${data.via}" />` : ''}
    `;
  },

  // Generate QR code for sharing URL
  async generateQRCode(url: string, size: number = 200): Promise<string> {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
      return qrApiUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  },

  // Validate share data
  validateShareData(data: ShareData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.text || data.text.trim().length === 0) {
      errors.push('Text is required');
    }

    if (!data.url || !this.isValidUrl(data.url)) {
      errors.push('Valid URL is required');
    }

    if (data.title && data.title.length > 280) {
      errors.push('Title is too long (max 280 characters)');
    }

    if (data.text && data.text.length > 1000) {
      errors.push('Text is too long (max 1000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate URL format
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Export main sharing object
export const sharing = {
  content: contentGenerator,
  platforms: platformShares,
  service: sharingService,
  utils: shareUtils
};