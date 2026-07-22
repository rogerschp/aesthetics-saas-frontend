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

export enum TenantSegment {
  BARBERSHOP = 'BARBERSHOP',
  TATTOO_STUDIO = 'TATTOO_STUDIO',
  HAIR_SALON = 'HAIR_SALON',
  NAIL_STUDIO = 'NAIL_STUDIO',
  BEAUTY_SALON = 'BEAUTY_SALON',
  OTHER = 'OTHER',
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
  segment: TenantSegment | null;
  avatarUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Política de cancelamento de CONFIRMED pelo cliente (default false). */
  clientCanCancelConfirmed: boolean;
  /** Antecedência mínima em minutos p/ cancelar confirmado (default 60; 0–43200). */
  clientCancelConfirmedMinLeadMinutes: number;
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
  clientUserId: string | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resposta de GET ops de listagem (agenda do dia / profissional). */
export interface OpsBookingCustomer {
  kind: "USER" | "GUEST";
  clientUserId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
}

export interface OpsBooking {
  id: string;
  status: BookingStatus;
  date: string; // yyyy-MM-dd no fuso do tenant
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
  professional: {
    tenantProfessionalId: string;
    displayName: string;
  };
  service: {
    id: string;
    name: string;
    durationInMinutes: number;
  };
  customer: OpsBookingCustomer;
}

// ============ Vitrine pública ============
export interface PublicProfessional {
  /** tenantProfessionalId — usar na URL de agenda/booking. */
  id: string;
  tenantId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode: BookingMode;
  whatsappNumber: string | null;
  instagramUsername: string | null;
}

// ============ Reviews ============
export type ReviewTargetType = 'TENANT' | 'PROFESSIONAL';

export interface Review {
  id: string;
  reviewerUserId: string;
  reviewerName: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  reply: string | null;
  repliedAt?: string | null;
  repliedByUserId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewList {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// ============ Theme ============
export enum FonteDisponivel {
  INTER = 'Inter',
  PLAYFAIR = 'Playfair Display',
  ROBOTO = 'Roboto',
  OUTFIT = 'Outfit',
  BEBAS_NEUE = 'Bebas Neue',
  MONTSERRAT = 'Montserrat',
  POPPINS = 'Poppins',
}

export enum BorderRadiusOpcao {
  NONE = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  FULL = 'full',
}

export enum TipoSecao {
  PROFISSIONAIS = 'profissionais',
  HORARIOS = 'horarios',
  SERVICOS = 'servicos',
  AVALIACOES = 'avaliacoes',
  SOBRE = 'sobre',
  ENDERECO = 'endereco',
}

export enum VarianteComponente {
  PADRAO = 'padrao',
  CARDS = 'cards',
  LISTA = 'lista',
  GRID = 'grid',
}

export interface SecaoLayout {
  id: string;
  tipo: TipoSecao | string;
  visivel: boolean;
  ordem: number;
  variante: VarianteComponente | string;
}

export interface TenantThemeData {
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  fonte: FonteDisponivel | string;
  borderRadius: BorderRadiusOpcao | string;
  secoesLayout: SecaoLayout[];
}

export interface TenantThemeResponse {
  tenantId: string;
  theme: TenantThemeData | null;
  plan: string;
}

// ============ Search ============
export interface TenantSearchResult {
  id: string;
  name: string;
  slug: string;
  segment: TenantSegment | null;
  avatarUrl: string | null;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  distanceKm: number | null;
  plan: {
    name: string;
    eliteBadge: boolean;
    regionalHighlight: boolean;
  };
}

export interface TenantSearchResponse {
  data: TenantSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ Planos & Assinatura ============
export enum PlanName {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface PlanFeatures {
  reports: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  reportExport: boolean;
  reviews: boolean;
  marketplace: boolean;
  regionalHighlight: boolean;
  eliteBadge: boolean;
  whatsappNotification: boolean;
  customization: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FULL';
  maxProfessionals: number | null;
}

export interface Plan {
  id: string;
  name: PlanName;
  billingCycle: string;
  price: string;
  sortWeight: number;
  gracePeriodDays: number;
  features: PlanFeatures;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  status: SubscriptionStatus | string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  cancelledAt: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistoryEvent {
  id: string;
  event: string;
  fromPlanId: string | null;
  toPlanId: string | null;
  performedBy: string;
  createdAt: string;
}

// ============ Memberships (GET /users/me/tenants) ============
export interface MyTenantSummary {
  id: string;
  slug: string;
  name: string;
  status: string;
  telephone: string;
  timezone: string;
  segment?: TenantSegment | null;
  avatarUrl?: string | null;
  clientCanCancelConfirmed: boolean;
  clientCancelConfirmedMinLeadMinutes: number;
}

export interface Membership {
  membershipId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  tenant: MyTenantSummary;
}

// ============ Meus agendamentos (GET /users/me/bookings) ============
export interface MyBooking {
  id: string;
  status: BookingStatus;
  tenant: {
    id: string;
    name: string;
    slug: string;
    telephone: string;
    timezone: string;
    address: Address | null;
    clientCanCancelConfirmed?: boolean;
    clientCancelConfirmedMinLeadMinutes?: number;
  };
  professional: {
    tenantProfessionalId: string;
    displayName: string;
  };
  service: {
    id: string;
    name: string;
    durationInMinutes: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
}

// ============ Reports (GET /tenants/:id/reports/*) ============
/** Eixo temporal: bookings.startsAt no timezone do tenant. */

export interface ReportPeriod {
  start: string;
  end: string;
}

export interface DashboardSummary {
  revenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  averageTicket: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface TopServiceMetrics {
  serviceId: string;
  serviceName: string;
  quantity: number;
  revenue: number;
}

export interface MonthlyMetrics {
  year: number;
  month: number;
  revenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenueChangePercent: number | null;
}

export interface ProfessionalMetrics {
  tenantProfessionalId: string;
  professionalName: string;
  revenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageTicket: number;
  cancellationRate: number;
}

export interface StandardReport {
  period: ReportPeriod;
  /** Compat: espelha dashboard.revenue */
  revenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  dashboard: DashboardSummary;
  topServices: TopServiceMetrics[];
  /** Sempre null no MVP — não renderizar bloco de IA */
  insights: object | null;
}

export interface ProReport extends StandardReport {
  monthlyBreakdown: MonthlyMetrics[];
}

export interface EliteReport extends ProReport {
  professionalBreakdown: ProfessionalMetrics[];
}

export type TenantReport = StandardReport | ProReport | EliteReport;

export type ReportTier = 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

export type ReportExportFormat = 'pdf' | 'excel';

