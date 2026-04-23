import { getMockUser } from "@/lib/mock/users";
import { getEstabelecimentos } from "@/lib/mock/estabelecimentos";
import { AvatarResume } from "@/components/shared/AvatarResume";
import { AnalyticMetrics } from "@/components/shared/AnalyticMetrics";
import { HistoryTimeline } from "@/components/shared/HistoryTimeline";
import { UpcomingAppointments } from "@/components/shared/UpcomingAppointments";
import { EstabelecimentoCard } from "@/components/shared/EstabelecimentoCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, Sparkles, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Meu Perfil | BarberShop",
  description: "Dashboard do cliente com histórico e métricas.",
};

interface PerfilPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PerfilPage({ params }: PerfilPageProps) {
  const resolvedParams = await params;
  const usuario = await getMockUser(resolvedParams.id);
  const estabelecimentos = await getEstabelecimentos();

  if (!usuario) {
    notFound();
  }

  // Pega os top 4 estabelecimentos para a seção de descobertas
  const recomendacoes = estabelecimentos.slice(0, 4);

  return (
    <div className="min-h-screen bg-black pb-20 relative overflow-hidden">
      {/* Background Decorative Efeito */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-28">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Voltar para Início
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="dark:border-zinc-800 dark:hover:bg-zinc-800">
              <Settings className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Resume & Metrics */}
          <div className="lg:col-span-5 space-y-8">
            <section className="animate-in fade-in slide-in-from-left-4 duration-500">
              <AvatarResume usuario={usuario} />
            </section>
            
            <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <AnalyticMetrics usuario={usuario} />
            </section>

            <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-2xl p-6">
                <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Privilégios Bronze
                </h4>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  </div>
                  <p className="text-xs text-zinc-500 text-center">
                    Faltam 6 serviços para o próximo nível (Prata)
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Upcoming & History */}
          <div className="lg:col-span-7 space-y-10">
            <section className="animate-in fade-in slide-in-from-right-4 duration-500">
              <UpcomingAppointments agendamentos={usuario.agendamentosEmAndamento} />
            </section>

            <Separator className="bg-zinc-800/50" />

            <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
              <HistoryTimeline historico={usuario.historico} />
            </section>
          </div>
        </div>

        {/* Discovery Section */}
        <section className="mt-24 pt-12 border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Map className="h-7 w-7 text-yellow-500" />
                Descubra em sua região
              </h2>
              <p className="text-zinc-500 mt-2">Explore novos estilos e estabelecimentos próximos de você.</p>
            </div>
            <Link href="/">
              <Button variant="link" className="text-yellow-500 p-0 font-bold hover:text-yellow-400">
                Ver todos os estabelecimentos →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recomendacoes.map((estabelecimento) => (
              <EstabelecimentoCard key={estabelecimento.id} estabelecimento={estabelecimento} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
