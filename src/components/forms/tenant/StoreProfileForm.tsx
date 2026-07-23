"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, MapPin, Phone } from "lucide-react";
import { maskCep, maskCnpj, maskPhoneBR } from "@/lib/masks";
import { MediaImageField } from "@/components/shared/MediaImageField";
import { MediaType } from "@/lib/api/types";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

interface StoreProfileFormProps {
  /** Na criação o slug é editável; na edição fica bloqueado. */
  slugLocked?: boolean;
  /** Necessário para POST /media/upload (LOGO/BANNER/COVER). */
  tenantId?: string;
}

export function StoreProfileForm({
  slugLocked = true,
  tenantId,
}: StoreProfileFormProps) {
  const t = useTranslations("MediaUpload");
  const queryClient = useQueryClient();
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();

  const telefoneReg = register("telefone");
  const cepReg = register("endereco.zipCode");
  const cnpjReg = register("cnpj");
  const nomeReg = register("nome");
  const slugReg = register("slug");

  const logoUrl = watch("banner") as string | undefined;
  const bannerUrl = watch("bannerWide") as string | undefined;
  const coverUrl = watch("cover") as string | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
          <Store className="h-5 w-5 text-yellow-500" />
          Perfil do estabelecimento
        </h3>
        <p className="text-sm text-zinc-400">
          Dados públicos da vitrine. Slug não é alterável após a criação.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do estabelecimento *</Label>
          <Input
            id="nome"
            placeholder="Ex: Classic Barber"
            name={nomeReg.name}
            ref={nomeReg.ref}
            onBlur={nomeReg.onBlur}
            onChange={(e) => {
              if (!slugLocked) {
                const previousSuggestion = slugify(
                  String(getValues("nome") ?? ""),
                );
                const currentSlug = String(getValues("slug") ?? "");
                void nomeReg.onChange(e);
                if (!currentSlug || currentSlug === previousSuggestion) {
                  setValue("slug", slugify(e.target.value), {
                    shouldValidate: true,
                  });
                }
              } else {
                void nomeReg.onChange(e);
              }
            }}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          {errors.nome && (
            <p className="text-sm text-destructive">
              {errors.nome.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL){slugLocked ? "" : " *"}</Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-800 bg-zinc-900/50 px-3 text-zinc-500 sm:text-sm">
              /estabelecimento/
            </span>
            <Input
              id="slug"
              disabled={slugLocked}
              name={slugReg.name}
              ref={slugReg.ref}
              onBlur={slugReg.onBlur}
              onChange={(e) => {
                const next = slugify(e.target.value);
                e.target.value = next;
                void slugReg.onChange(e);
                setValue("slug", next, { shouldValidate: true });
              }}
              className={`rounded-l-none border-zinc-800 ${slugLocked ? "opacity-70" : "focus-visible:ring-yellow-500/50"}`}
            />
          </div>
          <p className="text-xs text-zinc-500">
            {slugLocked
              ? "Imutável na API — só definição na criação."
              : "Gerado a partir do nome; você pode ajustar antes de concluir."}
          </p>
          {errors.slug && (
            <p className="text-sm text-destructive">
              {errors.slug.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone" className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            Telefone *
          </Label>
          <Input
            id="telefone"
            placeholder="(11) 99999-9999"
            name={telefoneReg.name}
            ref={telefoneReg.ref}
            onBlur={telefoneReg.onBlur}
            onChange={(e) => {
              const masked = maskPhoneBR(e.target.value);
              e.target.value = masked;
              void telefoneReg.onChange(e);
              setValue("telefone", masked, { shouldValidate: true });
            }}
            inputMode="tel"
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">
              {errors.telefone.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ (opcional)</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            name={cnpjReg.name}
            ref={cnpjReg.ref}
            onBlur={cnpjReg.onBlur}
            onChange={(e) => {
              const masked = maskCnpj(e.target.value);
              e.target.value = masked;
              void cnpjReg.onChange(e);
              setValue("cnpj", masked, { shouldValidate: true });
            }}
            inputMode="numeric"
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          {errors.cnpj && (
            <p className="text-sm text-destructive">
              {errors.cnpj.message as string}
            </p>
          )}
        </div>

        {tenantId ? (
          <div className="grid grid-cols-1 gap-6 border-t border-zinc-800/50 pt-4 md:grid-cols-2">
            <MediaImageField
              label={t("logo")}
              hint={t("logoHint")}
              mediaType={MediaType.LOGO}
              context={{ tenantId }}
              value={logoUrl || null}
              onLink={async (media) => {
                await tenantsService.setLogo(tenantId, media.id);
                await queryClient.invalidateQueries({
                  queryKey: ["tenant-edit", tenantId],
                });
                await queryClient.invalidateQueries({ queryKey: ["me-tenants"] });
              }}
              onChange={(url) =>
                setValue("banner", url ?? "", { shouldDirty: true })
              }
              variant="square"
            />
            <MediaImageField
              label={t("banner")}
              hint={t("bannerHint")}
              mediaType={MediaType.BANNER}
              context={{ tenantId }}
              value={bannerUrl || null}
              onChange={(url) =>
                setValue("bannerWide", url ?? "", { shouldDirty: true })
              }
              variant="wide"
              className="md:col-span-2"
            />
            <MediaImageField
              label={t("cover")}
              hint={t("coverHint")}
              mediaType={MediaType.COVER}
              context={{ tenantId }}
              value={coverUrl || null}
              onChange={(url) =>
                setValue("cover", url ?? "", { shouldDirty: true })
              }
              variant="cover"
              className="md:col-span-2"
            />
          </div>
        ) : (
          <p className="rounded-xl border border-border/40 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
            {t("logoAfterCreate")}
          </p>
        )}

        <div className="border-t border-zinc-800/50 pb-2 pt-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <MapPin className="h-4 w-4 text-yellow-500" />
            Endereço (aparece na vitrine e no mapa)
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                {...register("endereco.street")}
                className="border-zinc-800"
              />
              {(errors.endereco as { street?: { message?: string } })?.street && (
                <p className="text-sm text-destructive">
                  {(errors.endereco as { street?: { message?: string } }).street
                    ?.message}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                {...register("endereco.number")}
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                {...register("endereco.complement")}
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                {...register("endereco.city")}
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="state">UF *</Label>
              <Input
                id="state"
                maxLength={2}
                {...register("endereco.state")}
                className="border-zinc-800 uppercase"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="zip">CEP *</Label>
              <Input
                id="zip"
                name={cepReg.name}
                ref={cepReg.ref}
                onBlur={cepReg.onBlur}
                onChange={(e) => {
                  const masked = maskCep(e.target.value);
                  e.target.value = masked;
                  void cepReg.onChange(e);
                  setValue("endereco.zipCode", masked, { shouldValidate: true });
                }}
                placeholder="00000-000"
                inputMode="numeric"
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="country">País *</Label>
              <Input
                id="country"
                {...register("endereco.country")}
                className="border-zinc-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
