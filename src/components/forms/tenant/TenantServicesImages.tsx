"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { MediaImageField } from "@/components/shared/MediaImageField";
import { catalogService } from "@/lib/api/services/catalog.service";
import { MediaType } from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";

interface TenantServicesImagesProps {
  tenantId: string;
}

/**
 * Imagens de capa por serviço (SERVICE_IMAGE).
 * O back ainda não expõe imageUrl no Service — upload vai ao Cloudinary;
 * preview fica na sessão até existir campo/FK no domínio.
 */
export function TenantServicesImages({ tenantId }: TenantServicesImagesProps) {
  const t = useTranslations("MediaUpload");

  const servicesQuery = useQuery({
    queryKey: ["tenant-edit-services", tenantId],
    queryFn: () => catalogService.list(tenantId),
    enabled: !!tenantId,
  });

  if (servicesQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        {formatApiError(servicesQuery.error)}
      </p>
    );
  }

  const services = (servicesQuery.data ?? []).filter((s) => s.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
          <Scissors className="h-5 w-5 text-yellow-500" />
          {t("serviceImagesTitle")}
        </h3>
        <p className="text-sm text-zinc-400">{t("serviceImagesHint")}</p>
      </div>

      {services.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          {t("noServices")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceImageCard
              key={service.id}
              tenantId={tenantId}
              serviceId={service.id}
              name={service.name}
              label={t("serviceCover", { name: service.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceImageCard({
  tenantId,
  serviceId,
  name,
  label,
}: {
  tenantId: string;
  serviceId: string;
  name: string;
  label: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{name}</p>
      <MediaImageField
        label={label}
        mediaType={MediaType.SERVICE_IMAGE}
        context={{ tenantId, serviceId }}
        value={url}
        onChange={(next) => setUrl(next)}
        variant="cover"
      />
    </div>
  );
}
