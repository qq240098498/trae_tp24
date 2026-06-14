import { motion } from 'framer-motion';
import { Phone, Receipt, MapPin, Calendar, Trash2, Edit, MessageSquare } from 'lucide-react';
import type { Provider, Review } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Modal } from './Modal';
import { StarRating } from './StarRating';
import { ServiceTypeBadge } from './ServiceTypeBadge';
import { TagSelector } from './TagSelector';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onEdit: (provider: Provider) => void;
  onAddReview: (provider: Provider) => void;
}

export const DetailModal = ({
  isOpen,
  onClose,
  provider,
  onEdit,
  onAddReview,
}: DetailModalProps) => {
  const { getReviewsByProvider, deleteProvider } = useProviderStore();

  if (!provider) return null;

  const reviews = getReviewsByProvider(provider.id);

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
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-orange-500" />
              评价记录
            </h3>
            <motion.button
              onClick={() => onAddReview(provider)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + 新增评价
            </motion.button>
          </div>

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
        </div>
      </div>
    </Modal>
  );
};
