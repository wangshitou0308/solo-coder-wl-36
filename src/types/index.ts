export type ToiletType = 'street' | 'park' | 'station' | 'mall';

export type District = '东城区' | '西城区' | '朝阳区' | '海淀区';

export interface Toilet {
  id: string;
  code: string;
  name: string;
  address: string;
  district: District;
  lat: number;
  lng: number;
  openTime: string;
  hasThirdBathroom: boolean;
  hasBabyRoom: boolean;
  hasAccessible: boolean;
  seatCount: number;
  managementUnit: string;
  type: ToiletType;
  facilityLevel: 1 | 2 | 3 | 4 | 5;
  averageInspectionScore: number;
  averageCitizenScore: number;
}

export interface FaultReport {
  id: string;
  description: string;
  reportedAt: string;
  status: 'pending' | 'processing' | 'resolved';
}

export interface Inspection {
  id: string;
  toiletId: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  groundCleanliness: number;
  toiletCleanliness: number;
  odorLevel: number;
  suppliesAdequacy: number;
  facilityIntegrity: number;
  totalScore: number;
  remark?: string;
  faultReports: FaultReport[];
}

export interface CitizenReview {
  id: string;
  toiletId: string;
  citizenName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  photoUrls: string[];
  createdAt: string;
}

export type ProblemType =
  | 'cleanliness'
  | 'odor'
  | 'supply_shortage'
  | 'facility_damage'
  | 'other';

export type ProblemStatus = 'pending' | 'processing' | 'resolved';

export interface ProblemReport {
  id: string;
  toiletId: string;
  citizenName: string;
  problemType: ProblemType;
  description: string;
  photoUrls: string[];
  status: ProblemStatus;
  reportedAt: string;
  assignedTo: string;
  resolvedAt?: string;
  resolutionNote?: string;
  processingHours?: number;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
}

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'full';

export interface Schedule {
  id: string;
  toiletId: string;
  cleanerId: string;
  cleanerName: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
}

export interface CheckinRecord {
  id: string;
  scheduleId: string;
  toiletId: string;
  cleanerId: string;
  checkinTime: string;
  cleanupCompleteTime?: string;
  selfInspectionScore?: number;
}

export type SupplyType =
  | 'toilet_paper'
  | 'hand_sanitizer'
  | 'soap'
  | 'trash_bag';

export interface SupplyRecord {
  id: string;
  toiletId: string;
  supplyType: SupplyType;
  supplyName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  restockedAt: string;
  nextEstimatedRestock: string;
}
