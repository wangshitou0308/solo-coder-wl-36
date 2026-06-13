import { cn } from '@/lib/utils';
import { getScoreLevel } from '@/utils/score';

type BadgeSize = 'sm' | 'md' | 'lg';

interface ScoreBadgeProps {
  score: number;
  size?: BadgeSize;
}

const sizeConfig: Record<BadgeSize, { size: number; stroke: number; text: string; sub: string }> = {
  sm: { size: 44, stroke: 4, text: 'text-sm', sub: 'text-[8px]' },
  md: { size: 64, stroke: 5, text: 'text-xl', sub: 'text-[10px]' },
  lg: { size: 80, stroke: 6, text: 'text-2xl', sub: 'text-xs' },
};

const colorMap: Record<string, { ring: string; text: string; label: string }> = {
  green: {
    ring: 'stroke-green-500',
    text: 'text-green-600',
    label: 'bg-green-500',
  },
  teal: {
    ring: 'stroke-teal-500',
    text: 'text-teal-600',
    label: 'bg-teal-500',
  },
  yellow: {
    ring: 'stroke-yellow-500',
    text: 'text-yellow-600',
    label: 'bg-yellow-500',
  },
  orange: {
    ring: 'stroke-orange-500',
    text: 'text-orange-600',
    label: 'bg-orange-500',
  },
  red: {
    ring: 'stroke-red-500',
    text: 'text-red-600',
    label: 'bg-red-500',
  },
};

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const { color, label } = getScoreLevel(score);
  const colors = colorMap[color];
  const cfg = sizeConfig[size];
  const clampedScore = Math.max(0, Math.min(5, score));
  const progress = (clampedScore / 5) * 100;
  const radius = (cfg.size - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const labelSize = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : size === 'md' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={cfg.size} height={cfg.size} className="-rotate-90">
        <circle
          cx={cfg.size / 2}
          cy={cfg.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={cfg.stroke}
          className="text-gray-100"
        />
        <circle
          cx={cfg.size / 2}
          cy={cfg.size / 2}
          r={radius}
          fill="none"
          strokeWidth={cfg.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500', colors.ring)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', cfg.text, colors.text)}>
          {clampedScore.toFixed(1)}
        </span>
        <span className={cn('text-gray-400 mt-0.5', cfg.sub)}>/5.0</span>
      </div>
      <span
        className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded font-medium text-white whitespace-nowrap',
          colors.label,
          labelSize
        )}
      >
        {label}
      </span>
    </div>
  );
}
