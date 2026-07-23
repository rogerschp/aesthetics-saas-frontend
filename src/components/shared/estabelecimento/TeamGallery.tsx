import { Membro } from "@/types";
import type { VarianteComponente } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/routing";

interface TeamGalleryProps {
  time: Membro[];
  variante?: VarianteComponente;
}

function MemberShell({
  membro,
  className,
  children,
}: {
  membro: Membro;
  className: string;
  children: React.ReactNode;
}) {
  if (membro.userId) {
    return (
      <Link href={`/profissional/${membro.userId}`} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

/**
 * TeamGallery
 *
 * Exibição da equipe do estabelecimento com 3 variantes visuais:
 * - padrão: Scroll horizontal com cards verticais (layout original)
 * - alternativo: Grid 2x2 com fotos grandes e descrição expandida
 * - compacto: Lista vertical simples com avatar pequeno
 *
 * Se `userId` vier da API, o card leva à página pública de avaliações.
 */
export function TeamGallery({ time, variante = "padrao" }: TeamGalleryProps) {
  if (!time || time.length === 0) {
    return null;
  }

  if (variante === "padrao") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Nossos Profissionais</h3>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {time.map((membro) => (
            <MemberShell
              key={membro.id}
              membro={membro}
              className="snap-start shrink-0 w-[140px] md:w-[160px] flex flex-col items-center bg-card border border-border/40 rounded-xl p-4 hover:border-primary/50 transition-colors group"
            >
              <Avatar className="w-20 h-20 mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
                <AvatarImage src={membro.foto} alt={membro.nome} className="object-cover" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                  {membro.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm text-center text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {membro.nome}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">
                {membro.role}
              </span>
              {membro.userId && (
                <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  Avaliar
                </span>
              )}
            </MemberShell>
          ))}
        </div>
      </div>
    );
  }

  if (variante === "alternativo") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Nossos Profissionais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {time.map((membro) => (
            <MemberShell
              key={membro.id}
              membro={membro}
              className="flex items-center gap-4 bg-card border border-border/40 rounded-xl p-5 hover:border-primary/50 transition-colors group"
            >
              <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-primary transition-colors shrink-0">
                <AvatarImage src={membro.foto} alt={membro.nome} className="object-cover" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                  {membro.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                  {membro.nome}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5">
                  {membro.role}
                </span>
              </div>
            </MemberShell>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Nossos Profissionais</h3>

      <div className="space-y-2">
        {time.map((membro) => (
          <MemberShell
            key={membro.id}
            membro={membro}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-card/60 transition-colors group"
          >
            <Avatar className="w-9 h-9 border border-border/40 group-hover:border-primary/50 transition-colors shrink-0">
              <AvatarImage src={membro.foto} alt={membro.nome} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {membro.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {membro.nome}
            </span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {membro.role}
            </span>
          </MemberShell>
        ))}
      </div>
    </div>
  );
}
