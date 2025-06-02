<script lang="ts">
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let isMenuOpen = false;
  let isScrolled = false;

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 50;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
  };

  const navItems = [
    { href: '/', label: 'Address Checker', icon: '🔍' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
    { href: '/legal/privacy', label: 'Privacy', icon: '🔒' },
    { href: '/legal/terms', label: 'Terms', icon: '📋' }
  ];
</script>

<nav class="nav" class:scrolled={isScrolled}>
  <div class="nav-container">
    <!-- Logo and Brand -->
    <div class="brand">
      <a href="/" class="logo-link">
        <div class="logo">
          <div class="logo-circle">
            <span class="logo-h">H</span>
            <div class="logo-accent"></div>
          </div>
        </div>
        <div class="brand-text">
          <span class="brand-name">HANNISOL</span>
          <span class="brand-tagline">Solana Address Checker</span>
        </div>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <div class="desktop-nav">
      <ul class="nav-list">
        {#each navItems as item}
          <li class="nav-item">
            <a 
              href={item.href} 
              class="nav-link"
              class:active={$page.url.pathname === item.href}
            >
              <span class="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
      
      <!-- Admin Link (if authenticated) -->
      {#if $authStore.isAuthenticated}
        <a href="/admin" class="admin-link">
          <span>⚙️</span>
          Dashboard
        </a>
      {/if}
    </div>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" on:click={toggleMenu} aria-label="Toggle menu">
      <span class="hamburger" class:open={isMenuOpen}></span>
    </button>
  </div>

  <!-- Mobile Navigation -->
  {#if isMenuOpen}
    <div class="mobile-nav">
      <ul class="mobile-nav-list">
        {#each navItems as item}
          <li class="mobile-nav-item">
            <a 
              href={item.href} 
              class="mobile-nav-link"
              on:click={toggleMenu}
              class:active={$page.url.pathname === item.href}
            >
              <span class="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          </li>
        {/each}
        
        {#if $authStore.isAuthenticated}
          <li class="mobile-nav-item">
            <a href="/admin" class="mobile-nav-link" on:click={toggleMenu}>
              <span class="nav-icon">⚙️</span>
              Dashboard
            </a>
          </li>
        {/if}
      </ul>
    </div>
  {/if}
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e5e7eb;
    transition: all 0.3s ease;
  }

  .nav.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
  }

  .brand {
    display: flex;
    align-items: center;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 16px;
    text-decoration: none;
    color: inherit;
  }

  .logo {
    position: relative;
  }

  .logo-circle {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }

  .logo-h {
    font-size: 24px;
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
    width: 16px;
    height: 4px;
    background: linear-gradient(90deg, #00bcd4 0%, #7933ff 50%, #ff6b35 100%);
    border-radius: 2px;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-family: "Times", "Georgia", serif;
    letter-spacing: 3px;
    font-weight: 400;
    font-size: 18px;
    color: #1f2937;
    line-height: 1;
  }

  .brand-tagline {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 24px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    text-decoration: none;
    color: #374151;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .nav-link:hover {
    color: #7c3aed;
    background: #f3f4f6;
  }

  .nav-link.active {
    color: #7c3aed;
    background: #f3e8ff;
  }

  .nav-icon {
    font-size: 16px;
  }

  .admin-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .admin-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    position: relative;
  }

  .hamburger {
    display: block;
    width: 24px;
    height: 2px;
    background: #374151;
    transition: all 0.3s ease;
    position: relative;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background: #374151;
    transition: all 0.3s ease;
  }

  .hamburger::before {
    top: -8px;
  }

  .hamburger::after {
    bottom: -8px;
  }

  .hamburger.open {
    background: transparent;
  }

  .hamburger.open::before {
    transform: rotate(45deg);
    top: 0;
  }

  .hamburger.open::after {
    transform: rotate(-45deg);
    bottom: 0;
  }

  .mobile-nav {
    display: none;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 16px 0;
  }

  .mobile-nav-list {
    list-style: none;
    margin: 0;
    padding: 0 24px;
  }

  .mobile-nav-item {
    border-bottom: 1px solid #f3f4f6;
  }

  .mobile-nav-item:last-child {
    border-bottom: none;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    text-decoration: none;
    color: #374151;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .mobile-nav-link:hover,
  .mobile-nav-link.active {
    color: #7c3aed;
  }

  @media (max-width: 768px) {
    .brand-tagline {
      display: none;
    }

    .desktop-nav {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .mobile-nav {
      display: block;
    }

    .nav-container {
      padding: 0 16px;
    }
  }

  @media (max-width: 480px) {
    .brand-name {
      font-size: 16px;
      letter-spacing: 2px;
    }

    .logo-circle {
      width: 40px;
      height: 40px;
    }

    .logo-h {
      font-size: 20px;
    }
  }
</style>