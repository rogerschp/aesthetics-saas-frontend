import { Usuario } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MapPin, Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AvatarResumeProps {
  usuario: Usuario;
}

export function AvatarResume({ usuario }: AvatarResumeProps) {
  const memberSince = format(new Date(usuario.dataCriacao), "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <Avatar className="h-32 w-32 border-4 border-zinc-800 shadow-xl shadow-black/40">
        <AvatarImage src={usuario.foto} alt={usuario.nome} className="object-cover" />
        <AvatarFallback className="bg-zinc-800 text-3xl font-bold text-yellow-500">
          {usuario.nome.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center md:items-start flex-1 w-full space-y-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-white leading-tight">{usuario.nome}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-yellow-500/20">
              Cliente VIP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-3 w-full pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 text-sm text-zinc-400 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
              <Mail className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="break-all font-medium">{usuario.email}</span>
          </div>
          
          {usuario.telefone && (
            <div className="flex items-center gap-3 text-sm text-zinc-400 group">
              <div className="h-8 w-8 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
                <Phone className="h-4 w-4 text-zinc-500" />
              </div>
              <span className="font-medium whitespace-nowrap">{usuario.telefone}</span>
            </div>
          )}

          {usuario.localizacao && (
            <div className="flex items-center gap-3 text-sm text-zinc-400 group">
              <div className="h-8 w-8 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
                <MapPin className="h-4 w-4 text-zinc-500" />
              </div>
              <span className="font-medium">{usuario.localizacao}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-zinc-400 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
              <Calendar className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="capitalize font-medium">Cadastrado em {memberSince}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
