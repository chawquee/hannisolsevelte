<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  export let data;
  
  let showCookieBanner = false;
  let showMobileMenu = false;
  let cookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  };
  
  // Reactive statements
  $: isHomePage = $page.url.pathname === '/';
  $: isAdminPage = $page.url.pathname.startsWith('/admin');
  $: isLegalPage = $page.url.pathname.startsWith('/legal');
  $: seoData = data.ui.seoData;
  $: showAds = data.config.adConfig && data.config.cookieConsent && !isAdminPage;
  
  onMount(() => {
    // Check cookie consent
    if (browser) {
      const consent = localStorage.getItem('hannisol_cookie_consent');
      if (!consent) {
        showCookieBanner = true;
      } else {
        const preferences = localStorage.getItem('hannisol_cookie_preferences');
        if (preferences) {
          cookiePreferences = { ...cookiePreferences, ...JSON.parse(preferences) };
        }
      }
      
      // Initialize analytics if consent given
      if (consent === 'true' && cookiePreferences.analytics) {
        initializeAnalytics();
      }
      
      // Initialize ads if consent given
      if (consent === 'true' && cookiePreferences.marketing) {
        initializeAds();
      }
    }
  });
  
  function acceptAllCookies() {
    if (browser) {
      cookiePreferences = {
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true
      };
      
      localStorage.setItem('hannisol_cookie_consent', 'true');
      localStorage.setItem('hannisol_cookie_preferences', JSON.stringify(cookiePreferences));
      showCookieBanner = false;
      
      initializeAnalytics();
      initializeAds();
    }
  }
  
  function rejectOptionalCookies() {
    if (browser) {
      cookiePreferences = {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
      };
      
      localStorage.setItem('hannisol_cookie_consent', 'true');
      localStorage.setItem('hannisol_cookie_preferences', JSON.stringify(cookiePreferences));
      showCookieBanner = false;
    }
  }
  
  function initializeAnalytics() {
    if (browser && data.config.adConfig.adsense) {
      // Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    }
  }
  
  function initializeAds() {
    if (browser) {
      // Google AdSense
      if (data.config.adConfig.adsense) {
        const adsenseScript = document.createElement('script');
        adsenseScript.async = true;
        adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXX';
        adsenseScript.crossOrigin = 'anonymous';
        document.head.appendChild(adsenseScript);
      }
    }
  }
  
  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }
</script>

<svelte:head>
  <title>{seoData.title}</title>
  <meta name="description" content={seoData.description} />
  <meta name="keywords" content={seoData.keywords} />
  <link rel="canonical" href={seoData.canonicalUrl} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={seoData.title} />
  <meta property="og:description" content={seoData.description} />
  <meta property="og:image" content={seoData.ogImage} />
  <meta property="og:url" content={seoData.canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Hannisol" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoData.title} />
  <meta name="twitter:description" content={seoData.description} />
  <meta name="twitter:image" content={seoData.ogImage} />
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  
  <!-- Viewport and mobile -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#7c3aed" />
</svelte:head>

<!-- Maintenance Mode Banner -->
{#if data.config.maintenanceMode && !isAdminPage}
  <div class="bg-yellow-600 text-white text-center p-3">
    <p class="text-sm font-medium">
      🔧 Scheduled maintenance in progress. Some features may be temporarily unavailable.
    </p>
  </div>
{/if}

<!-- Announcement Banner -->
{#if data.ui.announcement && !isAdminPage}
  <div class="bg-blue-600 text-white text-center p-3">
    <p class="text-sm font-medium">
      📢 {data.ui.announcement.message}
    </p>
  </div>
{/if}

<!-- Cookie Consent Banner -->
{#if showCookieBanner}
  <div class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex-1">
        <p class="text-sm">
          We use cookies to enhance your experience and analyze website traffic. 
          <a href="/legal/cookies" class="underline hover:no-underline">Learn more</a>
        </p>
      </div>
      <div class="flex gap-3">
        <button 
          on:click={rejectOptionalCookies}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
        >
          Essential Only
        </button>
        <button 
          on:click={acceptAllCookies}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          Accept All
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Main Layout -->
<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <a href="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
              <span class="text-lg font-bold text-black">H</span>
            </div>
            <div>
              <div class="text-xl font-bold text-gray-900" style="font-family: 'Times', 'Georgia', serif; letter-spacing: 3px;">
                HANNISOL
              </div>
              <div class="text-xs text-gray-500 -mt-1">Address Checker</div>
            </div>
          </a>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a 
            href="/" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors {isHomePage ? 'text-blue-600' : ''}"
          >
            Check Address
          </a>
          
          {#if data.auth.isAdmin}
            <a 
              href="/admin" 
              class="text-gray-700 hover:text-purple-600 font-medium transition-colors {isAdminPage ? 'text-purple-600' : ''}"
            >
              Dashboard
            </a>
          {/if}
          
          <div class="relative group">
            <button class="text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-1">
              Legal
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <a href="/legal/privacy" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg">Privacy Policy</a>
              <a href="/legal/terms" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Terms of Service</a>
              <a href="/legal/cookies" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg">Cookie Policy</a>
            </div>
          </div>
          
          <!-- Stats Display -->
          <div class="text-sm text-gray-500">
            {data.stats.searches24h.toLocaleString()} searches today
          </div>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button 
          on:click={toggleMobileMenu}
          class="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    {#if showMobileMenu}
      <div class="md:hidden bg-white border-t border-gray-200">
        <div class="px-4 py-2 space-y-1">
          <a 
            href="/" 
            class="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md {isHomePage ? 'text-blue-600 bg-blue-50' : ''}"
            on:click={() => showMobileMenu = false}
          >
            Check Address
          </a>
          
          {#if data.auth.isAdmin}
            <a 
              href="/admin" 
              class="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md {isAdminPage ? 'text-purple-600 bg-purple-50' : ''}"
              on:click={() => showMobileMenu = false}
            >
              Dashboard
            </a>
          {/if}
          
          <div class="border-t border-gray-200 my-2"></div>
          
          <a 
            href="/legal/privacy" 
            class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            on:click={() => showMobileMenu = false}
          >
            Privacy Policy
          </a>
          <a 
            href="/legal/terms" 
            class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            on:click={() => showMobileMenu = false}
          >
            Terms of Service
          </a>
          <a 
            href="/legal/cookies" 
            class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            on:click={() => showMobileMenu = false}
          >
            Cookie Policy
          </a>
          
          <div class="px-3 py-2 text-xs text-gray-500">
            {data.stats.searches24h.toLocaleString()} searches today
          </div>
        </div>
      </div>
    {/if}
  </header>
  
  <!-- Main Content -->
  <main class="flex-1">
    <slot />
  </main>
  
  <!-- Footer -->
  {#if !isAdminPage}
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand Section -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <span class="text-xl font-bold text-black">H</span>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900" style="font-family: 'Times', 'Georgia', serif; letter-spacing: 3px;">
                  HANNISOL
                </div>
                <div class="text-sm text-gray-600">Solana Address Checker</div>
              </div>
            </div>
            
            <p class="text-gray-600 mb-4" style="font-family: 'Times', 'Georgia', serif; font-style: italic;">
              "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps."
            </p>
            
            <p class="text-sm text-gray-500 mb-4">
              Professional-grade Solana address validation and blockchain analysis tools. 
              Trusted by crypto enthusiasts and professionals worldwide.
            </p>
            
            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="font-semibold text-gray-900">{data.stats.totalSearches.toLocaleString()}</div>
                <div class="text-gray-500">Total Searches</div>
              </div>
              <div>
                <div class="font-semibold text-gray-900">{data.stats.uniqueAddresses.toLocaleString()}</div>
                <div class="text-gray-500">Addresses Analyzed</div>
              </div>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">Address Checker</a></li>
              <li><a href="/legal/privacy" class="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/terms" class="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="/legal/cookies" class="text-gray-600 hover:text-blue-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          
          <!-- Support -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="mailto:support@hannisol.com" class="text-gray-600 hover:text-blue-600 transition-colors">support@hannisol.com</a></li>
              <li><a href="mailto:privacy@hannisol.com" class="text-gray-600 hover:text-blue-600 transition-colors">privacy@hannisol.com</a></li>
              <li><a href="mailto:legal@hannisol.com" class="text-gray-600 hover:text-blue-600 transition-colors">legal@hannisol.com</a></li>
            </ul>
            
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
              <div class="text-xs font-medium text-gray-700 mb-1">Response Time</div>
              <div class="text-xs text-gray-600">Support: 24 hours</div>
              <div class="text-xs text-gray-600">Legal: 3 business days</div>
            </div>
          </div>
        </div>
        
        <!-- Bottom Bar -->
        <div class="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div class="text-sm text-gray-500">
            © {new Date().getFullYear()} Hannisol. All rights reserved.
          </div>
          
          <div class="flex items-center gap-4 mt-4 sm:mt-0">
            <div class="text-xs text-gray-400">
              Made with ❤️ for the Solana community
            </div>
            
            {#if data.performance && data.auth.isAdmin}
              <div class="text-xs text-gray-400">
                Avg response: {Math.round(data.performance.avg_response_time || 0)}ms
              </div>
            {/if}
          </div>
        </div>
      </div>
    </footer>
  {/if}
</div>

<!-- Ad Scripts (only load if consent given) -->
{#if showAds && cookiePreferences.marketing}
  <!-- Google AdSense -->
  {#if data.config.adConfig.adsense}
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXX" crossorigin="anonymous"></script>
  {/if}
{/if}

<style>
  /* Global styles */
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  /* Hannisol brand typography */
  :global(.brand-text) {
    font-family: 'Times', 'Georgia', serif;
    letter-spacing: 3px;
    font-weight: 400;
  }
  
  /* Smooth transitions */
  :global(a) {
    transition: color 0.2s ease;
  }
  
  /* Focus styles for accessibility */
  :global(button:focus, a:focus) {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }
  
  /* Custom scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #f1f5f9;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #94a3b8;
  }
</style>