/**
 * Notificações: o backend dispara eventos via `DispatchNotificationUseCase`
 * (provider mock no MVP — log no servidor). Não há controller HTTP de inbox.
 *
 * Este módulo só documenta o contrato futuro para o front ficar preparado.
 * Quando existirem rotas (list / mark-read / unread-count), implemente aqui.
 */
import {
  NotificationChannel,
  NotificationEvent,
} from "../types";

export type NotificationRecordStatus = "PENDING" | "SENT" | "FAILED";

/** Shape esperado de um item de inbox (ainda sem API). */
export type NotificationInboxItem = {
  id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  to: string;
  status: NotificationRecordStatus;
  payload?: Record<string, unknown>;
  createdAt: string;
  readAt?: string | null;
};

export const notificationsService = {
  /**
   * Placeholder — inbox não disponível no MVP.
   * @throws sempre, para evitar uso acidental.
   */
  listMine: async (): Promise<NotificationInboxItem[]> => {
    throw new Error(
      "GET /notifications ainda não existe no backend (MVP: dispatch mock apenas).",
    );
  },
};
