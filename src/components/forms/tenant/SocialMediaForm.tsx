"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, AtSign, Share2 } from "lucide-react";

/**
 * SocialMediaForm
 *
 * Formulário dedicado para editar as redes sociais do estabelecimento.
 * Separado do StoreProfileForm para ter sua própria seção na sidebar.
 */
export function SocialMediaForm() {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-yellow-500" />
          Redes Sociais
        </h3>
        <p className="text-sm text-zinc-400">
          Conecte suas redes para que clientes encontrem você com facilidade.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="instagram-social" className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-pink-500" />
            Instagram
          </Label>
          <Input
            id="instagram-social"
            placeholder="https://instagram.com/seu.perfil"
            {...register("redesSociais.instagram")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          <p className="text-xs text-zinc-500">
            Cole o link completo do seu perfil no Instagram.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook-social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-500" />
            Facebook
          </Label>
          <Input
            id="facebook-social"
            placeholder="https://facebook.com/seu.perfil"
            {...register("redesSociais.facebook")}
            className="border-zinc-800 focus-visible:ring-yellow-500/50"
          />
          <p className="text-xs text-zinc-500">
            Cole o link completo da sua página no Facebook.
          </p>
        </div>
      </div>
    </div>
  );
}
