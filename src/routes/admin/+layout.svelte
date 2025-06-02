<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authActions } from '$lib/stores/auth';
  import { analyticsActions } from '$lib/stores/analytics';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let sidebarOpen = true;
  let userMenuOpen = false;

  // Navigation items
  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & metrics'
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Traffic & revenue data'
    },
    {
      href: '/admin/searches',
      label: 'Searches',
      icon: '🔍',
      description: 'Search history & patterns'
    },
    {
      href: '/admin/revenue',
      label: 'Revenue',
      icon: '💰',
      description: 'Ads & affiliate earnings'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: '👥',
      description: 'User management'
    },
    {
      href: '/admin/system',
      label: 'System',
      icon: '⚙️',
      description: 'Settings & maintenance'
    }
  ];

  // Handle logout
  async function handleLogout() {
    await authActions.logout();
    goto('/admin/login');
  }

  // Toggle sidebar
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Toggle user menu
  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  // Close user menu when clicking outside
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.user-menu-container')) {
      userMenuOpen = false;
    }
  }

  // Format number for display
  function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  }

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  });

  $: currentPath = $page.url.pathname;
  $: isCurrentPage = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(href);
  };
</script>

<svelte:head>
  <title>Admin Dashboard - Hannisol</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-layout">
  <!-- Sidebar -->
  <aside class="sidebar" class:collapsed={!sidebarOpen}>
    <!-- Logo -->
    <div class="sidebar-header">
      <a href="/admin" class="logo-link">
        <div class="logo">
          <div class="logo-circle">
            <span class="logo-h">H</span>
            <div class="logo-accent"></div>
          </div>
        </div>
        {#if sidebarOpen}
          <div class="brand-text">
            <span class="brand-name">HANNISOL</span>
            <span class="brand-subtitle">Admin Panel</span>
          </div>
        {/if}
      </a>
      
      <button class="sidebar-toggle" on:click={toggleSidebar} aria-label="Toggle sidebar">
        <span class="toggle-icon" class:rotated={!sidebarOpen}>
          {sidebarOpen ? '❮' : '❯'}
        </span>
      </button>
    </div>

    <!-- Real-time stats -->
    {#if sidebarOpen && data.realTimeData}
      <div class="realtime-stats">
        <h3>Live Stats</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-value">{data.realTimeData.activeUsers}</span>
            <span class="stat-label">Active Users</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{formatCurrency(data.realTimeData.currentRevenue)}</span>
            <span class="stat-label">Today's Revenue</span>
          </div>
        </div>
        <div class="status-indicator" class:healthy={data.realTimeData.serverStatus === 'healthy'}>
          <span class="status-dot"></span>
          {data.realTimeData.serverStatus === 'healthy' ? 'System Healthy' : 'System Issues'}
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        {#each navItems as item}
          <li class="nav-item">
            <a 
              href={item.href} 
              class="nav-link"
              class:active={isCurrentPage(item.href)}
              title={item.description}
            >
              <span class="nav-icon">{item.icon}</span>
              {#if sidebarOpen}
                <div class="nav-content">
                  <span class="nav-label">{item.label}</span>
                  <span class="nav-description">{item.description}</span>
                </div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Quick actions -->
    {#if sidebarOpen}
      <div class="quick-actions">
        <h4>Quick Actions</h4>
        <div class="action-buttons">
          <button class="action-btn" on:click={() => goto('/')}>
            <span>🌐</span>
            View Site
          </button>
          <button class="action-btn" on:click={() => analyticsActions.exportData('7d')}>
            <span>📥</span>
            Export Data
          </button>
        </div>
      </div>
    {/if}

    <!-- Footer -->
    {#if sidebarOpen}
      <div class="sidebar-footer">
        <p class="version">v1.0.0</p>
        <p class="copyright">© 2025 Hannisol</p>
      </div>
    {/if}
  </aside>

  <!-- Main content area -->
  <div class="main-content" class:sidebar-collapsed={!sidebarOpen}>
    <!-- Header -->
    <header class="main-header">
      <div class="header-left">
        <h1 class="page-title">
          {#if currentPath === '/admin'}
            Dashboard
          {:else if currentPath.includes('/analytics')}
            Analytics
          {:else if currentPath.includes('/searches')}
            Search Analytics
          {:else if currentPath.includes('/revenue')}
            Revenue Management
          {:else if currentPath.includes('/users')}
            User Management
          {:else if currentPath.includes('/system')}
            System Settings
          {:else}
            Admin Panel
          {/if}
        </h1>
        <div class="breadcrumb">
          <a href="/admin">Admin</a>
          {#if currentPath !== '/admin'}
            <span class="separator">›</span>
            <span class="current">
              {currentPath.split('/').pop()?.replace('-', ' ') || 'Page'}
            </span>
          {/if}
        </div>
      </div>

      <div class="header-right">
        <!-- Notifications -->
        <button class="header-btn" title="Notifications">
          <span class="icon">🔔</span>
          <span class="notification-badge">3</span>
        </button>

        <!-- User menu -->
        <div class="user-menu-container">
          <button class="user-menu-trigger" on:click={toggleUserMenu}>
            <div class="user-avatar">
              <span>{data.user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{data.user.username}</span>
              <span class="user-role">{data.user.role}</span>
            </div>
            <span class="dropdown-arrow" class:open={userMenuOpen}>▼</span>
          </button>

          {#if userMenuOpen}
            <div class="user-menu">
              <div class="menu-header">
                <div class="user-details">
                  <span class="email">{data.user.email}</span>
                  <span class="last-login">
                    Last login: {new Date(data.user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div class="menu-items">
                <a href="/admin/profile" class="menu-item">
                  <span class="menu-icon">👤</span>
                  Profile Settings
                </a>
                <a href="/admin/security" class="menu-item">
                  <span class="menu-icon">🔒</span>
                  Security
                </a>
                <div class="menu-divider"></div>
                <button class="menu-item logout" on:click={handleLogout}>
                  <span class="menu-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="page-content">
      <slot />
    </main>
  </div>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
  }

  /* Sidebar */
  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    z-index: 1000;
  }

  .sidebar.collapsed {
    width: 80px;
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
  }

  .logo-circle {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }

  .logo-h {
    font-size: 20px;
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
    width: 12px;
    height: 3px;
    background: linear-gradient(90deg, #00bcd4 0%, #7933ff 50%, #ff6b35 100%);
    border-radius: 2px;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-family: "Times", "Georgia", serif;
    letter-spacing: 2px;
    font-weight: 400;
    font-size: 16px;
    color: #1f2937;
    line-height: 1;
  }

  .brand-subtitle {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
  }

  .sidebar-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }

  .sidebar-toggle:hover {
    background: #f3f4f6;
  }

  .toggle-icon {
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  .toggle-icon.rotated {
    transform: rotate(180deg);
  }

  .realtime-stats {
    padding: 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  .realtime-stats h3 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 16px;
    font-weight: bold;
    color: #7c3aed;
  }

  .stat-label {
    display: block;
    font-size: 10px;
    color: #6b7280;
    margin-top: 2px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
  }

  .status-indicator.healthy .status-dot {
    background: #10b981;
  }

  .sidebar-nav {
    flex: 1;
    padding: 20px 0;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    margin-bottom: 4px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    text-decoration: none;
    color: #6b7280;
    transition: all 0.2s ease;
    position: relative;
  }

  .nav-link:hover {
    background: #f8fafc;
    color: #374151;
  }

  .nav-link.active {
    background: #f3e8ff;
    color: #7c3aed;
    border-right: 3px solid #7c3aed;
  }

  .nav-icon {
    font-size: 18px;
    min-width: 18px;
  }

  .nav-content {
    flex: 1;
  }

  .nav-label {
    display: block;
    font-weight: 500;
    font-size: 14px;
  }

  .nav-description {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 1px;
  }

  .quick-actions {
    padding: 20px;
    border-top: 1px solid #f1f5f9;
  }

  .quick-actions h4 {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid #f1f5f9;
    text-align: center;
  }

  .version, .copyright {
    font-size: 10px;
    color: #9ca3af;
    margin: 2px 0;
  }

  /* Main content */
  .main-content {
    flex: 1;
    margin-left: 280px;
    transition: margin-left 0.3s ease;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content.sidebar-collapsed {
    margin-left: 80px;
  }

  .main-header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
  }

  .breadcrumb a {
    color: #7c3aed;
    text-decoration: none;
  }

  .breadcrumb a:hover {
    text-decoration: underline;
  }

  .separator {
    color: #d1d5db;
  }

  .current {
    color: #374151;
    text-transform: capitalize;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-btn {
    position: relative;
    background: none;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: #6b7280;
    transition: background-color 0.2s ease;
  }

  .header-btn:hover {
    background: #f3f4f6;
  }

  .notification-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-menu-container {
    position: relative;
  }

  .user-menu-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .user-menu-trigger:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  .user-role {
    font-size: 12px;
    color: #6b7280;
    text-transform: capitalize;
  }

  .dropdown-arrow {
    font-size: 10px;
    color: #9ca3af;
    transition: transform 0.2s ease;
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
    margin-top: 4px;
  }

  .menu-header {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .user-details .email {
    display: block;
    font-size: 14px;
    color: #374151;
    margin-bottom: 4px;
  }

  .user-details .last-login {
    font-size: 12px;
    color: #6b7280;
  }

  .menu-items {
    padding: 8px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    text-decoration: none;
    color: #374151;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: left;
  }

  .menu-item:hover {
    background: #f8fafc;
  }

  .menu-item.logout {
    color: #dc2626;
  }

  .menu-item.logout:hover {
    background: #fef2f2;
  }

  .menu-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 8px 0;
  }

  .page-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .sidebar {
      width: 80px;
    }

    .sidebar.collapsed {
      width: 0;
      border-right: none;
    }

    .main-content {
      margin-left: 80px;
    }

    .main-content.sidebar-collapsed {
      margin-left: 0;
    }

    .realtime-stats, .quick-actions, .sidebar-footer {
      display: none;
    }

    .nav-description {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .main-header {
      padding: 12px 16px;
    }

    .page-content {
      padding: 16px;
    }

    .user-info {
      display: none;
    }

    .page-title {
      font-size: 20px;
    }
  }
</style>