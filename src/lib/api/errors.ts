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

/** Evita expor mensagens técnicas do axios/fetch na UI. */
function isTechnicalMessage(message: string): boolean {
  return /status code|Network Error|Request failed|ECONNREFUSED|fetch failed|timeout/i.test(
    message,
  );
}

export function parseApiError(error: unknown): NormalizedApiError {
  // Error JS puro (ex.: NextAuth CredentialsSignin)
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    const msg = error.message || "";
    if (
      msg === "CredentialsSignin" ||
      msg === "CallbackRouteError" ||
      msg === "AccessDenied"
    ) {
      return {
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
        message: "E-mail ou senha inválidos. Verifique e tente novamente.",
        messages: ["E-mail ou senha inválidos. Verifique e tente novamente."],
      };
    }
  }

  const payload = (error ?? {}) as ApiErrorPayload & {
    response?: { data?: ApiErrorPayload; status?: number };
    message?: string | string[];
  };

  // Caso o interceptor não tenha desembrulhado (ex.: erro de rede/axios cru)
  const data: ApiErrorPayload = payload.response?.data ?? payload;
  const statusCode = data.statusCode ?? payload.response?.status ?? 0;
  const messages = extractMessages(data.message).filter(
    (m) => !isTechnicalMessage(m),
  );

  return {
    statusCode,
    code: data.code ?? null,
    message: messages[0] ?? "Erro inesperado. Tente novamente.",
    messages:
      messages.length > 0 ? messages : ["Erro inesperado. Tente novamente."],
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
  // Auth / conta
  INVALID_CREDENTIALS: "E-mail ou senha inválidos. Verifique e tente novamente.",
  USER_DISABLED: "Esta conta está desativada.",
  EMAIL_ALREADY_EXISTS: "Este e-mail já está em uso.",
  WEAK_PASSWORD: "Senha fraca. Use pelo menos 6 caracteres.",
  INVALID_WHATSAPP_NUMBER: "WhatsApp inválido. Verifique o número.",
  INVALID_INSTAGRAM_USERNAME: "Instagram inválido.",
  INVALID_EXPERIENCE_YEARS: "Anos de experiência inválidos.",
  PROFESSIONAL_PROFILE_ALREADY_EXISTS: "Você já possui perfil profissional.",
  INVALID_TENANT_MEMBERSHIP_ROLE:
    "Seu vínculo com o estabelecimento não permite esta ação.",
  INVALID_COORDINATES: "Coordenadas inválidas para a busca.",
  RADIUS_TOO_LARGE: "Raio de busca acima do permitido.",
  INVALID_REPORT_MONTHS: "Período de relatório inválido para o seu plano.",
  USER_NOT_IDENTIFIED: "Sessão inválida. Faça login novamente.",
  // Booking — slot / lead / política
  SLOT_NOT_AVAILABLE: "Este horário não está mais disponível. Escolha outro.",
  BOOKING_MIN_LEAD_NOT_MET:
    "Escolha um horário com pelo menos 15 minutos de antecedência.",
  BOOKING_IN_THE_PAST: "Não é possível agendar em um horário no passado.",
  BOOKING_REQUIRES_QUOTE:
    "Este profissional atende por orçamento. Entre em contato para agendar.",
  BOOKING_WHATSAPP_ONLY: "Este profissional agenda apenas pelo WhatsApp.",
  BOOKING_NOT_OWNED: "Você só pode alterar os próprios agendamentos.",
  // Booking — identidade / limites anti-spam
  CUSTOMER_TIME_CONFLICT:
    "Você já tem um agendamento que conflita com esse horário.",
  CUSTOMER_ACTIVE_BOOKINGS_LIMIT:
    "Você atingiu o limite de agendamentos ativos neste estabelecimento (máx. 3).",
  CUSTOMER_IDENTITY_XOR:
    "Informe apenas cliente OU visitante, não ambos.",
  GUEST_NAME_REQUIRED: "Informe o nome para o agendamento.",
  INVALID_PHONE: "Telefone inválido. Verifique o número informado.",
  // Cancelamento pelo cliente
  CLIENT_CANCEL_DISABLED:
    "Este estabelecimento não permite cancelar agendamentos confirmados.",
  CLIENT_CANCEL_TOO_LATE:
    "Fora do prazo permitido para cancelar este agendamento.",
  // Serviço
  SERVICE_INACTIVE: "Serviço indisponível no momento.",
  PROFESSIONAL_SERVICE_NOT_OFFERED:
    "Este profissional não oferece o serviço selecionado.",
  // Plano / assinatura
  PLAN_FEATURE_NOT_AVAILABLE: "Recurso indisponível no plano atual.",
  SUBSCRIPTION_EXPIRED: "Assinatura expirada. Renove para continuar.",
  SUBSCRIPTION_NOT_FOUND: "Assinatura não encontrada.",
  // Reviews
  REVIEW_ALREADY_EXISTS: "Você já avaliou este estabelecimento.",
  BOOKING_REQUIRED_FOR_REVIEW:
    "Só é possível avaliar após um atendimento concluído.",
  BOOKING_INVALID_DATE_FILTER:
    "Filtro de data inválido. Use um dia (date) ou um intervalo (from + to).",
  BOOKING_DATE_RANGE_TOO_LARGE:
    "Intervalo de agenda acima do permitido (máx. 31 dias).",
  CANNOT_REVIEW_YOURSELF: "Você não pode avaliar a si mesmo.",
  // Media
  MEDIA_FILE_REQUIRED: "Selecione um arquivo para enviar.",
  MEDIA_INVALID_MIME: "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.",
  MEDIA_EMPTY_FILE: "Arquivo vazio não é permitido.",
  MEDIA_FILE_TOO_LARGE: "Arquivo excede o limite permitido (imagens: 5 MB).",
  MEDIA_NOT_OWNED: "Esta mídia não pertence a você ou ao estabelecimento.",
};

export function formatApiError(error: unknown): string {
  const parsed = parseApiError(error);

  if (parsed.statusCode === 401 && !parsed.code) {
    return CODE_MESSAGES.INVALID_CREDENTIALS;
  }
  if (parsed.statusCode === 429) {
    return "Muitas requisições em pouco tempo. Aguarde um instante e tente novamente.";
  }
  if (parsed.code && CODE_MESSAGES[parsed.code]) {
    return CODE_MESSAGES[parsed.code];
  }
  if (parsed.code?.startsWith("THEME_")) {
    return parsed.message || "Configuração de tema inválida para o seu plano.";
  }
  if (isTechnicalMessage(parsed.message)) {
    return "Erro inesperado. Tente novamente.";
  }
  return parsed.message;
}

/** Códigos que significam "modo de agendamento não permite draft" (CTA externo). */
export function isNonBookableMode(code: string | null): boolean {
  return code === 'BOOKING_REQUIRES_QUOTE' || code === 'BOOKING_WHATSAPP_ONLY';
}
