import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Shield,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import type { ServiceRecord } from '@/types';
import { SERVICE_STATUS_CONFIG } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface ServiceRecordTimelineProps {
  records: ServiceRecord[];
  onEdit: (record: ServiceRecord) => void;
}

interface TimelineItemProps {
  record: ServiceRecord;
  onEdit: (record: ServiceRecord) => void;
  index: number;
}

const TimelineItem = ({ record, onEdit, index }: TimelineItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { deleteServiceRecord } = useProviderStore();
  const statusConfig = SERVICE_STATUS_CONFIG[record.status];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = () => {
    if (!record.completedDate) return null;
    const start = new Date(record.serviceDate).getTime();
    const end = new Date(record.completedDate).getTime();
    const diffMs = end - start;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.round(diffMs / (1000 * 60));
      return `${diffMins}分钟`;
    }
    if (diffHours < 24) {
      return `${diffHours}小时`;
    }
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}天`;
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条服务记录吗？')) {
      deleteServiceRecord(record.id);
    }
  };

  const duration = calculateDuration();

  return (
    <motion.div
      className="relative pl-8 pb-6 last:pb-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-orange-200" />
      <div
        className={`absolute left-[-8px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
          record.status === 'completed' ? 'bg-emerald-500' :
          record.status === 'in_progress' ? 'bg-blue-500' :
          record.status === 'scheduled' ? 'bg-amber-500' : 'bg-gray-400'
        }`}
      />

      <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${
        record.followUpNeeded ? 'ring-2 ring-orange-300' : ''
      }`}>
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{record.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                {record.followUpNeeded && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                    <AlertCircle size={12} />
                    需跟进
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ServiceTypeBadge type={record.serviceType} size="sm" />
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(record.serviceDate)}
                </span>
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    用时 {duration}
                  </span>
                )}
                {record.totalFee !== null && (
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <DollarSign size={14} />
                    ¥{record.totalFee}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
              animate={{ rotate: expanded ? 180 : 0 }}
            >
              <ChevronDown size={20} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                {record.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">问题描述</p>
                    <p className="text-sm text-gray-700">{record.description}</p>
                  </div>
                )}

                {record.issuesFound && (
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-red-50 rounded-lg h-fit">
                      <AlertTriangle size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">发现的问题</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{record.issuesFound}</p>
                    </div>
                  </div>
                )}

                {record.solutions && (
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-emerald-50 rounded-lg h-fit">
                      <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">解决方案</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{record.solutions}</p>
                    </div>
                  </div>
                )}

                {record.materials && (
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg h-fit">
                      <Package size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">使用材料</p>
                      <p className="text-sm text-gray-700">{record.materials}</p>
                    </div>
                  </div>
                )}

                {record.warrantyMonths !== null && (
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-purple-50 rounded-lg h-fit">
                      <Shield size={16} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">保修期限</p>
                      <p className="text-sm text-gray-700">{record.warrantyMonths}个月</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    创建于 {formatDate(record.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(record);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit2 size={14} />
                      编辑
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 size={14} />
                      删除
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const ServiceRecordTimeline = ({ records, onEdit }: ServiceRecordTimelineProps) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-gray-100 rounded-full inline-block mb-3">
          <Wrench className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无服务记录</p>
        <p className="text-sm text-gray-400 mt-1">点击上方"新增服务记录"添加第一条</p>
      </div>
    );
  }

  const totalSpent = records.reduce((sum, r) => sum + (r.totalFee || 0), 0);
  const completedCount = records.filter((r) => r.status === 'completed').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500">总服务次数</p>
            <p className="text-lg font-bold text-gray-900">{records.length}次</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">已完成</p>
            <p className="text-lg font-bold text-emerald-600">{completedCount}次</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">累计费用</p>
            <p className="text-lg font-bold text-orange-500">¥{totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto pr-2">
        {records.map((record, index) => (
          <TimelineItem
            key={record.id}
            record={record}
            onEdit={onEdit}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
