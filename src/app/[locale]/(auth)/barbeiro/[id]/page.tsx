import { getMockUser } from "@/lib/mock/users";
import { notFound } from "next/navigation";
import { ProfessionalTimeline } from "@/components/shared/ProfessionalTimeline";
import { Scissors, TrendingUp, Calendar as CalendarIcon, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

interface BarbeariaProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfissionalDashboardPage({ params }: BarbeariaProps) {
  const t = await getTranslations("BarbeiroDashboard");
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  const user = await getMockUser(userId);

  // Fallback e Controle de Rotas
  if (!user || user.role !== "PROFESSIONAL") {
    notFound(); 
  }

  const { agendamentosEmAndamento } = user;
  
  // Basic analytics pro dashboard
  const concluidosHoje = agendamentosEmAndamento.filter(a => a.status === "concluido").length;
  const pendentesHoje = agendamentosEmAndamento.filter(a => a.status !== "concluido" && a.status !== "cancelado").length;

  return (
    <main className="min-h-screen bg-black pb-24 pt-12">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header Resumo */}
        <section className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-yellow-500/50">
              <Image 
                src={user.foto || "https://i.pravatar.cc/150"} 
                alt={user.nome} 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {t("hello")} {user.nome.split(" ")[0]} 
                <span className="bg-yellow-500 text-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black">
                  {t("proBadge")}
                </span>
              </h1>
              <p className="text-zinc-500">{t("dailySummary")}</p>
            </div>
          </div>
        </section>

        {/* Quick Analytics Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <CalendarIcon className="h-5 w-5 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold text-white content-end">{pendentesHoje}</span>
            <span className="text-xs text-zinc-500 uppercase font-medium">{t("inQueueToday")}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <Scissors className="h-5 w-5 text-emerald-500 mb-2" />
            <span className="text-2xl font-bold text-white content-end">{concluidosHoje}</span>
            <span className="text-xs text-zinc-500 uppercase font-medium">{t("completedToday")}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
            <span className="text-2xl font-bold text-white content-end">{user.estatisticas.totalServicos}</span>
            <span className="text-xs text-zinc-500 uppercase font-medium">{t("totalCuts")}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <UserCircle2 className="h-5 w-5 text-purple-500 mb-2" />
            <span className="text-2xl font-bold text-white content-end">{user.estatisticas.totalAvaliacoes}</span>
            <span className="text-xs text-zinc-500 uppercase font-medium">{t("fiveStarReviews")}</span>
          </div>
        </section>

        {/* Timeline Manager */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{t("activeSchedule")}</h2>
            <span className="text-sm text-zinc-500">{t("today")}</span>
          </div>
          <ProfessionalTimeline agendamentos={agendamentosEmAndamento} />
        </section>

      </div>
    </main>
  );
}
