import type { Address } from "@/shared/lib/api/types";

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
  telephone: string;
  address?: Address;
}

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
