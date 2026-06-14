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
  completed: { label: '已完成', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  in_progress: { label: '进行中', color: 'text-blue-700', bg: 'bg-blue-100' },
  scheduled: { label: '已预约', color: 'text-amber-700', bg: 'bg-amber-100' },
  cancelled: { label: '已取消', color: 'text-gray-700', bg: 'bg-gray-100' },
};
