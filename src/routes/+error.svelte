<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  
  $: status = $page.status;
  $: message = $page.error?.message || 'An unexpected error occurred';
  $: errorId = $page.error?.errorId;
  
  // Error messages for common status codes
  const errorMessages: Record<number, { title: string; description: string; suggestion: string }> = {
    400: {
      title: 'Bad Request',
      description: 'The request could not be understood by the server.',
      suggestion: 'Please check your input and try again.'
    },
    401: {
      title: 'Unauthorized',
      description: 'Authentication is required to access this resource.',
      suggestion: 'Please log in and try again.'
    },
    403: {
      title: 'Access Forbidden',
      description: 'You do not have permission to access this resource.',
      suggestion: 'Contact support if you believe this is an error.'
    },
    404: {
      title: 'Page Not Found',
      description: 'The page you are looking for could not be found.',
      suggestion: 'Check the URL or return to the homepage to find what you need.'
    },
    405: {
      title: 'Method Not Allowed',
      description: 'The request method is not supported for this resource.',
      suggestion: 'Please try a different approach or contact support.'
    },
    429: {
      title: 'Too Many Requests',
      description: 'You have made too many requests in a short period.',
      suggestion: 'Please wait a moment and try again.'
    },
    500: {
      title: 'Internal Server Error',
      description: 'Something went wrong on our end.',
      suggestion: 'We have been notified and are working to fix this issue.'
    },
    502: {
      title: 'Bad Gateway',
      description: 'The server received an invalid response.',
      suggestion: 'Please try again in a few moments.'
    },
    503: {
      title: 'Service Unavailable',
      description: 'The service is temporarily unavailable.',
      suggestion: 'We are working to restore service. Please try again later.'
    }
  };
  
  $: errorInfo = errorMessages[status] || {
    title: 'Error',
    description: message,
    suggestion: 'Please try again or contact support if the problem persists.'
  };
  
  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
  
  function goHome() {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
  
  function reportError() {
    const subject = encodeURIComponent(`Error Report - ${status} ${errorInfo.title}`);
    const body = encodeURIComponent(
      `Error Details:\n` +
      `Status: ${status}\n` +
      `Message: ${message}\n` +
      `Error ID: ${errorId || 'N/A'}\n` +
      `URL: ${$page.url.href}\n` +
      `Time: ${new Date().toISOString()}\n\n` +
      `Please describe what you were trying to do when this error occurred:`
    );
    
    window.open(`mailto:support@hannisol.com?subject=${subject}&body=${body}`);
  }
</script>

<svelte:head>
  <title>Error {status} - Hannisol</title>
  <meta name="description" content="An error occurred on Hannisol Solana Address Checker" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
  <div class="max-w-2xl w-full">
    <!-- Error Card -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <!-- Header with Hannisol Logo -->
      <div class="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 p-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span class="text-3xl font-bold text-black">H</span>
          </div>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2" style="font-family: 'Times', 'Georgia', serif; letter-spacing: 3px;">
          HANNISOL
        </h1>
        
        <p class="text-gray-600" style="font-family: 'Times', 'Georgia', serif; font-style: italic;">
          "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps."
        </p>
      </div>
      
      <!-- Error Content -->
      <div class="p-8">
        <!-- Status and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <span class="text-3xl font-bold text-red-600">{status}</span>
          </div>
          
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{errorInfo.title}</h2>
          <p class="text-lg text-gray-600 mb-2">{errorInfo.description}</p>
          <p class="text-gray-500">{errorInfo.suggestion}</p>
        </div>
        
        <!-- Error Details (Development Only) -->
        {#if dev && (message || errorId)}
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Development Details:</h3>
            {#if message}
              <p class="text-sm text-gray-600 mb-1">
                <strong>Message:</strong> {message}
              </p>
            {/if}
            {#if errorId}
              <p class="text-sm text-gray-600">
                <strong>Error ID:</strong> {errorId}
              </p>
            {/if}
          </div>
        {/if}
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            on:click={goHome}
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Return Home
          </button>
          
          <button 
            on:click={goBack}
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Go Back
          </button>
          
          {#if status >= 500}
            <button 
              on:click={reportError}
              class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              Report Issue
            </button>
          {/if}
        </div>
        
        <!-- Common Links -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 text-center">Quick Links</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <a href="/" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Address Checker
            </a>
            <a href="/legal/terms" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Terms of Service
            </a>
            <a href="/legal/privacy" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Privacy Policy
            </a>
            <a href="/legal/cookies" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Cookie Policy
            </a>
          </div>
        </div>
        
        <!-- Support Information -->
        <div class="mt-6 bg-blue-50 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-blue-900">Need Help?</h4>
              <p class="text-sm text-blue-800">
                Contact our support team at 
                <a href="mailto:support@hannisol.com" class="underline hover:no-underline">
                  support@hannisol.com
                </a>
                for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Additional Error-Specific Content -->
    {#if status === 404}
      <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <a href="/" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Address Checker</div>
              <div class="text-sm text-gray-600">Validate Solana addresses</div>
            </div>
          </a>
          
          <a href="/admin" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Admin Dashboard</div>
              <div class="text-sm text-gray-600">Analytics and management</div>
            </div>
          </a>
        </div>
      </div>
    {/if}
    
    {#if status === 429}
      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-yellow-900">Rate Limit Information</h4>
            <p class="text-sm text-yellow-800">
              You can make up to 100 address checks per hour. Please wait before trying again.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Ensure consistent font loading */
  @import url('https://fonts.googleapis.com/css2?family=Times:wght@400;600;700&display=swap');
</style>