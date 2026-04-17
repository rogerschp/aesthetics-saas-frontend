import { Button } from "@/components/ui/button";
import { Check, Scissors, Star, Zap } from "lucide-react";
import Link from "next/link";

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-black pb-24 pt-24">
      {/* Hero */}
      <section className="container mx-auto px-4 max-w-5xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Sua Barbearia no <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Próximo Nível</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
          Gerencie sua equipe, modernize seus agendamentos e seja descoberto por milhares de novos clientes na sua região todos os dias.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 max-w-6xl mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
            <div className="mb-6">
              <Scissors className="h-8 w-8 text-zinc-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Cadeira Única</h3>
              <p className="text-zinc-500 text-sm">Perfeito para barbeiros independentes começando sua jornada digital.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">R$ 49</span>
              <span className="text-zinc-500">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Destaque regional básico
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Até 2 profissionais na equipe
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Painel analítico mensal
              </li>
            </ul>
            <Link href="/painel/barbearia/criar" className="w-full">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 h-12">
                Começar Teste Grátis
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-zinc-900 border border-yellow-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(212,175,55,0.15)] transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              Mais Popular
            </div>
            <div className="mb-6">
              <Star className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Barbearia Pro</h3>
              <p className="text-zinc-400 text-sm">O arsenal completo para espaços que estão escalando seus lucros.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">R$ 129</span>
              <span className="text-zinc-500">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-white text-sm font-medium">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Tudo do plano Cadeíra Única
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Profissionais ilimitados
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Notificações de reserva via WhatsApp
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Prioridade alta nas buscas de clientes
              </li>
            </ul>
            <Link href="/painel/barbearia/criar" className="w-full">
              <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600 h-12 font-bold font-lg shadow-lg shadow-yellow-500/20">
                Assinar Plano Pro
              </Button>
            </Link>
          </div>

          {/* Elite Plan */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
            <div className="mb-6">
              <Zap className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Franquia Elite</h3>
              <p className="text-zinc-500 text-sm">Solução robusta para redes com dezenas de unidades espalhadas.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">Consulte</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Rede de Gestão Multi-lojas
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                API própria para integrações
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Gerente de sucesso dedicado
              </li>
              <li className="flex items-center text-zinc-300 text-sm">
                <Check className="h-5 w-5 text-yellow-500 mr-3 shrink-0" />
                Selo de Franquia Verificada
              </li>
            </ul>
            <Link href="/painel/barbearia/criar" className="w-full">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 h-12">
                Contatar Vendas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 max-w-4xl mt-32 text-center border-t border-zinc-800/50 pt-16">
        <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold mb-8">
          Confiado por mais de 500 espaços no brasil
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white tracking-widest">RAZOR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white relative overflow-hidden flex items-center justify-center">
              <div className="w-2 h-8 bg-black rotate-45"></div>
            </div>
            <span className="text-xl font-black text-white">CLIPPER.IO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif italic text-white pr-2 border-r-2 border-white">B</span>
            <span className="text-xl font-light tracking-[0.2em] text-white">BLADES</span>
          </div>
        </div>
      </section>
    </main>
  );
}
