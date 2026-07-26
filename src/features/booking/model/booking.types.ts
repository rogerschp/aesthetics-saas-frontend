import { BookingStatus } from "@/shared/lib/api/types";

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
    professionalProfileId?: string;
    userId?: string;
    displayName: string;
  };
  service: {
    id: string;
    name: string;
    durationInMinutes: number;
  };
  customer: OpsBookingCustomer;
}
