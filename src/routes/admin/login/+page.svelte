<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let isLoading = false;
  let showPassword = false;
  let showForgotPassword = false;
  let email = form?.email || '';
  let password = '';
  let rememberMe = false;
  let forgotPasswordEmail = '';

  // Focus management
  let emailInput: HTMLInputElement;
  let passwordInput: HTMLInputElement;
  let forgotEmailInput: HTMLInputElement;

  // Form validation
  let emailError = '';
  let passwordError = '';
  let formValid = false;

  // Check form validity
  $: {
    emailError = '';
    passwordError = '';
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError = 'Please enter a valid email address';
    }
    
    if (password && password.length < 6) {
      passwordError = 'Password must be at least 6 characters';
    }
    
    formValid = email.length > 0 && password.length > 0 && !emailError && !passwordError;
  }

  // Handle form submission
  function handleSubmit() {
    return ({ pending, result }: any) => {
      isLoading = pending;
      
      if (result?.type === 'failure') {
        // Focus on the first field with an error
        if (form?.errors?.email) {
          emailInput?.focus();
        } else if (form?.errors?.password) {
          passwordInput?.focus();
        }
      }
    };
  }

  // Handle forgot password
  function handleForgotPassword() {
    return ({ pending }: any) => {
      isLoading = pending;
    };
  }

  // Toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  // Handle forgot password form
  function openForgotPassword() {
    showForgotPassword = true;
    forgotPasswordEmail = email;
    setTimeout(() => {
      forgotEmailInput?.focus();
    }, 100);
  }

  function closeForgotPassword() {
    showForgotPassword = false;
    forgotPasswordEmail = '';
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showForgotPassword) {
      closeForgotPassword();
    }
  }

  // Auto-focus email input on mount
  onMount(() => {
    if (!email) {
      emailInput?.focus();
    } else {
      passwordInput?.focus();
    }
  });

  // Get system status color
  function getSystemStatusColor(): string {
    // In a real app, this would come from an API
    return '#10b981'; // Green for healthy
  }
</script>

<svelte:head>
  <title>Admin Login - Hannisol</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="login-container">
  <!-- Background Elements -->
  <div class="background-pattern"></div>
  <div class="background-gradient"></div>

  <!-- Main Login Card -->
  <div class="login-card">
    <!-- Header Section -->
    <div class="login-header">
      <!-- Hannisol Logo -->
      <div class="logo-container">
        <div class="logo">
          <div class="logo-circle">
            <span class="logo-h">H</span>
            <div class="logo-accent"></div>
          </div>
        </div>
        <div class="brand-info">
          <h1 class="brand-name">HANNISOL</h1>
          <p class="brand-subtitle">Admin Access Portal</p>
          <p class="brand-slogan">"Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps."</p>
        </div>
      </div>

      <!-- System Status -->
      <div class="system-status">
        <div class="status-indicator">
          <span class="status-dot" style="background-color: {getSystemStatusColor()}"></span>
          <span class="status-text">System Operational</span>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    {#if data.error}
      <div class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        <span class="alert-message">{data.error}</span>
      </div>
    {/if}

    {#if data.message}
      <div class="alert alert-success">
        <span class="alert-icon">✅</span>
        <span class="alert-message">{data.message}</span>
      </div>
    {/if}

    {#if form?.message}
      <div class="alert alert-error">
        <span class="alert-icon">❌</span>
        <span class="alert-message">{form.message}</span>
      </div>
    {/if}

    <!-- Main Login Form -->
    {#if !showForgotPassword}
      <form 
        method="POST" 
        class="login-form"
        use:enhance={handleSubmit}
      >
        <div class="form-header">
          <h2>Administrator Login</h2>
          <p>Please enter your credentials to access the admin panel</p>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">
            <span class="label-text">Email Address</span>
            <span class="label-required">*</span>
          </label>
          <div class="input-container">
            <input
              bind:this={emailInput}
              bind:value={email}
              type="email"
              id="email"
              name="email"
              class="form-input"
              class:error={emailError || form?.errors?.email}
              placeholder="admin@hannisol.com"
              autocomplete="email"
              required
              disabled={isLoading}
            />
            <span class="input-icon">📧</span>
          </div>
          {#if emailError}
            <span class="field-error">{emailError}</span>
          {/if}
          {#if form?.errors?.email}
            {#each form.errors.email as error}
              <span class="field-error">{error}</span>
            {/each}
          {/if}
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">
            <span class="label-text">Password</span>
            <span class="label-required">*</span>
          </label>
          <div class="input-container">
            <input
              bind:this={passwordInput}
              bind:value={password}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              class="form-input"
              class:error={passwordError || form?.errors?.password}
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              class="password-toggle"
              on:click={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {#if passwordError}
            <span class="field-error">{passwordError}</span>
          {/if}
          {#if form?.errors?.password}
            {#each form.errors.password as error}
              <span class="field-error">{error}</span>
            {/each}
          {/if}
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-options">
          <label class="checkbox-label">
            <input
              bind:checked={rememberMe}
              type="checkbox"
              name="rememberMe"
              class="checkbox-input"
              disabled={isLoading}
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Remember me for 30 days</span>
          </label>

          <button
            type="button"
            class="forgot-password-link"
            on:click={openForgotPassword}
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button"
          disabled={!formValid || isLoading}
        >
          {#if isLoading}
            <span class="loading-spinner"></span>
            <span>Signing in...</span>
          {:else}
            <span class="button-icon">🔐</span>
            <span>Sign In to Admin Panel</span>
          {/if}
        </button>

        <!-- Security Notice -->
        <div class="security-notice">
          <span class="security-icon">🔒</span>
          <span class="security-text">
            This is a secure area. All access attempts are logged and monitored.
          </span>
        </div>
      </form>

    <!-- Forgot Password Form -->
    {:else}
      <form 
        method="POST" 
        action="?/forgotPassword"
        class="forgot-password-form"
        use:enhance={handleForgotPassword}
      >
        <div class="form-header">
          <h2>Reset Your Password</h2>
          <p>Enter your email address and we'll send you reset instructions</p>
        </div>

        <!-- Forgot Password Success Message -->
        {#if form?.forgotPasswordSuccess}
          <div class="alert alert-success">
            <span class="alert-icon">✅</span>
            <span class="alert-message">{form.forgotPasswordSuccess}</span>
          </div>
        {/if}

        <!-- Forgot Password Error -->
        {#if form?.forgotPasswordError}
          <div class="alert alert-error">
            <span class="alert-icon">❌</span>
            <span class="alert-message">{form.forgotPasswordError}</span>
          </div>
        {/if}

        <!-- Email Field -->
        <div class="form-group">
          <label for="forgot-email" class="form-label">
            <span class="label-text">Email Address</span>
            <span class="label-required">*</span>
          </label>
          <div class="input-container">
            <input
              bind:this={forgotEmailInput}
              bind:value={forgotPasswordEmail}
              type="email"
              id="forgot-email"
              name="email"
              class="form-input"
              placeholder="Enter your admin email"
              autocomplete="email"
              required
              disabled={isLoading}
            />
            <span class="input-icon">📧</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            disabled={!forgotPasswordEmail || isLoading}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
              <span>Sending...</span>
            {:else}
              <span class="button-icon">📧</span>
              <span>Send Reset Instructions</span>
            {/if}
          </button>

          <button
            type="button"
            class="back-button"
            on:click={closeForgotPassword}
            disabled={isLoading}
          >
            ← Back to Login
          </button>
        </div>
      </form>
    {/if}

    <!-- Footer -->
    <div class="login-footer">
      <div class="footer-links">
        <a href="/" class="footer-link">← Back to Main Site</a>
        <span class="footer-separator">•</span>
        <a href="/legal/privacy" class="footer-link">Privacy Policy</a>
        <span class="footer-separator">•</span>
        <a href="/legal/terms" class="footer-link">Terms of Service</a>
      </div>
      <div class="footer-copyright">
        <p>© 2025 Hannisol. All rights reserved.</p>
        <p class="version">Admin Panel v1.0.0</p>
      </div>
    </div>
  </div>

  <!-- Side Panel -->
  <div class="side-panel">
    <div class="side-content">
      <div class="feature-list">
        <h3>Admin Features</h3>
        <div class="feature-item">
          <span class="feature-icon">📊</span>
          <div class="feature-text">
            <span class="feature-title">Real-time Analytics</span>
            <span class="feature-description">Monitor traffic, revenue, and search patterns</span>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💰</span>
          <div class="feature-text">
            <span class="feature-title">Revenue Tracking</span>
            <span class="feature-description">Track ad networks and affiliate earnings</span>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔍</span>
          <div class="feature-text">
            <span class="feature-title">Search Management</span>
            <span class="feature-description">Monitor Solana address lookups</span>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🛡️</span>
          <div class="feature-text">
            <span class="feature-title">Security Controls</span>
            <span class="feature-description">System health and security monitoring</span>
          </div>
        </div>
      </div>

      <div class="stats-preview">
        <h4>Live System Stats</h4>
        <div class="stat-item">
          <span class="stat-label">System Status</span>
          <span class="stat-value operational">Operational</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Uptime</span>
          <span class="stat-value">99.9%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Response Time</span>
          <span class="stat-value">< 200ms</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 400px;
    position: relative;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237c3aed' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .background-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%);
  }

  .login-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px;
    position: relative;
    z-index: 1;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
  }

  .logo {
    position: relative;
  }

  .logo-circle {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
    border: 4px solid rgba(255, 255, 255, 0.2);
  }

  .logo-h {
    font-size: 36px;
    font-weight: bold;
    color: #000;
    position: relative;
    z-index: 2;
  }

  .logo-accent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 6px;
    background: linear-gradient(90deg, #00bcd4 0%, #7933ff 50%, #ff6b35 100%);
    border-radius: 3px;
  }

  .brand-info {
    text-align: center;
  }

  .brand-name {
    font-family: "Times", "Georgia", serif;
    letter-spacing: 3px;
    font-weight: 400;
    font-size: 28px;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .brand-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 12px 0;
    font-weight: 500;
  }

  .brand-slogan {
    font-family: "Times", "Georgia", serif;
    font-style: italic;
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
    max-width: 300px;
    line-height: 1.4;
  }

  .system-status {
    margin-top: 16px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-size: 14px;
  }

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .alert-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .login-form,
  .forgot-password-form {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
  }

  .form-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .form-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .form-header p {
    color: #6b7280;
    margin: 0;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .label-required {
    color: #dc2626;
  }

  .input-container {
    position: relative;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 40px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.2s ease;
    background: #f9fafb;
  }

  .form-input:focus {
    outline: none;
    border-color: #7c3aed;
    background: white;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  .form-input.error {
    border-color: #dc2626;
    background: #fef2f2;
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    pointer-events: none;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .password-toggle:hover {
    background: #f3f4f6;
  }

  .password-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .field-error {
    display: block;
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-input {
    display: none;
  }

  .checkbox-custom {
    width: 16px;
    height: 16px;
    border: 2px solid #d1d5db;
    border-radius: 3px;
    background: white;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkbox-input:checked + .checkbox-custom {
    background: #7c3aed;
    border-color: #7c3aed;
  }

  .checkbox-input:checked + .checkbox-custom::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 10px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .checkbox-text {
    font-size: 14px;
    color: #374151;
  }

  .forgot-password-link {
    background: none;
    border: none;
    color: #7c3aed;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
  }

  .forgot-password-link:hover {
    color: #5b21b6;
  }

  .submit-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 20px;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .button-icon {
    font-size: 18px;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .back-button {
    width: 100%;
    padding: 12px 24px;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: #e5e7eb;
  }

  .security-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }

  .security-icon {
    font-size: 14px;
  }

  .login-footer {
    margin-top: 32px;
    text-align: center;
  }

  .footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .footer-link {
    color: #7c3aed;
    text-decoration: none;
    font-size: 14px;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  .footer-separator {
    color: #d1d5db;
  }

  .footer-copyright {
    color: #9ca3af;
    font-size: 12px;
  }

  .footer-copyright p {
    margin: 2px 0;
  }

  .version {
    opacity: 0.7;
  }

  /* Side Panel */
  .side-panel {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    color: white;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .side-content {
    max-width: 300px;
  }

  .feature-list h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 24px 0;
    color: #f9fafb;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .feature-icon {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .feature-text {
    flex: 1;
  }

  .feature-title {
    display: block;
    font-weight: 600;
    color: #f9fafb;
    margin-bottom: 4px;
  }

  .feature-description {
    display: block;
    font-size: 14px;
    color: #d1d5db;
    line-height: 1.4;
  }

  .stats-preview {
    margin-top: 40px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .stats-preview h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #f9fafb;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .stat-item:last-child {
    margin-bottom: 0;
  }

  .stat-label {
    font-size: 14px;
    color: #d1d5db;
  }

  .stat-value {
    font-weight: 600;
    color: #f9fafb;
  }

  .stat-value.operational {
    color: #34d399;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .login-container {
      grid-template-columns: 1fr;
    }

    .side-panel {
      display: none;
    }

    .login-card {
      padding: 24px;
    }
  }

  @media (max-width: 768px) {
    .login-card {
      padding: 16px;
    }

    .login-form,
    .forgot-password-form {
      padding: 24px;
    }

    .brand-name {
      font-size: 24px;
      letter-spacing: 2px;
    }

    .logo-circle {
      width: 60px;
      height: 60px;
    }

    .logo-h {
      font-size: 28px;
    }

    .form-options {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .footer-links {
      flex-direction: column;
      gap: 4px;
    }

    .footer-separator {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .login-container {
      padding: 16px;
    }

    .login-card {
      padding: 12px;
    }

    .login-form,
    .forgot-password-form {
      padding: 20px;
    }

    .form-input {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }
</style>