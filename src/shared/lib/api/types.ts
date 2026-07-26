/**
 * Tipos de API verdadeiramente cross-cutting (usados por 2+ features, ou
 * consumidos diretamente por código em `shared/`). Tipos de domínio de uma
 * única feature vivem em `features/<nome>/model/*.types.ts`.
 *
 * Ver `docs/architecture/ETAPA-2-TYPES.md` para o mapeamento completo.
 */

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

// ============ Media (serviço compartilhado em shared/lib/api/services/media.service.ts) ============
export enum MediaType {
  AVATAR = 'AVATAR',
  USER_AVATAR = 'USER_AVATAR',
  LOGO = 'LOGO',
  BANNER = 'BANNER',
  COVER = 'COVER',
  SERVICE_IMAGE = 'SERVICE_IMAGE',
  GALLERY = 'GALLERY',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export enum MediaStatus {
  UPLOADING = 'UPLOADING',
  AVAILABLE = 'AVAILABLE',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export interface MediaAsset {
  id: string;
  provider: string;
  providerResourceId: string;
  providerAssetId: string | null;
  storagePath: string;
  url: string;
  checksum: string | null;
  originalFileName: string | null;
  mimeType: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  mediaType: MediaType;
  visibility: string;
  accessLevel: string;
  status: MediaStatus;
  failureReason: string | null;
  tenantId: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
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
  COMPLETED = 'COMPLETED',
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

// ============ Professional Profile (usado por features/professional e features/user) ============
export interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarMediaId?: string | null;
  avatarUrl: string | null;
  professionalType: ProfessionalType;
  bookingMode: BookingMode;
  whatsappNumber: string | null;
  instagramUsername: string | null;
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ User (usado por features/auth, features/professional, features/user) ============
export interface User {
  id: string;
  firebaseUid: string | null;
  email: string;
  name: string;
  status: UserStatus;
  role: Role;
  telephone: string;
  address: Address | null;
  avatarMediaId?: string | null;
  /** Resolvido do Media (USER_AVATAR). */
  avatarUrl?: string | null;
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

// ============ Tenant Professional (usado por features/professional e features/booking) ============
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

// ============ Service / Catálogo (usado por features/tenant e features/booking) ============
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

// ============ Vitrine pública (usado por features/booking e features/professional) ============
export interface PublicProfessional {
  /** tenantProfessionalId — usar na URL de agenda/booking. */
  id: string;
  tenantId: string;
  professionalProfileId?: string;
  /** UUID do usuário dono do perfil — necessário para avaliações. */
  userId?: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode: BookingMode;
  whatsappNumber: string | null;
  instagramUsername: string | null;
}

// ============ Reviews ============
// Review/ReviewComment moram aqui (e não em features/reviews/model) porque
// `ReviewList` é consumido também pela duplicata em features/professional,
// e shared não pode importar de features.
export type ReviewTargetType = 'TENANT' | 'PROFESSIONAL';

export interface ReviewComment {
  id: string;
  reviewId: string;
  authorUserId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  reviewerUserId: string;
  reviewerName: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  repliedAt?: string | null;
  repliedByUserId?: string | null;
  comments: ReviewComment[];
  createdAt: string;
  updatedAt?: string;
}

/** Agregado de avaliações — usado por features/reviews e pela duplicata em features/professional. */
export interface ReviewList {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// ============ Notificações (serviço compartilhado em shared/lib/api/services/notifications.service.ts) ============
/**
 * Eventos do pipeline de notificação no back (dispatch mock no MVP).
 * Sem inbox HTTP ainda — tipos preparados para integração futura.
 */
export enum NotificationEvent {
  TEAM_INVITATION = 'TEAM_INVITATION',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  REVIEW_CREATED = 'REVIEW_CREATED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

// ============ Planos & Assinatura (usado por features/plans, features/reports e shared/lib/plans.ts) ============
export enum PlanName {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  PRO = 'PRO',
  ELITE = 'ELITE',
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
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  cancelledAt: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

// ============ Memberships (GET /users/me/tenants) — usado por features/user e shared/providers/TenantProvider ============
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

// ============ Meus agendamentos (GET /users/me/bookings) — usado por features/booking e features/user ============
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
    professionalProfileId?: string;
    displayName: string;
    /** UUID do usuário — link para /profissional/[userId] e reviews. */
    userId?: string;
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
