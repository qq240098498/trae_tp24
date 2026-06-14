import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Receipt, MapPin, Calendar, Trash2, Edit, MessageSquare, Wrench, FileText, AlertTriangle, Clock } from 'lucide-react';
import type { Provider, Review, ServiceRecord } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Modal } from './Modal';
import { StarRating } from './StarRating';
import { ServiceTypeBadge } from './ServiceTypeBadge';
import { TagSelector } from './TagSelector';
import { ServiceRecordTimeline } from './ServiceRecordTimeline';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onEdit: (provider: Provider) => void;
  onAddReview: (provider: Provider) => void;
  onAddServiceRecord: (provider: Provider) => void;
  onEditServiceRecord: (record: ServiceRecord) => void;
}

type TabType = 'reviews' | 'records';

export const DetailModal = ({
  isOpen,
  onClose,
  provider,
  onEdit,
  onAddReview,
  onAddServiceRecord,
  onEditServiceRecord,
}: DetailModalProps) => {
  const { getReviewsByProvider, getServiceRecordsByProvider, deleteProvider } = useProviderStore();
  const [activeTab, setActiveTab] = useState<TabType>('records');

  if (!provider) return null;

  const reviews = getReviewsByProvider(provider.id);
  const serviceRecords = getServiceRecordsByProvider(provider.id);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (confirm(`确定要删除「${provider.name}」吗？此操作不可恢复。`)) {
      deleteProvider(provider.id);
      onClose();
    }
  };

  const tabs = [
    { id: 'records' as TabType, label: '服务记录', icon: FileText, count: serviceRecords.length },
    { id: 'reviews' as TabType, label: '评价记录', icon: MessageSquare, count: reviews.length },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={provider.name}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={provider.avgRating} readonly size="md" />
              <span className="text-sm text-gray-500">({provider.reviewCount}条评价)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {provider.serviceTypes.map((type) => (
                <ServiceTypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onEdit(provider)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit size={16} />
              编辑
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={16} />
              删除
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-orange-50 transition-colors group"
            onClick={() => window.open(`tel:${provider.phone}`)}
          >
            <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:bg-orange-500 transition-colors">
              <Phone size={20} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xs text-gray-500">联系方式</p>
              <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {provider.phone}
              </p>
            </div>
          </div>

          {provider.doorFee !== null && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <MapPin size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">上门费</p>
                <p className="font-semibold text-gray-900">¥{provider.doorFee}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <Receipt size={20} className={provider.hasInvoice ? 'text-emerald-500' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-xs text-gray-500">发票</p>
              <p className={`font-semibold ${provider.hasInvoice ? 'text-emerald-600' : 'text-gray-500'}`}>
                {provider.hasInvoice ? '可提供' : '不提供'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">最近更新</p>
              <p className="font-semibold text-gray-900">
                {new Date(provider.updatedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          {provider.emergency?.isEmergency && (
            <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="p-2.5 bg-red-500 rounded-lg shadow-sm">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-500">紧急联系人</p>
                  {provider.emergency.is24Hours && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                      <Clock size={10} />
                      24小时服务
                    </span>
                  )}
                </div>
                <p className="font-semibold text-red-700">
                  {provider.emergency.emergencyNote || '已设为紧急联系人'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-md"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon size={16} />
                      {tab.label}
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-gray-200'
                      }`}>
                        {tab.count}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              onClick={() => activeTab === 'records' ? onAddServiceRecord(provider) : onAddReview(provider)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + 新增{activeTab === 'records' ? '服务记录' : '评价'}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'records' && (
              <motion.div
                key="records"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ServiceRecordTimeline
                  records={serviceRecords}
                  onEdit={onEditServiceRecord}
                />
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>暂无评价记录</p>
                    <p className="text-sm">点击上方按钮添加第一条评价</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {reviews.map((review: Review, index: number) => (
                      <motion.div
                        key={review.id}
                        className="p-4 bg-gray-50 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <StarRating rating={review.rating} readonly size="sm" />
                          <span className="text-xs text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.tags.length > 0 && (
                          <div className="mb-2">
                            <TagSelector selectedTags={review.tags} onTagToggle={() => {}} readonly />
                          </div>
                        )}
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};
