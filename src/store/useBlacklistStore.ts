import { create } from 'zustand';
import type { BlacklistEntry, BlacklistFilters, BlacklistReason, ServiceType, BlacklistReport } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { STORAGE_KEYS, MOCK_BLACKLIST_ENTRIES, BLACKLIST_PUBLIC_THRESHOLD, DEFAULT_REGION } from '@/utils/constants';

interface BlacklistState {
  entries: BlacklistEntry[];
  filters: BlacklistFilters;
  userNickname: string;
  reportedEntryIds: string[];
  init: () => void;
  setFilters: (filters: Partial<BlacklistFilters>) => void;
  setUserNickname: (nickname: string) => void;
  addBlacklistEntry: (
    data: Omit<BlacklistEntry, 'id' | 'reportCount' | 'isPublic' | 'reports' | 'createdAt' | 'updatedAt'> & {
      reasons: BlacklistReason[];
      description: string;
      isAnonymous: boolean;
      reporterNickname?: string;
    }
  ) => void;
  addReport: (
    entryId: string,
    data: {
      reasons: BlacklistReason[];
      description: string;
      isAnonymous: boolean;
      reporterNickname?: string;
    }
  ) => boolean;
  hasReported: (entryId: string) => boolean;
  getFilteredEntries: () => BlacklistEntry[];
  getPublicEntries: () => BlacklistEntry[];
  getEntryById: (id: string) => BlacklistEntry | undefined;
  getReportsByEntry: (entryId: string) => BlacklistReport[];
  deleteEntry: (id: string) => void;
}

export const useBlacklistStore = create<BlacklistState>((set, get) => ({
  entries: [],
  filters: {
    serviceType: 'all',
    searchQuery: '',
    sortBy: 'reportCount',
    showPending: false,
  },
  userNickname: '',
  reportedEntryIds: [],

  init: () => {
    const storedEntries = loadFromStorage<BlacklistEntry[]>(STORAGE_KEYS.BLACKLIST, []);
    const storedNickname = loadFromStorage<string>(STORAGE_KEYS.USER_NICKNAME, '');
    const storedReported = loadFromStorage<string[]>(STORAGE_KEYS.REPORTED_BLACKLIST, []);

    if (storedEntries.length === 0) {
      set({
        entries: MOCK_BLACKLIST_ENTRIES,
        userNickname: storedNickname,
        reportedEntryIds: storedReported,
      });
      saveToStorage(STORAGE_KEYS.BLACKLIST, MOCK_BLACKLIST_ENTRIES);
    } else {
      set({
        entries: storedEntries,
        userNickname: storedNickname,
        reportedEntryIds: storedReported,
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

  addBlacklistEntry: (data) => {
    const now = new Date().toISOString();
    const state = get();
    const nickname = data.reporterNickname || state.userNickname || '匿名用户';

    const existingEntry = state.entries.find(
      (e) =>
        e.providerPhone === data.providerPhone ||
        e.providerName === data.providerName
    );

    if (existingEntry) {
      const newReport: BlacklistReport = {
        id: generateId(),
        blacklistEntryId: existingEntry.id,
        reporterNickname: data.isAnonymous ? '匿名用户' : nickname,
        isAnonymous: data.isAnonymous,
        reasons: data.reasons,
        description: data.description,
        createdAt: now,
      };

      const entries = state.entries.map((e) => {
        if (e.id === existingEntry.id) {
          const reports = [...e.reports, newReport];
          const reportCount = reports.length;
          const isPublic = reportCount >= BLACKLIST_PUBLIC_THRESHOLD;
          return {
            ...e,
            reports,
            reportCount,
            isPublic,
            updatedAt: now,
          };
        }
        return e;
      });

      const reportedEntryIds = [...state.reportedEntryIds, existingEntry.id];

      set({ entries, reportedEntryIds });
      saveToStorage(STORAGE_KEYS.BLACKLIST, entries);
      saveToStorage(STORAGE_KEYS.REPORTED_BLACKLIST, reportedEntryIds);
      return;
    }

    const newEntry: BlacklistEntry = {
      id: generateId(),
      providerName: data.providerName,
      providerPhone: data.providerPhone,
      serviceTypes: data.serviceTypes,
      region: data.region || DEFAULT_REGION,
      reportCount: 1,
      isPublic: 1 >= BLACKLIST_PUBLIC_THRESHOLD,
      reports: [
        {
          id: generateId(),
          blacklistEntryId: '',
          reporterNickname: data.isAnonymous ? '匿名用户' : nickname,
          isAnonymous: data.isAnonymous,
          reasons: data.reasons,
          description: data.description,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    newEntry.reports[0].blacklistEntryId = newEntry.id;

    const entries = [...state.entries, newEntry];
    const reportedEntryIds = [...state.reportedEntryIds, newEntry.id];

    set({ entries, reportedEntryIds });
    saveToStorage(STORAGE_KEYS.BLACKLIST, entries);
    saveToStorage(STORAGE_KEYS.REPORTED_BLACKLIST, reportedEntryIds);
  },

  addReport: (entryId, data) => {
    const state = get();

    if (state.reportedEntryIds.includes(entryId)) {
      return false;
    }

    const now = new Date().toISOString();
    const nickname = data.reporterNickname || state.userNickname || '匿名用户';

    const newReport: BlacklistReport = {
      id: generateId(),
      blacklistEntryId: entryId,
      reporterNickname: data.isAnonymous ? '匿名用户' : nickname,
      isAnonymous: data.isAnonymous,
      reasons: data.reasons,
      description: data.description,
      createdAt: now,
    };

    const entries = state.entries.map((e) => {
      if (e.id === entryId) {
        const reports = [...e.reports, newReport];
        const reportCount = reports.length;
        const isPublic = reportCount >= BLACKLIST_PUBLIC_THRESHOLD;
        return {
          ...e,
          reports,
          reportCount,
          isPublic,
          updatedAt: now,
        };
      }
      return e;
    });

    const reportedEntryIds = [...state.reportedEntryIds, entryId];

    set({ entries, reportedEntryIds });
    saveToStorage(STORAGE_KEYS.BLACKLIST, entries);
    saveToStorage(STORAGE_KEYS.REPORTED_BLACKLIST, reportedEntryIds);
    return true;
  },

  hasReported: (entryId) => {
    return get().reportedEntryIds.includes(entryId);
  },

  getFilteredEntries: () => {
    const { entries, filters } = get();
    let filtered = [...entries];

    if (!filters.showPending) {
      filtered = filtered.filter((e) => e.isPublic);
    }

    if (filters.serviceType !== 'all') {
      const serviceType = filters.serviceType as ServiceType;
      filtered = filtered.filter((e) => e.serviceTypes.includes(serviceType));
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.providerName.toLowerCase().includes(query) ||
          e.providerPhone.includes(query) ||
          e.region.toLowerCase().includes(query)
      );
    }

    switch (filters.sortBy) {
      case 'reportCount':
        filtered.sort((a, b) => b.reportCount - a.reportCount);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return filtered;
  },

  getPublicEntries: () => {
    return get().entries.filter((e) => e.isPublic);
  },

  getEntryById: (id) => {
    return get().entries.find((e) => e.id === id);
  },

  getReportsByEntry: (entryId) => {
    return get()
      .entries.find((e) => e.id === entryId)
      ?.reports.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) || [];
  },

  deleteEntry: (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    saveToStorage(STORAGE_KEYS.BLACKLIST, entries);
  },
}));
