import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Provider, ServiceRecord, ServiceType, ServiceStatus } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';
import { SERVICE_STATUS_CONFIG } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Modal } from './Modal';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface ServiceRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  editRecord?: ServiceRecord | null;
}

interface FormData {
  serviceType: ServiceType;
  title: string;
  description: string;
  serviceDate: string;
  completedDate: string;
  status: ServiceStatus;
  totalFee: string;
  materials: string;
  issuesFound: string;
  solutions: string;
  warrantyMonths: string;
  followUpNeeded: boolean;
}

const initialFormData: FormData = {
  serviceType: 'plumber',
  title: '',
  description: '',
  serviceDate: '',
  completedDate: '',
  status: 'completed',
  totalFee: '',
  materials: '',
  issuesFound: '',
  solutions: '',
  warrantyMonths: '',
  followUpNeeded: false,
};

export const ServiceRecordForm = ({
  isOpen,
  onClose,
  provider,
  editRecord,
}: ServiceRecordFormProps) => {
  const { addServiceRecord, updateServiceRecord } = useProviderStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (editRecord) {
      setFormData({
        serviceType: editRecord.serviceType,
        title: editRecord.title,
        description: editRecord.description,
        serviceDate: editRecord.serviceDate.split('T')[0],
        completedDate: editRecord.completedDate?.split('T')[0] || '',
        status: editRecord.status,
        totalFee: editRecord.totalFee?.toString() || '',
        materials: editRecord.materials,
        issuesFound: editRecord.issuesFound,
        solutions: editRecord.solutions,
        warrantyMonths: editRecord.warrantyMonths?.toString() || '',
        followUpNeeded: editRecord.followUpNeeded,
      });
    } else if (provider) {
      setFormData({
        ...initialFormData,
        serviceType: provider.serviceTypes[0] || 'plumber',
        serviceDate: new Date().toISOString().split('T')[0],
        completedDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [editRecord, provider, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入服务标题';
    }
    if (!formData.serviceDate) {
      newErrors.serviceDate = '请选择服务日期';
    }
    if (formData.status === 'completed' && !formData.completedDate) {
      newErrors.completedDate = '已完成的服务请选择完成日期';
    }
    if (formData.totalFee && isNaN(Number(formData.totalFee))) {
      newErrors.totalFee = '请输入有效的数字';
    }
    if (formData.warrantyMonths && isNaN(Number(formData.warrantyMonths))) {
      newErrors.warrantyMonths = '请输入有效的数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !provider) return;

    const recordData = {
      serviceType: formData.serviceType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      serviceDate: new Date(formData.serviceDate).toISOString(),
      completedDate: formData.completedDate ? new Date(formData.completedDate).toISOString() : null,
      status: formData.status,
      totalFee: formData.totalFee ? Number(formData.totalFee) : null,
      materials: formData.materials.trim(),
      issuesFound: formData.issuesFound.trim(),
      solutions: formData.solutions.trim(),
      warrantyMonths: formData.warrantyMonths ? Number(formData.warrantyMonths) : null,
      followUpNeeded: formData.followUpNeeded,
    };

    if (editRecord) {
      updateServiceRecord(editRecord.id, recordData);
    } else {
      addServiceRecord(provider.id, recordData);
    }
    onClose();
  };

  if (!provider) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRecord ? '编辑服务记录' : `添加服务记录 - ${provider.name}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            服务类型 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {provider.serviceTypes.map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, serviceType: type }))}
                className={`px-3 py-2 rounded-xl font-medium transition-all ${
                  formData.serviceType === type
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ServiceTypeBadge type={type} showLabel={true} showIcon={true} size="sm" />
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            服务标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="如：厨房水龙头漏水维修"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            问题描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="简要描述遇到的问题"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              服务日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, serviceDate: e.target.value }));
                if (errors.serviceDate) setErrors((prev) => ({ ...prev, serviceDate: undefined }));
              }}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                errors.serviceDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            {errors.serviceDate && <p className="mt-1 text-sm text-red-500">{errors.serviceDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              完成日期
            </label>
            <input
              type="date"
              value={formData.completedDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, completedDate: e.target.value }));
                if (errors.completedDate) setErrors((prev) => ({ ...prev, completedDate: undefined }));
              }}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                errors.completedDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            {errors.completedDate && <p className="mt-1 text-sm text-red-500">{errors.completedDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              服务状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ServiceStatus }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              {(Object.keys(SERVICE_STATUS_CONFIG) as ServiceStatus[]).map((status) => (
                <option key={status} value={status}>
                  {SERVICE_STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              总费用（元）
            </label>
            <input
              type="text"
              value={formData.totalFee}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, totalFee: e.target.value }));
                if (errors.totalFee) setErrors((prev) => ({ ...prev, totalFee: undefined }));
              }}
              placeholder="如：180"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                errors.totalFee ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            {errors.totalFee && <p className="mt-1 text-sm text-red-500">{errors.totalFee}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              保修（月）
            </label>
            <input
              type="text"
              value={formData.warrantyMonths}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, warrantyMonths: e.target.value }));
                if (errors.warrantyMonths) setErrors((prev) => ({ ...prev, warrantyMonths: undefined }));
              }}
              placeholder="如：6"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                errors.warrantyMonths ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            {errors.warrantyMonths && <p className="mt-1 text-sm text-red-500">{errors.warrantyMonths}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            使用材料
          </label>
          <input
            type="text"
            value={formData.materials}
            onChange={(e) => setFormData((prev) => ({ ...prev, materials: e.target.value }))}
            placeholder="如：新水龙头阀芯x1、生料带x1"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            发现的问题
          </label>
          <textarea
            value={formData.issuesFound}
            onChange={(e) => setFormData((prev) => ({ ...prev, issuesFound: e.target.value }))}
            placeholder="详细描述检查后发现的具体问题"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            解决方案
          </label>
          <textarea
            value={formData.solutions}
            onChange={(e) => setFormData((prev) => ({ ...prev, solutions: e.target.value }))}
            placeholder="详细描述维修过程和采取的措施"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-700">需要后续跟进</p>
            <p className="text-sm text-gray-500">标记后会在列表中突出显示</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, followUpNeeded: !prev.followUpNeeded }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.followUpNeeded ? 'bg-orange-500' : 'bg-gray-300'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: formData.followUpNeeded ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex gap-3 pt-4">
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            取消
          </motion.button>
          <motion.button
            type="submit"
            className="flex-1 px-4 py-2.5 text-white font-medium bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {editRecord ? '保存修改' : '添加服务记录'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
