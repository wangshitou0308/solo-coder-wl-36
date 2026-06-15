import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Package,
  Star,
  Wrench,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { DataCard, ScoreBadge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { WorkOrderStatus } from '@/types';

const TODAY = '2026-06-15';

const LAST_7_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2026, 5, 9 + i);
  return d.toISOString().slice(0, 10);
});

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  unassigned: '待分派',
  assigned: '待处理',
  processing: '处理中',
  reviewing: '待复核',
  completed: '已完成',
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  unassigned: '#F59E0B',
  assigned: '#3B82F6',
  processing: '#8B5CF6',
  reviewing: '#06B6D4',
  completed: '#10B981',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const toilets = useAppStore((s) => s.toilets);
  const inspections = useAppStore((s) => s.inspections);
  const workOrders = useAppStore((s) => s.workOrders);
  const supplyRecords = useAppStore((s) => s.supplyRecords);

  const todayInspectionCount = useMemo(
    () => inspections.filter((i) => i.date === TODAY).length,
    [inspections]
  );

  const pendingWorkOrderCount = useMemo(
    () => workOrders.filter((w) => w.status !== 'completed').length,
    [workOrders]
  );

  const lowSupplyCount = useMemo(() => {
    const todayDate = new Date(TODAY);
    const threeDaysLater = new Date(TODAY);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return supplyRecords.filter((s) => {
      const restockDate = new Date(s.nextEstimatedRestock);
      return restockDate >= todayDate && restockDate <= threeDaysLater;
    }).length;
  }, [supplyRecords]);

  const avgCitizenScore = useMemo(() => {
    if (toilets.length === 0) return 0;
    const total = toilets.reduce((sum, t) => sum + t.averageCitizenScore, 0);
    return Math.round((total / toilets.length) * 10) / 10;
  }, [toilets]);

  const districtScoreData = useMemo(() => {
    const districts = ['东城区', '西城区', '朝阳区', '海淀区'] as const;
    return districts
      .map((district) => {
        const districtToilets = toilets.filter((t) => t.district === district);
        if (districtToilets.length === 0) return null;
        const avgInspection =
          districtToilets.reduce((s, t) => s + t.averageInspectionScore, 0) /
          districtToilets.length;
        const avgCitizen =
          districtToilets.reduce((s, t) => s + t.averageCitizenScore, 0) /
          districtToilets.length;
        return {
          district,
          巡检分: Math.round(avgInspection * 10) / 10,
          市民分: Math.round(avgCitizen * 10) / 10,
        };
      })
      .filter(Boolean);
  }, [toilets]);

  const statusPieData = useMemo(() => {
    const counts: Record<WorkOrderStatus, number> = {
      unassigned: 0,
      assigned: 0,
      processing: 0,
      reviewing: 0,
      completed: 0,
    };
    workOrders.forEach((w) => {
      counts[w.status]++;
    });
    return (Object.entries(counts) as [WorkOrderStatus, number][])
      .filter(([, count]) => count > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status],
        value,
        color: STATUS_COLORS[status],
      }));
  }, [workOrders]);

  const inspectionTrendData = useMemo(() => {
    return LAST_7_DAYS.map((date) => {
      const count = inspections.filter((i) => i.date === date).length;
      const label = date.slice(5);
      return { date: label, 巡检数: count };
    });
  }, [inspections]);

  const lowScoreToilets = useMemo(() => {
    return [...toilets]
      .sort((a, b) => a.averageInspectionScore - b.averageInspectionScore)
      .slice(0, 5);
  }, [toilets]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">运营驾驶舱</h1>
        <p className="mt-1 text-sm text-gray-500">公厕运营核心指标一览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DataCard
          title="公厕总数"
          value={toilets.length}
          icon={<Building2 className="w-5 h-5" />}
          color="primary"
        />
        <DataCard
          title="今日巡检数"
          value={todayInspectionCount}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color="blue"
        />
        <DataCard
          title="待处理问题数"
          value={pendingWorkOrderCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="accent"
        />
        <DataCard
          title="即将缺货耗材"
          value={lowSupplyCount}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
        <DataCard
          title="平均市民评分"
          value={avgCitizenScore}
          icon={<Star className="w-5 h-5" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">区域评分排行</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={districtScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="district" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="巡检分" fill="#0F4C3A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="市民分" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">问题状态占比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}`}
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">近七日巡检趋势</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={inspectionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="巡检数"
                stroke="#0F4C3A"
                strokeWidth={2}
                dot={{ fill: '#0F4C3A', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">低分公厕榜单</h3>
          <div className="space-y-3">
            {lowScoreToilets.map((toilet, index) => (
              <div
                key={toilet.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      index < 3
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{toilet.name}</p>
                    <p className="text-xs text-gray-400">{toilet.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">巡检分</p>
                    <ScoreBadge score={toilet.averageInspectionScore} size="sm" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">市民分</p>
                    <ScoreBadge score={toilet.averageCitizenScore} size="sm" />
                  </div>
                </div>
              </div>
            ))}
            {lowScoreToilets.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-primary"
            onClick={() => navigate('/inspection')}
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            新增巡检
          </button>
          <button
            className="btn-accent"
            onClick={() => navigate('/work-orders')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            处理问题
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/supplies')}
          >
            <Package className="w-4 h-4 mr-2" />
            补给耗材
          </button>
        </div>
      </div>
    </div>
  );
}
