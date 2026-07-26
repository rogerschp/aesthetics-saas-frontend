import type { BookingMode, ProfessionalType } from "@/shared/lib/api/types";

export interface CreateProfessionalProfileRequest {
  displayName: string;
  professionalType: ProfessionalType;
  bookingMode?: BookingMode;
  whatsappNumber?: string;
  instagramUsername?: string;
  experienceYears: number;
  bio?: string | null;
}

export type UpdateProfessionalProfileRequest =
  Partial<CreateProfessionalProfileRequest>;
