import { useState, useEffect } from 'react';
import { AlertTriangle, EyeOff, User as UserIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlacklistReason, ServiceType, BlacklistEntry } from '@/types';
import { SERVICE_TYPE_CONFIG, BLACKLIST_REASONS, BLACKLIST_PUBLIC_THRESHOLD, DEFAULT_REGION } from '@/utils/constants';
import { useBlacklistStore } from '@/store/useBlacklistStore';
import { Modal } from './Modal';

interface BlacklistFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingEntry?: BlacklistEntry | null;
}

export const BlacklistForm = ({ isOpen, onClose, existingEntry }: BlacklistFormProps) => {
  const { addBlacklistEntry, addReport, userNickname, setUserNickname, entries } = useBlacklistStore();

  const [formData, setFormData] = useState({
    providerName: '',
    providerPhone: '',
    serviceTypes: [] as ServiceType[],
    region: DEFAULT_REGION,
    reasons: [] as BlacklistReason[],
    description: '',
    isAnonymous: true,
    reporterNickname: userNickname || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        providerName: existingEntry.providerName,
        providerPhone: existingEntry.providerPhone,
        serviceTypes: existingEntry.serviceTypes,
        region: existingEntry.region,
        reasons: [],
        description: '',
        isAnonymous: true,
        reporterNickname: userNickname || '',
      });
    } else {
      setFormData({
        providerName: '',
        providerPhone: '',
        serviceTypes: [],
        region: DEFAULT_REGION,
        reasons: [],
        description: '',
        isAnonymous: true,
        reporterNickname: userNickname || '',
      });
    }
    setErrors({});
    setSubmitted(false);
  }, [existingEntry, isOpen, userNickname]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.providerName.trim()) {
      newErrors.providerName = '请输入服务商名称';
    }
    if (!formData.providerPhone.trim()) {
      newErrors.providerPhone = '请输入联系电话';
    }
    if (formData.serviceTypes.length === 0 && !existingEntry) {
      newErrors.serviceTypes = '请至少选择一个服务类型';
    }
    if (formData.reasons.length === 0) {
      newErrors.reasons = '请至少选择一个踩雷原因';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请描述具体情况';
    }
    if (!formData.isAnonymous && !formData.reporterNickname.trim()) {
      newErrors.reporterNickname = '非匿名举报请填写昵称';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!formData.isAnonymous && formData.reporterNickname.trim()) {
      setUserNickname(formData.reporterNickname.trim());
    }

    const reportData = {
      reasons: formData.reasons,
      description: formData.description.trim(),
      isAnonymous: formData.isAnonymous,
      reporterNickname: formData.isAnonymous ? '匿名用户' : formData.reporterNickname.trim(),
    };

    if (existingEntry) {
      const success = addReport(existingEntry.id, reportData);
      if (!success) {
        alert('您已经举报过该服务商，请勿重复举报');
        return;
      }
    } else {
      addBlacklistEntry({
        providerName: formData.providerName.trim(),
        providerPhone: formData.providerPhone.trim(),
        serviceTypes: formData.serviceTypes,
        region: formData.region.trim() || DEFAULT_REGION,
        ...reportData,
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const toggleServiceType = (type: ServiceType) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const toggleReason = (reason: BlacklistReason) => {
    setFormData((prev) => ({
      ...prev,
      reasons: prev.reasons.includes(reason)
        ? prev.reasons.filter((r) => r !== reason)
        : [...prev.reasons, reason],
    }));
  };

  const similarEntries = entries.filter(
    (e) =>
      !existingEntry &&
      (formData.providerPhone.trim() && e.providerPhone === formData.providerPhone.trim())
  );

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="举报成功" maxWidth="max-w-md">
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">举报已提交</h3>
          <p className="text-sm text-gray-500">
            感谢您的反馈！累计 {BLACKLIST_PUBLIC_THRESHOLD} 人举报后将对外公示，
            帮助更多邻居避坑。
          </p>
        </motion.div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingEntry ? '追加举报' : '举报踩雷服务商'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!existingEntry && similarEntries.length > 0 && (
          <motion.div
            className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">已有相似举报</p>
              <p className="text-xs text-amber-600 mt-0.5">
                该号码已被其他邻居举报，您可以直接追加举报，帮助加快公示。
              </p>
            </div>
          </motion.div>
        )}

        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">温馨提示</p>
              <p className="text-xs text-red-600 mt-0.5">
                请如实举报，恶意差评将影响社区信誉。举报信息匿名处理，请放心提交。
              </p>
            </div>
          </div>
        </div>

        {!existingEntry ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                服务商名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                placeholder="如：李师傅、快速开锁王"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                  errors.providerName ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.providerName && <p className="mt-1 text-xs text-red-500">{errors.providerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.providerPhone}
                onChange={(e) => setFormData({ ...formData, providerPhone: e.target.value })}
                placeholder="请输入手机号或座机号"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                  errors.providerPhone ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.providerPhone && <p className="mt-1 text-xs text-red-500">{errors.providerPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                服务类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((type) => {
                  const config = SERVICE_TYPE_CONFIG[type];
                  const isSelected = formData.serviceTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleServiceType(type)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={isSelected ? { backgroundColor: config.color } : {}}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
              {errors.serviceTypes && <p className="mt-1 text-xs text-red-500">{errors.serviceTypes}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">所在地区</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="如：北京朝阳区、上海浦东新区"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{existingEntry.providerName}</h3>
                <p className="text-sm text-gray-500">{existingEntry.providerPhone}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  已有 {existingEntry.reportCount} 人举报 ·{' '}
                  {existingEntry.isPublic ? '已公示' : `还差 ${BLACKLIST_PUBLIC_THRESHOLD - existingEntry.reportCount} 人公示`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            踩雷原因 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BLACKLIST_REASONS.map((reason) => {
              const isSelected = formData.reasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    isSelected
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>
          {errors.reasons && <p className="mt-1 text-xs text-red-500">{errors.reasons}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            详细描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请描述具体经过，如：上门前报价200，到了说情况复杂要加钱到600..."
            rows={4}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3">
            <label className="flex items-start gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <EyeOff size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">匿名举报</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">匿名后其他人看不到您的昵称</p>
              </div>
            </label>
          </div>
          {!formData.isAnonymous && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <UserIcon size={14} className="inline mr-1" />
                我的昵称
              </label>
              <input
                type="text"
                value={formData.reporterNickname}
                onChange={(e) => setFormData({ ...formData, reporterNickname: e.target.value })}
                placeholder="请输入您的昵称"
                className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                  errors.reporterNickname ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.reporterNickname && (
                <p className="mt-1 text-xs text-red-500">{errors.reporterNickname}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            取消
          </motion.button>
          <motion.button
            type="submit"
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus size={18} />
            {existingEntry ? '提交举报' : '提交举报'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
