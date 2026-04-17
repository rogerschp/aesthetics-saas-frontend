"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyPlus, Store, MapPin } from "lucide-react";

export function StoreProfileForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Store className="h-5 w-5 text-yellow-500" />
          Perfil da Barbearia
        </h3>
        <p className="text-sm text-zinc-400">
          Essas informações ficarão públicas na sua página. Atente-se ao nome e descrição.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Estabelecimento *</Label>
          <Input 
            id="nome" 
            placeholder="Ex: Classic Barber" 
            {...register("nome")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL amigável) *</Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-800 bg-zinc-900/50 text-zinc-500 sm:text-sm">
              barbershop.com/
            </span>
            <Input 
              id="slug" 
              placeholder="classic-barber" 
              {...register("slug")}
              className="rounded-l-none border-zinc-800 focus-visible:ring-yellow-500/50"
            />
          </div>
          <p className="text-xs text-zinc-500">Apenas letras minúsculas e hifens.</p>
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <textarea
            id="descricao"
            rows={4}
            placeholder="Conte um pouco da história e diferencial do seu espaço..."
            {...register("descricao")}
            className="flex w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner" className="flex items-center gap-2">Banner URL (Opcional)</Label>
          <Input 
            id="banner" 
            placeholder="https://sua-imagem.com/banner.jpg" 
            {...register("banner")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
        </div>

        <div className="pt-4 pb-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-yellow-500" />
            Endereço Completo *
          </h4>
          <div className="space-y-2">
            <Input 
              id="localizacao" 
              placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" 
              {...register("localizacao")}
              className="border-zinc-800 focus-visible:ring-yellow-500/50"
            />
            {errors.localizacao && <p className="text-sm text-destructive">{errors.localizacao.message as string}</p>}
          </div>
        </div>

        <div className="pt-4 pb-2 border-t border-zinc-800/50">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <CopyPlus className="h-4 w-4 text-yellow-500" />
            Redes Sociais
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-xs">Instagram URL</Label>
              <Input 
                id="instagram" 
                placeholder="https://instagram.com/seu.perfil" 
                {...register("redesSociais.instagram")}
                className="border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-xs">Facebook URL</Label>
              <Input 
                id="facebook" 
                placeholder="https://facebook.com/seu.perfil" 
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
