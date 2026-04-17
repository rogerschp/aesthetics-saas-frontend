import { getBarbershops } from "@/lib/mock/barbershops";
import { notFound } from "next/navigation";
import { BarberBanner } from "@/components/shared/barbearia/BarberBanner";
import { AddressMapper } from "@/components/shared/barbearia/AddressMapper";
import { ServicesAccordion } from "@/components/shared/barbearia/ServicesAccordion";
import { TeamGallery } from "@/components/shared/barbearia/TeamGallery";
import { WeekTimetable } from "@/components/shared/barbearia/WeekTimetable";
import { ReviewsWall } from "@/components/shared/barbearia/ReviewsWall";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface BarbeariaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BarbeariaPage({ params }: BarbeariaPageProps) {
  // Awaiting the Promise since Next 15+ mandates route segment parts be promises
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const barbearias = await getBarbershops();
  const barbearia = barbearias.find((b) => b.slug === slug);

  if (!barbearia) {
    notFound();
  }

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <BarberBanner barbearia={barbearia} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Space - Left Side */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Sobre a Barbearia</h2>
              <p className="text-muted-foreground leading-relaxed text-lg lg:max-w-3xl">
                {barbearia.descricao}
              </p>
            </section>

            <section>
              <TeamGallery time={barbearia.time} />
            </section>

            <section>
              <ServicesAccordion servicos={barbearia.servicos} />
            </section>
            
            <section>
              <ReviewsWall avaliacoes={barbearia.avaliacoes} />
            </section>
          </div>

          {/* Sidebar / Sticky Options - Right Side */}
          <div className="space-y-8 lg:sticky lg:top-8 h-fit">
            <AddressMapper localizacao={barbearia.localizacao} />
            <WeekTimetable horarios={barbearia.horarios} />
            
            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Button size="lg" className="w-full font-semibold px-4 py-6 text-primary-foreground shadow-xl shadow-primary/20 group">
                <Calendar className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                <span className="text-base">Agendar Horário</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-50 animate-in slide-in-from-bottom-full duration-500">
        <Button size="lg" className="w-full font-semibold text-primary-foreground">
          <Calendar className="w-5 h-5 mr-2" />
          Agendar Horário
        </Button>
      </div>
    </main>
  );
}
