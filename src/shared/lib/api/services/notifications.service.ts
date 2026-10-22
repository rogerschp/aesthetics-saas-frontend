import { api } from "@/shared/lib/api/client";
import {
  NotificationChannel,
  NotificationEvent,
} from "@/shared/lib/api/types";

export type NotificationRecordStatus = "PENDING" | "SENT" | "FAILED";

/** Token de push (FCM) registrado para o usuário logado. */
export type NotificationDeviceToken = {
  id: string;
  channel: NotificationChannel;
  token: string;
  platform?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

/** Preferência (opt-in/out) do usuário por evento/canal. */
export type NotificationPreference = {
  id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  enabled: boolean;
};

/** GET /notifications/telegram/status */
export type TelegramStatus = {
  linked: boolean;
  linkedAt: string | null;
};

/** GET /notifications/telegram/link — `url` null quando o bot não está configurado. */
export type TelegramLink = {
  url: string | null;
  token: string;
  expiresAt: string;
  instructions: string;
};

export const notificationsService = {
  // ---- Telegram ----
  getTelegramStatus: async (): Promise<TelegramStatus> => {
    return api.get<TelegramStatus>("/notifications/telegram/status");
  },

  getTelegramLink: async (): Promise<TelegramLink> => {
    return api.get<TelegramLink>("/notifications/telegram/link");
  },

  // ---- Push (device tokens) ----
  registerDeviceToken: async (input: {
    token: string;
    channel?: NotificationChannel;
    platform?: string;
  }): Promise<NotificationDeviceToken> => {
    return api.post("/notifications/device-tokens", {
      channel: NotificationChannel.PUSH,
      ...input,
    });
  },

  listDeviceTokens: async (): Promise<NotificationDeviceToken[]> => {
    return api.get("/notifications/device-tokens");
  },

  removeDeviceToken: async (id: string): Promise<void> => {
    return api.delete(`/notifications/device-tokens/${id}`);
  },

  // ---- Preferências ----
  listPreferences: async (): Promise<NotificationPreference[]> => {
    return api.get("/notifications/preferences");
  },

  updatePreference: async (input: {
    event: NotificationEvent;
    channel: NotificationChannel;
    enabled: boolean;
  }): Promise<NotificationPreference> => {
    return api.patch("/notifications/preferences", input);
  },
};
