import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp, Lightbulb, ExternalLink } from 'lucide-react';
import type { ServiceType, PriceReference } from '@/types';
import { usePriceStore } from '@/store/usePriceStore';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';

interface PriceTipProps {
  serviceType: ServiceType;
  itemName?: string;
  onViewAll?: () => void;
}

export const PriceTip = ({ serviceType, itemName = '', onViewAll }: PriceTipProps) => {
  const { getPriceRange, getPriceReferencesByServiceType } = usePriceStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
    avg: number;
    references: PriceReference[];
  } | null>(null);

  useEffect(() => {
    if (itemName) {
      const range = getPriceRange(itemName, serviceType);
      if (range) {
        setPriceRange(range);
      } else {
        const related = getPriceReferencesByServiceType(serviceType);
        if (related.length > 0) {
          const allMins = related.map((r) => r.minPrice);
          const allMaxs = related.map((r) => r.maxPrice);
          setPriceRange({
            min: Math.min(...allMins),
            max: Math.max(...allMaxs),
            avg: Math.round(
              related.reduce((sum, r) => sum + (r.minPrice + r.maxPrice) / 2, 0) / related.length
            ),
            references: related.slice(0, 3),
          });
        } else {
          setPriceRange(null);
        }
      }
    } else {
      const related = getPriceReferencesByServiceType(serviceType);
      if (related.length > 0) {
        const allMins = related.map((r) => r.minPrice);
        const allMaxs = related.map((r) => r.maxPrice);
        setPriceRange({
          min: Math.min(...allMins),
          max: Math.max(...allMaxs),
          avg: Math.round(
            related.reduce((sum, r) => sum + (r.minPrice + r.maxPrice) / 2, 0) / related.length
          ),
          references: related.slice(0, 3),
        });
      } else {
        setPriceRange(null);
      }
    }
  }, [serviceType, itemName, getPriceRange, getPriceReferencesByServiceType]);

  if (!priceRange) return null;

  const serviceTypeColor = SERVICE_TYPE_CONFIG[serviceType]?.color || '#10B981';

  return (
    <motion.div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: `${serviceTypeColor}08`,
        borderColor: `${serviceTypeColor}20`,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${serviceTypeColor}20` }}
          >
            <Lightbulb size={16} style={{ color: serviceTypeColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: serviceTypeColor }}>
                价格参考提示
              </span>
              {itemName && (
                <span className="px-2 py-0.5 text-xs bg-white rounded-full text-gray-600 border border-gray-200">
                  {itemName}
                </span>
              )}
              <span className="px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: serviceTypeColor }}>
                {SERVICE_TYPE_CONFIG[serviceType]?.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs text-gray-500">市场价</span>
              <span className="text-base font-bold text-gray-900">
                ¥{priceRange.min} ~ ¥{priceRange.max}
              </span>
              <span className="text-xs text-gray-500">均价约</span>
              <span className="text-sm font-semibold text-orange-600">¥{priceRange.avg}</span>
              <span className="text-xs text-gray-400">基于{priceRange.references.length}条数据</span>
            </div>
          </div>
        </div>
        <motion.button
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-start gap-2 p-3 bg-white/70 rounded-xl border border-white">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed">
                  <p className="font-medium text-gray-800 mb-1">议价小贴士</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>报价低于 <span className="text-emerald-600 font-semibold">¥{priceRange.min}</span> 时要留意是否存在隐性收费或偷工减料</li>
                    <li>报价高于 <span className="text-red-600 font-semibold">¥{priceRange.max}</span> 时可以要求给出详细的报价明细</li>
                    <li>建议多对比2-3位师傅的报价，不要急于成交</li>
                    <li>问清楚是否包含上门费、材料费，以及保修期</li>
                  </ul>
                </div>
              </div>

              {priceRange.references.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">相关价格参考：</p>
                  {priceRange.references.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800 truncate">{ref.itemName}</span>
                          {ref.source === 'community' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">
                              众包
                            </span>
                          )}
                        </div>
                        {ref.description && (
                          <p className="text-gray-500 mt-0.5 line-clamp-1">{ref.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="font-semibold text-gray-900">
                          ¥{ref.minPrice}-{ref.maxPrice}
                        </div>
                        <div className="flex items-center gap-1 justify-end text-gray-400">
                          {ref.region && <span>{ref.region}</span>}
                          {ref.helpfulCount > 0 && (
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <TrendingUp size={10} />
                              {ref.helpfulCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border transition-colors"
                  style={{
                    color: serviceTypeColor,
                    borderColor: `${serviceTypeColor}40`,
                    backgroundColor: `${serviceTypeColor}08`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${serviceTypeColor}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${serviceTypeColor}08`;
                  }}
                >
                  <ExternalLink size={12} />
                  查看更多{SERVICE_TYPE_CONFIG[serviceType]?.label}价格参考
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
