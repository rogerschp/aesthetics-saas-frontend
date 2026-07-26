"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  mediaService,
  type UploadMediaParams,
} from "@/shared/lib/api/services/media.service";
import { MediaAsset, MediaType } from "@/shared/lib/api/types";

type MutationCallbacks<TData, TVariables> = Pick<
  UseMutationOptions<TData, unknown, TVariables>,
  "onSuccess" | "onError" | "onSettled" | "onMutate"
>;

/** POST /media/upload (mediaType=GALLERY) — usado por MediaGalleryField. */
export function useGalleryUpload(
  professionalId: string,
  options?: MutationCallbacks<MediaAsset, File>,
) {
  return useMutation({
    mutationFn: (file: File) =>
      mediaService.upload({ file, mediaType: MediaType.GALLERY, professionalId }),
    ...options,
  });
}

/** DELETE /media/:id — usado por MediaGalleryField. */
export function useMediaDelete(options?: MutationCallbacks<MediaAsset, string>) {
  return useMutation({
    mutationFn: (id: string) => mediaService.delete(id),
    ...options,
  });
}

type ImageUploadContext = Omit<UploadMediaParams, "file" | "mediaType">;

/**
 * POST /media/upload — usado por MediaImageField.
 * Encapsula upload + vínculo opcional (`onLink`) na mesma mutation, preservando
 * o comportamento original (isPending cobre as duas etapas).
 */
export function useMediaImageUpload(
  params: {
    mediaType: MediaType;
    context?: ImageUploadContext;
    onLink?: (media: MediaAsset) => Promise<void>;
  },
  options?: MutationCallbacks<MediaAsset, File>,
) {
  return useMutation({
    mutationFn: async (file: File) => {
      const media = await mediaService.upload({
        file,
        mediaType: params.mediaType,
        ...params.context,
      });
      if (params.onLink) {
        await params.onLink(media);
      }
      return media;
    },
    ...options,
  });
}
