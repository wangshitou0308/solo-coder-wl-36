import { useState, useMemo } from 'react';
import { Plus, Calendar, ChevronLeft, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreBadge } from '@/components/ui';
import { schedules, checkinRecords } from '@/data/schedules';
import { toilets } from '@/data/toilets';
import type { Schedule, ShiftType, CheckinRecord } from '@/types';
import { formatDate, addDays } from '@/utils/date';

type ViewMode = 'day' | 'week';

const SHIFT_CONFIG: Record<ShiftType, { label: string; color: string; bg: string; startTime: string; endTime: string }> = {
  morning: { label: '早班', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300', startTime: '06:00', endTime: '14:00' },
  afternoon: { label: '中班', color: 'text-green-700', bg: 'bg-green-100 border-green-300', startTime: '14:00', endTime: '22:00' },
  night: { label: '晚班', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-300', startTime: '22:00', endTime: '06:00' },
  full: { label: '全天', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', startTime: '08:00', endTime: '20:00' },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const CLEANERS = [
  { id: 'CL01', name: '李秀英' },
  { id: 'CL02', name: '王桂芳' },
  { id: 'CL03', name: '张翠花' },
  { id: 'CL04', name: '赵秀兰' },
  { id: 'CL05', name: '刘桂英' },
  { id: 'CL06', name: '孙玉兰' },
  { id: 'CL07', name: '周凤英' },
  { id: 'CL08', name: '吴金梅' },
  { id: 'CL09', name: '郑秀珍' },
  { id: 'CL10', name: '冯玉珍' },
  { id: 'CL11', name: '陈秀华' },
  { id: 'CL12', name: '褚桂兰' },
  { id: 'CL13', name: '卫素英' },
  { id: 'CL14', name: '蒋秀琴' },
];

export default function Schedule() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-11'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const [allSchedules, setAllSchedules] = useState<Schedule[]>(schedules);

  const [newSchedule, setNewSchedule] = useState({
    toiletId: '',
    cleanerId: '',
    date: formatDate(new Date('2026-06-11')),
    shiftType: 'morning' as ShiftType,
  });

  const getToiletName = (toiletId: string) => {
    return toilets.find((t) => t.id === toiletId)?.name || '未知公厕';
  };

  const getCleanerName = (cleanerId: string) => {
    return CLEANERS.find((c) => c.id === cleanerId)?.name || '未知保洁员';
  };

  const getCheckinRecord = (scheduleId: string): CheckinRecord | undefined => {
    return checkinRecords.find((c) => c.scheduleId === scheduleId);
  };

  const daySchedules = useMemo(() => {
    const dateStr = formatDate(currentDate);
    return allSchedules.filter((s) => s.date === dateStr);
  }, [allSchedules, currentDate]);

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  }, [currentDate]);

  const weekSchedules = useMemo(() => {
    const weekDateStrs = weekDates.map((d) => formatDate(d));
    return allSchedules.filter((s) => weekDateStrs.includes(s.date));
  }, [allSchedules, weekDates]);

  const handlePrevDay = () => setCurrentDate((prev) => addDays(prev, -1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date('2026-06-11'));

  const handlePrevWeek = () => setCurrentDate((prev) => addDays(prev, -7));
  const handleNextWeek = () => setCurrentDate((prev) => addDays(prev, 7));

  const handleAddSchedule = () => {
    if (!newSchedule.toiletId || !newSchedule.cleanerId) return;
    const shiftConfig = SHIFT_CONFIG[newSchedule.shiftType];
    const schedule: Schedule = {
      id: `SCH${Date.now()}`,
      toiletId: newSchedule.toiletId,
      cleanerId: newSchedule.cleanerId,
      cleanerName: getCleanerName(newSchedule.cleanerId),
      date: newSchedule.date,
      shiftType: newSchedule.shiftType,
      startTime: shiftConfig.startTime,
      endTime: shiftConfig.endTime,
    };
    setAllSchedules([...allSchedules, schedule]);
    setNewSchedule({ toiletId: '', cleanerId: '', date: formatDate(new Date('2026-06-11')), shiftType: 'morning' });
    setShowAddModal(false);
  };

  const getSchedulePosition = (schedule: Schedule) => {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const startOffset = (startHour - 7) * 60 + startMin;
    let endOffset = (endHour - 7) * 60 + endMin;
    if (endHour <= startHour) {
      endOffset += 24 * 60;
    }

    const totalMinutes = 16 * 60;
    const left = Math.max(0, (startOffset / totalMinutes) * 100);
    const width = Math.min(100 - left, ((endOffset - startOffset) / totalMinutes) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const formatDateDisplay = (date: Date) => {
    return formatDate(date);
  };

  const getWeekDayLabel = (date: Date) => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dayIndex = (date.getDay() + 6) % 7;
    return days[dayIndex];
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">保洁排班管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理公厕保洁人员的排班与考勤</p>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              日视图
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              周视图
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-1">
            <button
              onClick={viewMode === 'day' ? handlePrevDay : handlePrevWeek}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-900 min-w-[180px] text-center">
                {viewMode === 'day'
                  ? formatDateDisplay(currentDate)
                  : `${formatDateDisplay(weekDates[0])} ~ ${formatDateDisplay(weekDates[6])}`}
              </span>
            </div>
            <button
              onClick={viewMode === 'day' ? handleNextDay : handleNextWeek}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button onClick={handleToday} className="btn-outline text-sm">
            今天
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded', config.bg.replace('border-', '').replace('-100', '-300'))} />
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'day' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="w-48 shrink-0 p-3 border-r border-gray-100 bg-gray-50">
                  <span className="text-xs font-medium text-gray-500">公厕 / 时间</span>
                </div>
                <div className="flex-1 flex">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 p-3 text-center border-r border-gray-50 last:border-r-0"
                    >
                      <span className="text-xs font-medium text-gray-500">{hour}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              {toilets.map((toilet) => {
                const toiletSchedules = daySchedules.filter((s) => s.toiletId === toilet.id);
                return (
                  <div key={toilet.id} className="flex border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                    <div className="w-48 shrink-0 p-3 border-r border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 line-clamp-1" title={toilet.name}>
                          {toilet.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-[72px]">
                      <div className="absolute inset-0 flex">
                        {HOURS.map((hour) => (
                          <div key={hour} className="flex-1 border-r border-gray-50 last:border-r-0" />
                        ))}
                      </div>
                      {toiletSchedules.map((schedule) => {
                        const position = getSchedulePosition(schedule);
                        const shiftConfig = SHIFT_CONFIG[schedule.shiftType];
                        return (
                          <button
                            key={schedule.id}
                            onClick={() => setSelectedSchedule(schedule)}
                            style={{ left: position.left, width: position.width }}
                            className={cn(
                              'absolute top-2 bottom-2 rounded-lg border px-2 py-1 text-left overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5',
                              shiftConfig.bg
                            )}
                          >
                            <div className={cn('text-xs font-semibold truncate', shiftConfig.color)}>
                              {schedule.cleanerName}
                            </div>
                            <div className={cn('text-[10px] opacity-75 truncate', shiftConfig.color)}>
                              {schedule.startTime}-{schedule.endTime}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="flex border-b border-gray-100">
                <div className="w-48 shrink-0 p-3 border-r border-gray-100 bg-gray-50">
                  <span className="text-xs font-medium text-gray-500">公厕</span>
                </div>
                {weekDates.map((date) => {
                  const isToday = formatDate(date) === '2026-06-11';
                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'flex-1 p-3 text-center border-r border-gray-50 last:border-r-0',
                        isToday && 'bg-primary-50/50'
                      )}
                    >
                      <div className="text-xs font-medium text-gray-500">{getWeekDayLabel(date)}</div>
                      <div className={cn('text-sm font-semibold mt-0.5', isToday ? 'text-primary-600' : 'text-gray-900')}>
                        {date.getDate()}日
                      </div>
                    </div>
                  );
                })}
              </div>

              {toilets.map((toilet) => (
                <div key={toilet.id} className="flex border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                  <div className="w-48 shrink-0 p-3 border-r border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-900 line-clamp-1" title={toilet.name}>
                        {toilet.name}
                      </span>
                    </div>
                  </div>
                  {weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    const daySchedulesForToilet = weekSchedules.filter(
                      (s) => s.toiletId === toilet.id && s.date === dateStr
                    );
                    return (
                      <div
                        key={date.toISOString()}
                        className="flex-1 p-1.5 border-r border-gray-50 last:border-r-0 min-h-[64px] space-y-1"
                      >
                        {daySchedulesForToilet.map((schedule) => {
                          const shiftConfig = SHIFT_CONFIG[schedule.shiftType];
                          return (
                            <button
                              key={schedule.id}
                              onClick={() => setSelectedSchedule(schedule)}
                              className={cn(
                                'w-full rounded border px-2 py-1 text-left transition-all hover:shadow-md',
                                shiftConfig.bg
                              )}
                            >
                              <div className={cn('text-xs font-semibold truncate', shiftConfig.color)}>
                                {schedule.cleanerName}
                              </div>
                              <div className={cn('text-[10px] opacity-75', shiftConfig.color)}>
                                {shiftConfig.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">排班详情</h2>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">公厕</p>
                  <p className="text-sm font-medium text-gray-900">{getToiletName(selectedSchedule.toiletId)}</p>
                </div>
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold border',
                  SHIFT_CONFIG[selectedSchedule.shiftType].bg,
                  SHIFT_CONFIG[selectedSchedule.shiftType].color
                )}>
                  {SHIFT_CONFIG[selectedSchedule.shiftType].label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">保洁员</p>
                  <p className="text-sm font-medium text-gray-900">{selectedSchedule.cleanerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">日期</p>
                  <p className="text-sm font-medium text-gray-900">{selectedSchedule.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">打卡记录</p>
                {(() => {
                  const checkin = getCheckinRecord(selectedSchedule.id);
                  if (!checkin) {
                    return (
                      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
                        暂无打卡记录
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">到岗时间</p>
                          <p className="text-sm font-medium text-blue-700">{checkin.checkinTime.split(' ')[1]}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">清扫完成时间</p>
                          <p className="text-sm font-medium text-green-700">
                            {checkin.cleanupCompleteTime ? checkin.cleanupCompleteTime.split(' ')[1] : '-'}
                          </p>
                        </div>
                      </div>
                      {checkin.selfInspectionScore !== undefined && (
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <span className="text-sm text-gray-600">自检评分</span>
                          <ScoreBadge score={checkin.selfInspectionScore} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedSchedule(null)} className="btn-outline">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">添加排班</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">选择公厕</label>
                <select
                  value={newSchedule.toiletId}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, toiletId: e.target.value }))}
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
                <label className="label">选择保洁员</label>
                <select
                  value={newSchedule.cleanerId}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, cleanerId: e.target.value }))}
                  className="input"
                >
                  <option value="">请选择保洁员</option>
                  {CLEANERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">日期</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, date: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="label">班次类型</label>
                <select
                  value={newSchedule.shiftType}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, shiftType: e.target.value as ShiftType }))}
                  className="input"
                >
                  {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} ({config.startTime}-{config.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">班次时间（自动填充）</p>
                <p className="text-sm font-medium text-gray-700">
                  {SHIFT_CONFIG[newSchedule.shiftType].startTime} - {SHIFT_CONFIG[newSchedule.shiftType].endTime}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={!newSchedule.toiletId || !newSchedule.cleanerId}
                className={cn(
                  'btn-primary',
                  (!newSchedule.toiletId || !newSchedule.cleanerId) && 'opacity-50 cursor-not-allowed'
                )}
              >
                添加排班
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
