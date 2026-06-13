import { cn } from '@/lib/utils';

type StatusType =
  | 'pending'
  | 'processing'
  | 'resolved'
  | 'excellent'
  | 'good'
  | 'average'
  | 'poor'
  | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  pending: {
    label: '待处理',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  processing: {
    label: '处理中',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500 animate-pulse',
  },
  resolved: {
    label: '已解决',
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  excellent: {
    label: '优秀',
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  good: {
    label: '良好',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
  average: {
    label: '一般',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  poor: {
    label: '较差',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  critical: {
    label: '严重',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {displayLabel}
    </span>
  );
}
