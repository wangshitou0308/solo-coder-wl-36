import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  RotateCcw,
  Bell,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import DataCard from '@/components/ui/DataCard';
import type { InspectionTaskStatus, InspectionFrequency, District } from '@/types';

const TODAY = '2026-06-15';

const INSPECTORS = [
  { id: 'INS01', name: '张伟' },
  { id: 'INS02', name: '李娜' },
  { id: 'INS03', name: '王强' },
  { id: 'INS04', name: '刘芳' },
];

const STATUS_LABELS: Record<InspectionTaskStatus, string> = {
  pending: '待巡检',
  completed: '已完成',
  overdue: '逾期',
};

const STATUS_COLORS: Record<InspectionTaskStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
};

const FREQUENCY_LABELS: Record<InspectionFrequency, string> = {
  once: '单次',
  daily: '每日',
  weekly: '每周',
  biweekly: '双周',
  monthly: '每月',
};

const FREQUENCY_BADGE_CLASSES: Record<InspectionFrequency, string> = {
  once: 'bg-gray-100 text-gray-600',
  daily: 'bg-blue-50 text-blue-700',
  weekly: 'bg-purple-50 text-purple-700',
  biweekly: 'bg-cyan-50 text-cyan-700',
  monthly: 'bg-teal-50 text-teal-700',
};

const STATUS_TABS: { value: InspectionTaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待巡检' },
  { value: 'completed', label: '已完成' },
  { value: 'overdue', label: '逾期' },
];

const DISTRICTS: District[] = ['东城区', '西城区', '朝阳区', '海淀区'];

function getOverdueDays(planDate: string): number {
  const plan = new Date(planDate);
  const today = new Date(TODAY);
  const diff = today.getTime() - plan.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function InspectionTasks() {
  const navigate = useNavigate();
  const inspectionTasks = useAppStore((s) => s.inspectionTasks);
  const toilets = useAppStore((s) => s.toilets);
  const addInspectionTask = useAppStore((s) => s.addInspectionTask);
  const scanOverdueTasks = useAppStore((s) => s.scanOverdueTasks);

  const [statusFilter, setStatusFilter] = useState<InspectionTaskStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formToiletIds, setFormToiletIds] = useState<string[]>([]);
  const [formInspectorId, setFormInspectorId] = useState('INS01');
  const [formPlanDate, setFormPlanDate] = useState(TODAY);
  const [formFrequency, setFormFrequency] = useState<InspectionFrequency>('once');
  const [showOverdueAlert, setShowOverdueAlert] = useState(false);
  const [newOverdueCount, setNewOverdueCount] = useState(0);

  useEffect(() => {
    const count = scanOverdueTasks(TODAY);
    if (count > 0) {
      setNewOverdueCount(count);
      setShowOverdueAlert(true);
      const timer = setTimeout(() => setShowOverdueAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [scanOverdueTasks]);

  const todayPending = useMemo(
    () => inspectionTasks.filter((t) => t.status === 'pending' && t.planDate === TODAY).length,
    [inspectionTasks]
  );

  const todayCompleted = useMemo(
    () => inspectionTasks.filter((t) => t.status === 'completed' && t.planDate === TODAY).length,
    [inspectionTasks]
  );

  const overdueCount = useMemo(
    () => inspectionTasks.filter((t) => t.status === 'overdue').length,
    [inspectionTasks]
  );

  const todayCoverage = useMemo(() => {
    const todayTotal = inspectionTasks.filter(
      (t) => (t.status === 'pending' || t.status === 'completed' || t.status === 'overdue') && t.planDate === TODAY
    ).length;
    if (todayTotal === 0) return 0;
    return Math.round((todayCompleted / todayTotal) * 100);
  }, [inspectionTasks, todayCompleted]);

  const weekCoverage = useMemo(() => {
    const weekStart = new Date(2026, 5, 15);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const weekTasks = inspectionTasks.filter(
      (t) => t.planDate >= weekStartStr && t.planDate <= weekEndStr
    );
    const weekCompleted = weekTasks.filter((t) => t.status === 'completed').length;
    if (weekTasks.length === 0) return 0;
    return Math.round((weekCompleted / weekTasks.length) * 100);
  }, [inspectionTasks]);

  const filteredTasks = useMemo(() => {
    return inspectionTasks
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .sort((a, b) => {
        const statusOrder: Record<InspectionTaskStatus, number> = {
          overdue: 0,
          pending: 1,
          completed: 2,
        };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.planDate.localeCompare(a.planDate);
      });
  }, [inspectionTasks, statusFilter]);

  const toiletsByDistrict = useMemo(() => {
    const grouped: Record<string, typeof toilets> = {};
    DISTRICTS.forEach((d) => {
      grouped[d] = toilets.filter((t) => t.district === d);
    });
    return grouped;
  }, [toilets]);

  const handleToggleToilet = (toiletId: string) => {
    setFormToiletIds((prev) =>
      prev.includes(toiletId) ? prev.filter((id) => id !== toiletId) : [...prev, toiletId]
    );
  };

  const handleToggleDistrict = (district: District) => {
    const districtIds = toiletsByDistrict[district].map((t) => t.id);
    const allSelected = districtIds.every((id) => formToiletIds.includes(id));
    if (allSelected) {
      setFormToiletIds((prev) => prev.filter((id) => !districtIds.includes(id)));
    } else {
      setFormToiletIds((prev) => [...new Set([...prev, ...districtIds])]);
    }
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || formToiletIds.length === 0) return;
    const inspector = INSPECTORS.find((i) => i.id === formInspectorId);
    addInspectionTask({
      title: formTitle.trim(),
      toiletIds: formToiletIds,
      inspectorId: formInspectorId,
      inspectorName: inspector?.name || '',
      planDate: formPlanDate,
      frequency: formFrequency,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    setShowModal(false);
    setFormTitle('');
    setFormToiletIds([]);
    setFormInspectorId('INS01');
    setFormPlanDate(TODAY);
    setFormFrequency('once');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">巡检任务</h1>
        <p className="text-sm text-gray-500 mt-1">任务计划驱动的巡检管理</p>
      </div>

      {showOverdueAlert && newOverdueCount > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">逾期任务提醒</p>
              <p className="text-xs text-red-600 mt-0.5">
                检测到 <span className="font-bold">{newOverdueCount}</span> 个新的逾期巡检任务，请及时处理
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOverdueAlert(false)}
            className="p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <DataCard
          title="今日待巡检"
          value={todayPending}
          subtitle={`今日覆盖率 ${todayCoverage}%`}
          icon={<Clock className="w-5 h-5" />}
          color="accent"
        />
        <DataCard
          title="今日已完成"
          value={todayCompleted}
          subtitle={`本周覆盖率 ${weekCoverage}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <DataCard
          title="逾期任务"
          value={overdueCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="primary"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                statusFilter === tab.value
                  ? tab.value === 'all'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : STATUS_COLORS[tab.value as InspectionTaskStatus] + ' border-current/20'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              )}
            >
              {tab.label}
              <span className="ml-0.5 font-bold">
                {tab.value === 'all'
                  ? inspectionTasks.length
                  : inspectionTasks.filter((t) => t.status === tab.value).length}
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          创建任务
        </button>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card py-16 text-center text-gray-400">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无巡检任务</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'card p-4 transition-all',
                task.status === 'overdue' && 'border-red-300 border-2 shadow-lg bg-red-50/30'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className={cn(
                      'text-base font-semibold truncate',
                      task.status === 'overdue' ? 'text-red-800' : 'text-gray-900'
                    )}>
                      {task.title}
                    </h3>
                    {task.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-500 animate-pulse-soft">
                        <Bell className="w-3 h-3" />
                        紧急
                      </span>
                    )}
                    <span className={cn('badge', STATUS_COLORS[task.status])}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className={cn('tag', FREQUENCY_BADGE_CLASSES[task.frequency])}>
                      {FREQUENCY_LABELS[task.frequency]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {task.inspectorName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.planDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {task.toiletIds.length}个公厕
                    </span>
                    {task.status === 'completed' && task.completedAt && (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        完成于 {task.completedAt}
                      </span>
                    )}
                    {task.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        逾期{getOverdueDays(task.planDate)}天
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => navigate('/inspection')}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      开始巡检
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button className="btn-outline text-xs px-3 py-1.5">
                      <ChevronRight className="w-3.5 h-3.5 mr-1" />
                      查看结果
                    </button>
                  )}
                  {task.status === 'overdue' && (
                    <button
                      onClick={() => navigate('/inspection')}
                      className="btn-accent text-xs px-3 py-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      立即执行
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">创建巡检任务</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="label">任务标题</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input"
                  placeholder="输入巡检任务标题"
                />
              </div>

              <div>
                <label className="label">目标公厕</label>
                <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {DISTRICTS.map((district) => {
                    const districtToilets = toiletsByDistrict[district];
                    if (districtToilets.length === 0) return null;
                    const allSelected = districtToilets.every((t) =>
                      formToiletIds.includes(t.id)
                    );
                    return (
                      <div key={district}>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 mb-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => handleToggleDistrict(district)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                          />
                          {district}
                        </label>
                        <div className="ml-6 space-y-1">
                          {districtToilets.map((toilet) => (
                            <label
                              key={toilet.id}
                              className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formToiletIds.includes(toilet.id)}
                                onChange={() => handleToggleToilet(toilet.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                              />
                              {toilet.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formToiletIds.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">已选择 {formToiletIds.length} 个公厕</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">巡检人员</label>
                  <select
                    value={formInspectorId}
                    onChange={(e) => setFormInspectorId(e.target.value)}
                    className="input"
                  >
                    {INSPECTORS.map((inspector) => (
                      <option key={inspector.id} value={inspector.id}>
                        {inspector.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">计划日期</label>
                  <input
                    type="date"
                    value={formPlanDate}
                    onChange={(e) => setFormPlanDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">巡检频率</label>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as InspectionFrequency)}
                  className="input"
                >
                  {(Object.entries(FREQUENCY_LABELS) as [InspectionFrequency, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formTitle.trim() || formToiletIds.length === 0}
                className={cn(
                  'btn-primary',
                  (!formTitle.trim() || formToiletIds.length === 0) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
