/**
 * Tratamento central do payload de erro padronizado da API Cyacsys:
 * { statusCode, requestId, timestamp, code, message }
 *
 * O interceptor do axios (client.ts) já faz reject com `error.response?.data`,
 * então aqui normalizamos qualquer formato para um shape previsível.
 */

export interface ApiErrorPayload {
  statusCode?: number;
  requestId?: string;
  timestamp?: string;
  code?: string;
  message?: string | string[];
}

export interface NormalizedApiError {
  statusCode: number;
  code: string | null;
  message: string;
  messages: string[];
  requestId?: string;
}

function extractMessages(message: string | string[] | undefined): string[] {
  if (!message) return [];
  return Array.isArray(message) ? message : [message];
}

export function parseApiError(error: unknown): NormalizedApiError {
  const payload = (error ?? {}) as ApiErrorPayload & {
    response?: { data?: ApiErrorPayload; status?: number };
  };

  // Caso o interceptor não tenha desembrulhado (ex.: erro de rede/axios cru)
  const data: ApiErrorPayload = payload.response?.data ?? payload;
  const statusCode = data.statusCode ?? payload.response?.status ?? 0;
  const messages = extractMessages(data.message);

  return {
    statusCode,
    code: data.code ?? null,
    message: messages[0] ?? 'Erro inesperado. Tente novamente.',
    messages,
    requestId: data.requestId,
  };
}

export function getErrorCode(error: unknown): string | null {
  return parseApiError(error).code;
}

/**
 * Mensagens amigáveis por código de negócio/plano documentado.
 * Retorna null quando não há tradução específica (usar `.message`).
 */
const CODE_MESSAGES: Record<string, string> = {
  // Booking — slot / lead / política
  SLOT_NOT_AVAILABLE: 'Este horário não está mais disponível. Escolha outro.',
  BOOKING_MIN_LEAD_NOT_MET: 'Escolha um horário com pelo menos 15 minutos de antecedência.',
  BOOKING_IN_THE_PAST: 'Não é possível agendar em um horário no passado.',
  BOOKING_REQUIRES_QUOTE: 'Este profissional atende por orçamento. Entre em contato para agendar.',
  BOOKING_WHATSAPP_ONLY: 'Este profissional agenda apenas pelo WhatsApp.',
  BOOKING_NOT_OWNED: 'Você só pode alterar os próprios agendamentos.',
  // Booking — identidade / limites anti-spam
  CUSTOMER_TIME_CONFLICT: 'Você já tem um agendamento que conflita com esse horário.',
  CUSTOMER_ACTIVE_BOOKINGS_LIMIT: 'Você atingiu o limite de agendamentos ativos neste estabelecimento (máx. 3).',
  CUSTOMER_IDENTITY_XOR: 'Informe apenas cliente OU visitante, não ambos.',
  GUEST_NAME_REQUIRED: 'Informe o nome para o agendamento.',
  INVALID_PHONE: 'Telefone inválido. Verifique o número informado.',
  // Cancelamento pelo cliente
  CLIENT_CANCEL_DISABLED: 'Este estabelecimento não permite cancelar agendamentos confirmados.',
  CLIENT_CANCEL_TOO_LATE: 'Fora do prazo permitido para cancelar este agendamento.',
  // Serviço
  SERVICE_INACTIVE: 'Serviço indisponível no momento.',
  PROFESSIONAL_SERVICE_NOT_OFFERED: 'Este profissional não oferece o serviço selecionado.',
  // Plano / assinatura
  PLAN_FEATURE_NOT_AVAILABLE: 'Recurso indisponível no plano atual.',
  SUBSCRIPTION_EXPIRED: 'Assinatura expirada. Renove para continuar.',
  SUBSCRIPTION_NOT_FOUND: 'Assinatura não encontrada.',
  // Reviews
  REVIEW_ALREADY_EXISTS: 'Você já avaliou este estabelecimento.',
  CANNOT_REVIEW_YOURSELF: 'Você não pode avaliar a si mesmo.',
  // Media
  MEDIA_FILE_REQUIRED: 'Selecione um arquivo para enviar.',
  MEDIA_INVALID_MIME: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
  MEDIA_EMPTY_FILE: 'Arquivo vazio não é permitido.',
  MEDIA_FILE_TOO_LARGE: 'Arquivo excede o limite permitido (imagens: 5 MB).',
  MEDIA_NOT_OWNED: 'Esta mídia não pertence a você ou ao estabelecimento.',
};

export function formatApiError(error: unknown): string {
  const parsed = parseApiError(error);

  if (parsed.statusCode === 429) {
    return 'Muitas requisições em pouco tempo. Aguarde um instante e tente novamente.';
  }
  if (parsed.code && CODE_MESSAGES[parsed.code]) {
    return CODE_MESSAGES[parsed.code];
  }
  if (parsed.code?.startsWith('THEME_')) {
    return parsed.message || 'Configuração de tema inválida para o seu plano.';
  }
  return parsed.message;
}

/** Códigos que significam "modo de agendamento não permite draft" (CTA externo). */
export function isNonBookableMode(code: string | null): boolean {
  return code === 'BOOKING_REQUIRES_QUOTE' || code === 'BOOKING_WHATSAPP_ONLY';
}
