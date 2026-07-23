"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TenantSearchCard } from "@/components/shared/TenantSearchCard";
import type { TenantSearchResult } from "@/lib/api/types";

export function HomeHighlightsCarousel({
  tenants,
}: {
  tenants: TenantSearchResult[];
}) {
  return (
    <Carousel
      opts={{ align: "start", loop: tenants.length > 4 }}
      className="relative w-full px-10"
    >
      <CarouselContent className="-ml-4">
        {tenants.map((tenant) => (
          <CarouselItem
            key={tenant.id}
            className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <TenantSearchCard tenant={tenant} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  );
}
