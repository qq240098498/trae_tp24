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

export interface Provider {
  id: string;
  name: string;
  phone: string;
  serviceTypes: ServiceType[];
  doorFee: number | null;
  hasInvoice: boolean;
  avgRating: number;
  reviewCount: number;
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
