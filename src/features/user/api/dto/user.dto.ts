import type {
  Address,
  BookingMode,
  ProfessionalType,
} from "@/shared/lib/api/types";

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
  telephone: string;
  address?: Address;
}

export interface UpdateMyUserRequest {
  name?: string;
  telephone?: string;
  password?: string;
  address?: Address;
}

export interface CreateProfessionalProfileRequest {
  displayName: string;
  professionalType: ProfessionalType;
  bookingMode?: BookingMode;
  whatsappNumber?: string;
  instagramUsername?: string;
  experienceYears: number;
  bio?: string | null;
}

export type UpdateProfessionalProfileRequest = Partial<CreateProfessionalProfileRequest>;
