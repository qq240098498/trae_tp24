import { Wrench, Plus, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProviderStore } from '@/store/useProviderStore';

interface HeaderProps {
  onAddClick: () => void;
}

export const Header = ({ onAddClick }: HeaderProps) => {
  const { exportData, importData } = useProviderStore();

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
        <div className="flex items-center justify-between h-16">
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
            <motion.button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              <span>添加服务商</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
