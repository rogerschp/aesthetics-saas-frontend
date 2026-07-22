import { api } from '../client';
import { User, Address, ProfessionalProfile, ProfessionalType, BookingMode } from '../types';

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
  }
};
