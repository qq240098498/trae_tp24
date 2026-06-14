import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Eye, ChevronDown, ChevronUp, Phone, ShieldAlert } from 'lucide-react';
import type { BlacklistEntry, BlacklistReport } from '@/types';
import { BLACKLIST_PUBLIC_THRESHOLD } from '@/utils/constants';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface BlacklistCardProps {
  entry: BlacklistEntry;
  index: number;
  onReport: (entry: BlacklistEntry) => void;
  onViewDetail?: (entry: BlacklistEntry) => void;
}

export const BlacklistCard = ({ entry, index, onReport }: BlacklistCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const topReasons = entry.reports
    .flatMap((r) => r.reasons)
    .reduce((acc, reason) => {
      acc.set(reason, (acc.get(reason) || 0) + 1);
      return acc;
    }, new Map<string, number>());

  const sortedReasons = Array.from(topReasons.entries()).sort((a, b) => b[1] - a[1]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const progressPercent = Math.min((entry.reportCount / BLACKLIST_PUBLIC_THRESHOLD) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${entry.isPublic ? 'bg-red-100' : 'bg-amber-100'}`}>
              <AlertTriangle size={22} className={entry.isPublic ? 'text-red-500' : 'text-amber-500'} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{entry.providerName}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <Phone size={14} />
                <span>{entry.providerPhone}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {entry.isPublic ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                <ShieldAlert size={12} />
                已公示
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">
                <Eye size={12} />
                待公示
              </span>
            )}
          </div>
        </div>

        {entry.serviceTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {entry.serviceTypes.map((type) => (
              <ServiceTypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{entry.region}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDate(entry.updatedAt)}</span>
          </div>
        </div>

        {!entry.isPublic && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500">公示进度</span>
              <span className="text-amber-600 font-medium">
                {entry.reportCount}/{BLACKLIST_PUBLIC_THRESHOLD} 人举报
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              还差 {BLACKLIST_PUBLIC_THRESHOLD - entry.reportCount} 人举报后对外公示
            </p>
          </div>
        )}

        {entry.isPublic && sortedReasons.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">主要问题：</p>
            <div className="flex flex-wrap gap-1.5">
              {sortedReasons.slice(0, 4).map(([reason, count]) => (
                <span
                  key={reason}
                  className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
                >
                  {reason} ({count})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">共 </span>
            <span className="font-bold text-red-500">{entry.reportCount}</span>
            <span className="text-gray-500"> 条举报</span>
          </div>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {expanded ? (
              <>
                收起详情
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                查看详情
                <ChevronDown size={16} />
              </>
            )}
          </motion.button>
        </div>

        {expanded && entry.reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <p className="text-sm font-medium text-gray-700 mb-3">举报详情</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {entry.reports.map((report, idx) => (
                <BlacklistReportItem key={report.id} report={report} index={idx} />
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <motion.button
            onClick={() => onReport(entry)}
            className="w-full py-2.5 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <AlertTriangle size={16} />
            我也踩过雷，举报
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

interface BlacklistReportItemProps {
  report: BlacklistReport;
  index: number;
}

function BlacklistReportItem({ report, index }: BlacklistReportItemProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-3 bg-gray-50 rounded-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            {report.isAnonymous ? (
              <Eye size={12} className="text-gray-400" />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {report.reporterNickname.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {report.isAnonymous ? '匿名用户' : report.reporterNickname}
          </span>
        </div>
        <span className="text-xs text-gray-400">{formatDate(report.createdAt)}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {report.reasons.map((reason) => (
          <span
            key={reason}
            className="px-1.5 py-0.5 bg-red-50 text-red-500 text-xs rounded"
          >
            {reason}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>
    </motion.div>
  );
}
