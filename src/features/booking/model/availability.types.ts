export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum TimeOffReason {
  HOLIDAY = 'HOLIDAY',
  DAY_OFF = 'DAY_OFF',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
}

export enum BlockReason {
  LUNCH = 'LUNCH',
  PERSONAL = 'PERSONAL',
  BOOKING = 'BOOKING',
}

// ============ Availability ============
export interface WorkingHoursPeriod {
  id: string;
  workingHoursId: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  periods?: WorkingHoursPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeOff {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  date: string; // "yyyy-MM-dd"
  startTime: string | null;
  endTime: string | null;
  reason: TimeOffReason;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityBlock {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  date: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason: BlockReason;
  bookingId: string | null;
  createdAt: string;
}

export interface AvailableSlotsResponse {
  date: string; // "yyyy-MM-dd"
  timezone: string; // IANA
  slots: string[]; // ["09:00", "09:30", ...]
}
