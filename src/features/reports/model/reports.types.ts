// ============ Reports (GET /tenants/:id/reports/*) ============
/** Eixo temporal: bookings.startsAt no timezone do tenant. */

export interface ReportPeriod {
  start: string;
  end: string;
}

export interface DashboardSummary {
  revenue: number;
  completedBookings: number;
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
  completedBookings: number;
  cancelledBookings: number;
  revenueChangePercent: number | null;
}

export interface ProfessionalMetrics {
  tenantProfessionalId: string;
  professionalName: string;
  revenue: number;
  completedBookings: number;
  cancelledBookings: number;
  averageTicket: number;
  cancellationRate: number;
}

export interface StandardReport {
  period: ReportPeriod;
  /** Compat: espelha dashboard.revenue */
  revenue: number;
  /** Compat: espelha dashboard.completedBookings */
  completedBookings: number;
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
