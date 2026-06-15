import { useState } from 'react';
import { X, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { WorkOrder, WorkOrderPriority, WorkOrderSource, WorkOrderStatus } from '@/types';

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

const SOURCE_LABELS: Record<WorkOrderSource, string> = {
  citizen: '市民上报',
  inspection: '巡检故障',
};

const SOURCE_BADGE_CLASSES: Record<WorkOrderSource, string> = {
  citizen: 'bg-blue-50 text-blue-700',
  inspection: 'bg-teal-50 text-teal-700',
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

interface WorkOrderDrawerProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export default function WorkOrderDrawer({ workOrder, onClose }: WorkOrderDrawerProps) {
  const navigate = useNavigate();
  const toilets = useAppStore((s) => s.toilets);
  const updateWorkOrder = useAppStore((s) => s.updateWorkOrder);
  const addWorkOrderTimeline = useAppStore((s) => s.addWorkOrderTimeline);

  const [assignRole, setAssignRole] = useState<'cleaner' | 'repairer'>('cleaner');
  const [assignName, setAssignName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const toilet = toilets.find((t) => t.id === workOrder.toiletId);
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const handleAssign = () => {
    if (!assignName.trim()) return;
    const assignee = `${workOrder.district}${assignRole === 'cleaner' ? '保洁员' : '维修员'}-${assignName.trim()}`;
    updateWorkOrder(workOrder.id, {
      status: 'assigned',
      assignedTo: assignee,
      assignedRole: assignRole,
      updatedAt: now,
    });
    addWorkOrderTimeline(workOrder.id, {
      action: '分派工单',
      operator: '管理员',
      timestamp: now,
      remark: `分派至${assignee}`,
    });
    setAssignName('');
  };

  const handleStartProcessing = () => {
    updateWorkOrder(workOrder.id, {
      status: 'processing',
      updatedAt: now,
    });
    addWorkOrderTimeline(workOrder.id, {
      action: '开始处理',
      operator: workOrder.assignedTo || '处理人',
      timestamp: now,
    });
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    updateWorkOrder(workOrder.id, {
      status: 'reviewing',
      feedback: feedbackText.trim(),
      updatedAt: now,
    });
    addWorkOrderTimeline(workOrder.id, {
      action: '提交处理结果',
      operator: workOrder.assignedTo || '处理人',
      timestamp: now,
      remark: feedbackText.trim(),
    });
    setFeedbackText('');
  };

  const handleConfirmComplete = () => {
    updateWorkOrder(workOrder.id, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    });
    addWorkOrderTimeline(workOrder.id, {
      action: '确认完成',
      operator: '管理员',
      timestamp: now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">工单详情</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{workOrder.title}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('badge', PRIORITY_BADGE_CLASSES[workOrder.priority])}>
                {PRIORITY_LABELS[workOrder.priority]}
              </span>
              <span className={cn('badge', SOURCE_BADGE_CLASSES[workOrder.source])}>
                {SOURCE_LABELS[workOrder.source]}
              </span>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_COLORS[workOrder.status])}>
                <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT_COLORS[workOrder.status])} />
                {STATUS_LABELS[workOrder.status]}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">描述</p>
            <p className="text-sm text-gray-700 leading-relaxed">{workOrder.description}</p>
          </div>

          {toilet && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">关联公厕</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{toilet.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{toilet.district}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/toilet/${toilet.id}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <ExternalLink size={12} />
                    查看公厕
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 font-medium mb-3">工单时间线</p>
            <div className="space-y-0">
              {workOrder.timeline.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0',
                      idx === workOrder.timeline.length - 1 ? 'bg-primary-500' : 'bg-gray-300'
                    )} />
                    {idx < workOrder.timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={10} />
                      <span>{entry.timestamp}</span>
                      <span className="text-gray-300">|</span>
                      <span>{entry.operator}</span>
                    </div>
                    {entry.remark && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">
                        {entry.remark}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 font-medium mb-3">操作</p>

            {workOrder.status === 'unassigned' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">角色</label>
                    <select
                      value={assignRole}
                      onChange={(e) => setAssignRole(e.target.value as 'cleaner' | 'repairer')}
                      className="input"
                    >
                      <option value="cleaner">保洁员</option>
                      <option value="repairer">维修员</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">姓名</label>
                    <input
                      type="text"
                      value={assignName}
                      onChange={(e) => setAssignName(e.target.value)}
                      className="input"
                      placeholder="输入姓名"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAssign}
                  disabled={!assignName.trim()}
                  className={cn(
                    'btn-primary w-full',
                    !assignName.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  分派工单
                </button>
              </div>
            )}

            {workOrder.status === 'assigned' && (
              <button onClick={handleStartProcessing} className="btn-primary w-full">
                开始处理
              </button>
            )}

            {workOrder.status === 'processing' && (
              <div className="space-y-3">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="请输入处理结果..."
                  className="input resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                  className={cn(
                    'btn-primary w-full',
                    !feedbackText.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  提交处理结果
                </button>
              </div>
            )}

            {workOrder.status === 'reviewing' && (
              <button onClick={handleConfirmComplete} className="btn-primary w-full">
                确认完成
              </button>
            )}

            {workOrder.status === 'completed' && workOrder.feedback && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-gray-500 mb-1">处理结果</p>
                <p className="text-sm text-gray-700">{workOrder.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
