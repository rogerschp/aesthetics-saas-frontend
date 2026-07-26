import { api } from "@/shared/lib/api/client";
import { User } from "@/shared/lib/api/types";
import type {
  RegisterUserRequest,
  LoginRequest,
  LoginResponse,
} from "@/features/auth/api/dto/auth.dto";

export type { RegisterUserRequest, LoginRequest, LoginResponse };

export const authService = {
  register: async (data: RegisterUserRequest): Promise<User> => {
    return api.post("/users", data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post('/auth/login', data);
  },
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    return api.post('/auth/refresh', { refreshToken });
  },
  logout: async (): Promise<{ message: string }> => {
    return api.post('/auth/logout');
  }
};
