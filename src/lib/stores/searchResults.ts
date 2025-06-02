import { writable, derived, type Readable } from 'svelte/store';
import type { 
  SolanaAddressInfo, 
  SearchResult, 
  RiskAnalysis, 
  TransactionHistory,
  TokenBalance,
  CommunityData 
} from '$lib/types/solana';

// Search state
export interface SearchState {
  query: string;
  isSearching: boolean;
  results: SearchResult | null;
  error: string | null;
  lastSearchTime: number | null;
  searchHistory: string[];
}

// Initial search state
const initialSearchState: SearchState = {
  query: '',
  isSearching: false,
  results: null,
  error: null,
  lastSearchTime: null,
  searchHistory: []
};

// Main search store
export const searchStore = writable<SearchState>(initialSearchState);

// Search query store (for input binding)
export const searchQuery = writable<string>('');

// Search history (stored in localStorage)
export const searchHistory = writable<string[]>([]);

// Loading states for different operations
export const validationLoading = writable<boolean>(false);
export const balanceLoading = writable<boolean>(false);
export const transactionLoading = writable<boolean>(false);
export const riskAnalysisLoading = writable<boolean>(false);
export const communityDataLoading = writable<boolean>(false);

// Derived stores for specific result data
export const addressValidation: Readable<SolanaAddressInfo | null> = derived(
  searchStore,
  ($searchStore) => $searchStore.results?.addressInfo || null
);

export const balanceData: Readable<TokenBalance[] | null> = derived(
  searchStore,
  ($searchStore) => $searchStore.results?.balances || null
);

export const transactionData: Readable<TransactionHistory[] | null> = derived(
  searchStore,
  ($searchStore) => $searchStore.results?.transactions || null
);

export const riskAnalysisData: Readable<RiskAnalysis | null> = derived(
  searchStore,
  ($searchStore) => $searchStore.results?.riskAnalysis || null
);

export const communityData: Readable<CommunityData | null> = derived(
  searchStore,
  ($searchStore) => $searchStore.results?.communityData || null
);

export const isValidAddress: Readable<boolean> = derived(
  addressValidation,
  ($addressValidation) => $addressValidation?.isValid || false
);

export const hasResults: Readable<boolean> = derived(
  searchStore,
  ($searchStore) => $searchStore.results !== null && !$searchStore.error
);

// Search history management
const SEARCH_HISTORY_KEY = 'hannisol_search_history';
const MAX_HISTORY_ITEMS = 50;

const loadSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = (history: string[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

// Initialize search history
if (typeof window !== 'undefined') {
  searchHistory.set(loadSearchHistory());
}

// Search actions
export const searchActions = {
  // Main search function
  async searchAddress(address: string, options: { 
    includeTransactions?: boolean;
    includeRiskAnalysis?: boolean;
    includeCommunityData?: boolean;
    forceRefresh?: boolean;
  } = {}) {
    // Validate input
    if (!address.trim()) {
      searchStore.update(state => ({
        ...state,
        error: 'Please enter a valid Solana address'
      }));
      return;
    }

    // Update search state
    searchStore.update(state => ({
      ...state,
      query: address.trim(),
      isSearching: true,
      error: null,
      results: options.forceRefresh ? null : state.results
    }));

    try {
      // Track search start time
      const searchStartTime = Date.now();

      // Prepare search options
      const searchOptions = {
        includeTransactions: options.includeTransactions ?? true,
        includeRiskAnalysis: options.includeRiskAnalysis ?? true,
        includeCommunityData: options.includeCommunityData ?? true,
        forceRefresh: options.forceRefresh ?? false
      };

      // Call search API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: address.trim(),
          options: searchOptions,
          timestamp: searchStartTime
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Search failed: ${response.statusText}`);
      }

      const results: SearchResult = await response.json();

      // Update search state with results
      searchStore.update(state => ({
        ...state,
        isSearching: false,
        results,
        error: null,
        lastSearchTime: Date.now()
      }));

      // Add to search history
      this.addToHistory(address.trim());

      // Track successful search
      await this.trackSearch(address.trim(), 'success', Date.now() - searchStartTime);

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      
      searchStore.update(state => ({
        ...state,
        isSearching: false,
        error: errorMessage
      }));

      // Track failed search
      await this.trackSearch(address.trim(), 'error', Date.now() - (Date.now()));
      
      throw error;
    }
  },

  // Validate address format only
  async validateAddressFormat(address: string) {
    validationLoading.set(true);
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const validation = await response.json();
      return validation;
    } catch (error) {
      console.error('Address validation failed:', error);
      return { isValid: false, error: 'Validation failed' };
    } finally {
      validationLoading.set(false);
    }
  },

  // Get balance data only
  async getBalanceData(address: string) {
    balanceLoading.set(true);
    
    try {
      const response = await fetch(`/api/balance/${address}`);
      
      if (!response.ok) {
        throw new Error('Balance fetch failed');
      }

      const balances = await response.json();
      
      // Update only balance data in results
      searchStore.update(state => ({
        ...state,
        results: state.results ? {
          ...state.results,
          balances
        } : null
      }));

      return balances;
    } catch (error) {
      console.error('Balance fetch failed:', error);
      throw error;
    } finally {
      balanceLoading.set(false);
    }
  },

  // Get transaction history
  async getTransactionHistory(address: string, limit: number = 50) {
    transactionLoading.set(true);
    
    try {
      const response = await fetch(`/api/transactions/${address}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Transaction fetch failed');
      }

      const transactions = await response.json();
      
      // Update only transaction data in results
      searchStore.update(state => ({
        ...state,
        results: state.results ? {
          ...state.results,
          transactions
        } : null
      }));

      return transactions;
    } catch (error) {
      console.error('Transaction fetch failed:', error);
      throw error;
    } finally {
      transactionLoading.set(false);
    }
  },

  // Get risk analysis
  async getRiskAnalysis(address: string) {
    riskAnalysisLoading.set(true);
    
    try {
      const response = await fetch(`/api/risk-analysis/${address}`);
      
      if (!response.ok) {
        throw new Error('Risk analysis failed');
      }

      const riskAnalysis = await response.json();
      
      // Update only risk analysis data in results
      searchStore.update(state => ({
        ...state,
        results: state.results ? {
          ...state.results,
          riskAnalysis
        } : null
      }));

      return riskAnalysis;
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw error;
    } finally {
      riskAnalysisLoading.set(false);
    }
  },

  // Get community data
  async getCommunityData(address: string) {
    communityDataLoading.set(true);
    
    try {
      const response = await fetch(`/api/community-data/${address}`);
      
      if (!response.ok) {
        throw new Error('Community data fetch failed');
      }

      const communityData = await response.json();
      
      // Update only community data in results
      searchStore.update(state => ({
        ...state,
        results: state.results ? {
          ...state.results,
          communityData
        } : null
      }));

      return communityData;
    } catch (error) {
      console.error('Community data fetch failed:', error);
      throw error;
    } finally {
      communityDataLoading.set(false);
    }
  },

  // Add address to search history
  addToHistory(address: string) {
    searchHistory.update(history => {
      const filtered = history.filter(item => item !== address);
      const updated = [address, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveSearchHistory(updated);
      return updated;
    });
  },

  // Remove from search history
  removeFromHistory(address: string) {
    searchHistory.update(history => {
      const updated = history.filter(item => item !== address);
      saveSearchHistory(updated);
      return updated;
    });
  },

  // Clear search history
  clearHistory() {
    searchHistory.set([]);
    saveSearchHistory([]);
  },

  // Clear current search results
  clearResults() {
    searchStore.update(state => ({
      ...state,
      results: null,
      error: null,
      query: ''
    }));
    searchQuery.set('');
  },

  // Clear error state
  clearError() {
    searchStore.update(state => ({ ...state, error: null }));
  },

  // Track search analytics
  async trackSearch(address: string, result: 'success' | 'error', duration: number) {
    try {
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          result,
          duration,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  },

  // Share search results
  async shareResults(address: string) {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Share generation failed');
      }

      const { shareId, shareUrl } = await response.json();
      return { shareId, shareUrl };
    } catch (error) {
      console.error('Failed to create share link:', error);
      throw error;
    }
  },

  // Get search suggestions based on history
  getSearchSuggestions(query: string): string[] {
    if (!query.trim()) return [];
    
    let history: string[] = [];
    searchHistory.subscribe(h => history = h)();
    
    return history
      .filter(address => address.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
};

// Auto-clear search query when component unmounts
export const resetSearchQuery = () => {
  searchQuery.set('');
};