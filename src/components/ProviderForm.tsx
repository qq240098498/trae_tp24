import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Provider, ServiceType } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';
import { useProviderStore } from '@/store/useProviderStore';
import { Modal } from './Modal';
import { ServiceTypeBadge } from './ServiceTypeBadge';

interface ProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  editProvider?: Provider | null;
}

interface FormData {
  name: string;
  phone: string;
  serviceTypes: ServiceType[];
  doorFee: string;
  hasInvoice: boolean;
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  serviceTypes: [],
  doorFee: '',
  hasInvoice: false,
};

export const ProviderForm = ({ isOpen, onClose, editProvider }: ProviderFormProps) => {
  const { addProvider, updateProvider } = useProviderStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (editProvider) {
      setFormData({
        name: editProvider.name,
        phone: editProvider.phone,
        serviceTypes: editProvider.serviceTypes,
        doorFee: editProvider.doorFee?.toString() || '',
        hasInvoice: editProvider.hasInvoice,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editProvider, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入名称';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系方式';
    } else if (!/^[\d-+\s]+$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的电话号码';
    }
    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = '请至少选择一种服务类型';
    }
    if (formData.doorFee && isNaN(Number(formData.doorFee))) {
      newErrors.doorFee = '请输入有效的数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const providerData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      serviceTypes: formData.serviceTypes,
      doorFee: formData.doorFee ? Number(formData.doorFee) : null,
      hasInvoice: formData.hasInvoice,
    };

    if (editProvider) {
      updateProvider(editProvider.id, providerData);
    } else {
      addProvider(providerData);
    }
    onClose();
  };

  const toggleServiceType = (type: ServiceType) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
    if (errors.serviceTypes) {
      setErrors((prev) => ({ ...prev, serviceTypes: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editProvider ? '编辑服务商' : '添加服务商'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="如：李师傅、张师傅家电维修"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            联系方式 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, phone: e.target.value }));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder="电话号码"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
              errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            服务类型 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => toggleServiceType(type)}
                className={`px-3 py-2 rounded-xl font-medium transition-all ${
                  formData.serviceTypes.includes(type)
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
          {errors.serviceTypes && (
            <p className="mt-1 text-sm text-red-500">{errors.serviceTypes}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            上门费（元）
          </label>
          <input
            type="text"
            value={formData.doorFee}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, doorFee: e.target.value }));
              if (errors.doorFee) setErrors((prev) => ({ ...prev, doorFee: undefined }));
            }}
            placeholder="选填，如：30、50"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
              errors.doorFee ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
          />
          {errors.doorFee && <p className="mt-1 text-sm text-red-500">{errors.doorFee}</p>}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-700">提供发票</p>
            <p className="text-sm text-gray-500">该服务商是否可以提供发票</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, hasInvoice: !prev.hasInvoice }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.hasInvoice ? 'bg-orange-500' : 'bg-gray-300'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: formData.hasInvoice ? 26 : 2 }}
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
            {editProvider ? '保存修改' : '添加服务商'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
