import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Toilet,
  Inspection,
  CitizenReview,
  ProblemReport,
  Schedule,
  CheckinRecord,
  SupplyRecord,
  FaultReport,
  WorkOrder,
  WorkOrderTimeline,
  InspectionTask,
} from '@/types';
import { initialToilets } from '@/data/toilets';
import { initialInspections } from '@/data/inspections';
import { initialCitizenReviews, initialProblemReports } from '@/data/reviews';
import { initialSchedules, initialCheckinRecords } from '@/data/schedules';
import { initialSupplyRecords } from '@/data/supplies';
import { initialWorkOrders } from '@/data/workOrders';
import { initialInspectionTasks } from '@/data/inspectionTasks';
import { generateId } from '@/utils/format';

interface AppState {
  toilets: Toilet[];
  inspections: Inspection[];
  citizenReviews: CitizenReview[];
  problemReports: ProblemReport[];
  schedules: Schedule[];
  checkinRecords: CheckinRecord[];
  supplyRecords: SupplyRecord[];
  workOrders: WorkOrder[];
  inspectionTasks: InspectionTask[];

  addToilet: (toilet: Omit<Toilet, 'id'>) => void;
  updateToilet: (id: string, toilet: Partial<Toilet>) => void;
  deleteToilet: (id: string) => void;
  getToiletById: (id: string) => Toilet | undefined;

  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  getInspectionsByToiletId: (toiletId: string) => Inspection[];

  addCitizenReview: (review: Omit<CitizenReview, 'id' | 'createdAt'>) => void;
  getCitizenReviewsByToiletId: (toiletId: string) => CitizenReview[];

  addProblemReport: (report: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>) => void;
  updateProblemReport: (id: string, report: Partial<ProblemReport>) => void;
  getProblemReportsByToiletId: (toiletId: string) => ProblemReport[];

  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  addCheckinRecord: (record: Omit<CheckinRecord, 'id'>) => void;

  addSupplyRecord: (record: Omit<SupplyRecord, 'id'>) => void;
  getSupplyRecordsByToiletId: (toiletId: string) => SupplyRecord[];

  addFaultReport: (toiletId: string, inspectionId: string, fault: Omit<FaultReport, 'id'>) => void;

  addWorkOrder: (order: Omit<WorkOrder, 'id'>) => void;
  updateWorkOrder: (id: string, order: Partial<WorkOrder>) => void;
  getWorkOrdersByToiletId: (toiletId: string) => WorkOrder[];
  addWorkOrderTimeline: (orderId: string, entry: Omit<WorkOrderTimeline, 'id'>) => void;

  addInspectionTask: (task: Omit<InspectionTask, 'id'>) => void;
  updateInspectionTask: (id: string, task: Partial<InspectionTask>) => void;
  getInspectionTasksByToiletId: (toiletId: string) => InspectionTask[];
  getPendingInspectionTaskByToiletId: (toiletId: string, inspectorId: string, date: string) => InspectionTask | undefined;
  completeInspectionTask: (taskId: string, inspectionId: string) => void;
  scanOverdueTasks: (today: string) => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      toilets: initialToilets,
      inspections: initialInspections,
      citizenReviews: initialCitizenReviews,
      problemReports: initialProblemReports,
      schedules: initialSchedules,
      checkinRecords: initialCheckinRecords,
      supplyRecords: initialSupplyRecords,
      workOrders: initialWorkOrders,
      inspectionTasks: initialInspectionTasks,

      addToilet: (toilet) =>
        set((state) => ({
          toilets: [...state.toilets, { ...toilet, id: generateId() } as Toilet],
        })),

      updateToilet: (id, toilet) =>
        set((state) => ({
          toilets: state.toilets.map((t) => (t.id === id ? { ...t, ...toilet } : t)),
        })),

      deleteToilet: (id) =>
        set((state) => ({
          toilets: state.toilets.filter((t) => t.id !== id),
          inspections: state.inspections.filter((i) => i.toiletId !== id),
          citizenReviews: state.citizenReviews.filter((r) => r.toiletId !== id),
          problemReports: state.problemReports.filter((p) => p.toiletId !== id),
          schedules: state.schedules.filter((s) => s.toiletId !== id),
          checkinRecords: state.checkinRecords.filter((c) => c.toiletId !== id),
          supplyRecords: state.supplyRecords.filter((s) => s.toiletId !== id),
        })),

      getToiletById: (id) => get().toilets.find((t) => t.id === id),

      addInspection: (inspection) =>
        set((state) => {
          const newInspection = { ...inspection, id: generateId() } as Inspection;
          const allInspections = [...state.inspections, newInspection];
          const toiletInspections = allInspections.filter((i) => i.toiletId === inspection.toiletId);
          const avgScore =
            toiletInspections.length > 0
              ? Math.round(
                  (toiletInspections.reduce((sum, i) => sum + i.totalScore, 0) / toiletInspections.length) * 10
                ) / 10
              : 0;
          return {
            inspections: allInspections,
            toilets: state.toilets.map((t) =>
              t.id === inspection.toiletId ? { ...t, averageInspectionScore: avgScore } : t
            ),
          };
        }),

      getInspectionsByToiletId: (toiletId) =>
        get().inspections.filter((i) => i.toiletId === toiletId).sort((a, b) => b.date.localeCompare(a.date)),

      addCitizenReview: (review) =>
        set((state) => {
          const newReview = {
            ...review,
            id: generateId(),
            createdAt: new Date().toISOString(),
          } as CitizenReview;
          const allReviews = [...state.citizenReviews, newReview];
          const toiletReviews = allReviews.filter((r) => r.toiletId === review.toiletId);
          const avgScore =
            toiletReviews.length > 0
              ? Math.round(
                  (toiletReviews.reduce((sum, r) => sum + r.rating, 0) / toiletReviews.length) * 10
                ) / 10
              : 0;
          return {
            citizenReviews: allReviews,
            toilets: state.toilets.map((t) =>
              t.id === review.toiletId ? { ...t, averageCitizenScore: avgScore } : t
            ),
          };
        }),

      getCitizenReviewsByToiletId: (toiletId) =>
        get()
          .citizenReviews.filter((r) => r.toiletId === toiletId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      addProblemReport: (report) =>
        set((state) => ({
          problemReports: [
            ...state.problemReports,
            { ...report, id: generateId(), reportedAt: new Date().toISOString(), status: 'pending' as const } as ProblemReport,
          ],
        })),

      updateProblemReport: (id, report) =>
        set((state) => ({
          problemReports: state.problemReports.map((p) => (p.id === id ? { ...p, ...report } : p)),
        })),

      getProblemReportsByToiletId: (toiletId) =>
        get()
          .problemReports.filter((p) => p.toiletId === toiletId)
          .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)),

      addSchedule: (schedule) =>
        set((state) => ({
          schedules: [...state.schedules, { ...schedule, id: generateId() } as Schedule],
        })),

      addCheckinRecord: (record) =>
        set((state) => ({
          checkinRecords: [...state.checkinRecords, { ...record, id: generateId() } as CheckinRecord],
        })),

      addSupplyRecord: (record) =>
        set((state) => ({
          supplyRecords: [...state.supplyRecords, { ...record, id: generateId() } as SupplyRecord],
        })),

      getSupplyRecordsByToiletId: (toiletId) =>
        get()
          .supplyRecords.filter((s) => s.toiletId === toiletId)
          .sort((a, b) => b.restockedAt.localeCompare(a.restockedAt)),

      addFaultReport: (toiletId, inspectionId, fault) =>
        set((state) => ({
          inspections: state.inspections.map((i) =>
            i.id === inspectionId
              ? { ...i, faultReports: [...i.faultReports, { ...fault, id: generateId() } as FaultReport] }
              : i
          ),
        })),

      addWorkOrder: (order) =>
        set((state) => ({
          workOrders: [...state.workOrders, { ...order, id: generateId() } as WorkOrder],
        })),

      updateWorkOrder: (id, order) =>
        set((state) => ({
          workOrders: state.workOrders.map((w) => (w.id === id ? { ...w, ...order } : w)),
        })),

      getWorkOrdersByToiletId: (toiletId) =>
        get()
          .workOrders.filter((w) => w.toiletId === toiletId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      addWorkOrderTimeline: (orderId, entry) =>
        set((state) => ({
          workOrders: state.workOrders.map((w) =>
            w.id === orderId
              ? { ...w, timeline: [...w.timeline, { ...entry, id: generateId() } as WorkOrderTimeline] }
              : w
          ),
        })),

      addInspectionTask: (task) =>
        set((state) => ({
          inspectionTasks: [...state.inspectionTasks, { ...task, id: generateId() } as InspectionTask],
        })),

      updateInspectionTask: (id, task) =>
        set((state) => ({
          inspectionTasks: state.inspectionTasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
        })),

      getInspectionTasksByToiletId: (toiletId) =>
        get()
          .inspectionTasks.filter((t) => t.toiletIds.includes(toiletId))
          .sort((a, b) => b.planDate.localeCompare(a.planDate)),

      getPendingInspectionTaskByToiletId: (toiletId, inspectorId, date) =>
        get().inspectionTasks.find(
          (t) =>
            t.toiletIds.includes(toiletId) &&
            t.inspectorId === inspectorId &&
            t.planDate === date &&
            (t.status === 'pending' || t.status === 'overdue')
        ),

      completeInspectionTask: (taskId, inspectionId) =>
        set((state) => ({
          inspectionTasks: state.inspectionTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed' as const,
                  inspectionId,
                  completedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                }
              : t
          ),
        })),

      scanOverdueTasks: (today) => {
        let overdueCount = 0;
        set((state) => {
          const updatedTasks = state.inspectionTasks.map((t) => {
            if (t.status === 'pending' && t.planDate < today) {
              overdueCount++;
              return { ...t, status: 'overdue' as const };
            }
            return t;
          });
          return { inspectionTasks: updatedTasks };
        });
        return overdueCount;
      },
    }),
    {
      name: 'toilet-management-storage',
      partialize: (state) => ({
        toilets: state.toilets,
        inspections: state.inspections,
        citizenReviews: state.citizenReviews,
        problemReports: state.problemReports,
        schedules: state.schedules,
        checkinRecords: state.checkinRecords,
        supplyRecords: state.supplyRecords,
        workOrders: state.workOrders,
        inspectionTasks: state.inspectionTasks,
      }),
    }
  )
);
