export type ServiceType =
  | 'plumber'
  | 'appliance'
  | 'locksmith'
  | 'drain'
  | 'aircon'
  | 'other';

export type ReviewTag =
  | '技术好'
  | '收费贵'
  | '响应快'
  | '态度好'
  | '不专业'
  | '乱收费'
  | '准时';

export interface EmergencyContactConfig {
  isEmergency: boolean;
  is24Hours: boolean;
  emergencyNote: string;
}

export interface Provider {
  id: string;
  name: string;
  phone: string;
  serviceTypes: ServiceType[];
  doorFee: number | null;
  hasInvoice: boolean;
  avgRating: number;
  reviewCount: number;
  emergency: EmergencyContactConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  providerId: string;
  rating: number;
  tags: ReviewTag[];
  comment: string;
  createdAt: string;
}

export interface ServiceTypeConfig {
  label: string;
  icon: string;
  color: string;
}

export type ServiceStatus = 'completed' | 'in_progress' | 'scheduled' | 'cancelled';

export interface ServiceRecord {
  id: string;
  providerId: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  serviceDate: string;
  completedDate: string | null;
  status: ServiceStatus;
  totalFee: number | null;
  materials: string;
  issuesFound: string;
  solutions: string;
  warrantyMonths: number | null;
  followUpNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SERVICE_STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  completed: { label: '已完成', color: ' text-emerald-700', bg: 'bg-emerald-100' },
  in_progress: { label: '进行中', color: 'text-blue-700', bg: 'bg-blue-100' },
  scheduled: { label: '已预约', color: 'text-amber-700', bg: 'bg-amber-100' },
  cancelled: { label: '已取消', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export type PriceSource = 'local' | 'community' | 'both';

export interface PriceReference {
  id: string;
  itemName: string;
  serviceType: ServiceType;
  minPrice: number;
  maxPrice: number;
  unit: string;
  description: string;
  region: string;
  source: PriceSource;
  isAnonymous: boolean;
  contributorNickname: string;
  helpfulCount: number;
  unhelpfulCount: number;
  verificationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceReferenceFilters {
  serviceType: ServiceType | 'all';
  searchQuery: string;
  source: PriceSource;
  sortBy: 'recent' | 'helpful' | 'priceLow' | 'priceHigh';
}

export type BlacklistReason =
  | '乱收费'
  | '没修好还删微信'
  | '态度恶劣'
  | '不专业'
  | '加价'
  | '其他';

export interface BlacklistReport {
  id: string;
  blacklistEntryId: string;
  reporterNickname: string;
  isAnonymous: boolean;
  reasons: BlacklistReason[];
  description: string;
  createdAt: string;
}

export interface BlacklistEntry {
  id: string;
  providerName: string;
  providerPhone: string;
  serviceTypes: ServiceType[];
  region: string;
  reportCount: number;
  isPublic: boolean;
  reports: BlacklistReport[];
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistFilters {
  serviceType: ServiceType | 'all';
  searchQuery: string;
  sortBy: 'reportCount' | 'recent';
  showPending: boolean;
}
