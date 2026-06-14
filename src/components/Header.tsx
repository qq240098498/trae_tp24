import { Wrench, Plus, Download, Upload, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProviderStore } from '@/store/useProviderStore';
import { usePriceStore } from '@/store/usePriceStore';
import { useBlacklistStore } from '@/store/useBlacklistStore';

export type ViewMode = 'providers' | 'prices' | 'blacklist';

interface HeaderProps {
  onAddClick: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddPriceClick: () => void;
  onAddBlacklistClick: () => void;
}

export const Header = ({ onAddClick, viewMode, onViewModeChange, onAddPriceClick, onAddBlacklistClick }: HeaderProps) => {
  const { exportData, importData } = useProviderStore();
  const { priceReferences } = usePriceStore();
  const { entries: blacklistEntries } = useBlacklistStore();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair-providers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          const success = importData(data);
          if (success) {
            alert('导入成功！');
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
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 flex-wrap gap-2">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                维修服务商
              </h1>
              <p className="text-xs text-gray-500">本地维修师傅管理工具</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-1 bg-gray-100 rounded-xl p-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <motion.button
              onClick={() => onViewModeChange('providers')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'providers'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users size={16} />
              <span>服务商</span>
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange('prices')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all relative ${
                viewMode === 'prices'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign size={16} />
              <span>价格参考</span>
              {priceReferences.length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full ${
                    viewMode === 'prices' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                  }`}
                >
                  {priceReferences.length > 99 ? '99+' : priceReferences.length}
                </span>
              )}
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange('blacklist')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all relative ${
                viewMode === 'blacklist'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertTriangle size={16} />
              <span>黑名单</span>
              {blacklistEntries.filter((e) => e.isPublic).length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full ${
                    viewMode === 'blacklist' ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {blacklistEntries.filter((e) => e.isPublic).length > 99
                    ? '99+'
                    : blacklistEntries.filter((e) => e.isPublic).length}
                </span>
              )}
            </motion.button>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={18} />
              <span className="hidden sm:inline">导入</span>
            </motion.button>
            <motion.button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              <span className="hidden sm:inline">导出</span>
            </motion.button>
            {viewMode === 'providers' ? (
              <motion.button
                onClick={onAddClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">添加服务商</span>
                <span className="sm:hidden">添加</span>
              </motion.button>
            ) : viewMode === 'prices' ? (
              <motion.button
                onClick={onAddPriceClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">添加价格</span>
                <span className="sm:hidden">添加</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={onAddBlacklistClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AlertTriangle size={18} />
                <span className="hidden sm:inline">举报踩雷</span>
                <span className="sm:hidden">举报</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};
