import { api } from '../client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  username?: string;
}

export const authService = {
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
