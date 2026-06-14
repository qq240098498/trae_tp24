import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, AlertTriangle } from 'lucide-react';
import type { BlacklistEntry } from '@/types';
import { useBlacklistStore } from '@/store/useBlacklistStore';
import { BlacklistCard } from './BlacklistCard';
import { BlacklistForm } from './BlacklistForm';

interface BlacklistListProps {
  onViewDetail?: (entry: BlacklistEntry) => void;
}

export const BlacklistList = ({ onViewDetail }: BlacklistListProps) => {
  const { getFilteredEntries, entries } = useBlacklistStore();
  const [reportEntry, setReportEntry] = useState<BlacklistEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredEntries = getFilteredEntries();

  const handleReport = (entry: BlacklistEntry) => {
    setReportEntry(entry);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setReportEntry(null);
  };

  if (filteredEntries.length === 0) {
    return (
      <>
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 bg-gray-100 rounded-full mb-4">
            <Inbox className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无黑名单记录</h3>
          <p className="text-gray-500 max-w-md">
            {entries.length === 0
              ? '还没有任何黑名单数据。点击"举报踩雷"按钮，帮助邻居避坑！'
              : '当前筛选条件下没有匹配的黑名单记录，试试调整筛选条件或搜索关键词。'}
          </p>
        </motion.div>
        <BlacklistForm isOpen={isFormOpen} onClose={handleClose} existingEntry={reportEntry} />
      </>
    );
  }

  return (
    <>
      {filteredEntries.length > 0 && (
        <motion.div
          className="mb-4 p-4 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 rounded-2xl border border-red-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">⚠️ 小区共享黑名单</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                以下服务商被多位邻居举报，建议谨慎选择。
                黑名单需经多人举报才对外展示，减少恶意差评。如您也遇到过问题，欢迎举报补充。
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, index) => (
            <BlacklistCard
              key={entry.id}
              entry={entry}
              index={index}
              onReport={handleReport}
              onViewDetail={onViewDetail}
            />
          ))}
        </AnimatePresence>
      </div>

      <BlacklistForm isOpen={isFormOpen} onClose={handleClose} existingEntry={reportEntry} />
    </>
  );
};
