import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { authUtils } from '$lib/utils/auth';
import { analyticsActions } from '$lib/stores/analytics';

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
  // Get authentication token from cookies
  const token = cookies.get('hannisol_auth_token');
  
  if (!token) {
    // Redirect to login if no token
    throw redirect(302, `/admin/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  try {
    // Verify token and get user info
    const response = await fetch(`${url.origin}/api/admin/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!response.ok) {
      // Invalid token, clear cookie and redirect
      cookies.delete('hannisol_auth_token', { path: '/' });
      throw redirect(302, `/admin/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    const { user } = await response.json();

    // Check if user has admin permissions
    if (user.role !== 'admin') {
      throw redirect(302, '/admin/login?error=insufficient_permissions');
    }

    // Get basic analytics data for sidebar
    let basicAnalytics = null;
    try {
      const analyticsResponse = await fetch(`${url.origin}/api/analytics/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      if (analyticsResponse.ok) {
        basicAnalytics = await analyticsResponse.json();
      }
    } catch (error) {
      console.warn('Failed to load basic analytics:', error);
    }

    // Get real-time metrics
    let realTimeData = null;
    try {
      const realTimeResponse = await fetch(`${url.origin}/api/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      if (realTimeResponse.ok) {
        realTimeData = await realTimeResponse.json();
      }
    } catch (error) {
      console.warn('Failed to load real-time data:', error);
    }

    // Get system status
    let systemStatus = null;
    try {
      const statusResponse = await fetch(`${url.origin}/api/admin/system/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      if (statusResponse.ok) {
        systemStatus = await statusResponse.json();
      }
    } catch (error) {
      console.warn('Failed to load system status:', error);
    }

    return {
      user,
      isAuthenticated: true,
      basicAnalytics,
      realTimeData,
      systemStatus,
      currentPath: url.pathname
    };

  } catch (error) {
    console.error('Admin layout auth error:', error);
    
    // Clear any invalid tokens
    cookies.delete('hannisol_auth_token', { path: '/' });
    
    throw redirect(302, `/admin/login?error=auth_failed&redirect=${encodeURIComponent(url.pathname)}`);
  }
};