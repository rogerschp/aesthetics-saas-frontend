import { api } from '../client';
import { User, Address, ProfessionalProfile, ProfessionalType, BookingMode, MyBooking, BookingStatus, Membership } from '../types';

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
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode?: BookingMode;
  whatsappNumber?: string;
  instagramUsername?: string;
  experienceYears: number;
  bio?: string | null;
}

export type UpdateProfessionalProfileRequest = Partial<CreateProfessionalProfileRequest>;

export const usersService = {
  register: async (data: RegisterUserRequest): Promise<User> => {
    return api.post('/users', data);
  },
  
  getMe: async (): Promise<User> => {
    return api.get('/users/me');
  },

  /** GET /users/me/bookings?status= — Bearer. */
  getMyBookings: async (status?: BookingStatus): Promise<MyBooking[]> => {
    return api.get('/users/me/bookings', {
      params: status ? { status } : undefined,
    });
  },

  /** GET /users/me/tenants — memberships ACTIVE + resumo do tenant. */
  getMyTenants: async (): Promise<Membership[]> => {
    return api.get('/users/me/tenants');
  },
  
  updateMe: async (data: UpdateMyUserRequest): Promise<User> => {
    return api.patch('/users/me', data);
  },

  getProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.get('/users/me/professional-profile');
  },

  createProfessionalProfile: async (data: CreateProfessionalProfileRequest): Promise<ProfessionalProfile> => {
    return api.post('/users/me/professional-profile', data);
  },

  updateProfessionalProfile: async (data: UpdateProfessionalProfileRequest): Promise<ProfessionalProfile> => {
    return api.patch('/users/me/professional-profile', data);
  },

  deactivateProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.patch('/users/me/professional-profile/deactivate');
  },

  activateProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.patch('/users/me/professional-profile/activate');
  },

  /** PATCH /users/me/deactivate — status INACTIVE + desabilita no Firebase. */
  deactivateMe: async (): Promise<User> => {
    return api.patch('/users/me/deactivate');
  },
};
