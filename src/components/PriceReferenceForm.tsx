import { useState, useEffect } from 'react';
import { Plus, User as UserIcon, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PriceReference, ServiceType, PriceSource } from '@/types';
import { SERVICE_TYPE_CONFIG, PRICE_UNITS, DEFAULT_REGION } from '@/utils/constants';
import { usePriceStore } from '@/store/usePriceStore';
import { Modal } from './Modal';

interface PriceReferenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  editPriceRef?: PriceReference | null;
}

export const PriceReferenceForm = ({ isOpen, onClose, editPriceRef }: PriceReferenceFormProps) => {
  const { addPriceReference, updatePriceReference, userNickname, setUserNickname, getAllItemNames } = usePriceStore();
  const allItemNames = getAllItemNames();

  const [formData, setFormData] = useState({
    itemName: '',
    serviceType: 'plumber' as ServiceType,
    minPrice: '',
    maxPrice: '',
    unit: '次',
    description: '',
    region: DEFAULT_REGION,
    source: 'community' as PriceSource,
    isAnonymous: true,
    contributorNickname: userNickname || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editPriceRef) {
      setFormData({
        itemName: editPriceRef.itemName,
        serviceType: editPriceRef.serviceType,
        minPrice: String(editPriceRef.minPrice),
        maxPrice: String(editPriceRef.maxPrice),
        unit: editPriceRef.unit,
        description: editPriceRef.description,
        region: editPriceRef.region,
        source: editPriceRef.source,
        isAnonymous: editPriceRef.isAnonymous,
        contributorNickname: editPriceRef.isAnonymous ? userNickname || '' : editPriceRef.contributorNickname,
      });
    } else {
      setFormData({
        itemName: '',
        serviceType: 'plumber',
        minPrice: '',
        maxPrice: '',
        unit: '次',
        description: '',
        region: DEFAULT_REGION,
        source: 'community',
        isAnonymous: true,
        contributorNickname: userNickname || '',
      });
    }
    setErrors({});
  }, [editPriceRef, isOpen, userNickname]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = '请输入项目名称';
    }
    if (!formData.minPrice || isNaN(Number(formData.minPrice)) || Number(formData.minPrice) < 0) {
      newErrors.minPrice = '请输入有效的最低价格';
    }
    if (!formData.maxPrice || isNaN(Number(formData.maxPrice)) || Number(formData.maxPrice) < 0) {
      newErrors.maxPrice = '请输入有效的最高价格';
    }
    if (
      formData.minPrice &&
      formData.maxPrice &&
      Number(formData.minPrice) > Number(formData.maxPrice)
    ) {
      newErrors.maxPrice = '最高价格不能低于最低价格';
    }
    if (!formData.isAnonymous && !formData.contributorNickname.trim()) {
      newErrors.contributorNickname = '非匿名发布请填写昵称';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!formData.isAnonymous && formData.contributorNickname.trim()) {
      setUserNickname(formData.contributorNickname.trim());
    }

    const data = {
      itemName: formData.itemName.trim(),
      serviceType: formData.serviceType,
      minPrice: Number(formData.minPrice),
      maxPrice: Number(formData.maxPrice),
      unit: formData.unit,
      description: formData.description.trim(),
      region: formData.region.trim() || DEFAULT_REGION,
      source: formData.source,
      isAnonymous: formData.isAnonymous,
      contributorNickname: formData.isAnonymous ? '匿名用户' : formData.contributorNickname.trim(),
    };

    if (editPriceRef) {
      updatePriceReference(editPriceRef.id, data);
    } else {
      addPriceReference(data);
    }
    onClose();
  };

  const handleItemNameSelect = (name: string) => {
    setFormData({ ...formData, itemName: name });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editPriceRef ? '编辑价格参考' : '添加价格参考'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            维修项目名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            placeholder="如：疏通下水道、空调加氟"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              errors.itemName ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
            }`}
            list="itemNameSuggestions"
          />
          <datalist id="itemNameSuggestions">
            {allItemNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {allItemNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-400">快速选择：</span>
              {allItemNames.slice(0, 6).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleItemNameSelect(name)}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {errors.itemName && <p className="mt-1 text-xs text-red-500">{errors.itemName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            服务类型 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((type) => {
              const config = SERVICE_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceType: type })}
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    formData.serviceType === type
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={formData.serviceType === type ? { backgroundColor: config.color } : {}}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              最低价 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
              <input
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                placeholder="80"
                min="0"
                className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.minPrice ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.minPrice && <p className="mt-1 text-xs text-red-500">{errors.minPrice}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              最高价 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                placeholder="150"
                min="0"
                className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.maxPrice ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.maxPrice && <p className="mt-1 text-xs text-red-500">{errors.maxPrice}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">计价单位</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {PRICE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">地区</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="如：北京、上海、全国"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">详细说明</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="包含的服务内容、特殊情况说明等，如：普通家庭厨房/卫生间下水道堵塞疏通，不含严重堵塞或高压疏通"
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">数据来源</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, source: 'community' })}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                formData.source === 'community'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              匿名共享到社区
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, source: 'local' })}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                formData.source === 'local'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              仅本地记录
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3">
            <label className="flex items-start gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <EyeOff size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">匿名发布</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">匿名后其他人将看不到你的昵称</p>
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
                value={formData.contributorNickname}
                onChange={(e) => setFormData({ ...formData, contributorNickname: e.target.value })}
                placeholder="请输入你的昵称"
                className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.contributorNickname ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.contributorNickname && (
                <p className="mt-1 text-xs text-red-500">{errors.contributorNickname}</p>
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
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus size={18} />
            {editPriceRef ? '保存修改' : '添加价格'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
