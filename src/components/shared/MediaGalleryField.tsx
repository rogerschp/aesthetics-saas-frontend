"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  mediaService,
  MEDIA_IMAGE_ACCEPT,
  validateImageFile,
} from "@/lib/api/services/media.service";
import { formatApiError } from "@/lib/api/errors";
import { MediaType } from "@/lib/api/types";

export type GalleryItem = { id: string; url: string };

interface MediaGalleryFieldProps {
  label: string;
  hint?: string;
  professionalId: string;
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  disabled?: boolean;
}

/**
 * Galeria do profissional (mediaType=GALLERY).
 * Sem listagem no back: o front mantém os itens enviados nesta sessão/tela.
 * DOCUMENT fica fora deste componente.
 */
export function MediaGalleryField({
  label,
  hint,
  professionalId,
  items,
  onChange,
  disabled,
}: MediaGalleryFieldProps) {
  const t = useTranslations("MediaUpload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      mediaService.upload({
        file,
        mediaType: MediaType.GALLERY,
        professionalId,
      }),
    onSuccess: (media) => {
      setError(null);
      onChange([...items, { id: media.id, url: media.url }]);
    },
    onError: (err) => setError(formatApiError(err) || t("error")),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => mediaService.delete(id),
    onSuccess: (_data, id) => {
      onChange(items.filter((i) => i.id !== id));
    },
    onError: (err) => setError(formatApiError(err) || t("error")),
  });

  function onPick(file: File | undefined) {
    if (!file) return;
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    uploadMutation.mutate(file);
  }

  const busy =
    disabled || uploadMutation.isPending || removeMutation.isPending;

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-8 w-8 opacity-90"
                disabled={busy}
                onClick={() => removeMutation.mutate(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-[2/1] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">{t("galleryEmpty")}</span>
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_IMAGE_ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          {t("addPhoto")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
