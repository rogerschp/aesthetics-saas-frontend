"use client";

import { Agendamento } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MessageCircle, CheckCircle2, CircleDashed, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfessionalTimelineProps {
  agendamentos: Agendamento[];
}

export function ProfessionalTimeline({ agendamentos }: ProfessionalTimelineProps) {
  // Ordenar por data
  const dataOrdenada = [...agendamentos].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const onOpenWhatsApp = (telefone?: string, nome?: string, servico?: string, horario?: string) => {
    if (!telefone) return;
    
    // Tratativa extra se fosse telefone mal inserido
    const cleanedPhone = telefone.replace(/\D/g, "");
    
    const texto = `Olá ${nome || "cliente"}! Sou da equipe da barbearia. Seu horário para *${servico}* às *${horario}* está chegando. Gostaria de confirmar se está a caminho?`;
    const messageEncoded = encodeURIComponent(texto);
    
    window.open(`https://wa.me/${cleanedPhone}?text=${messageEncoded}`, "_blank");
  };

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
        <Clock className="h-10 w-10 text-zinc-600 mb-3" />
        <h4 className="text-lg font-bold text-zinc-300">Agenda Livre</h4>
        <p className="text-zinc-500 text-sm">Nenhum agendamento para hoje.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dataOrdenada.map((age) => {
        const itemDate = new Date(age.data);
        const horario = format(itemDate, "HH:mm");
        const statusDetails = getStatusDetails(age.status);

        return (
          <div key={age.id} className="group flex gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-800/60 transition-colors">
            
            {/* Esquerda: Horário e Status */}
            <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-zinc-800/50 pr-4">
              <span className="text-lg font-black text-white">{horario}</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${statusDetails.colorClass}`}>
                {statusDetails.label}
              </span>
            </div>

            {/* Centro: Infos do Cliente */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-zinc-800 p-1 rounded-full text-zinc-400">
                  <UserIcon className="h-3 w-3" />
                </div>
                <span className="font-bold text-white truncate">{age.clienteNome || "Cliente Visitante"}</span>
              </div>
              <span className="text-sm text-zinc-400 truncate">{age.servicoNome}</span>
            </div>

            {/* Direita: Ações (Botoes) */}
            <div className="flex items-center gap-2 shrink-0">
              {age.status !== "concluido" && age.clienteTelefone && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-none"
                  title="Chamar no WhatsApp"
                  onClick={() => onOpenWhatsApp(age.clienteTelefone, age.clienteNome, age.servicoNome, horario)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              
              {age.status !== "concluido" && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all shadow-none"
                  title="Marcar como Concluído"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}

// Utilitário interno para design do status
function getStatusDetails(status: Agendamento["status"]) {
  switch (status) {
    case "confirmado":
      return { label: "Confirm", colorClass: "text-blue-500" };
    case "pendente":
      return { label: "Pendente", colorClass: "text-yellow-500" };
    case "concluido":
      return { label: "Feito", colorClass: "text-emerald-500" };
    case "cancelado":
      return { label: "Cancel", colorClass: "text-red-500" };
    default:
      return { label: status, colorClass: "text-zinc-500" };
  }
}
