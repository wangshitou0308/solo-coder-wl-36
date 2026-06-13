import { useState, useMemo } from 'react';
import {
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  AlertTriangle,
  FileText,
  Upload,
  MapPin,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StarRating, ScoreBadge, StatusBadge } from '@/components/ui';
import { calculateTotalScore } from '@/utils/score';
import { cn } from '@/lib/utils';
import type { Toilet, Inspection, FaultReport } from '@/types';

type FaultType = 'plumbing' | 'electrical' | 'hardware' | 'cleaning' | 'other';

interface FaultFormItem {
  type: FaultType;
  description: string;
  photoName: string;
}

const faultTypeLabels: Record<FaultType, string> = {
  plumbing: '管道',
  electrical: '电器',
  hardware: '五金',
  cleaning: '清洁',
  other: '其他',
};

const ratingDimensions = [
  { key: 'groundCleanliness', label: '地面洁净度', description: '地面是否干净无污渍、无积水' },
  { key: 'toiletCleanliness', label: '便器洁净度', description: '便器内壁是否清洁、无黄垢' },
  { key: 'odorLevel', label: '异味程度', description: '1=异味重，5=无异味' },
  { key: 'suppliesAdequacy', label: '耗材充足度', description: '厕纸、洗手液、擦手纸等是否充足' },
  { key: 'facilityIntegrity', label: '设施完好度', description: '门锁、冲水、照明等设施是否完好' },
] as const;

type RatingKey = (typeof ratingDimensions)[number]['key'];

export default function InspectionPage() {
  const toilets = useAppStore((s) => s.toilets);
  const addInspection = useAppStore((s) => s.addInspection);
  const getInspectionsByToiletId = useAppStore((s) => s.getInspectionsByToiletId);
  const addFaultReport = useAppStore((s) => s.addFaultReport);

  const [selectedToiletId, setSelectedToiletId] = useState<string | null>(null);
  const [expandedInspectionId, setExpandedInspectionId] = useState<string | null>(null);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    groundCleanliness: 4,
    toiletCleanliness: 4,
    odorLevel: 4,
    suppliesAdequacy: 4,
    facilityIntegrity: 4,
  });
  const [remark, setRemark] = useState('');
  const [faults, setFaults] = useState<FaultFormItem[]>([]);

  const selectedToilet = toilets.find((t) => t.id === selectedToiletId) || null;
  const toiletInspections = selectedToiletId
    ? getInspectionsByToiletId(selectedToiletId)
    : [];

  const totalScore = useMemo(
    () =>
      calculateTotalScore(
        ratings.groundCleanliness,
        ratings.toiletCleanliness,
        ratings.odorLevel,
        ratings.suppliesAdequacy,
        ratings.facilityIntegrity
      ),
    [ratings]
  );

  const handleSelectToilet = (toilet: Toilet) => {
    setSelectedToiletId(toilet.id);
    setRatings({
      groundCleanliness: 4,
      toiletCleanliness: 4,
      odorLevel: 4,
      suppliesAdequacy: 4,
      facilityIntegrity: 4,
    });
    setRemark('');
    setFaults([]);
    setExpandedInspectionId(null);
  };

  const handleRatingChange = (key: RatingKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddFault = () => {
    setFaults((prev) => [
      ...prev,
      { type: 'plumbing', description: '', photoName: '' },
    ]);
  };

  const handleRemoveFault = (index: number) => {
    setFaults((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFaultChange = (index: number, field: keyof FaultFormItem, value: string) => {
    setFaults((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFaultChange(index, 'photoName', file.name);
    }
  };

  const handleSubmit = () => {
    if (!selectedToilet) return;

    const today = new Date().toISOString().slice(0, 10);
    const faultReports: FaultReport[] = faults.map((f) => ({
      id: '',
      description: `【${faultTypeLabels[f.type]}】${f.description}${f.photoName ? `（照片：${f.photoName}）` : ''}`,
      reportedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending',
    }));

    const inspection: Omit<Inspection, 'id'> = {
      toiletId: selectedToilet.id,
      inspectorId: 'INS01',
      inspectorName: '张伟',
      date: today,
      groundCleanliness: ratings.groundCleanliness,
      toiletCleanliness: ratings.toiletCleanliness,
      odorLevel: ratings.odorLevel,
      suppliesAdequacy: ratings.suppliesAdequacy,
      facilityIntegrity: ratings.facilityIntegrity,
      totalScore,
      remark: remark || undefined,
      faultReports: [],
    };

    addInspection(inspection);

    setTimeout(() => {
      const inspections = getInspectionsByToiletId(selectedToilet.id);
      const newInspection = inspections[0];
      if (newInspection) {
        faultReports.forEach((fault) => {
          addFaultReport(selectedToilet.id, newInspection.id, fault);
        });
      }
    }, 10);

    setRatings({
      groundCleanliness: 4,
      toiletCleanliness: 4,
      odorLevel: 4,
      suppliesAdequacy: 4,
      facilityIntegrity: 4,
    });
    setRemark('');
    setFaults([]);
  };

  const getLastScore = (toiletId: string): number | null => {
    const inspections = getInspectionsByToiletId(toiletId);
    return inspections.length > 0 ? inspections[0].totalScore : null;
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">巡检评分</h1>
          <p className="text-sm text-gray-500 mt-1">对公厕进行巡检评分并记录故障</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="card overflow-hidden flex flex-col max-h-[calc(100vh-160px)]">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardList size={18} />
                <span className="font-medium">公厕列表</span>
                <span className="ml-auto text-xs text-gray-400">
                  共 {toilets.length} 个
                </span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {toilets.map((toilet) => {
                const lastScore = getLastScore(toilet.id);
                const isSelected = selectedToiletId === toilet.id;
                return (
                  <button
                    key={toilet.id}
                    onClick={() => handleSelectToilet(toilet)}
                    className={cn(
                      'w-full px-4 py-3 text-left border-b border-gray-100 transition-colors',
                      isSelected
                        ? 'bg-primary-50 border-l-4 border-l-primary-500'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium text-sm truncate',
                            isSelected ? 'text-primary-700' : 'text-gray-900'
                          )}
                        >
                          {toilet.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {toilet.district}
                          </span>
                        </div>
                      </div>
                      {lastScore !== null ? (
                        <ScoreBadge score={lastScore} size="sm" />
                      ) : (
                        <span className="text-xs text-gray-400 px-2 py-1">暂无评分</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {selectedToilet ? (
              <>
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedToilet.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="tag bg-primary-50 text-primary-700">
                          <MapPin size={12} />
                          {selectedToilet.district}
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedToilet.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          编号：{selectedToilet.code}
                        </span>
                        <span className="text-xs text-gray-500">
                          厕位数：{selectedToilet.seatCount}
                        </span>
                        <span className="text-xs text-gray-500">
                          开放时间：{selectedToilet.openTime}
                        </span>
                      </div>
                    </div>
                    <ScoreBadge score={selectedToilet.averageInspectionScore} size="md" />
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <ClipboardList size={18} className="text-primary-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">巡检评分</h3>
                  </div>

                  <div className="space-y-5">
                    {ratingDimensions.map((dim) => (
                      <div
                        key={dim.key}
                        className="flex items-center gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {dim.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {dim.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating
                            value={ratings[dim.key]}
                            onChange={(v) => handleRatingChange(dim.key, v)}
                            size={24}
                          />
                          <span className="text-lg font-bold text-gray-700 w-8 text-right">
                            {ratings[dim.key]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-teal-50 rounded-xl border border-primary-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">综合得分</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          5项评分取平均值
                        </p>
                      </div>
                      <ScoreBadge score={totalScore} size="lg" />
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">巡检备注</h3>
                  </div>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="填写巡检中的其他情况和建议..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-orange-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">故障报修</h3>
                      <span className="text-xs text-gray-400">
                        {faults.length > 0 ? `${faults.length} 条` : ''}
                      </span>
                    </div>
                    <button onClick={handleAddFault} className="btn-outline text-sm">
                      <Plus size={16} />
                      添加故障
                    </button>
                  </div>

                  {faults.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      暂无故障记录，点击上方按钮添加
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {faults.map((fault, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="badge bg-orange-100 text-orange-700">
                              故障 #{index + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveFault(index)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="label">故障类型</label>
                              <select
                                value={fault.type}
                                onChange={(e) =>
                                  handleFaultChange(index, 'type', e.target.value)
                                }
                                className="input"
                              >
                                {Object.entries(faultTypeLabels).map(([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="label">照片上传</label>
                              <label className="input flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                                <Upload size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-600 truncate flex-1">
                                  {fault.photoName || '选择照片文件...'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(index, e)}
                                />
                              </label>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="label">故障描述</label>
                              <input
                                type="text"
                                value={fault.description}
                                onChange={(e) =>
                                  handleFaultChange(index, 'description', e.target.value)
                                }
                                className="input"
                                placeholder="描述故障的具体情况..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSubmit} className="btn-primary text-base px-8 py-2.5">
                    <Save size={18} />
                    提交巡检
                  </button>
                </div>

                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <h3 className="text-base font-semibold text-gray-900">巡检历史</h3>
                      <span className="text-xs text-gray-400">
                        共 {toiletInspections.length} 条记录
                      </span>
                    </div>
                  </div>

                  {toiletInspections.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                      暂无巡检记录
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              日期
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              地面
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              便器
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              异味
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              耗材
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              设施
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              综合
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              故障
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {toiletInspections.map((inspection) => {
                            const isExpanded = expandedInspectionId === inspection.id;
                            return (
                              <>
                                <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4 text-gray-900 font-medium">
                                    {inspection.date}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-700">
                                    {inspection.groundCleanliness}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-700">
                                    {inspection.toiletCleanliness}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-700">
                                    {inspection.odorLevel}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-700">
                                    {inspection.suppliesAdequacy}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-700">
                                    {inspection.facilityIntegrity}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex justify-center">
                                      <ScoreBadge score={inspection.totalScore} size="sm" />
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {inspection.faultReports.length > 0 ? (
                                      <span className="badge bg-orange-100 text-orange-700">
                                        {inspection.faultReports.length} 条
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-end">
                                      <button
                                        onClick={() =>
                                          setExpandedInspectionId(
                                            isExpanded ? null : inspection.id
                                          )
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                      >
                                        <Eye size={14} />
                                        {isExpanded ? (
                                          <>
                                            收起 <ChevronUp size={14} />
                                          </>
                                        ) : (
                                          <>
                                            详情 <ChevronDown size={14} />
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-gray-50">
                                    <td colSpan={9} className="px-4 py-4">
                                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                                        <div>
                                          <p className="text-xs text-gray-500 mb-2 font-medium">
                                            评分明细
                                          </p>
                                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                            {ratingDimensions.map((dim) => (
                                              <div
                                                key={dim.key}
                                                className="p-3 bg-gray-50 rounded-lg text-center"
                                              >
                                                <p className="text-xs text-gray-500 mb-1">
                                                  {dim.label}
                                                </p>
                                                <div className="flex justify-center mb-1">
                                                  <StarRating
                                                    value={inspection[dim.key]}
                                                    readonly
                                                    size={14}
                                                  />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">
                                                  {inspection[dim.key]}.0
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {inspection.remark && (
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium">
                                              巡检备注
                                            </p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                              {inspection.remark}
                                            </p>
                                          </div>
                                        )}

                                        {inspection.faultReports.length > 0 && (
                                          <div>
                                            <p className="text-xs text-gray-500 mb-2 font-medium">
                                              故障列表（{inspection.faultReports.length} 条）
                                            </p>
                                            <div className="space-y-2">
                                              {inspection.faultReports.map((fault) => (
                                                <div
                                                  key={fault.id}
                                                  className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex items-start justify-between gap-3"
                                                >
                                                  <div className="flex items-start gap-2 flex-1">
                                                    <AlertTriangle
                                                      size={16}
                                                      className="text-orange-500 mt-0.5 flex-shrink-0"
                                                    />
                                                    <div>
                                                      <p className="text-sm text-gray-800">
                                                        {fault.description}
                                                      </p>
                                                      <p className="text-xs text-gray-400 mt-0.5">
                                                        上报时间：{fault.reportedAt}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <StatusBadge status={fault.status} />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                          巡检员：{inspection.inspectorName}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">请从左侧列表选择一个公厕开始巡检</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
