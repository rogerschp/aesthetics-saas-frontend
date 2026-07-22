import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/api/services/auth.service";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "barbershop_saas_dev_secret_123",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password
          });
          
          if (response.idToken) {
            // Busca o perfil do usuário na API usando o token recém-adquirido
            const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'}/users/me`, {
              headers: { Authorization: `Bearer ${response.idToken}` }
            });
            const userData = await userRes.json();
            
            return {
              id: userData.id || '1', 
              idToken: response.idToken,
              refreshToken: response.refreshToken,
              email: credentials.email,
              role: userData.role || 'CLIENT'
            };
          }
          return null;
        } catch (error) {
          console.error("Erro na autenticação", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.idToken = (user as any).idToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).idToken = token.idToken;
      (session.user as any).role = token.role;
      (session.user as any).id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
