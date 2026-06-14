import { Search, SlidersHorizontal, TrendingUp, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ServiceType } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';
import { useBlacklistStore } from '@/store/useBlacklistStore';

export const BlacklistFilterBar = () => {
  const { filters, setFilters, entries } = useBlacklistStore();

  const publicCount = entries.filter((e) => e.isPublic).length;
  const pendingCount = entries.filter((e) => !e.isPublic).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 space-y-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="搜索服务商名称、电话、地区..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
          <motion.button
            onClick={() => setFilters({ sortBy: 'reportCount' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              filters.sortBy === 'reportCount'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp size={14} />
            <span>举报最多</span>
          </motion.button>
          <motion.button
            onClick={() => setFilters({ sortBy: 'recent' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              filters.sortBy === 'recent'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Clock size={14} />
            <span>最新</span>
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <SlidersHorizontal size={14} />
          <span>服务类型：</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <motion.button
            onClick={() => setFilters({ serviceType: 'all' })}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              filters.serviceType === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            全部
          </motion.button>
          {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((type) => {
            const config = SERVICE_TYPE_CONFIG[type];
            const isActive = filters.serviceType === type;
            return (
              <motion.button
                key={type}
                onClick={() => setFilters({ serviceType: type })}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={isActive ? { backgroundColor: config.color } : {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showPending}
            onChange={(e) => setFilters({ showPending: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Eye size={14} />
            显示待公示条目
            <span className="text-xs text-amber-500">({pendingCount})</span>
          </span>
        </label>
        <div className="text-sm text-gray-500">
          已公示 <span className="font-bold text-red-500">{publicCount}</span> 条
        </div>
      </div>
    </motion.div>
  );
};
