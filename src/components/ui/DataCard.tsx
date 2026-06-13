import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'accent' | 'green' | 'blue' | 'purple';
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function DataCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: DataCardProps) {
  const colors = colorClasses[color];

  const renderTrend = () => {
    if (!trend) return null;
    const isUp = trend.value > 0;
    const isDown = trend.value < 0;
    const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium',
          isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-500'
        )}
      >
        <TrendIcon className="w-3.5 h-3.5" />
        <span>{Math.abs(trend.value)}%</span>
        {trend.label && <span className="text-gray-400">{trend.label}</span>}
      </div>
    );
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
            {renderTrend()}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-4',
              colors.bg,
              colors.text
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
