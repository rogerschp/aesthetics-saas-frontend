import { HeroSection } from "@/components/shared/HeroSection";
import { BarberShopCard } from "@/components/shared/BarberShopCard";
import { getBarbershops } from "@/lib/mock/barbershops";

export default async function Home() {
  // Chamada de API simulada aguardando o delay real
  const barbearias = await getBarbershops();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />

        <section className="container mx-auto px-4 py-16 max-w-screen-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Destaques na sua Região
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {barbearias.map((shop) => (
              <BarberShopCard key={shop.id} barbershop={shop} />
            ))}
          </div>
          
          {/* Empty State Fallback (se a array vier vazia) */}
          {barbearias.length === 0 && (
            <div className="w-full text-center py-20 text-muted-foreground">
              Nenhuma barbearia encontrada na sua região.
            </div>
          )}
        </section>
      </main>

      <footer className="w-full border-t border-border/40 py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} BarberShop SaaS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
