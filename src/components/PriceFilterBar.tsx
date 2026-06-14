import { Search, Filter, ArrowUpDown, Download, Upload, Users, DollarSign, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ServiceType, PriceSource } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';
import { usePriceStore } from '@/store/usePriceStore';

export const PriceFilterBar = () => {
  const {
    filters,
    setFilters,
    priceReferences,
    getFilteredPriceReferences,
    exportCommunityData,
    importCommunityData,
  } = usePriceStore();

  const filteredCount = getFilteredPriceReferences().length;
  const communityCount = priceReferences.filter((p) => p.source === 'community').length;

  const handleExportCommunity = () => {
    const data = exportCommunityData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-prices-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCommunity = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          const success = importCommunityData(data);
          if (success) {
            alert('导入社区价格数据成功！');
          } else {
            alert('导入失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索维修项目、说明、地区..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Filter size={18} />
            <span className="text-sm font-medium">筛选:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              onClick={() => setFilters({ serviceType: 'all' })}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filters.serviceType === 'all'
                  ? 'bg-emerald-500 text-white shadow-md'
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
                  onClick={() => setFilters({ serviceType: type })}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filters.serviceType === type
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filters.serviceType === type ? { backgroundColor: config.color } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {config.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Share2 size={18} />
            <span className="text-sm font-medium">来源:</span>
          </div>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ source: e.target.value as PriceSource })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="both">全部来源</option>
            <option value="community">社区众包</option>
            <option value="local">仅本地</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 text-gray-500">
            <ArrowUpDown size={18} />
            <span className="text-sm font-medium">排序:</span>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                sortBy: e.target.value as 'recent' | 'helpful' | 'priceLow' | 'priceHigh',
              })
            }
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="helpful">最有用</option>
            <option value="recent">最近更新</option>
            <option value="priceLow">价格从低到高</option>
            <option value="priceHigh">价格从高到低</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleImportCommunity}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="导入社区价格数据"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">导入</span>
          </motion.button>
          <motion.button
            onClick={handleExportCommunity}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="导出社区价格数据"
          >
            <Download size={18} />
            <span className="hidden sm:inline">导出</span>
          </motion.button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            共 <span className="font-semibold text-gray-900">{filteredCount}</span> 条价格参考
            {filters.serviceType !== 'all' && (
              <span>
                {' '}· 筛选:{' '}
                <span className="font-medium text-emerald-500">
                  {SERVICE_TYPE_CONFIG[filters.serviceType].label}
                </span>
              </span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} className="text-purple-500" />
            社区众包 <span className="font-semibold text-purple-600">{communityCount}</span> 条
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={14} className="text-blue-500" />
            总计 <span className="font-semibold text-blue-600">{priceReferences.length}</span> 条
          </span>
        </div>
      </div>
    </motion.div>
  );
};
