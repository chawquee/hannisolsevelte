<!-- src/routes/legal/terms/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let lastUpdated = '2024-12-30';
  let effectiveDate = '2024-12-30';
  
  onMount(() => {
    // Update page title
    document.title = 'Terms of Service - Hannisol Solana Address Checker';
  });
</script>

<svelte:head>
  <title>Terms of Service - Hannisol Solana Address Checker</title>
  <meta name="description" content="Terms of Service for Hannisol Solana Address Checker. Read our terms and conditions for using our service." />
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
        <p class="text-gray-600 mt-2">Terms of Service</p>
      </div>
      
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-orange-800">
              <strong>Important:</strong> Please read these terms carefully before using our service. By using Hannisol, you agree to these terms.
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
        
        <!-- Agreement to Terms -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p class="text-blue-800 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the Hannisol Solana address checker service ("Service") operated by Hannisol ("we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p class="text-blue-800 leading-relaxed mt-4">
              <strong>Last Updated:</strong> {lastUpdated} | <strong>Effective Date:</strong> {effectiveDate}
            </p>
          </div>
        </section>

        <!-- Service Description -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Hannisol provides a web-based service for analyzing Solana blockchain addresses, including:
            </p>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-2">Core Features</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Address validation and format checking</li>
                  <li>Balance and token holdings display</li>
                  <li>Transaction history analysis</li>
                  <li>Basic risk assessment</li>
                  <li>Account information display</li>
                </ul>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-2">Additional Services</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Community data aggregation</li>
                  <li>Share analysis results</li>
                  <li>Educational resources</li>
                  <li>Security recommendations</li>
                  <li>API access (where available)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- User Accounts and Responsibilities -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
          <div class="space-y-6">
            
            <div class="bg-green-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-green-900 mb-3">Acceptable Use</h3>
              <p class="text-green-800 mb-3">You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <ul class="list-disc list-inside text-green-800 space-y-1 text-sm">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or harvest data excessively</li>
                <li>Interfere with or disrupt the Service</li>
              </ul>
            </div>

            <div class="bg-yellow-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-yellow-900 mb-3">Usage Limitations</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-yellow-900 mb-2">Rate Limits</h4>
                  <ul class="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                    <li>Maximum 100 searches per hour per IP</li>
                    <li>Maximum 1,000 searches per day per IP</li>
                    <li>No bulk automated searching</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-yellow-900 mb-2">Content Restrictions</h4>
                  <ul class="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                    <li>Only valid Solana addresses</li>
                    <li>No spam or abuse reports</li>
                    <li>Respectful use of sharing features</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-red-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-red-900 mb-3">Prohibited Activities</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-red-900 mb-2">Security Violations</h4>
                  <ul class="list-disc list-inside text-red-800 space-y-1 text-sm">
                    <li>Attempting to hack or breach security</li>
                    <li>Reverse engineering our systems</li>
                    <li>Circumventing rate limits or restrictions</li>
                    <li>Using the service to attack other systems</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-red-900 mb-2">Misuse of Service</h4>
                  <ul class="list-disc list-inside text-red-800 space-y-1 text-sm">
                    <li>Creating fake or misleading reports</li>
                    <li>Harassing other users</li>
                    <li>Violating others' privacy</li>
                    <li>Commercial use without permission</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Service Availability -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Uptime & Maintenance</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-sm">
                  <li>We strive for 99.9% uptime but cannot guarantee continuous availability</li>
                  <li>Scheduled maintenance will be announced in advance when possible</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>Service may be temporarily unavailable due to technical issues</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Modifications</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-sm">
                  <li>We may modify, suspend, or discontinue the Service at any time</li>
                  <li>Features may be added, modified, or removed</li>
                  <li>We will provide notice of significant changes when feasible</li>
                  <li>No compensation for service interruptions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Data and Privacy -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Data and Privacy</h2>
          <div class="space-y-4">
            <div class="bg-blue-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">Data Collection</h3>
              <p class="text-blue-800 mb-3">
                By using our Service, you acknowledge and agree that we may collect and use data as described in our Privacy Policy, including:
              </p>
              <ul class="list-disc list-inside text-blue-800 space-y-1 text-sm">
                <li>Solana addresses you search (public blockchain data)</li>
                <li>IP addresses and usage analytics</li>
                <li>Browser and device information</li>
                <li>Geographic location based on IP</li>
                <li>Search patterns and frequency</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-3">Blockchain Data</h3>
              <p class="text-purple-800 text-sm">
                All Solana addresses and transaction data displayed through our Service are publicly available on the Solana blockchain. We do not control or own this data. We provide analysis and presentation of public blockchain information.
              </p>
            </div>
          </div>
        </section>

        <!-- Disclaimers and Limitations -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitations</h2>
          <div class="space-y-6">
            
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-red-900 mb-3">⚠️ Important Disclaimers</h3>
              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold text-red-900 mb-2">Not Financial Advice</h4>
                  <p class="text-red-800 text-sm">
                    Our Service provides information and analysis tools only. Nothing on our platform constitutes financial, investment, trading, or other professional advice. You should consult with qualified professionals before making any financial decisions.
                  </p>
                </div>
                
                <div>
                  <h4 class="font-semibold text-red-900 mb-2">Accuracy Disclaimer</h4>
                  <p class="text-red-800 text-sm">
                    While we strive for accuracy, we cannot guarantee that all information displayed is correct, complete, or up-to-date. Blockchain data may be subject to network delays or inconsistencies.
                  </p>
                </div>
                
                <div>
                  <h4 class="font-semibold text-red-900 mb-2">Risk Assessment Limitations</h4>
                  <p class="text-red-800 text-sm">
                    Our risk analysis features are automated tools based on various data points and algorithms. They should not be considered definitive security assessments. Always conduct your own research and due diligence.
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-yellow-900 mb-3">Service "As Is"</h3>
              <p class="text-yellow-800 text-sm mb-3">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul class="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Accuracy or reliability of information</li>
                <li>Security against unauthorized access</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Liability Limitations -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
          <div class="bg-gray-50 border border-gray-300 rounded-lg p-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Maximum Liability</h3>
                <p class="text-gray-700 text-sm">
                  To the fullest extent permitted by law, Hannisol's total liability to you for all claims arising from your use of the Service shall not exceed $100 USD or the amount you paid for the Service in the 12 months preceding the claim, whichever is greater.
                </p>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluded Damages</h3>
                <p class="text-gray-700 text-sm mb-2">We shall not be liable for:</p>
                <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from third-party actions</li>
                  <li>Losses due to investment decisions based on our Service</li>
                  <li>Security breaches or unauthorized access to your data</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Indemnification -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
          <div class="bg-blue-50 rounded-lg p-6">
            <p class="text-blue-800 text-sm">
              You agree to indemnify, defend, and hold harmless Hannisol and its officers, directors, employees, and agents from and against any claims, damages, losses, costs, and expenses (including reasonable attorney's fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </div>
        </section>

        <!-- Intellectual Property -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
          <div class="space-y-4">
            <div class="bg-purple-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-3">Our Rights</h3>
              <p class="text-purple-800 text-sm mb-3">
                The Service, including its design, functionality, text, graphics, logos, and software, is owned by Hannisol and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <ul class="list-disc list-inside text-purple-800 space-y-1 text-sm">
                <li>Hannisol brand name and logo</li>
                <li>Website design and user interface</li>
                <li>Software and algorithms</li>
                <li>Original content and analysis tools</li>
              </ul>
            </div>
            
            <div class="bg-green-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-green-900 mb-3">Your Rights</h3>
              <p class="text-green-800 text-sm">
                You are granted a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes in accordance with these Terms. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </div>
          </div>
        </section>

        <!-- Termination -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-orange-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-orange-900 mb-3">By You</h3>
              <p class="text-orange-800 text-sm mb-2">
                You may stop using the Service at any time. No formal termination process is required as we do not require user accounts for basic service usage.
              </p>
            </div>
            
            <div class="bg-red-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-red-900 mb-3">By Us</h3>
              <p class="text-red-800 text-sm mb-2">
                We may terminate or suspend your access immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.
              </p>
              <p class="text-red-800 text-sm">
                Reasons for termination may include: abuse of service, violation of rate limits, illegal activities, or security threats.
              </p>
            </div>
          </div>
        </section>

        <!-- Governing Law -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Governing Law and Disputes</h2>
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Jurisdiction</h3>
              <p class="text-gray-700 text-sm">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles. Any legal action or proceeding shall be brought exclusively in the courts of [Your Jurisdiction].
              </p>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">Dispute Resolution</h3>
              <p class="text-blue-800 text-sm mb-3">
                We encourage resolving disputes through direct communication. If you have a concern:
              </p>
              <ol class="list-decimal list-inside text-blue-800 space-y-1 text-sm">
                <li>Contact us at support@hannisol.com</li>
                <li>Provide detailed information about your concern</li>
                <li>Allow 10 business days for our response</li>
                <li>Engage in good faith negotiations</li>
              </ol>
            </div>
          </div>
        </section>

        <!-- Changes to Terms -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-900 mb-3">Modifications</h3>
            <p class="text-yellow-800 text-sm mb-3">
              We may update these Terms from time to time. When we make changes:
            </p>
            <ul class="list-disc list-inside text-yellow-800 space-y-1 text-sm">
              <li>We will update the "Last Updated" date</li>
              <li>Significant changes will be posted prominently on our website</li>
              <li>Continued use of the Service constitutes acceptance of new terms</li>
              <li>If you disagree with changes, you should stop using the Service</li>
            </ul>
          </div>
        </section>

        <!-- Miscellaneous -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Miscellaneous</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">Severability</h3>
              <p class="text-gray-700 text-sm">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">Entire Agreement</h3>
              <p class="text-gray-700 text-sm">
                These Terms, along with our Privacy Policy, constitute the entire agreement between you and Hannisol.
              </p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">No Waiver</h3>
              <p class="text-gray-700 text-sm">
                Our failure to enforce any provision of these Terms shall not be deemed a waiver of such provision or our right to enforce it.
              </p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">Assignment</h3>
              <p class="text-gray-700 text-sm">
                You may not assign your rights under these Terms. We may assign our rights and obligations without restriction.
              </p>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p class="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div class="space-y-2 text-gray-700">
              <p><strong>Email:</strong> legal@hannisol.com</p>
              <p><strong>Support:</strong> support@hannisol.com</p>
              <p><strong>General Inquiries:</strong> info@hannisol.com</p>
              <p><strong>Response Time:</strong> We respond to legal inquiries within 3 business days</p>
            </div>
          </div>
        </section>

        <!-- Footer Notice -->
        <section class="border-t border-gray-200 pt-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-blue-800 text-sm text-center">
              <strong>Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.</strong><br>
              These Terms of Service are effective as of {effectiveDate} and were last updated on {lastUpdated}.<br>
              By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
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
  
  .prose ul, .prose ol {
    margin-bottom: 1rem;
  }
</style>