import { getEstabelecimentos } from "@/lib/mock/estabelecimentos";
import { notFound } from "next/navigation";
import { EstabelecimentoBanner } from "@/components/shared/estabelecimento/EstabelecimentoBanner";
import { AddressMapper } from "@/components/shared/estabelecimento/AddressMapper";
import { ServicesAccordion } from "@/components/shared/estabelecimento/ServicesAccordion";
import { TeamGallery } from "@/components/shared/estabelecimento/TeamGallery";
import { WeekTimetable } from "@/components/shared/estabelecimento/WeekTimetable";
import { ReviewsWall } from "@/components/shared/estabelecimento/ReviewsWall";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EstabelecimentoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EstabelecimentoPage({ params }: EstabelecimentoPageProps) {
  // Awaiting the Promise since Next 15+ mandates route segment parts be promises
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const estabelecimentos = await getEstabelecimentos();
  const estabelecimento = estabelecimentos.find((e) => e.slug === slug);

  if (!estabelecimento) {
    notFound();
  }

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <EstabelecimentoBanner estabelecimento={estabelecimento} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Space - Left Side */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Sobre o Estabelecimento</h2>
              <p className="text-muted-foreground leading-relaxed text-lg lg:max-w-3xl">
                {estabelecimento.descricao}
              </p>
            </section>

            <section>
              <TeamGallery time={estabelecimento.time} />
            </section>

            <section>
              <ServicesAccordion servicos={estabelecimento.servicos} />
            </section>

            <section>
              <ReviewsWall avaliacoes={estabelecimento.avaliacoes} />
            </section>
          </div>

          {/* Sidebar / Sticky Options - Right Side */}
          <div className="space-y-8 lg:sticky lg:top-8 h-fit">
            <AddressMapper localizacao={estabelecimento.localizacao} />
            <WeekTimetable horarios={estabelecimento.horarios} />

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
