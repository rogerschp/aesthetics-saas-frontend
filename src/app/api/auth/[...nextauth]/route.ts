import NextAuth, { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/api/services/auth.service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";

/**
 * Rotação de token: o idToken do Firebase expira; usamos o refreshToken
 * (POST /auth/refresh) dentro do callback jwt, único lugar capaz de
 * atualizar o cookie da sessão do next-auth.
 */
async function rotateAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error("missing refresh token");
    const refreshed = await authService.refresh(token.refreshToken);
    return {
      ...token,
      idToken: refreshed.idToken,
      refreshToken: refreshed.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + (refreshed.expiresIn ?? 3600) * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "barbershop_saas_dev_secret_123",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!response.idToken) return null;

          const userRes = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${response.idToken}` },
          });
          const userData = await userRes.json();

          return {
            id: userData.id || "1",
            idToken: response.idToken,
            refreshToken: response.refreshToken,
            email: userData.email || credentials.email,
            name: userData.name || response.username || null,
            role: userData.role || "client",
            // guardamos expiração para rotação no callback jwt
            expiresIn: response.expiresIn,
          };
        } catch (error) {
          console.error("Erro na autenticação", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Login inicial
      if (user) {
        token.id = user.id;
        token.idToken = (user as { idToken?: string }).idToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
        token.role = (user as { role?: string }).role;
        const expiresIn = (user as { expiresIn?: number }).expiresIn ?? 3600;
        token.accessTokenExpires = Date.now() + expiresIn * 1000;
        return token;
      }

      // Token ainda válido (margem de 60s)
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60_000
      ) {
        return token;
      }

      // Expirado → rotaciona
      return rotateAccessToken(token);
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      session.error = token.error;
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
