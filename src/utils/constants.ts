import type { ServiceType, ReviewTag, ServiceTypeConfig } from '@/types';

export const SERVICE_TYPE_CONFIG: Record<ServiceType, ServiceTypeConfig> = {
  plumber: { label: '水电工', icon: 'Wrench', color: '#3B82F6' },
  appliance: { label: '家电维修', icon: 'Tv', color: '#8B5CF6' },
  locksmith: { label: '开锁', icon: 'Key', color: '#F59E0B' },
  drain: { label: '通下水道', icon: 'Droplets', color: '#10B981' },
  aircon: { label: '空调加氟', icon: 'Wind', color: '#06B6D4' },
  other: { label: '其他', icon: 'MoreHorizontal', color: '#6B7280' },
};

export const REVIEW_TAGS: ReviewTag[] = [
  '技术好',
  '收费贵',
  '响应快',
  '态度好',
  '不专业',
  '乱收费',
  '准时',
];

export const STORAGE_KEYS = {
  PROVIDERS: 'repair_providers',
  REVIEWS: 'repair_reviews',
};

export const MOCK_PROVIDERS = [
  {
    id: '1',
    name: '李师傅',
    phone: '13800138001',
    serviceTypes: ['plumber', 'aircon'] as ServiceType[],
    doorFee: 30,
    hasInvoice: false,
    avgRating: 4.5,
    reviewCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: '张师傅家电维修',
    phone: '13900139002',
    serviceTypes: ['appliance'] as ServiceType[],
    doorFee: 50,
    hasInvoice: true,
    avgRating: 4.0,
    reviewCount: 1,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
  },
  {
    id: '3',
    name: '王师傅开锁',
    phone: '13700137003',
    serviceTypes: ['locksmith'] as ServiceType[],
    doorFee: 80,
    hasInvoice: false,
    avgRating: 5.0,
    reviewCount: 3,
    createdAt: '2024-03-05T16:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
  {
    id: '4',
    name: '陈师傅管道疏通',
    phone: '13600136004',
    serviceTypes: ['drain', 'plumber'] as ServiceType[],
    doorFee: 40,
    hasInvoice: true,
    avgRating: 3.5,
    reviewCount: 1,
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-04-01T08:00:00Z',
  },
];

export const MOCK_REVIEWS = [
  {
    id: 'r1',
    providerId: '1',
    rating: 5,
    tags: ['技术好', '响应快'] as ReviewTag[],
    comment: '修水管很专业，半小时就搞定了',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'r2',
    providerId: '1',
    rating: 4,
    tags: ['技术好', '收费贵'] as ReviewTag[],
    comment: '空调加氟效果不错，但价格比预期高',
    createdAt: '2024-01-20T15:00:00Z',
  },
  {
    id: 'r3',
    providerId: '2',
    rating: 4,
    tags: ['准时', '态度好'] as ReviewTag[],
    comment: '修洗衣机很认真，还教了保养方法',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'r4',
    providerId: '3',
    rating: 5,
    tags: ['响应快', '技术好'] as ReviewTag[],
    comment: '半夜开锁，10分钟就到了，太给力了',
    createdAt: '2024-03-05T23:00:00Z',
  },
  {
    id: 'r5',
    providerId: '3',
    rating: 5,
    tags: ['准时', '态度好'] as ReviewTag[],
    comment: '换锁很专业，价格公道',
    createdAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'r6',
    providerId: '3',
    rating: 5,
    tags: ['技术好', '响应快'] as ReviewTag[],
    comment: '开保险柜技术一流',
    createdAt: '2024-03-15T12:00:00Z',
  },
  {
    id: 'r7',
    providerId: '4',
    rating: 3,
    tags: ['收费贵', '不专业'] as ReviewTag[],
    comment: '通了两次才通好，价格有点高',
    createdAt: '2024-04-01T09:00:00Z',
  },
];
