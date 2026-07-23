import axios from "axios";
import { getSession } from "next-auth/react";

/**
 * Browser e SSR usam a URL absoluta da API quando `NEXT_PUBLIC_API_URL` está setada
 * (Vercel → Render). Localmente, sem env, o browser pode usar o rewrite `/api/backend`.
 */
function resolveApiBaseURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "/api/backend";
  return "http://127.0.0.1:3000";
}

/**
 * Cache em memória do idToken.
 * `getSession()` SEMPRE bate em GET /api/auth/session — não usa o React Context.
 * Por isso o interceptor NÃO deve chamá-lo a cada request.
 */
let cachedIdToken: string | undefined;
let cachedAt = 0;
let inflightSession: Promise<string | undefined> | null = null;

/** TTL curto; o bridge do SessionProvider atualiza o cache em tempo real. */
const TOKEN_CACHE_TTL_MS = 60_000;

export function setCachedIdToken(token: string | undefined) {
  cachedIdToken = token;
  cachedAt = Date.now();
}

export function clearCachedIdToken() {
  cachedIdToken = undefined;
  cachedAt = 0;
  inflightSession = null;
}

async function resolveIdToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;

  if (cachedIdToken && Date.now() - cachedAt < TOKEN_CACHE_TTL_MS) {
    return cachedIdToken;
  }

  // Deduplica chamadas paralelas (várias APIs no mount).
  if (!inflightSession) {
    inflightSession = getSession()
      .then((session) => {
        const token = session?.idToken;
        setCachedIdToken(token);
        return token;
      })
      .catch(() => undefined)
      .finally(() => {
        inflightSession = null;
      });
  }

  return inflightSession;
}

export const api = axios.create({
  baseURL: resolveApiBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") {
      return config;
    }

    try {
      const idToken = await resolveIdToken();
      if (idToken && config.headers) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch {
      // Sem sessão — segue como público
    }

    // Multipart: não forçar application/json (senão o boundary some).
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      const headers = config.headers;
      if (headers && typeof headers === "object") {
        if (typeof (headers as { delete?: (k: string) => void }).delete === "function") {
          (headers as { delete: (k: string) => void }).delete("Content-Type");
        } else {
          delete (headers as Record<string, unknown>)["Content-Type"];
          delete (headers as Record<string, unknown>)["content-type"];
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token pode ter expirado — força refresh na próxima request.
      clearCachedIdToken();
    }

    return Promise.reject(error.response?.data || error);
  },
);
