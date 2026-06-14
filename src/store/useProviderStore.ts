import { create } from 'zustand';
import type { Provider, Review, ServiceType } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { STORAGE_KEYS, MOCK_PROVIDERS, MOCK_REVIEWS } from '@/utils/constants';

interface ProviderState {
  providers: Provider[];
  reviews: Review[];
  filterType: ServiceType | 'all';
  searchQuery: string;
  sortBy: 'rating' | 'date';
  init: () => void;
  setFilterType: (type: ServiceType | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'rating' | 'date') => void;
  addProvider: (data: Omit<Provider, 'id' | 'avgRating' | 'reviewCount' | 'createdAt' | 'updatedAt'>) => void;
  updateProvider: (id: string, data: Partial<Provider>) => void;
  deleteProvider: (id: string) => void;
  addReview: (providerId: string, data: Omit<Review, 'id' | 'providerId' | 'createdAt'>) => void;
  getReviewsByProvider: (providerId: string) => Review[];
  getFilteredProviders: () => Provider[];
  exportData: () => string;
  importData: (data: string) => boolean;
}

const calculateAvgRating = (reviews: Review[], providerId: string): number => {
  const providerReviews = reviews.filter((r) => r.providerId === providerId);
  if (providerReviews.length === 0) return 0;
  const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / providerReviews.length) * 10) / 10;
};

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: [],
  reviews: [],
  filterType: 'all',
  searchQuery: '',
  sortBy: 'rating',

  init: () => {
    const storedProviders = loadFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, []);
    const storedReviews = loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);

    if (storedProviders.length === 0 && storedReviews.length === 0) {
      set({
        providers: MOCK_PROVIDERS,
        reviews: MOCK_REVIEWS,
      });
      saveToStorage(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
      saveToStorage(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
    } else {
      set({
        providers: storedProviders,
        reviews: storedReviews,
      });
    }
  },

  setFilterType: (type) => set({ filterType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),

  addProvider: (data) => {
    const now = new Date().toISOString();
    const newProvider: Provider = {
      ...data,
      id: generateId(),
      avgRating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const providers = [...get().providers, newProvider];
    set({ providers });
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
  },

  updateProvider: (id, data) => {
    const providers = get().providers.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    set({ providers });
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
  },

  deleteProvider: (id) => {
    const providers = get().providers.filter((p) => p.id !== id);
    const reviews = get().reviews.filter((r) => r.providerId !== id);
    set({ providers, reviews });
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  },

  addReview: (providerId, data) => {
    const newReview: Review = {
      ...data,
      id: generateId(),
      providerId,
      createdAt: new Date().toISOString(),
    };
    const reviews = [...get().reviews, newReview];
    const avgRating = calculateAvgRating(reviews, providerId);
    const reviewCount = reviews.filter((r) => r.providerId === providerId).length;
    const providers = get().providers.map((p) =>
      p.id === providerId
        ? { ...p, avgRating, reviewCount, updatedAt: new Date().toISOString() }
        : p
    );
    set({ providers, reviews });
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  },

  getReviewsByProvider: (providerId) => {
    return get().reviews.filter((r) => r.providerId === providerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getFilteredProviders: () => {
    const { providers, filterType, searchQuery, sortBy } = get();
    let filtered = [...providers];

    if (filterType !== 'all') {
      filtered = filtered.filter((p) => p.serviceTypes.includes(filterType));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query) || p.phone.includes(query)
      );
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.avgRating - a.avgRating);
    } else {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return filtered;
  },

  exportData: () => {
    const { providers, reviews } = get();
    return JSON.stringify({ providers, reviews }, null, 2);
  },

  importData: (dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      if (data.providers && data.reviews) {
        set({ providers: data.providers, reviews: data.reviews });
        saveToStorage(STORAGE_KEYS.PROVIDERS, data.providers);
        saveToStorage(STORAGE_KEYS.REVIEWS, data.reviews);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  },
}));
