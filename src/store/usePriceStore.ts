import { create } from 'zustand';
import type { PriceReference, PriceReferenceFilters, ServiceType, PriceSource } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { STORAGE_KEYS, MOCK_PRICE_REFERENCES, DEFAULT_REGION } from '@/utils/constants';

interface PriceStoreState {
  priceReferences: PriceReference[];
  filters: PriceReferenceFilters;
  userNickname: string;
  votedPrices: Record<string, 'helpful' | 'unhelpful'>;
  init: () => void;
  setFilters: (filters: Partial<PriceReferenceFilters>) => void;
  setUserNickname: (nickname: string) => void;
  addPriceReference: (
    data: Omit<PriceReference, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount' | 'verificationCount' | 'contributorNickname'> & {
      contributorNickname?: string;
    }
  ) => void;
  updatePriceReference: (id: string, data: Partial<PriceReference>) => void;
  deletePriceReference: (id: string) => void;
  voteHelpful: (id: string) => void;
  voteUnhelpful: (id: string) => void;
  markAsVerified: (id: string) => void;
  getFilteredPriceReferences: () => PriceReference[];
  getPriceReferencesByServiceType: (serviceType: ServiceType) => PriceReference[];
  getPriceRange: (itemName: string, serviceType: ServiceType) => { min: number; max: number; avg: number; references: PriceReference[] } | null;
  getAllItemNames: () => string[];
  exportCommunityData: () => string;
  importCommunityData: (data: string) => boolean;
}

export const usePriceStore = create<PriceStoreState>((set, get) => ({
  priceReferences: [],
  filters: {
    serviceType: 'all',
    searchQuery: '',
    source: 'both',
    sortBy: 'helpful',
  },
  userNickname: '',
  votedPrices: {},

  init: () => {
    const storedPrices = loadFromStorage<PriceReference[]>(STORAGE_KEYS.PRICE_REFERENCES, []);
    const storedNickname = loadFromStorage<string>(STORAGE_KEYS.USER_NICKNAME, '');
    const storedVotes = loadFromStorage<Record<string, 'helpful' | 'unhelpful'>>(STORAGE_KEYS.VOTED_PRICES, {});

    if (storedPrices.length === 0) {
      set({
        priceReferences: MOCK_PRICE_REFERENCES,
        userNickname: storedNickname,
        votedPrices: storedVotes,
      });
      saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, MOCK_PRICE_REFERENCES);
    } else {
      set({
        priceReferences: storedPrices,
        userNickname: storedNickname,
        votedPrices: storedVotes,
      });
    }
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setUserNickname: (nickname) => {
    set({ userNickname: nickname });
    saveToStorage(STORAGE_KEYS.USER_NICKNAME, nickname);
  },

  addPriceReference: (data) => {
    const now = new Date().toISOString();
    const state = get();
    const nickname = data.contributorNickname || state.userNickname || '匿名用户';
    const newPrice: PriceReference = {
      ...data,
      id: generateId(),
      contributorNickname: data.isAnonymous ? '匿名用户' : nickname,
      helpfulCount: 0,
      unhelpfulCount: 0,
      verificationCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const priceReferences = [...state.priceReferences, newPrice];
    set({ priceReferences });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
  },

  updatePriceReference: (id, data) => {
    const priceReferences = get().priceReferences.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    set({ priceReferences });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
  },

  deletePriceReference: (id) => {
    const priceReferences = get().priceReferences.filter((p) => p.id !== id);
    set({ priceReferences });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
  },

  voteHelpful: (id) => {
    const state = get();
    const existingVote = state.votedPrices[id];
    let votedPrices = { ...state.votedPrices };
    const priceReferences = state.priceReferences.map((p) => {
      if (p.id === id) {
        let helpfulCount = p.helpfulCount;
        let unhelpfulCount = p.unhelpfulCount;
        if (existingVote === 'helpful') {
          helpfulCount--;
          delete votedPrices[id];
        } else if (existingVote === 'unhelpful') {
          unhelpfulCount--;
          helpfulCount++;
          votedPrices[id] = 'helpful';
        } else {
          helpfulCount++;
          votedPrices[id] = 'helpful';
        }
        return { ...p, helpfulCount, unhelpfulCount, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    set({ priceReferences, votedPrices });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
    saveToStorage(STORAGE_KEYS.VOTED_PRICES, votedPrices);
  },

  voteUnhelpful: (id) => {
    const state = get();
    const existingVote = state.votedPrices[id];
    let votedPrices = { ...state.votedPrices };
    const priceReferences = state.priceReferences.map((p) => {
      if (p.id === id) {
        let helpfulCount = p.helpfulCount;
        let unhelpfulCount = p.unhelpfulCount;
        if (existingVote === 'unhelpful') {
          unhelpfulCount--;
          delete votedPrices[id];
        } else if (existingVote === 'helpful') {
          helpfulCount--;
          unhelpfulCount++;
          votedPrices[id] = 'unhelpful';
        } else {
          unhelpfulCount++;
          votedPrices[id] = 'unhelpful';
        }
        return { ...p, helpfulCount, unhelpfulCount, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    set({ priceReferences, votedPrices });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
    saveToStorage(STORAGE_KEYS.VOTED_PRICES, votedPrices);
  },

  markAsVerified: (id) => {
    const priceReferences = get().priceReferences.map((p) =>
      p.id === id
        ? { ...p, verificationCount: p.verificationCount + 1, updatedAt: new Date().toISOString() }
        : p
    );
    set({ priceReferences });
    saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
  },

  getFilteredPriceReferences: () => {
    const { priceReferences, filters } = get();
    let filtered = [...priceReferences];

    if (filters.serviceType !== 'all') {
      filtered = filtered.filter((p) => p.serviceType === filters.serviceType);
    }

    if (filters.source !== 'both') {
      filtered = filtered.filter((p) => p.source === filters.source);
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.itemName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.region.toLowerCase().includes(query)
      );
    }

    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'priceLow':
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.maxPrice - a.maxPrice);
        break;
    }

    return filtered;
  },

  getPriceReferencesByServiceType: (serviceType) => {
    return get()
      .priceReferences.filter((p) => p.serviceType === serviceType)
      .sort((a, b) => b.helpfulCount - a.helpfulCount);
  },

  getPriceRange: (itemName, serviceType) => {
    const state = get();
    const related = state.priceReferences.filter(
      (p) => p.serviceType === serviceType && p.itemName.includes(itemName)
    );
    if (related.length === 0) {
      const fuzzyMatched = state.priceReferences.filter((p) => {
        const nameMatch = itemName.includes(p.itemName) || p.itemName.includes(itemName);
        return p.serviceType === serviceType && nameMatch;
      });
      if (fuzzyMatched.length === 0) return null;
      return calculateRange(fuzzyMatched);
    }
    return calculateRange(related);
  },

  getAllItemNames: () => {
    const names = new Set(get().priceReferences.map((p) => p.itemName));
    return Array.from(names).sort();
  },

  exportCommunityData: () => {
    const communityPrices = get().priceReferences.filter((p) => p.source === 'community');
    return JSON.stringify(communityPrices, null, 2);
  },

  importCommunityData: (dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      if (Array.isArray(data)) {
        const state = get();
        const existingIds = new Set(state.priceReferences.map((p) => p.id));
        const newItems = data.filter((item: PriceReference) => !existingIds.has(item.id));
        if (newItems.length > 0) {
          const priceReferences = [...state.priceReferences, ...newItems];
          set({ priceReferences });
          saveToStorage(STORAGE_KEYS.PRICE_REFERENCES, priceReferences);
        }
        return true;
      }
    } catch (e) {
      console.error('Import community data failed:', e);
    }
    return false;
  },
}));

function calculateRange(
  references: PriceReference[]
): { min: number; max: number; avg: number; references: PriceReference[] } {
  const allMins = references.map((r) => r.minPrice);
  const allMaxs = references.map((r) => r.maxPrice);
  const min = Math.min(...allMins);
  const max = Math.max(...allMaxs);
  const avg = Math.round(
    references.reduce((sum, r) => sum + (r.minPrice + r.maxPrice) / 2, 0) / references.length
  );
  return { min, max, avg, references };
}
