import { useState, useMemo } from 'react';
import { Search, Filter, ClipboardList, Building2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import WorkOrderDrawer from '@/components/WorkOrderDrawer';
import type { WorkOrderStatus, WorkOrderPriority, WorkOrderSource, District, WorkOrder } from '@/types';

const SOURCE_OPTIONS: { value: WorkOrderSource | 'all'; label: string }[] = [
  { value: 'all', label: '全部来源' },
  { value: 'citizen', label: '市民上报' },
  { value: 'inspection', label: '巡检故障' },
];

const DISTRICT_OPTIONS: { value: District | 'all'; label: string }[] = [
  { value: 'all', label: '全部区域' },
  { value: '东城区', label: '东城区' },
  { value: '西城区', label: '西城区' },
  { value: '朝阳区', label: '朝阳区' },
  { value: '海淀区', label: '海淀区' },
];

const STATUS_OPTIONS: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'unassigned', label: '待分派' },
  { value: 'assigned', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'reviewing', label: '待复核' },
  { value: 'completed', label: '已完成' },
];

const SOURCE_LABELS: Record<WorkOrderSource, string> = {
  citizen: '市民上报',
  inspection: '巡检故障',
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  unassigned: '待分派',
  assigned: '待处理',
  processing: '处理中',
  reviewing: '待复核',
  completed: '已完成',
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  unassigned: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  reviewing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
};

const STATUS_DOT_COLORS: Record<WorkOrderStatus, string> = {
  unassigned: 'bg-yellow-500',
  assigned: 'bg-blue-500',
  processing: 'bg-purple-500',
  reviewing: 'bg-cyan-500',
  completed: 'bg-green-500',
};

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  normal: '普通',
  urgent: '紧急',
  critical: '严重',
};

const PRIORITY_BADGE_CLASSES: Record<WorkOrderPriority, string> = {
  normal: 'bg-gray-100 text-gray-600',
  urgent: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const PRIORITY_ORDER: Record<WorkOrderPriority, number> = {
  critical: 0,
  urgent: 1,
  normal: 2,
};

export default function WorkOrders() {
  const workOrders = useAppStore((s) => s.workOrders);
  const toilets = useAppStore((s) => s.toilets);

  const [sourceFilter, setSourceFilter] = useState<WorkOrderSource | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<District | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [toiletFilter, setToiletFilter] = useState<string>('all');
  const [handlerSearch, setHandlerSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<WorkOrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const getToiletName = (toiletId: string) => {
    return toilets.find((t) => t.id === toiletId)?.name || '未知公厕';
  };

  const toiletOptions = useMemo(() => {
    return [
      { value: 'all', label: '全部公厕' },
      ...toilets.map((t) => ({ value: t.id, label: t.name })),
    ];
  }, [toilets]);

  const statusCounts = useMemo(() => {
    const counts: Record<WorkOrderStatus, number> = {
      unassigned: 0,
      assigned: 0,
      processing: 0,
      reviewing: 0,
      completed: 0,
    };
    workOrders.forEach((wo) => {
      counts[wo.status]++;
    });
    return counts;
  }, [workOrders]);

  const filteredOrders = useMemo(() => {
    return workOrders
      .filter((wo) => {
        if (sourceFilter !== 'all' && wo.source !== sourceFilter) return false;
        if (districtFilter !== 'all' && wo.district !== districtFilter) return false;
        if (toiletFilter !== 'all' && wo.toiletId !== toiletFilter) return false;
        const effectiveStatus = activeStatus !== 'all' ? activeStatus : statusFilter;
        if (effectiveStatus !== 'all' && wo.status !== effectiveStatus) return false;
        if (handlerSearch) {
          const search = handlerSearch.toLowerCase();
          const assignedTo = wo.assignedTo || '';
          if (!assignedTo.toLowerCase().includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority];
        const pb = PRIORITY_ORDER[b.priority];
        if (pa !== pb) return pa - pb;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [workOrders, sourceFilter, districtFilter, toiletFilter, statusFilter, activeStatus, handlerSearch]);

  const handleStatusClick = (status: WorkOrderStatus) => {
    if (activeStatus === status) {
      setActiveStatus('all');
      setStatusFilter('all');
    } else {
      setActiveStatus(status);
      setStatusFilter(status);
    }
  };

  const handleRowClick = (wo: WorkOrder) => {
    setSelectedOrder(wo);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">工单中心</h1>
        <p className="text-sm text-gray-500 mt-1">统一管理市民上报与巡检故障工单</p>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as WorkOrderSource | 'all')}
              className="input w-32"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value as District | 'all')}
            className="input w-32"
          >
            {DISTRICT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <select
              value={toiletFilter}
              onChange={(e) => setToiletFilter(e.target.value)}
              className="input w-44"
            >
              {toiletOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value as WorkOrderStatus | 'all';
              setStatusFilter(val);
              setActiveStatus(val);
            }}
            className="input w-32"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索处理人..."
              value={handlerSearch}
              onChange={(e) => setHandlerSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(Object.keys(STATUS_LABELS) as WorkOrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              activeStatus === status
                ? STATUS_COLORS[status]
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                activeStatus === status ? STATUS_DOT_COLORS[status] : 'bg-gray-400'
              )}
            />
            {STATUS_LABELS[status]}
            <span className="ml-0.5 font-bold">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  优先级
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  标题
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  来源
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  公厕名
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  区域
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  创建时间
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>暂无工单记录</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => handleRowClick(wo)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span className={cn('badge', PRIORITY_BADGE_CLASSES[wo.priority])}>
                        {PRIORITY_LABELS[wo.priority]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium max-w-[200px] truncate">
                      {wo.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'badge',
                        wo.source === 'citizen'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-teal-50 text-teal-700'
                      )}>
                        {SOURCE_LABELS[wo.source]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{getToiletName(wo.toiletId)}</td>
                    <td className="py-3 px-4 text-gray-500">{wo.district}</td>
                    <td className="py-3 px-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_COLORS[wo.status])}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT_COLORS[wo.status])} />
                        {STATUS_LABELS[wo.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{wo.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(wo);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <WorkOrderDrawer
          workOrder={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
