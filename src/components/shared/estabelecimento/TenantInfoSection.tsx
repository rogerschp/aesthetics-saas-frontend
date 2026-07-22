import { Phone, Globe, Share2, Store } from "lucide-react";
import type { Estabelecimento } from "@/types";

const CATEGORIA_LABEL: Record<string, string> = {
  barbearia: "Barbearia",
  salao: "Salão",
  tatuagem: "Estúdio de tatuagem",
};

export function TenantInfoSection({
  estabelecimento,
}: {
  estabelecimento: Estabelecimento;
}) {
  const phoneDigits = estabelecimento.telefone?.replace(/\D/g, "") ?? "";
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits}` : null;
  const ig = estabelecimento.redesSociais.instagram?.replace(/^@/, "");
  const fb = estabelecimento.redesSociais.facebook;

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
        <Store className="h-6 w-6 text-primary" />
        Sobre o estabelecimento
      </h2>

      <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          {CATEGORIA_LABEL[estabelecimento.categoria] ?? estabelecimento.categoria}
        </p>

        {estabelecimento.descricao ? (
          <p className="text-base leading-relaxed text-foreground">
            {estabelecimento.descricao}
          </p>
        ) : null}

        <ul className="space-y-3 text-sm">
          {waHref && (
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                Contato
              </a>
            </li>
          )}
          {ig && (
            <li>
              <a
                href={
                  ig.startsWith("http")
                    ? ig
                    : `https://instagram.com/${ig.replace(/^@/, "").split("/").pop()}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                Instagram
              </a>
            </li>
          )}
          {fb && (
            <li>
              <a
                href={fb.startsWith("http") ? fb : `https://facebook.com/${fb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                <Share2 className="h-4 w-4 shrink-0 text-primary" />
                Facebook
              </a>
            </li>
          )}
        </ul>

        {!estabelecimento.telefone && !ig && !fb && !estabelecimento.descricao && (
          <p className="text-sm text-muted-foreground">
            Informações de contato ainda não cadastradas.
          </p>
        )}
      </div>
    </section>
  );
}
