import { api } from "@/shared/lib/api/client";
import { ProfessionalProfile, User } from "@/shared/lib/api/types";
import type {
  CreateProfessionalProfileRequest,
  UpdateProfessionalProfileRequest,
} from "@/features/professional/api/dto/professional.dto";

export type {
  CreateProfessionalProfileRequest,
  UpdateProfessionalProfileRequest,
};

export const usersService = {
  getMe: async (): Promise<User> => {
    return api.get("/users/me");
  },

  getProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.get("/users/me/professional-profile");
  },

  createProfessionalProfile: async (
    data: CreateProfessionalProfileRequest,
  ): Promise<ProfessionalProfile> => {
    return api.post("/users/me/professional-profile", data);
  },

  updateProfessionalProfile: async (
    data: UpdateProfessionalProfileRequest,
  ): Promise<ProfessionalProfile> => {
    return api.patch("/users/me/professional-profile", data);
  },

  setProfessionalAvatar: async (mediaId: string): Promise<ProfessionalProfile> => {
    return api.patch("/users/me/professional-profile/avatar", { mediaId });
  },

  deactivateProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.patch("/users/me/professional-profile/deactivate");
  },

  activateProfessionalProfile: async (): Promise<ProfessionalProfile> => {
    return api.patch("/users/me/professional-profile/activate");
  },
};
