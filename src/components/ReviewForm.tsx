import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Provider, ReviewTag } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Modal } from './Modal';
import { StarRating } from './StarRating';
import { TagSelector } from './TagSelector';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
}

interface FormData {
  rating: number;
  tags: ReviewTag[];
  comment: string;
}

const initialFormData: FormData = {
  rating: 0,
  tags: [],
  comment: '',
};

export const ReviewForm = ({ isOpen, onClose, provider }: ReviewFormProps) => {
  const { addReview } = useProviderStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [provider, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (formData.rating === 0) {
      newErrors.rating = '请选择评分';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !provider) return;

    addReview(provider.id, {
      rating: formData.rating,
      tags: formData.tags,
      comment: formData.comment.trim(),
    });
    onClose();
  };

  const toggleTag = (tag: ReviewTag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  if (!provider) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`评价 ${provider.name}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">点击星星进行评分</p>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => {
              setFormData((prev) => ({ ...prev, rating }));
              if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
            }}
            size="lg"
          />
          {formData.rating > 0 && (
            <motion.p
              className="mt-2 text-lg font-semibold text-orange-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formData.rating === 5 && '非常满意！'}
              {formData.rating === 4 && '比较满意'}
              {formData.rating === 3 && '一般'}
              {formData.rating === 2 && '不太满意'}
              {formData.rating === 1 && '非常不满意'}
            </motion.p>
          )}
          {errors.rating && <p className="mt-2 text-sm text-red-500">{errors.rating}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评价标签
          </label>
          <TagSelector
            selectedTags={formData.tags}
            onTagToggle={toggleTag}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            详细评价
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="分享您的服务体验（选填）"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
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
            提交评价
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
