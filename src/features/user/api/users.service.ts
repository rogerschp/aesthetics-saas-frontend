import { api } from "@/shared/lib/api/client";
import { User, ProfessionalProfile, MyBooking, BookingStatus, Membership } from "@/shared/lib/api/types";
import type {
  RegisterUserRequest,
  UpdateMyUserRequest,
  CreateProfessionalProfileRequest,
  UpdateProfessionalProfileRequest,
} from "@/features/user/api/dto/user.dto";

export type {
  RegisterUserRequest,
  UpdateMyUserRequest,
  CreateProfessionalProfileRequest,
  UpdateProfessionalProfileRequest,
};

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

  /** PATCH /users/me/avatar — vincula USER_AVATAR ({ mediaId }). */
  setMyAvatar: async (mediaId: string): Promise<User> => {
    return api.patch('/users/me/avatar', { mediaId });
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

  /** PATCH /users/me/professional-profile/avatar — vincula AVATAR ({ mediaId }). */
  setProfessionalAvatar: async (mediaId: string): Promise<ProfessionalProfile> => {
    return api.patch('/users/me/professional-profile/avatar', { mediaId });
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
