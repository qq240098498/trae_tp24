import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ServiceType } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';
import { useProviderStore } from '@/store/useProviderStore';

export const FilterBar = () => {
  const {
    filterType,
    searchQuery,
    sortBy,
    setFilterType,
    setSearchQuery,
    setSortBy,
    providers,
    getFilteredProviders,
  } = useProviderStore();

  const filteredCount = getFilteredProviders().length;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索名称或电话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Filter size={18} />
            <span className="text-sm font-medium">筛选:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 flex-1">
            <motion.button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              全部
            </motion.button>
            {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((type) => {
              const config = SERVICE_TYPE_CONFIG[type];
              return (
                <motion.button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filterType === type
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filterType === type ? { backgroundColor: config.color } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {config.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-gray-500">
            <ArrowUpDown size={18} />
            <span className="text-sm font-medium">排序:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'date')}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="rating">评分最高</option>
            <option value="date">最近更新</option>
          </select>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>
          共 <span className="font-semibold text-gray-900">{filteredCount}</span> 个服务商
          {filterType !== 'all' && (
            <span>
              {' '}· 筛选: <span className="font-medium text-orange-500">{SERVICE_TYPE_CONFIG[filterType].label}</span>
            </span>
          )}
        </span>
        <span>总计 {providers.length} 条记录</span>
      </div>
    </motion.div>
  );
};
