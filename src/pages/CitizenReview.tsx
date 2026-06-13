import { useState, useMemo } from 'react';
import { Plus, Filter, MessageSquare, Star, Search, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating, StatusBadge } from '@/components/ui';
import { citizenReviews, problemReports } from '@/data/reviews';
import { toilets } from '@/data/toilets';
import type { CitizenReview, ProblemReport, ProblemType, ProblemStatus } from '@/types';

type TabKey = 'reviews' | 'reports' | 'satisfaction';

const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  cleanliness: '卫生脏乱',
  odor: '异味问题',
  supply_shortage: '耗材短缺',
  facility_damage: '设施故障',
  other: '其他',
};

const STATUS_FILTERS: { value: ProblemStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

export default function CitizenReview() {
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');

  const [reviewToiletFilter, setReviewToiletFilter] = useState<string>('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [reportStatusFilter, setReportStatusFilter] = useState<ProblemStatus | 'all'>('all');
  const [reportToiletFilter, setReportToiletFilter] = useState<string>('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [satisfactionRatings, setSatisfactionRatings] = useState<Record<string, number>>({});
  const [satisfactionComments, setSatisfactionComments] = useState<Record<string, string>>({});

  const [reviews, setReviews] = useState<CitizenReview[]>(citizenReviews);
  const [reports, setReports] = useState<ProblemReport[]>(problemReports);

  const [newReview, setNewReview] = useState({
    toiletId: '',
    rating: 5,
    content: '',
  });

  const [newReport, setNewReport] = useState({
    toiletId: '',
    problemType: 'cleanliness' as ProblemType,
    description: '',
  });

  const getToiletName = (toiletId: string) => {
    return toilets.find((t) => t.id === toiletId)?.name || '未知公厕';
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (reviewToiletFilter && r.toiletId !== reviewToiletFilter) return false;
      if (reviewSearch) {
        const search = reviewSearch.toLowerCase();
        if (
          !r.content.toLowerCase().includes(search) &&
          !r.citizenName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reviews, reviewToiletFilter, reviewSearch]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportStatusFilter !== 'all' && r.status !== reportStatusFilter) return false;
      if (reportToiletFilter && r.toiletId !== reportToiletFilter) return false;
      return true;
    }).sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }, [reports, reportStatusFilter, reportToiletFilter]);

  const satisfactionReports = useMemo(() => {
    return reports.filter((r) => r.status === 'resolved' && !r.satisfaction);
  }, [reports]);

  const handleSubmitReview = () => {
    if (!newReview.toiletId || !newReview.content.trim()) return;
    const review: CitizenReview = {
      id: `CR${Date.now()}`,
      toiletId: newReview.toiletId,
      citizenName: '当前用户',
      rating: newReview.rating as 1 | 2 | 3 | 4 | 5,
      content: newReview.content,
      photoUrls: [],
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
    };
    setReviews([review, ...reviews]);
    setNewReview({ toiletId: '', rating: 5, content: '' });
    setShowReviewModal(false);
  };

  const handleSubmitReport = () => {
    if (!newReport.toiletId || !newReport.description.trim()) return;
    const report: ProblemReport = {
      id: `PR${Date.now()}`,
      toiletId: newReport.toiletId,
      citizenName: '当前用户',
      problemType: newReport.problemType,
      description: newReport.description,
      photoUrls: [],
      status: 'pending',
      reportedAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
      assignedTo: '待分配',
    };
    setReports([report, ...reports]);
    setNewReport({ toiletId: '', problemType: 'cleanliness', description: '' });
    setShowReportModal(false);
  };

  const handleSubmitSatisfaction = (reportId: string) => {
    const rating = satisfactionRatings[reportId];
    if (!rating) return;
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, satisfaction: rating as 1 | 2 | 3 | 4 | 5 }
          : r
      )
    );
    setSatisfactionRatings((prev) => {
      const next = { ...prev };
      delete next[reportId];
      return next;
    });
    setSatisfactionComments((prev) => {
      const next = { ...prev };
      delete next[reportId];
      return next;
    });
  };

  const tabs: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
    { key: 'reviews', label: '市民评价', icon: MessageSquare },
    { key: 'reports', label: '问题上报', icon: Filter },
    { key: 'satisfaction', label: '满意度评价', icon: Star },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">市民评价与问题上报</h1>
        <p className="text-sm text-gray-500 mt-1">收集市民反馈，提升公厕服务质量</p>
      </div>

      <div className="card mb-6">
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === key
                  ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === 'satisfaction' && satisfactionReports.length > 0 && (
                <span className="badge bg-red-500 text-white">{satisfactionReports.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'reviews' && (
        <div>
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={reviewToiletFilter}
                  onChange={(e) => setReviewToiletFilter(e.target.value)}
                  className="input w-56"
                >
                  <option value="">全部公厕</option>
                  {toilets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索评价内容或市民姓名..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <div className="flex-1" />
              <button onClick={() => setShowReviewModal(true)} className="btn-primary gap-1.5">
                <Plus className="w-4 h-4" />
                写评价
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无评价记录</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{getToiletName(review.toiletId)}</h3>
                        <span className="tag bg-gray-100 text-gray-600">{review.citizenName}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <StarRating value={review.rating} readonly size={16} />
                        <span className="text-sm text-gray-400">{review.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                      {review.photoUrls.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.photoUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
                            >
                              照片{idx + 1}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">状态：</span>
                <div className="flex gap-1">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setReportStatusFilter(f.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        reportStatusFilter === f.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={reportToiletFilter}
                  onChange={(e) => setReportToiletFilter(e.target.value)}
                  className="input w-56"
                >
                  <option value="">全部公厕</option>
                  {toilets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
              <button onClick={() => setShowReportModal(true)} className="btn-primary gap-1.5">
                <Plus className="w-4 h-4" />
                上报问题
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无问题上报记录</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isExpanded = expandedReportId === report.id;
                return (
                  <div key={report.id} className="card overflow-hidden">
                    <button
                      onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                      className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{getToiletName(report.toiletId)}</h3>
                            <span className="tag bg-orange-50 text-orange-700">
                              {PROBLEM_TYPE_LABELS[report.problemType]}
                            </span>
                            <StatusBadge status={report.status} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>上报时间：{report.reportedAt}</span>
                            {report.processingHours !== undefined && (
                              <span>处理用时：{report.processingHours}小时</span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">上报人</p>
                            <p className="text-sm font-medium text-gray-900">{report.citizenName}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">处理说明</p>
                            <p className="text-sm font-medium text-gray-900">
                              {report.resolutionNote || '暂无'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">处理人</p>
                            <p className="text-sm font-medium text-gray-900">{report.assignedTo}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'satisfaction' && (
        <div>
          <div className="space-y-3">
            {satisfactionReports.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无待评价的问题</p>
              </div>
            ) : (
              satisfactionReports.map((report) => (
                <div key={report.id} className="card p-5">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{getToiletName(report.toiletId)}</h3>
                      <span className="tag bg-orange-50 text-orange-700">
                        {PROBLEM_TYPE_LABELS[report.problemType]}
                      </span>
                      <StatusBadge status="resolved" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">问题描述</p>
                      <p className="text-sm text-gray-700">{report.description}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">处理说明</p>
                      <p className="text-sm text-gray-700">{report.resolutionNote || '已处理完成'}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">请为本次处理评分：</p>
                    <div className="flex items-center gap-4 mb-4">
                      <StarRating
                        value={satisfactionRatings[report.id] || 0}
                        onChange={(val) =>
                          setSatisfactionRatings((prev) => ({ ...prev, [report.id]: val }))
                        }
                        size={28}
                      />
                      {satisfactionRatings[report.id] && (
                        <span className="text-sm text-gray-500">
                          {satisfactionRatings[report.id]} 星
                        </span>
                      )}
                    </div>
                    <textarea
                      placeholder="补充评价（可选）..."
                      value={satisfactionComments[report.id] || ''}
                      onChange={(e) =>
                        setSatisfactionComments((prev) => ({ ...prev, [report.id]: e.target.value }))
                      }
                      className="input mb-4 min-h-[80px] resize-none"
                    />
                    <button
                      onClick={() => handleSubmitSatisfaction(report.id)}
                      disabled={!satisfactionRatings[report.id]}
                      className={cn(
                        'btn-primary gap-1.5',
                        !satisfactionRatings[report.id] && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Star className="w-4 h-4" />
                      提交评价
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">写评价</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">选择公厕</label>
                <select
                  value={newReview.toiletId}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, toiletId: e.target.value }))}
                  className="input"
                >
                  <option value="">请选择公厕</option>
                  {toilets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">星级评分</label>
                <div className="flex items-center gap-3">
                  <StarRating value={newReview.rating} onChange={(v) => setNewReview((p) => ({ ...p, rating: v }))} size={28} />
                  <span className="text-sm text-gray-500">{newReview.rating} 星</span>
                </div>
              </div>
              <div>
                <label className="label">评价内容</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="请输入您的评价..."
                  className="input min-h-[100px] resize-none"
                />
              </div>
              <div>
                <label className="label">照片上传</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击上传照片（模拟）</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowReviewModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!newReview.toiletId || !newReview.content.trim()}
                className={cn(
                  'btn-primary',
                  (!newReview.toiletId || !newReview.content.trim()) && 'opacity-50 cursor-not-allowed'
                )}
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">上报问题</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">选择公厕</label>
                <select
                  value={newReport.toiletId}
                  onChange={(e) => setNewReport((prev) => ({ ...prev, toiletId: e.target.value }))}
                  className="input"
                >
                  <option value="">请选择公厕</option>
                  {toilets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">问题类型</label>
                <select
                  value={newReport.problemType}
                  onChange={(e) => setNewReport((prev) => ({ ...prev, problemType: e.target.value as ProblemType }))}
                  className="input"
                >
                  {Object.entries(PROBLEM_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">问题描述</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="请详细描述问题..."
                  className="input min-h-[100px] resize-none"
                />
              </div>
              <div>
                <label className="label">照片上传</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击上传照片（模拟）</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowReportModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!newReport.toiletId || !newReport.description.trim()}
                className={cn(
                  'btn-primary',
                  (!newReport.toiletId || !newReport.description.trim()) && 'opacity-50 cursor-not-allowed'
                )}
              >
                提交上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
