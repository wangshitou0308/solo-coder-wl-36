import { useState, useMemo } from 'react';
import { Plus, Package, TrendingUp, AlertCircle, X, Upload, Filter, MapPin } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { DataCard } from '@/components/ui';
import { supplyRecords } from '@/data/supplies';
import { toilets } from '@/data/toilets';
import type { SupplyRecord, SupplyType } from '@/types';
import { daysBetween, formatDate } from '@/utils/date';

type TabKey = 'records' | 'stats' | 'alerts';

const SUPPLY_TYPE_LABELS: Record<SupplyType, string> = {
  toilet_paper: '厕纸',
  hand_sanitizer: '免洗洗手液',
  soap: '洗手液',
  trash_bag: '垃圾袋',
};

const SUPPLY_TYPE_COLORS: Record<SupplyType, string> = {
  toilet_paper: '#3B82F6',
  hand_sanitizer: '#10B981',
  soap: '#8B5CF6',
  trash_bag: '#F59E0B',
};

const TODAY = new Date('2026-06-12');

export default function Supplies() {
  const [selectedToiletId, setSelectedToiletId] = useState<string>('T001');
  const [activeTab, setActiveTab] = useState<TabKey>('records');
  const [showAddModal, setShowAddModal] = useState(false);
  const [allRecords, setAllRecords] = useState<SupplyRecord[]>(supplyRecords);

  const [newRecord, setNewRecord] = useState({
    supplyType: 'toilet_paper' as SupplyType,
    supplyName: '卷筒纸',
    quantity: 10,
    unit: '卷',
    unitPrice: 2.5,
    restockedAt: formatDate(TODAY),
  });

  const getToiletName = (toiletId: string) => {
    return toilets.find((t) => t.id === toiletId)?.name || '未知公厕';
  };

  const stats = useMemo(() => {
    const currentMonth = '2026-06';
    const monthRecords = allRecords.filter((r) => r.restockedAt.startsWith(currentMonth));
    const totalCost = monthRecords.reduce((sum, r) => sum + r.totalCost, 0);
    const supplyCount = monthRecords.length;

    const alertCount = allRecords.filter((r) => {
      const days = daysBetween(TODAY, r.nextEstimatedRestock);
      return days >= 0 && days <= 7;
    }).length;

    return { totalCost, supplyCount, alertCount };
  }, [allRecords]);

  const selectedToiletRecords = useMemo(() => {
    return allRecords
      .filter((r) => r.toiletId === selectedToiletId)
      .sort((a, b) => b.restockedAt.localeCompare(a.restockedAt));
  }, [allRecords, selectedToiletId]);

  const isUrgent = (nextDate: string) => {
    const days = daysBetween(TODAY, nextDate);
    return days >= 0 && days <= 7;
  };

  const monthlyStats = useMemo(() => {
    const months: { month: string; cost: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(TODAY);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${d.getMonth() + 1}月`;
      const cost = allRecords
        .filter((r) => r.restockedAt.startsWith(monthKey))
        .reduce((sum, r) => sum + r.totalCost, 0);
      months.push({ month: monthLabel, cost });
    }
    return months;
  }, [allRecords]);

  const typeStats = useMemo(() => {
    const typeCosts: Record<SupplyType, number> = {
      toilet_paper: 0,
      hand_sanitizer: 0,
      soap: 0,
      trash_bag: 0,
    };
    allRecords.forEach((r) => {
      typeCosts[r.supplyType] += r.totalCost;
    });
    return Object.entries(typeCosts).map(([type, value]) => ({
      name: SUPPLY_TYPE_LABELS[type as SupplyType],
      value,
      color: SUPPLY_TYPE_COLORS[type as SupplyType],
    }));
  }, [allRecords]);

  const allAlerts = useMemo(() => {
    return allRecords
      .filter((r) => {
        const days = daysBetween(TODAY, r.nextEstimatedRestock);
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => a.nextEstimatedRestock.localeCompare(b.nextEstimatedRestock));
  }, [allRecords]);

  const handleAddRecord = () => {
    if (!newRecord.supplyName.trim() || newRecord.quantity <= 0 || newRecord.unitPrice <= 0) return;
    const record: SupplyRecord = {
      id: `SUP${Date.now()}`,
      toiletId: selectedToiletId,
      supplyType: newRecord.supplyType,
      supplyName: newRecord.supplyName,
      quantity: newRecord.quantity,
      unit: newRecord.unit,
      unitPrice: newRecord.unitPrice,
      totalCost: newRecord.quantity * newRecord.unitPrice,
      restockedAt: newRecord.restockedAt,
      nextEstimatedRestock: formatDate(new Date(new Date(newRecord.restockedAt).getTime() + 10 * 24 * 60 * 60 * 1000)),
    };
    setAllRecords([record, ...allRecords]);
    setNewRecord({
      supplyType: 'toilet_paper',
      supplyName: '卷筒纸',
      quantity: 10,
      unit: '卷',
      unitPrice: 2.5,
      restockedAt: formatDate(TODAY),
    });
    setShowAddModal(false);
  };

  const getDefaultSupplyName = (type: SupplyType) => {
    const map: Record<SupplyType, { name: string; unit: string; price: number }> = {
      toilet_paper: { name: '卷筒纸', unit: '卷', price: 2.5 },
      hand_sanitizer: { name: '免洗洗手液', unit: '瓶', price: 18 },
      soap: { name: '洗手液', unit: '瓶', price: 12 },
      trash_bag: { name: '垃圾袋', unit: '个', price: 0.3 },
    };
    return map[type];
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">耗材管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理公厕耗材补给与费用统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DataCard
          title="本月总费用"
          value={`¥${stats.totalCost.toFixed(2)}`}
          subtitle="含所有公厕耗材支出"
          icon={<TrendingUp className="w-5 h-5" />}
          color="accent"
          trend={{ value: 12.5, label: '较上月' }}
        />
        <DataCard
          title="本月补给次数"
          value={stats.supplyCount}
          subtitle="累计补给记录数"
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <DataCard
          title="即将缺货提醒"
          value={stats.alertCount}
          subtitle="7天内需补给的耗材"
          icon={<AlertCircle className="w-5 h-5" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <div className="card p-3 h-fit">
          <div className="px-2 py-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              公厕列表
            </h3>
          </div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {toilets.map((toilet) => {
              const recordCount = allRecords.filter((r) => r.toiletId === toilet.id).length;
              const urgentCount = allRecords.filter(
                (r) => r.toiletId === toilet.id && isUrgent(r.nextEstimatedRestock)
              ).length;
              return (
                <button
                  key={toilet.id}
                  onClick={() => setSelectedToiletId(toilet.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all',
                    selectedToiletId === toilet.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{toilet.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{recordCount} 条记录</div>
                  </div>
                  {urgentCount > 0 && (
                    <span className="badge bg-orange-500 text-white ml-2 shrink-0">
                      {urgentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex border-b-0 gap-1">
              {([
                { key: 'records', label: '耗材记录' },
                { key: 'stats', label: '费用统计' },
                { key: 'alerts', label: '补给提醒' },
              ] as { key: TabKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === key
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {label}
                  {key === 'alerts' && allAlerts.length > 0 && (
                    <span className="ml-1.5 badge bg-orange-500 text-white">{allAlerts.length}</span>
                  )}
                </button>
              ))}
            </div>
            {activeTab === 'records' && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary gap-1.5 text-sm">
                <Plus className="w-4 h-4" />
                新增补给记录
              </button>
            )}
          </div>

          <div className="p-5">
            {activeTab === 'records' && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {getToiletName(selectedToiletId)}
                  </span>
                  <span className="text-xs text-gray-400">共 {selectedToiletRecords.length} 条记录</span>
                </div>
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">日期</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">耗材名称</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">类型</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">数量</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">单位</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">单价</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">总价</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">下次预估补给</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedToiletRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">暂无补给记录</p>
                          </td>
                        </tr>
                      ) : (
                        selectedToiletRecords.map((record) => {
                          const urgent = isUrgent(record.nextEstimatedRestock);
                          return (
                            <tr
                              key={record.id}
                              className={cn(
                                'transition-colors hover:bg-gray-50',
                                urgent && 'bg-orange-50/50'
                              )}
                            >
                              <td className="px-5 py-3.5 text-sm text-gray-900">{record.restockedAt}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{record.supplyName}</td>
                              <td className="px-5 py-3.5">
                                <span
                                  className="tag text-xs"
                                  style={{
                                    backgroundColor: `${SUPPLY_TYPE_COLORS[record.supplyType]}15`,
                                    color: SUPPLY_TYPE_COLORS[record.supplyType],
                                  }}
                                >
                                  {SUPPLY_TYPE_LABELS[record.supplyType]}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-gray-900 text-right">{record.quantity}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-500">{record.unit}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-900 text-right">¥{record.unitPrice.toFixed(2)}</td>
                              <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-right">
                                ¥{record.totalCost.toFixed(2)}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={cn('text-sm', urgent ? 'text-orange-600 font-medium' : 'text-gray-600')}>
                                    {record.nextEstimatedRestock}
                                  </span>
                                  {urgent && (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">最近6个月耗材费用</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `¥${v}`} />
                        <Tooltip
                          formatter={(value: number) => [`¥${value.toFixed(2)}`, '费用']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="cost" fill="#F97316" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">各类耗材费用占比</h3>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={{ stroke: '#d1d5db' }}
                        >
                          {typeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`¥${value.toFixed(2)}`, '费用']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">以下耗材将在7天内需要补给</span>
                </div>
                {allAlerts.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">暂无即将缺货的耗材</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allAlerts.map((record) => {
                      const days = daysBetween(TODAY, record.nextEstimatedRestock);
                      return (
                        <div
                          key={record.id}
                          className="border border-orange-200 bg-orange-50/50 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {getToiletName(record.toiletId)}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="tag text-xs"
                                  style={{
                                    backgroundColor: `${SUPPLY_TYPE_COLORS[record.supplyType]}20`,
                                    color: SUPPLY_TYPE_COLORS[record.supplyType],
                                  }}
                                >
                                  {SUPPLY_TYPE_LABELS[record.supplyType]}
                                </span>
                                <span className="text-sm text-gray-600">{record.supplyName}</span>
                              </div>
                            </div>
                            <span className="badge bg-orange-500 text-white shrink-0">
                              {days === 0 ? '今日' : `${days}天后`}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-gray-400 mb-0.5">上次补给</p>
                              <p className="text-gray-700 font-medium">{record.restockedAt}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-0.5">剩余库存</p>
                              <p className="text-gray-700 font-medium">{record.quantity} {record.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-0.5">预估补给</p>
                              <p className="text-orange-600 font-medium">{record.nextEstimatedRestock}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">新增补给记录</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">当前公厕</p>
                <p className="text-sm font-medium text-gray-900">{getToiletName(selectedToiletId)}</p>
              </div>
              <div>
                <label className="label">耗材类型</label>
                <select
                  value={newRecord.supplyType}
                  onChange={(e) => {
                    const type = e.target.value as SupplyType;
                    const defaults = getDefaultSupplyName(type);
                    setNewRecord((prev) => ({
                      ...prev,
                      supplyType: type,
                      supplyName: defaults.name,
                      unit: defaults.unit,
                      unitPrice: defaults.price,
                    }));
                  }}
                  className="input"
                >
                  {Object.entries(SUPPLY_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">耗材名称</label>
                <input
                  type="text"
                  value={newRecord.supplyName}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, supplyName: e.target.value }))}
                  className="input"
                  placeholder="请输入耗材名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">数量</label>
                  <input
                    type="number"
                    min={1}
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">单位</label>
                  <input
                    type="text"
                    value={newRecord.unit}
                    onChange={(e) => setNewRecord((prev) => ({ ...prev, unit: e.target.value }))}
                    className="input"
                    placeholder="卷/瓶/个"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">单价（元）</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={newRecord.unitPrice}
                    onChange={(e) => setNewRecord((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">总价（元）</label>
                  <div className="input bg-gray-50 text-gray-600">
                    ¥{(newRecord.quantity * newRecord.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">补给日期</label>
                <input
                  type="date"
                  value={newRecord.restockedAt}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, restockedAt: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">凭证上传</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击上传凭证（模拟）</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.supplyName.trim() || newRecord.quantity <= 0 || newRecord.unitPrice <= 0}
                className={cn(
                  'btn-primary',
                  (!newRecord.supplyName.trim() || newRecord.quantity <= 0 || newRecord.unitPrice <= 0) && 'opacity-50 cursor-not-allowed'
                )}
              >
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
