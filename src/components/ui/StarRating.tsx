import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export default function StarRating({
  value,
  max = 5,
  onChange,
  readonly = false,
  size = 20,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverValue(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  const gap = size <= 14 ? 2 : size <= 20 ? 4 : 6;

  return (
    <div
      className={cn(
        'inline-flex items-center',
        readonly ? 'cursor-default' : 'cursor-pointer',
        className
      )}
      style={{ gap: `${gap}px` }}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < displayValue;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-all duration-150 flex-shrink-0',
              isFilled
                ? 'text-accent-500 fill-accent-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.45)]'
                : 'text-gray-300',
              !readonly && 'hover:text-accent-400 hover:fill-accent-400 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.55)]'
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
          />
        );
      })}
    </div>
  );
}
