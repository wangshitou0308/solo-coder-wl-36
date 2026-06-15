import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import L from 'leaflet';
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Baby,
  Accessibility,
  Phone,
  AlertTriangle,
  CheckCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Wrench,
  ListChecks,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatDateTime, formatHours } from '@/utils';
import { StarRating, ScoreBadge, StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProblemType, ToiletType, WorkOrderStatus, InspectionTaskStatus } from '@/types';

const toiletTypeLabels: Record<ToiletType, string> = {
  street: '街道',
  park: '公园',
  station: '车站',
  mall: '商场',
};

const problemTypeLabels: Record<ProblemType, string> = {
  cleanliness: '卫生问题',
  odor: '异味问题',
  supply_shortage: '物资短缺',
  facility_damage: '设施损坏',
  other: '其他问题',
};

const WO_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  unassigned: '待分派',
  assigned: '待处理',
  processing: '处理中',
  reviewing: '待复核',
  completed: '已完成',
};

const WO_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  unassigned: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  reviewing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
};

const WO_STATUS_DOTS: Record<WorkOrderStatus, string> = {
  unassigned: 'bg-yellow-500',
  assigned: 'bg-blue-500',
  processing: 'bg-purple-500',
  reviewing: 'bg-cyan-500',
  completed: 'bg-green-500',
};

const TASK_STATUS_LABELS: Record<InspectionTaskStatus, string> = {
  pending: '待巡检',
  completed: '已完成',
  overdue: '逾期',
};

const TASK_STATUS_COLORS: Record<InspectionTaskStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
};

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width: 36px; height: 48px; position: relative;">
    <svg viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.1 27.9 0 18 0z" fill="#0F4C3A"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <circle cx="18" cy="18" r="4" fill="#0F4C3A"/>
    </svg>
  </div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
});

export default function ToiletDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const getToiletById = useAppStore((s) => s.getToiletById);
  const getInspectionsByToiletId = useAppStore((s) => s.getInspectionsByToiletId);
  const getCitizenReviewsByToiletId = useAppStore((s) => s.getCitizenReviewsByToiletId);
  const getProblemReportsByToiletId = useAppStore((s) => s.getProblemReportsByToiletId);
  const getWorkOrdersByToiletId = useAppStore((s) => s.getWorkOrdersByToiletId);
  const getInspectionTasksByToiletId = useAppStore((s) => s.getInspectionTasksByToiletId);

  const toilet = id ? getToiletById(id) : undefined;
  const inspections = id ? getInspectionsByToiletId(id).slice(0, 10) : [];
  const reviews = id ? getCitizenReviewsByToiletId(id) : [];
  const problemReports = id ? getProblemReportsByToiletId(id) : [];
  const workOrders = id ? getWorkOrdersByToiletId(id) : [];
  const inspectionTasks = id ? getInspectionTasksByToiletId(id) : [];

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const chartData = [...inspections]
    .reverse()
    .map((inspection) => ({
      date: inspection.date.slice(5),
      score: inspection.totalScore,
    }));

  if (!toilet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">公厕信息不存在</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface animate-fade-in">
      <header className="sticky top-0 z-10 bg-surface-card border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost !p-2"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{toilet.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="tag bg-primary-50 text-primary-700">
                <MapPin size={12} />
                {toilet.district}
              </span>
              <span className="tag bg-gray-100 text-gray-700">
                {toiletTypeLabels[toilet.type]}
              </span>
              <ScoreBadge score={toilet.averageInspectionScore} size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="card p-6 animate-slide-up stagger-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-sm font-bold">#</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">厕所编号</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.code}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">地址</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">所属区域</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.district}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">开放时间</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.openTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">厕位数</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.seatCount} 个</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">管理单位</p>
                  <p className="text-sm font-medium text-gray-900">{toilet.managementUnit}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Star size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">设施标签</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {toilet.hasThirdBathroom && (
                      <span className="badge bg-blue-100 text-blue-700">
                        <Accessibility size={12} />
                        第三卫生间
                      </span>
                    )}
                    {toilet.hasBabyRoom && (
                      <span className="badge bg-pink-100 text-pink-700">
                        <Baby size={12} />
                        母婴室
                      </span>
                    )}
                    {toilet.hasAccessible && (
                      <span className="badge bg-green-100 text-green-700">
                        <Accessibility size={12} />
                        无障碍设施
                      </span>
                    )}
                    {!toilet.hasThirdBathroom && !toilet.hasBabyRoom && !toilet.hasAccessible && (
                      <span className="text-sm text-gray-400">无特殊设施</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">位置地图</p>
              <div className="w-full overflow-hidden rounded-xl border border-gray-200" style={{ height: 300 }}>
                <MapContainer
                  center={[toilet.lat, toilet.lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  boxZoom={false}
                  keyboard={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[toilet.lat, toilet.lng]} icon={customIcon} />
                </MapContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6 animate-slide-up stagger-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">巡检评分趋势</h2>

          {inspections.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <AlertTriangle size={40} className="mx-auto mb-2 opacity-50" />
              <p>暂无巡检记录</p>
            </div>
          ) : (
            <>
              <div className="w-full" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F4C3A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0F4C3A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickCount={6}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [value.toFixed(2), '综合得分']}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#0F4C3A"
                      strokeWidth={2.5}
                      fill="url(#scoreGradient)"
                      dot={{ fill: '#0F4C3A', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        日期
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        巡检员
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        地面
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        厕位
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        异味
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        物资
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        设施
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        综合
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((inspection) => (
                      <tr key={inspection.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-900 font-medium">{inspection.date}</td>
                        <td className="py-3 px-3 text-gray-700">{inspection.inspectorName}</td>
                        <td className="py-3 px-3 text-center text-gray-700">{inspection.groundCleanliness}</td>
                        <td className="py-3 px-3 text-center text-gray-700">{inspection.toiletCleanliness}</td>
                        <td className="py-3 px-3 text-center text-gray-700">{inspection.odorLevel}</td>
                        <td className="py-3 px-3 text-center text-gray-700">{inspection.suppliesAdequacy}</td>
                        <td className="py-3 px-3 text-center text-gray-700">{inspection.facilityIntegrity}</td>
                        <td className="py-3 px-3 text-center">
                          <ScoreBadge score={inspection.totalScore} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-xs max-w-[200px] truncate">
                          {inspection.remark || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="card p-6 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">市民评价</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary-600">
                {toilet.averageCitizenScore.toFixed(1)}
              </span>
              <StarRating value={toilet.averageCitizenScore} size={20} />
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <AlertTriangle size={40} className="mx-auto mb-2 opacity-50" />
              <p>暂无市民评价</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 text-sm font-bold">
                          {review.citizenName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.citizenName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={review.rating} size={14} />
                          <span className="text-xs text-gray-400">{review.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.content}</p>
                </div>
              ))}

              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full flex items-center justify-center gap-1 py-2.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {showAllReviews ? (
                    <>
                      收起 <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      查看全部 {reviews.length} 条评价 <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>

        <section className="card p-6 animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">关联工单</h2>
            <span className="text-xs text-gray-400">{workOrders.length} 条</span>
          </div>

          {workOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">暂无关联工单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{wo.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {wo.source === 'citizen' ? '市民上报' : '巡检故障'} · {wo.createdAt}
                    </p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0', WO_STATUS_COLORS[wo.status])}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', WO_STATUS_DOTS[wo.status])} />
                    {WO_STATUS_LABELS[wo.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6 animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">巡检任务状态</h2>
          </div>

          {inspectionTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <ListChecks size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">暂无巡检任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspectionTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {task.inspectorName} · 计划日期 {task.planDate}
                    </p>
                  </div>
                  <span className={cn('badge flex-shrink-0', TASK_STATUS_COLORS[task.status])}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6 animate-slide-up stagger-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">问题处理公示</h2>

          {problemReports.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle size={40} className="mx-auto mb-2 opacity-50 text-green-400" />
              <p>暂无问题上报记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problemReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                          report.status === 'resolved'
                            ? 'bg-green-100'
                            : report.status === 'processing'
                            ? 'bg-blue-100'
                            : 'bg-yellow-100'
                        )}
                      >
                        {report.status === 'resolved' ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : report.status === 'processing' ? (
                          <Clock size={18} className="text-blue-600" />
                        ) : (
                          <AlertTriangle size={18} className="text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {problemTypeLabels[report.problemType]}
                          </span>
                          <StatusBadge status={report.status} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          上报人：{report.citizenName} · {report.reportedAt}
                        </p>
                      </div>
                    </div>
                    {report.processingHours !== undefined && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                        处理用时：{formatHours(report.processingHours)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{report.description}</p>

                  {report.resolutionNote && (
                    <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">处理说明</p>
                      <p className="text-sm text-gray-700">{report.resolutionNote}</p>
                    </div>
                  )}

                  {report.satisfaction !== undefined && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">市民满意度：</span>
                      <StarRating value={report.satisfaction} size={14} />
                      <span className="text-sm font-medium text-gray-700">{report.satisfaction}.0</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
