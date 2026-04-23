"use client";

import { Barbearia } from "@/types";
import { BarberShopCard } from "@/components/shared/BarberShopCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedCarouselProps {
  estabelecimentos: Barbearia[];
}

export function FeaturedCarousel({ estabelecimentos }: FeaturedCarouselProps) {
  if (estabelecimentos.length === 0) {
    return (
      <div className="w-full text-center py-20 text-muted-foreground">
        Nenhum estabelecimento encontrado na sua região.
      </div>
    );
  }

  return (
    <Carousel
      opts={{ align: "start", dragFree: true }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {estabelecimentos.map((shop) => (
          <CarouselItem
            key={shop.id}
            className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <BarberShopCard barbershop={shop} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex -left-10 xl:-left-12" />
      <CarouselNext className="hidden sm:flex -right-10 xl:-right-12" />
    </Carousel>
  );
}
