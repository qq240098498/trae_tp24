import { forwardRef } from 'react';
import { Phone, Receipt, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Provider } from '@/types';
import { StarRating } from './StarRating';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface ProviderCardProps {
  provider: Provider;
  onViewDetail: (provider: Provider) => void;
  onEdit: (provider: Provider) => void;
  onAddReview: (provider: Provider) => void;
  index: number;
}

export const ProviderCard = forwardRef<HTMLDivElement, ProviderCardProps>(
  ({ provider, onViewDetail, onEdit, onAddReview, index }, ref) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors cursor-pointer"
              onClick={() => onViewDetail(provider)}
              style={{ fontFamily: '"Noto Serif SC", serif' }}
            >
              {provider.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={provider.avgRating} readonly size="sm" />
              <span className="text-xs text-gray-500">({provider.reviewCount}条评价)</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {provider.hasInvoice && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Receipt size={12} />
                可开票
              </span>
            )}
            {provider.doorFee !== null && (
              <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                <MapPin size={12} />
                上门费 ¥{provider.doorFee}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.serviceTypes.map((type) => (
            <ServiceTypeBadge key={type} type={type} size="sm" />
          ))}
        </div>

        <div
          className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-orange-50 transition-colors group/phone"
          onClick={() => window.open(`tel:${provider.phone}`)}
        >
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover/phone:bg-orange-500 transition-colors">
            <Phone
              size={18}
              className="text-gray-600 group-hover/phone:text-white transition-colors"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500">点击拨打</p>
            <p className="font-semibold text-gray-900 group-hover/phone:text-orange-600 transition-colors">
              {provider.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">更新于 {formatDate(provider.updatedAt)}</span>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => onAddReview(provider)}
              className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              评价
            </motion.button>
            <motion.button
              onClick={() => onEdit(provider)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              编辑
            </motion.button>
          </div>
        </div>
      </div>

      <div
        className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
      />
    </motion.div>
  );
  }
);

ProviderCard.displayName = 'ProviderCard';
