<!-- src/routes/legal/cookies/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let lastUpdated = '2024-12-30';
  let effectiveDate = '2024-12-30';
  let cookiePreferences = {
    necessary: true, // Always enabled
    analytics: true,
    marketing: true,
    functional: true
  };
  
  let showCookieSettings = false;
  
  onMount(() => {
    // Update page title
    document.title = 'Cookie Policy - Hannisol Solana Address Checker';
    
    // Load existing cookie preferences from localStorage
    try {
      const savedPreferences = localStorage.getItem('hannisol_cookie_preferences');
      if (savedPreferences) {
        cookiePreferences = { ...cookiePreferences, ...JSON.parse(savedPreferences) };
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  });
  
  function saveCookiePreferences() {
    try {
      localStorage.setItem('hannisol_cookie_preferences', JSON.stringify(cookiePreferences));
      showCookieSettings = false;
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.textContent = 'Cookie preferences saved successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  }
  
  function acceptAllCookies() {
    cookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    saveCookiePreferences();
  }
  
  function rejectOptionalCookies() {
    cookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    saveCookiePreferences();
  }
</script>

<svelte:head>
  <title>Cookie Policy - Hannisol Solana Address Checker</title>
  <meta name="description" content="Cookie Policy for Hannisol Solana Address Checker. Learn about the cookies we use and how to manage your preferences." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <!-- Header Section -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <div class="text-center mb-6">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span class="text-2xl font-bold text-black">H</span>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900" style="font-family: 'Times', 'Georgia', serif; letter-spacing: 3px;">
          HANNISOL
        </h1>
        <p class="text-gray-600 mt-2">Cookie Policy</p>
      </div>
      
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M11 7.343V10a1 1 0 001 1h2.657"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-purple-800">
              <strong>Last Updated:</strong> {lastUpdated} | <strong>Effective Date:</strong> {effectiveDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Cookie Settings Panel -->
  {#if showCookieSettings}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">Cookie Preferences</h3>
            <button 
              on:click={() => showCookieSettings = false}
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Necessary Cookies -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="font-semibold text-gray-900">Necessary Cookies</h4>
                <p class="text-sm text-gray-600">Required for basic website functionality</p>
              </div>
              <div class="text-sm text-gray-500">Always Active</div>
            </div>
            
            <!-- Analytics Cookies -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="font-semibold text-gray-900">Analytics Cookies</h4>
                <p class="text-sm text-gray-600">Help us understand how visitors use our website</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={cookiePreferences.analytics}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <!-- Marketing Cookies -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="font-semibold text-gray-900">Marketing Cookies</h4>
                <p class="text-sm text-gray-600">Used to deliver relevant advertisements</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={cookiePreferences.marketing}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <!-- Functional Cookies -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="font-semibold text-gray-900">Functional Cookies</h4>
                <p class="text-sm text-gray-600">Enable enhanced functionality and personalization</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={cookiePreferences.functional}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              on:click={saveCookiePreferences}
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Preferences
            </button>
            <button 
              on:click={acceptAllCookies}
              class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="max-w-4xl mx-auto px-6 py-12">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-8 space-y-8">
        
        <!-- Quick Actions -->
        <section class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Cookie Actions</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <button 
              on:click={() => showCookieSettings = true}
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
            >
              <div class="text-lg font-semibold text-gray-900 mb-2">⚙️ Manage Preferences</div>
              <p class="text-sm text-gray-600">Customize your cookie settings</p>
            </button>
            
            <button 
              on:click={acceptAllCookies}
              class="bg-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
            >
              <div class="text-lg font-semibold text-green-900 mb-2">✅ Accept All</div>
              <p class="text-sm text-green-700">Enable all cookie categories</p>
            </button>
            
            <button 
              on:click={rejectOptionalCookies}
              class="bg-red-100 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
            >
              <div class="text-lg font-semibold text-red-900 mb-2">❌ Reject Optional</div>
              <p class="text-sm text-red-700">Only necessary cookies</p>
            </button>
          </div>
        </section>

        <!-- Introduction -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <div class="bg-blue-50 rounded-lg p-6">
            <p class="text-blue-800 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p class="text-blue-800 leading-relaxed">
              At Hannisol, we use cookies to enhance your experience, analyze website traffic, and serve relevant advertisements. This Cookie Policy explains what cookies we use, why we use them, and how you can control them.
            </p>
          </div>
        </section>

        <!-- Types of Cookies -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
          <div class="space-y-6">
            
            <!-- Necessary Cookies -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Necessary Cookies</h3>
                <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">Always Active</span>
              </div>
              
              <p class="text-gray-700 mb-4">
                These cookies are essential for the website to function properly. They enable basic features like page navigation, access to secure areas, and core functionality.
              </p>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-2 font-semibold">Cookie Name</th>
                      <th class="text-left py-2 font-semibold">Purpose</th>
                      <th class="text-left py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-600">
                    <tr class="border-b border-gray-100">
                      <td class="py-2">session_id</td>
                      <td class="py-2">Maintains user session</td>
                      <td class="py-2">Session</td>
                    </tr>
                    <tr class="border-b border-gray-100">
                      <td class="py-2">csrf_token</td>
                      <td class="py-2">Security protection</td>
                      <td class="py-2">Session</td>
                    </tr>
                    <tr class="border-b border-gray-100">
                      <td class="py-2">cookie_consent</td>
                      <td class="py-2">Remembers cookie preferences</td>
                      <td class="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Analytics Cookies -->
            <div class="bg-green-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-green-900">Analytics Cookies</h3>
                </div>
                <span class="text-sm {cookiePreferences.analytics ? 'text-green-600' : 'text-red-600'}">
                  {cookiePreferences.analytics ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <p class="text-green-800 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service.
              </p>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-green-200">
                      <th class="text-left py-2 font-semibold">Provider</th>
                      <th class="text-left py-2 font-semibold">Purpose</th>
                      <th class="text-left py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody class="text-green-700">
                    <tr class="border-b border-green-100">
                      <td class="py-2">Google Analytics</td>
                      <td class="py-2">Website traffic analysis</td>
                      <td class="py-2">2 years</td>
                    </tr>
                    <tr class="border-b border-green-100">
                      <td class="py-2">Hannisol Analytics</td>
                      <td class="py-2">Search pattern analysis</td>
                      <td class="py-2">90 days</td>
                    </tr>
                    <tr class="border-b border-green-100">
                      <td class="py-2">Performance Monitoring</td>
                      <td class="py-2">Site performance tracking</td>
                      <td class="py-2">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Marketing Cookies -->
            <div class="bg-purple-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-purple-900">Marketing Cookies</h3>
                </div>
                <span class="text-sm {cookiePreferences.marketing ? 'text-green-600' : 'text-red-600'}">
                  {cookiePreferences.marketing ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <p class="text-purple-800 mb-4">
                These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.
              </p>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-purple-200">
                      <th class="text-left py-2 font-semibold">Ad Network</th>
                      <th class="text-left py-2 font-semibold">Purpose</th>
                      <th class="text-left py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody class="text-purple-700">
                    <tr class="border-b border-purple-100">
                      <td class="py-2">Google AdSense</td>
                      <td class="py-2">Personalized advertising</td>
                      <td class="py-2">90 days</td>
                    </tr>
                    <tr class="border-b border-purple-100">
                      <td class="py-2">Media.net</td>
                      <td class="py-2">Targeted advertisements</td>
                      <td class="py-2">30 days</td>
                    </tr>
                    <tr class="border-b border-purple-100">
                      <td class="py-2">Coinzilla</td>
                      <td class="py-2">Crypto-focused ads</td>
                      <td class="py-2">60 days</td>
                    </tr>
                    <tr class="border-b border-purple-100">
                      <td class="py-2">A-ADS</td>
                      <td class="py-2">Bitcoin advertising network</td>
                      <td class="py-2">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Functional Cookies -->
            <div class="bg-orange-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-orange-900">Functional Cookies</h3>
                </div>
                <span class="text-sm {cookiePreferences.functional ? 'text-green-600' : 'text-red-600'}">
                  {cookiePreferences.functional ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <p class="text-orange-800 mb-4">
                These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
              </p>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-orange-200">
                      <th class="text-left py-2 font-semibold">Feature</th>
                      <th class="text-left py-2 font-semibold">Purpose</th>
                      <th class="text-left py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody class="text-orange-700">
                    <tr class="border-b border-orange-100">
                      <td class="py-2">Search History</td>
                      <td class="py-2">Remember recent searches</td>
                      <td class="py-2">7 days</td>
                    </tr>
                    <tr class="border-b border-orange-100">
                      <td class="py-2">Theme Preferences</td>
                      <td class="py-2">Remember display settings</td>
                      <td class="py-2">1 year</td>
                    </tr>
                    <tr class="border-b border-orange-100">
                      <td class="py-2">Language Settings</td>
                      <td class="py-2">Remember language choice</td>
                      <td class="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Third-Party Cookies -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p class="text-yellow-800 mb-4">
              We work with third-party partners who may also set cookies on your device. These partners include:
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-yellow-900 mb-3">Advertising Partners</h3>
                <ul class="space-y-2 text-yellow-800 text-sm">
                  <li>• <strong>Google AdSense:</strong> Contextual advertising</li>
                  <li>• <strong>Media.net:</strong> Yahoo/Bing advertising network</li>
                  <li>• <strong>Coinzilla:</strong> Cryptocurrency advertising</li>
                  <li>• <strong>A-ADS:</strong> Bitcoin advertising network</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-semibold text-yellow-900 mb-3">Analytics Partners</h3>
                <ul class="space-y-2 text-yellow-800 text-sm">
                  <li>• <strong>Google Analytics:</strong> Website analytics</li>
                  <li>• <strong>Cloudflare:</strong> Performance monitoring</li>
                  <li>• <strong>IP Geolocation:</strong> Location services</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p class="text-yellow-900 text-sm">
                <strong>Note:</strong> We have no control over third-party cookies. Please refer to their respective privacy policies for more information.
              </p>
            </div>
          </div>
        </section>

        <!-- How to Control Cookies -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How to Control Cookies</h2>
          <div class="space-y-6">
            
            <div class="bg-blue-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">Browser Settings</h3>
              <p class="text-blue-800 mb-4">
                You can control cookies through your browser settings. Here's how to manage cookies in popular browsers:
              </p>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-white rounded-lg p-4">
                  <h4 class="font-semibold text-blue-900 mb-2">Desktop Browsers</h4>
                  <ul class="space-y-1 text-blue-800 text-sm">
                    <li>• <strong>Chrome:</strong> Settings → Privacy → Cookies</li>
                    <li>• <strong>Firefox:</strong> Options → Privacy → Cookies</li>
                    <li>• <strong>Safari:</strong> Preferences → Privacy</li>
                    <li>• <strong>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                </div>
                
                <div class="bg-white rounded-lg p-4">
                  <h4 class="font-semibold text-blue-900 mb-2">Mobile Browsers</h4>
                  <ul class="space-y-1 text-blue-800 text-sm">
                    <li>• <strong>Chrome Mobile:</strong> Menu → Settings → Site Settings</li>
                    <li>• <strong>Safari iOS:</strong> Settings → Safari → Privacy</li>
                    <li>• <strong>Samsung Internet:</strong> Menu → Settings → Sites and downloads</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-green-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-green-900 mb-3">Our Cookie Settings</h3>
              <p class="text-green-800 mb-4">
                Use our cookie preference center to control which cookies we use:
              </p>
              
              <button 
                on:click={() => showCookieSettings = true}
                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open Cookie Settings
              </button>
            </div>

            <div class="bg-orange-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-orange-900 mb-3">Opt-Out Links</h3>
              <p class="text-orange-800 mb-4">
                You can opt out of advertising cookies from our partners:
              </p>
              
              <div class="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 class="font-semibold text-orange-900 mb-2">Advertising Opt-Outs</h4>
                  <ul class="space-y-1 text-orange-800">
                    <li>• <a href="https://www.google.com/settings/ads" class="underline hover:no-underline" target="_blank" rel="noopener">Google Ad Settings</a></li>
                    <li>• <a href="https://www.media.net/privacy-policy" class="underline hover:no-underline" target="_blank" rel="noopener">Media.net Opt-Out</a></li>
                    <li>• <a href="http://www.aboutads.info/choices/" class="underline hover:no-underline" target="_blank" rel="noopener">Digital Advertising Alliance</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="font-semibold text-orange-900 mb-2">Analytics Opt-Outs</h4>
                  <ul class="space-y-1 text-orange-800">
                    <li>• <a href="https://tools.google.com/dlpage/gaoptout" class="underline hover:no-underline" target="_blank" rel="noopener">Google Analytics Opt-Out</a></li>
                    <li>• <a href="https://www.cloudflare.com/privacypolicy/" class="underline hover:no-underline" target="_blank" rel="noopener">Cloudflare Privacy</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Impact of Disabling Cookies -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Impact of Disabling Cookies</h2>
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <p class="text-red-800 mb-4">
              Disabling certain cookies may affect your experience on our website:
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-red-900 mb-3">Necessary Cookies</h3>
                <ul class="list-disc list-inside text-red-800 space-y-1 text-sm">
                  <li>Website may not function properly</li>
                  <li>Security features may be disabled</li>
                  <li>Session information may be lost</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-semibold text-red-900 mb-3">Optional Cookies</h3>
                <ul class="list-disc list-inside text-red-800 space-y-1 text-sm">
                  <li>Less personalized experience</li>
                  <li>Generic advertisements</li>
                  <li>Limited analytics insights</li>
                  <li>Preferences not remembered</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Cookie Updates -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p class="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
            </p>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">When We Update</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>New cookies are added</li>
                  <li>Cookie purposes change</li>
                  <li>Legal requirements change</li>
                  <li>Technology improvements</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">How We Notify</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Update the "Last Updated" date</li>
                  <li>Banner notification on website</li>
                  <li>Email notification (if subscribed)</li>
                  <li>Prominent notice for major changes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Us About Cookies</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p class="text-gray-700 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div class="space-y-2 text-gray-700">
              <p><strong>Email:</strong> cookies@hannisol.com</p>
              <p><strong>Privacy Officer:</strong> privacy@hannisol.com</p>
              <p><strong>General Support:</strong> support@hannisol.com</p>
              <p><strong>Response Time:</strong> We respond to cookie inquiries within 48 hours</p>
            </div>
          </div>
        </section>

        <!-- Footer Notice -->
        <section class="border-t border-gray-200 pt-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-blue-800 text-sm text-center">
              <strong>Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.</strong><br>
              This Cookie Policy is effective as of {effectiveDate} and was last updated on {lastUpdated}.<br>
              Your current cookie preferences: 
              <span class="font-semibold">
                Analytics: {cookiePreferences.analytics ? 'Enabled' : 'Disabled'}, 
                Marketing: {cookiePreferences.marketing ? 'Enabled' : 'Disabled'}, 
                Functional: {cookiePreferences.functional ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom toggle switch styles */
  input[type="checkbox"]:checked + div {
    background-color: #2563eb;
  }
  
  input[type="checkbox"]:checked + div:after {
    transform: translateX(100%);
    border-color: white;
  }
  
  /* Table styles */
  table {
    border-collapse: collapse;
  }
  
  th, td {
    text-align: left;
    vertical-align: top;
  }
  
  /* Responsive table */
  @media (max-width: 768px) {
    .overflow-x-auto {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    table {
      min-width: 500px;
    }
  }
</style>