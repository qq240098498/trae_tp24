import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = sizeMap[size];

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= displayRating;
        const halfFilled = !filled && value - 0.5 <= displayRating;

        return (
          <motion.button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
            animate={filled ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <Star
              size={starSize}
              className={`transition-colors ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : halfFilled
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-transparent text-gray-300'
              }`}
            />
          </motion.button>
        );
      })}
      {readonly && rating > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};
