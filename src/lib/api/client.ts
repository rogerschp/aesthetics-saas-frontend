import axios from 'axios';
import { getSession } from 'next-auth/react';

export const api = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api/backend' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // getSession() do next-auth/react só funciona no browser.
  // Em RSC/SSR ele tenta GET /api/auth/session com URL inválida → CLIENT_FETCH_ERROR.
  if (typeof window === "undefined") {
    return config;
  }

  try {
    const session = await getSession();
    if (session?.idToken && config.headers) {
      config.headers.Authorization = `Bearer ${session.idToken}`;
    }
  } catch {
    // Sem sessão — segue como público
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    // O axios por padrão envelopa a resposta em um objeto { data, status, headers, ... }
    // Podemos retornar direto o data para facilitar a vida nos services
    return response.data;
  },
  (error) => {
    // Tratar erro retornado pela API padronizada do Cyacsys
    // { statusCode, requestId, timestamp, code, message }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Se for um unauthorized real, limpa a sessão local por segurança e força login
      // TODO: Aqui também poderiamos integrar o signOut do next-auth depois e o refresh token (POST /auth/refresh)
    }

    // Retorna o payload de erro para o hook/service tratar (ex: BusinessRuleException)
    return Promise.reject(error.response?.data || error);
  }
);
