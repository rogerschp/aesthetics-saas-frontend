"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyPlus, Store, MapPin, Phone } from "lucide-react";
import { maskCep, maskCnpj, maskPhoneBR } from "@/lib/masks";

export function StoreProfileForm() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const telefoneReg = register("telefone");
  const cepReg = register("endereco.zipCode");
  const cnpjReg = register("cnpj");

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
            {...register("nome")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          {errors.nome && (
            <p className="text-sm text-destructive">
              {errors.nome.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-800 bg-zinc-900/50 px-3 text-zinc-500 sm:text-sm">
              /estabelecimento/
            </span>
            <Input
              id="slug"
              disabled
              {...register("slug")}
              className="rounded-l-none border-zinc-800 opacity-70"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Imutável na API — só definição na criação.
          </p>
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

        <div className="space-y-2">
          <Label htmlFor="banner">Avatar / banner URL</Label>
          <Input
            id="banner"
            placeholder="https://cdn.exemplo.com/logo.jpg"
            {...register("banner")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
        </div>

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
                placeholder="SP"
                {...register("endereco.state")}
                className="border-zinc-800 uppercase"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="zipCode">CEP *</Label>
              <Input
                id="zipCode"
                placeholder="01310-100"
                name={cepReg.name}
                ref={cepReg.ref}
                onBlur={cepReg.onBlur}
                onChange={(e) => {
                  const masked = maskCep(e.target.value);
                  e.target.value = masked;
                  void cepReg.onChange(e);
                  setValue("endereco.zipCode", masked, { shouldValidate: true });
                }}
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
          {errors.endereco &&
            typeof (errors.endereco as { message?: string }).message ===
              "string" && (
              <p className="mt-2 text-sm text-destructive">
                {(errors.endereco as { message?: string }).message}
              </p>
            )}
        </div>

        <div className="border-t border-zinc-800/50 pb-2 pt-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <CopyPlus className="h-4 w-4 text-yellow-500" />
            Redes sociais
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-xs">
                Instagram (handle ou URL)
              </Label>
              <Input
                id="instagram"
                placeholder="seu.perfil"
                {...register("redesSociais.instagram")}
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-xs">
                Facebook (handle ou URL)
              </Label>
              <Input
                id="facebook"
                placeholder="seu.perfil"
                {...register("redesSociais.facebook")}
                className="border-zinc-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
