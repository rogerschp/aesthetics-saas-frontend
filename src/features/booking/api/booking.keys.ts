export const bookingKeys = {
  myBookings: (userId?: string) => ["my-bookings", userId] as const,

  opsProfessionals: (tenantId: string) => ["ops-professionals", tenantId] as const,
  opsServices: (tenantId: string) => ["ops-services", tenantId] as const,
  opsSlots: (
    tenantId: string,
    professionalId?: string,
    serviceId?: string,
    date?: string,
  ) => ["ops-slots", tenantId, professionalId, serviceId, date] as const,
  /** Prefixo usado para invalidar todas as janelas de agenda de um tenant. */
  opsAgendaAll: (tenantId: string) => ["ops-agenda", tenantId] as const,
  opsAgenda: (tenantId: string, from?: string, to?: string) =>
    ["ops-agenda", tenantId, from, to] as const,

  publicSlots: (
    tenantId: string,
    professionalId?: string,
    serviceId?: string,
    date?: string,
  ) => ["public-slots", tenantId, professionalId, serviceId, date] as const,

  /** Agenda do dashboard do profissional (`/barbeiro/[id]`). */
  byProfessional: (
    userId?: string,
    tenantId?: string,
    tpId?: string,
    from?: string,
    to?: string,
  ) => ["barbeiro-agenda", userId, tenantId, tpId, from, to] as const,
};
