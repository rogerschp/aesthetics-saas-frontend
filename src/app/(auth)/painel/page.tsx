import { notFound } from "next/navigation";
import { getMockUser } from "@/lib/mock/users";
import { Scissors, TrendingUp, Users, DollarSign, CalendarX, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// --- MOCK DATA SPECÍFICO DA TELA (Em um MVP Real seria extraído de uma chamada pesada no banco) ---
const KpiMetrics = {
  revenue: { value: "R$ 1.250", change: "+12%", up: true },
  occupancy: { value: "85%", change: "+5%", up: true },
  newClients: { value: "8", change: "-2%", up: false },
  cancellations: { value: "2", change: "Estável", up: true } // Poucos cancelamentos é "bom/up"
};

const TeamPerformance = [
  { id: 1, name: "Carlos Adão", role: "Barbeiro Sênior", avatar: "https://i.pravatar.cc/150?u=carlos", done: 6, total: 8, revenue: "R$ 380", status: "Em Atendimento" },
  { id: 2, name: "Lucas Lima", role: "Especialista Degradê", avatar: "https://i.pravatar.cc/150?u=lucaslima", done: 4, total: 5, revenue: "R$ 200", status: "Livre" },
  { id: 3, name: "Juliana", role: "Terapeuta Capilar", avatar: "https://i.pravatar.cc/150?u=juliana", done: 2, total: 3, revenue: "R$ 240", status: "Pausa (Almoço)" },
  { id: 4, name: "Rafael", role: "Visitante/Trainee", avatar: "https://i.pravatar.cc/150?u=rafael", done: 0, total: 2, revenue: "R$ 0", status: "Ausente" },
];

const GlobalTimeline = [
  { id: "g1", time: "14:00", barber: "Carlos Adão", client: "João", service: "Barba Terapia", price: "R$ 45", status: "Em andamento" },
  { id: "g2", time: "14:00", barber: "Lucas Lima", client: "Pedro", service: "Corte Social", price: "R$ 50", status: "Atrasado" },
  { id: "g3", time: "14:30", barber: "Carlos Adão", client: "Fábio R.", service: "Corte Degradê", price: "R$ 50", status: "Aguardando" },
  { id: "g4", time: "15:00", barber: "Juliana", client: "André", service: "Limpeza Pele", price: "R$ 120", status: "Aguardando" },
  { id: "g5", time: "15:30", barber: "Lucas Lima", client: "Thiago", service: "Corte + Sobrancelha", price: "R$ 65", status: "Aguardando" },
];
// --------------------------------------------------------------------------------------------------

interface PageProps {
  // Poderia aceitar slug da loja num multi-tenant completo
}

export default async function OwnerDashboardPage({}: PageProps) {
  // Simularemos que passamos um middleware que injetou 'own_001' se fosse server fetch real
  // No caso de Auth com next-auth usariamos `await getServerSession()`
  const currentUser = await getMockUser("own_001");
  
  if (!currentUser) notFound();

  return (
    <main className="min-h-screen bg-black pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">

        {/* 1. HEADER & COMANDOS RÁPIDOS */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Visão Geral
              <span className="bg-yellow-500/10 text-yellow-500 text-xs tracking-widest font-bold uppercase px-3 py-1 rounded-full border border-yellow-500/20">
                Sede Principal
              </span>
            </h1>
            <p className="text-zinc-400 mt-1">Bem-vindo(a) de volta, <span className="text-zinc-200 font-medium">{currentUser.nome}</span>. Esse é o pulso da sua barbearia hoje.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/painel/estabelecimento/editar">
              <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800">
                Ajustes da Loja
              </Button>
            </Link>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold shadow-lg shadow-yellow-500/20">
              Gerar Relatório
            </Button>
          </div>
        </section>

        {/* 2. SUPER MÉTRICAS (KPIs) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Receita Estimada" 
            value={KpiMetrics.revenue.value} 
            change={KpiMetrics.revenue.change} 
            up={KpiMetrics.revenue.up} 
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />} 
          />
          <KpiCard 
            title="Ocupação das Cadeiras" 
            value={KpiMetrics.occupancy.value} 
            change={KpiMetrics.occupancy.change} 
            up={KpiMetrics.occupancy.up} 
            icon={<Target className="w-5 h-5 text-blue-500" />} 
          />
          <KpiCard 
            title="Novos Clientes" 
            value={KpiMetrics.newClients.value} 
            change={KpiMetrics.newClients.change} 
            up={KpiMetrics.newClients.up} 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
          />
          <KpiCard 
            title="Furos / Cancelamentos" 
            value={KpiMetrics.cancellations.value} 
            change={KpiMetrics.cancellations.change} 
            up={KpiMetrics.cancellations.up} 
            icon={<CalendarX className="w-5 h-5 text-red-500" />} 
          />
        </section>

        {/* GRIDS INFERIORES: ESQUERDA (EQUIPE) | DIREITA (TIMELINE) */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* 3. MONITORAMENTO DE EQUIPE (Ocupa 2 colunas em telas XL) */}
          <div className="xl:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-500" />
                Desempenho da Equipe
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TeamPerformance.map((member) => {
                const percent = member.total > 0 ? Math.round((member.done / member.total) * 100) : 0;
                let statusColor = "text-zinc-500";
                if (member.status === "Em Atendimento") statusColor = "text-emerald-500";
                if (member.status === "Livre") statusColor = "text-blue-500";
                if (member.status === "Pausa (Almoço)") statusColor = "text-yellow-500";

                return (
                  <div key={member.id} className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                        <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className="font-bold text-zinc-200 truncate">{member.name}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {member.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{member.role}</p>
                      </div>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">Progresso Diário</span>
                        <span className="text-white">{member.done} / {member.total} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/50 flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Lucro Produzido</span>
                      <span className="text-sm font-bold text-emerald-400">{member.revenue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. FLUXO GLOBAL (TIMELINE MESTRA) */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                Dinamismo da Loja
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {GlobalTimeline.map((flow) => {
                const isDelayed = flow.status === "Atrasado";
                const isActive = flow.status === "Em andamento";
                
                return (
                  <div key={flow.id} className={`flex gap-3 p-3 rounded-xl border ${isActive ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black/40 border-zinc-800/60'}`}>
                    <div className="flex flex-col items-center justify-center border-r border-zinc-800/50 pr-3 min-w-[60px]">
                      <span className={`text-sm font-black ${isActive ? 'text-yellow-500' : 'text-zinc-300'}`}>{flow.time}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-sm text-zinc-200 truncate">{flow.client}</span>
                        <span className="text-zinc-600 text-xs">com</span>
                        <span className="font-bold text-sm text-yellow-500/80 truncate">{flow.barber.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 truncate pr-2">{flow.service}</span>
                        {isDelayed && <span className="bg-red-500/10 text-red-500 text-[10px] px-1.5 rounded uppercase font-bold shrink-0">Atraso</span>}
                        {isActive && <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 rounded uppercase font-bold shrink-0">Atendendo</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">Ver fila completa</Button>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

// -----------------------------------------
// Subcomponente de Card Auxiliar
// -----------------------------------------
function KpiCard({ title, value, change, up, icon }: { title: string, value: string, change: string, up: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col transition-all hover:bg-zinc-900">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <div className="p-2 bg-zinc-950 rounded-lg">{icon}</div>
      </div>
      <div className="mt-auto pt-4">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        <div className="flex items-center gap-1.5 mt-2">
          {up ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
          <span className={`text-xs font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>{change}</span>
          <span className="text-xs text-zinc-600">vs ontem</span>
        </div>
      </div>
    </div>
  );
}
