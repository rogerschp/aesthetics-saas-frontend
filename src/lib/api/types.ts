// ============ Enums ============

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CLIENT = 'client',
  BARBER = 'barber',
  RECEPTIONIST = 'receptionist',
  MANAGER = 'manager',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum TenantUserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  BARBER = 'BARBER',
  STAFF = 'STAFF',
}

export enum TenantUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TenantProfessionalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  LEFT = 'LEFT',
}

export enum ProfessionalType {
  BARBER = 'BARBER',
  TATTOO_ARTIST = 'TATTOO_ARTIST',
  HAIRDRESSER = 'HAIRDRESSER',
  MANICURE = 'MANICURE',
  ESTHETICIAN = 'ESTHETICIAN',
  LASH_DESIGNER = 'LASH_DESIGNER',
  EYEBROW_DESIGNER = 'EYEBROW_DESIGNER',
}

export enum BookingMode {
  DIRECT_BOOKING = 'DIRECT_BOOKING',
  QUOTE_REQUIRED = 'QUOTE_REQUIRED',
  WHATSAPP_ONLY = 'WHATSAPP_ONLY',
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

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

// ============ Address ============
export interface Address {
  street: string;
  number: string;
  city: string;
  state: string; // 2 caracteres (ex.: "SP")
  zipCode: string; // formato "00000-000"
  country: string;
  complement?: string;
}

// ============ Professional Profile ============
export interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode: BookingMode;
  whatsappNumber: string | null;
  instagramUsername: string | null;
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ User ============
export interface User {
  id: string;
  firebaseUid: string | null;
  email: string;
  name: string;
  status: UserStatus;
  role: Role;
  telephone: string;
  address: Address | null;
  professionalProfile: ProfessionalProfile | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Tenant ============
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  telephone: string;
  cnpj?: string | null;
  socialMedia?: Record<string, string> | null;
  address: Address | null;
  timezone: string;
}

// ============ Tenant Member ============
export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  createdAt: string;
}

// ============ Tenant Professional ============
export interface TenantProfessional {
  id: string;
  tenantId: string;
  professionalProfileId: string;
  role: TenantUserRole;
  status: TenantProfessionalStatus;
  joinedAt: string;
  leftAt: string | null;
  createdAt: string;
  professionalProfile: ProfessionalProfile;
}

// ============ Service ============
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: string;
  durationInMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface OfferedService {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  serviceId: string;
  isActive: boolean;
  createdAt: string;
}

export interface AvailableSlotsResponse {
  date: string; // "yyyy-MM-dd"
  timezone: string; // IANA
  slots: string[]; // ["09:00", "09:30", ...]
}

// ============ Booking ============
export interface Booking {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  serviceId: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  status: BookingStatus;
  createdByTenantUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
