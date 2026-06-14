import { ThumbsUp, ThumbsDown, MapPin, User, CheckCircle2, Edit2, Trash2, Share2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PriceReference } from '@/types';
import { usePriceStore } from '@/store/usePriceStore';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface PriceReferenceCardProps {
  priceRef: PriceReference;
  index: number;
  onEdit?: (priceRef: PriceReference) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const PriceReferenceCard = ({
  priceRef,
  index,
  onEdit,
  onDelete,
  showActions = true,
}: PriceReferenceCardProps) => {
  const { voteHelpful, voteUnhelpful, markAsVerified, votedPrices, userNickname } = usePriceStore();
  const userVote = votedPrices[priceRef.id];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const helpfulRate = priceRef.helpfulCount + priceRef.unhelpfulCount > 0
    ? Math.round((priceRef.helpfulCount / (priceRef.helpfulCount + priceRef.unhelpfulCount)) * 100)
    : 0;

  const isOwn = !priceRef.isAnonymous && priceRef.contributorNickname === userNickname && userNickname !== '';

  const handleExport = () => {
    const data = JSON.stringify([priceRef], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-${priceRef.itemName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3
                className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors"
                style={{ fontFamily: '"Noto Serif SC", serif' }}
              >
                {priceRef.itemName}
              </h3>
              <ServiceTypeBadge type={priceRef.serviceType} size="sm" />
              {priceRef.source === 'community' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  <Share2 size={12} />
                  众包
                </span>
              )}
              {priceRef.source === 'local' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  <Shield size={12} />
                  本地
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{priceRef.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{priceRef.contributorNickname}</span>
              </div>
              {priceRef.verificationCount > 0 && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={12} />
                  <span>{priceRef.verificationCount}人验证</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="text-2xl font-bold text-emerald-700">¥{priceRef.minPrice}</span>
            <span className="text-gray-400 font-medium">~</span>
            <span className="text-2xl font-bold text-emerald-700">¥{priceRef.maxPrice}</span>
            <span className="text-sm text-gray-500">/ {priceRef.unit}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">市场均价约</span>
            <span className="text-sm font-semibold text-orange-600">
              ¥{Math.round((priceRef.minPrice + priceRef.maxPrice) / 2)}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                style={{ width: `${helpfulRate}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{helpfulRate}% 有用</span>
          </div>
        </div>

        {priceRef.description && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 leading-relaxed">{priceRef.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">更新于 {formatDate(priceRef.updatedAt)}</span>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => voteHelpful(priceRef.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                userVote === 'helpful'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp size={14} />
              <span>{priceRef.helpfulCount}</span>
            </motion.button>
            <motion.button
              onClick={() => voteUnhelpful(priceRef.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                userVote === 'unhelpful'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsDown size={14} />
              <span>{priceRef.unhelpfulCount}</span>
            </motion.button>
            <motion.button
              onClick={() => markAsVerified(priceRef.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="我实际消费过，价格属实"
            >
              <CheckCircle2 size={14} />
              <span>验证</span>
            </motion.button>
            <motion.button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="导出此价格数据"
            >
              <Share2 size={14} />
            </motion.button>
            {showActions && (isOwn || priceRef.source === 'local') && (
              <>
                {onEdit && (
                  <motion.button
                    onClick={() => onEdit(priceRef)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={14} />
                  </motion.button>
                )}
                {onDelete && (
                  <motion.button
                    onClick={() => onDelete(priceRef.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
      />
    </motion.div>
  );
};
