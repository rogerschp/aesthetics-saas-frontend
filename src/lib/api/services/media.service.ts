import { api } from "../client";
import { MediaAsset, MediaType } from "../types";

export interface UploadMediaParams {
  file: File;
  mediaType: MediaType;
  tenantId?: string;
  /** UUID do user dono do professional profile (AVATAR / GALLERY). */
  professionalId?: string;
  serviceId?: string;
}

export const mediaService = {
  /**
   * POST /media/upload — multipart.
   * Não defina Content-Type manualmente (o client remove o JSON default).
   */
  upload: async (params: UploadMediaParams): Promise<MediaAsset> => {
    const form = new FormData();
    form.append("file", params.file);
    form.append("mediaType", params.mediaType);
    if (params.tenantId) form.append("tenantId", params.tenantId);
    if (params.professionalId) {
      form.append("professionalId", params.professionalId);
    }
    if (params.serviceId) form.append("serviceId", params.serviceId);

    return api.post("/media/upload", form) as Promise<MediaAsset>;
  },

  getById: async (id: string): Promise<MediaAsset> => {
    return api.get(`/media/${id}`) as Promise<MediaAsset>;
  },

  delete: async (id: string): Promise<MediaAsset> => {
    return api.delete(`/media/${id}`) as Promise<MediaAsset>;
  },
};

/** Limites alinhados à MediaPolicy do backend (imagens). */
export const MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const MEDIA_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateImageFile(file: File): string | null {
  if (!MEDIA_IMAGE_MIME.has(file.type)) {
    return "Use JPEG, PNG ou WebP.";
  }
  if (file.size <= 0) {
    return "Arquivo vazio.";
  }
  if (file.size > MEDIA_IMAGE_MAX_BYTES) {
    return "Arquivo maior que 5 MB.";
  }
  return null;
}
