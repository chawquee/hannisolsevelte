<!-- src/routes/legal/privacy/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let lastUpdated = '2024-12-30';
  let effectiveDate = '2024-12-30';
  
  onMount(() => {
    // Update page title
    document.title = 'Privacy Policy - Hannisol Solana Address Checker';
  });
</script>

<svelte:head>
  <title>Privacy Policy - Hannisol Solana Address Checker</title>
  <meta name="description" content="Privacy Policy for Hannisol Solana Address Checker. Learn how we collect, use, and protect your data." />
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
        <p class="text-gray-600 mt-2">Privacy Policy</p>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-blue-800">
              <strong>Last Updated:</strong> {lastUpdated} | <strong>Effective Date:</strong> {effectiveDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-4xl mx-auto px-6 py-12">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-8 space-y-8">
        
        <!-- Introduction -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <div class="prose prose-gray max-w-none">
            <p class="text-gray-700 leading-relaxed">
              Welcome to Hannisol ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Solana address checker service available at our website (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
            <p class="text-gray-700 leading-relaxed mt-4">
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy.
            </p>
          </div>
        </section>

        <!-- Information We Collect -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
          
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <p class="text-gray-700 mb-3">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Use our Solana address checking service</li>
                <li>Contact us with questions or support requests</li>
                <li>Subscribe to our newsletter or updates</li>
                <li>Participate in surveys or feedback forms</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
              <p class="text-gray-700 mb-3">
                When you visit our website, we automatically collect certain information, including:
              </p>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>IP Address:</strong> For geolocation and security purposes</li>
                <li><strong>Browser Information:</strong> Type, version, and settings</li>
                <li><strong>Device Information:</strong> Operating system and device type</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, and interaction patterns</li>
                <li><strong>Solana Addresses:</strong> Public addresses you search (for analytics)</li>
                <li><strong>Search Patterns:</strong> Frequency and timing of searches</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Cookies and Tracking Technologies</h3>
              <p class="text-gray-700 mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and user behavior</li>
                <li>Serve relevant advertisements</li>
                <li>Improve our service functionality</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- How We Use Information -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">Service Operations</h3>
              <ul class="list-disc list-inside text-blue-800 space-y-2 text-sm">
                <li>Provide Solana address validation services</li>
                <li>Generate risk assessments and analysis</li>
                <li>Maintain service security and integrity</li>
                <li>Process and respond to user inquiries</li>
              </ul>
            </div>
            
            <div class="bg-green-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-green-900 mb-3">Analytics & Improvement</h3>
              <ul class="list-disc list-inside text-green-800 space-y-2 text-sm">
                <li>Analyze usage patterns and trends</li>
                <li>Improve website performance and features</li>
                <li>Conduct research and development</li>
                <li>Monitor service quality and reliability</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-3">Marketing & Advertising</h3>
              <ul class="list-disc list-inside text-purple-800 space-y-2 text-sm">
                <li>Display relevant advertisements</li>
                <li>Send promotional communications (with consent)</li>
                <li>Personalize content and offers</li>
                <li>Measure advertising effectiveness</li>
              </ul>
            </div>
            
            <div class="bg-orange-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-orange-900 mb-3">Legal & Compliance</h3>
              <ul class="list-disc list-inside text-orange-800 space-y-2 text-sm">
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and abuse</li>
                <li>Enforce our terms of service</li>
                <li>Respond to legal requests</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Information Sharing -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
          <div class="space-y-4">
            <div class="border-l-4 border-red-400 pl-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">We DO NOT sell your personal information.</h3>
              <p class="text-gray-700">
                We may share your information in the following situations:
              </p>
            </div>
            
            <div class="grid gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Service Providers</h4>
                <p class="text-gray-700 text-sm">
                  With third-party vendors who perform services on our behalf, such as analytics providers, ad networks, and hosting services.
                </p>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                <p class="text-gray-700 text-sm">
                  When required by law, court order, or government regulation, or to protect our rights and safety.
                </p>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Business Transfers</h4>
                <p class="text-gray-700 text-sm">
                  In connection with a merger, acquisition, or sale of assets, where information may be transferred to the new entity.
                </p>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Aggregated Data</h4>
                <p class="text-gray-700 text-sm">
                  We may share aggregated, anonymized data that cannot identify you individually for research or marketing purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Data Security -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <div class="bg-green-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-green-900 mb-2">Security Measures</h3>
                <p class="text-green-800 mb-3">
                  We implement appropriate technical and organizational security measures to protect your information:
                </p>
                <ul class="list-disc list-inside text-green-800 space-y-1 text-sm">
                  <li>Encryption in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure hosting infrastructure</li>
                  <li>Data backup and recovery procedures</li>
                </ul>
                <p class="text-green-800 mt-3 text-sm">
                  <strong>Note:</strong> No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Your Rights -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Access & Portability</h3>
                <p class="text-blue-800 text-sm">Request access to your personal information and receive a copy in a portable format.</p>
              </div>
              
              <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-purple-900 mb-2">Correction</h3>
                <p class="text-purple-800 text-sm">Request correction of inaccurate or incomplete personal information.</p>
              </div>
              
              <div class="bg-red-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-red-900 mb-2">Deletion</h3>
                <p class="text-red-800 text-sm">Request deletion of your personal information, subject to legal requirements.</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="bg-orange-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-orange-900 mb-2">Restriction</h3>
                <p class="text-orange-800 text-sm">Request restriction of processing your personal information in certain circumstances.</p>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-green-900 mb-2">Objection</h3>
                <p class="text-green-800 text-sm">Object to processing of your information for direct marketing or legitimate interests.</p>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Withdraw Consent</h3>
                <p class="text-gray-800 text-sm">Withdraw consent for processing that is based on your consent.</p>
              </div>
            </div>
          </div>
          
          <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 text-sm">
              <strong>How to Exercise Your Rights:</strong> Contact us at privacy@hannisol.com with your request. We will respond within 30 days and may require verification of your identity.
            </p>
          </div>
        </section>

        <!-- Data Retention -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p class="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul class="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Search Data:</strong> 12 months for analytics purposes</li>
              <li><strong>IP Addresses:</strong> 90 days unless flagged for security</li>
              <li><strong>Analytics Data:</strong> 24 months in aggregated form</li>
              <li><strong>Support Communications:</strong> 3 years</li>
              <li><strong>Legal Requirements:</strong> As required by applicable law</li>
            </ul>
          </div>
        </section>

        <!-- International Transfers -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
          <div class="bg-blue-50 rounded-lg p-6">
            <p class="text-blue-800">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including standard contractual clauses and adequacy decisions where applicable.
            </p>
          </div>
        </section>

        <!-- Children's Privacy -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <p class="text-red-800">
              Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
            </p>
          </div>
        </section>

        <!-- Third-Party Services -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
          <div class="space-y-4">
            <p class="text-gray-700">
              Our website may contain links to third-party services. This privacy policy does not apply to third-party services. We use the following third-party services:
            </p>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-2">Analytics Services</h3>
                <ul class="text-gray-700 text-sm space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Custom analytics platform</li>
                </ul>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-2">Advertising Networks</h3>
                <ul class="text-gray-700 text-sm space-y-1">
                  <li>• Google AdSense</li>
                  <li>• Media.net</li>
                  <li>• Coinzilla</li>
                  <li>• A-ADS</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p class="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div class="space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@hannisol.com</p>
              <p><strong>Support:</strong> support@hannisol.com</p>
              <p><strong>Response Time:</strong> We respond to privacy inquiries within 48 hours</p>
            </div>
          </div>
        </section>

        <!-- Footer Notice -->
        <section class="border-t border-gray-200 pt-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-blue-800 text-sm text-center">
              <strong>Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.</strong><br>
              This Privacy Policy is effective as of {effectiveDate} and was last updated on {lastUpdated}.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom styles for better typography */
  .prose {
    max-width: none;
  }
  
  .prose h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .prose h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .prose p {
    margin-bottom: 1rem;
  }
  
  .prose ul {
    margin-bottom: 1rem;
  }
</style>