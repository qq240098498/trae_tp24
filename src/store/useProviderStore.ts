import { create } from 'zustand';
import type { Provider, Review, ServiceType, ServiceRecord } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { STORAGE_KEYS, MOCK_PROVIDERS, MOCK_REVIEWS, MOCK_SERVICE_RECORDS, DATA_VERSION } from '@/utils/constants';

interface ProviderState {
  providers: Provider[];
  reviews: Review[];
  serviceRecords: ServiceRecord[];
  filterType: ServiceType | 'all';
  searchQuery: string;
  sortBy: 'rating' | 'date';
  init: () => void;
  setFilterType: (type: ServiceType | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'rating' | 'date') => void;
  addProvider: (data: Omit<Provider, 'id' | 'avgRating' | 'reviewCount' | 'emergency' | 'createdAt' | 'updatedAt'> & { emergency?: Partial<Provider['emergency']> }) => void;
  updateProvider: (id: string, data: Partial<Provider>) => void;
  deleteProvider: (id: string) => void;
  addReview: (providerId: string, data: Omit<Review, 'id' | 'providerId' | 'createdAt'>) => void;
  getReviewsByProvider: (providerId: string) => Review[];
  addServiceRecord: (providerId: string, data: Omit<ServiceRecord, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceRecord: (id: string, data: Partial<ServiceRecord>) => void;
  deleteServiceRecord: (id: string) => void;
  getServiceRecordsByProvider: (providerId: string) => ServiceRecord[];
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
  serviceRecords: [],
  filterType: 'all',
  searchQuery: '',
  sortBy: 'rating',

  init: () => {
    const storedVersion = loadFromStorage<number>(STORAGE_KEYS.VERSION, 0);
    const storedProviders = loadFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, []);
    const storedReviews = loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);
    const storedServiceRecords = loadFromStorage<ServiceRecord[]>(STORAGE_KEYS.SERVICE_RECORDS, []);

    const shouldReset = 
      storedVersion < DATA_VERSION ||
      (storedProviders.length > 0 && storedServiceRecords.length === 0);

    if (storedProviders.length === 0 && storedReviews.length === 0 && storedServiceRecords.length === 0) {
      set({
        providers: MOCK_PROVIDERS,
        reviews: MOCK_REVIEWS,
        serviceRecords: MOCK_SERVICE_RECORDS,
      });
      saveToStorage(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
      saveToStorage(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
      saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, MOCK_SERVICE_RECORDS);
      saveToStorage(STORAGE_KEYS.VERSION, DATA_VERSION);
    } else if (shouldReset) {
      set({
        providers: MOCK_PROVIDERS,
        reviews: MOCK_REVIEWS,
        serviceRecords: MOCK_SERVICE_RECORDS,
      });
      saveToStorage(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
      saveToStorage(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
      saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, MOCK_SERVICE_RECORDS);
      saveToStorage(STORAGE_KEYS.VERSION, DATA_VERSION);
    } else {
      set({
        providers: storedProviders,
        reviews: storedReviews,
        serviceRecords: storedServiceRecords,
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
      emergency: {
        isEmergency: false,
        is24Hours: false,
        emergencyNote: '',
        ...data.emergency,
      },
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
    const serviceRecords = get().serviceRecords.filter((r) => r.providerId !== id);
    set({ providers, reviews, serviceRecords });
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, serviceRecords);
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

  addServiceRecord: (providerId, data) => {
    const now = new Date().toISOString();
    const newRecord: ServiceRecord = {
      ...data,
      id: generateId(),
      providerId,
      createdAt: now,
      updatedAt: now,
    };
    const serviceRecords = [...get().serviceRecords, newRecord];
    const providers = get().providers.map((p) =>
      p.id === providerId ? { ...p, updatedAt: now } : p
    );
    set({ serviceRecords, providers });
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, serviceRecords);
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
  },

  updateServiceRecord: (id, data) => {
    const now = new Date().toISOString();
    const serviceRecords = get().serviceRecords.map((r) =>
      r.id === id ? { ...r, ...data, updatedAt: now } : r
    );
    set({ serviceRecords });
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, serviceRecords);
  },

  deleteServiceRecord: (id) => {
    const serviceRecords = get().serviceRecords.filter((r) => r.id !== id);
    set({ serviceRecords });
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, serviceRecords);
  },

  getServiceRecordsByProvider: (providerId) => {
    return get().serviceRecords.filter((r) => r.providerId === providerId).sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
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
    const { providers, reviews, serviceRecords } = get();
    return JSON.stringify({ providers, reviews, serviceRecords }, null, 2);
  },

  importData: (dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      if (data.providers && data.reviews && data.serviceRecords) {
        set({
          providers: data.providers,
          reviews: data.reviews,
          serviceRecords: data.serviceRecords,
        });
        saveToStorage(STORAGE_KEYS.PROVIDERS, data.providers);
        saveToStorage(STORAGE_KEYS.REVIEWS, data.reviews);
        saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, data.serviceRecords);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  },
}));
