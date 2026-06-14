import { motion } from 'framer-motion';
import type { ReviewTag } from '@/types';
import { REVIEW_TAGS } from '@/utils/constants';

interface TagSelectorProps {
  selectedTags: ReviewTag[];
  onTagToggle: (tag: ReviewTag) => void;
  readonly?: boolean;
}

const tagColors: Record<ReviewTag, { bg: string; text: string; border: string }> = {
  '技术好': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '收费贵': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  '响应快': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '态度好': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '不专业': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  '乱收费': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '准时': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

export const TagSelector = ({ selectedTags, onTagToggle, readonly = false }: TagSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {REVIEW_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        const colors = tagColors[tag];

        return (
          <motion.button
            key={tag}
            type="button"
            onClick={() => !readonly && onTagToggle(tag)}
            disabled={readonly}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
              isSelected
                ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            whileHover={!readonly ? { scale: 1.05 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
          >
            {tag}
          </motion.button>
        );
      })}
    </div>
  );
};
