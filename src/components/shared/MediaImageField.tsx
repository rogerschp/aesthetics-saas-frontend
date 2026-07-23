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
  type UploadMediaParams,
} from "@/lib/api/services/media.service";
import { formatApiError } from "@/lib/api/errors";
import { MediaAsset, MediaType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type UploadContext = Omit<UploadMediaParams, "file" | "mediaType">;

interface MediaImageFieldProps {
  label: string;
  hint?: string;
  mediaType: MediaType;
  /** Contexto exigido pelo back (tenantId / professionalId / serviceId). */
  context?: UploadContext;
  value?: string | null;
  onChange: (url: string | null, mediaId?: string) => void;
  /**
   * Após upload, vincula a mídia no domínio (ex.: PATCH /users/me/avatar).
   * Obrigatório para LOGO / USER_AVATAR / AVATAR no fluxo novo.
   */
  onLink?: (media: MediaAsset) => Promise<void>;
  variant?: "square" | "wide" | "cover";
  disabled?: boolean;
  className?: string;
}

export function MediaImageField({
  label,
  hint,
  mediaType,
  context = {},
  value,
  onChange,
  onLink,
  variant = "square",
  disabled,
  className,
}: MediaImageFieldProps) {
  const t = useTranslations("MediaUpload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const media = await mediaService.upload({
        file,
        mediaType,
        ...context,
      });
      if (onLink) {
        await onLink(media);
      }
      return media;
    },
    onSuccess: (media) => {
      setError(null);
      onChange(media.url, media.id);
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

  const busy = uploadMutation.isPending || disabled;
  const previewClass =
    variant === "wide"
      ? "aspect-[3/1] w-full"
      : variant === "cover"
        ? "aspect-[16/9] w-full"
        : "aspect-square w-28";

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/50 bg-muted/20",
          previewClass,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">{t("empty")}</span>
          </div>
        )}
        {uploadMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
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
          {value ? t("replace") : t("upload")}
        </Button>
        {value && !onLink && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {t("remove")}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
