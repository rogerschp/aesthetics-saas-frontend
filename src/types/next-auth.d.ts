import type { Role } from '@/lib/api/types';

declare module 'next-auth' {
  interface Session {
    idToken?: string;
    error?: 'RefreshAccessTokenError';
    user: {
      id?: string;
      role?: Role | string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    idToken?: string;
    refreshToken?: string;
    role?: Role | string;
    expiresIn?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    idToken?: string;
    refreshToken?: string;
    role?: Role | string;
    /** Epoch ms de expiração do idToken (para rotação). */
    accessTokenExpires?: number;
    error?: 'RefreshAccessTokenError';
  }
}
