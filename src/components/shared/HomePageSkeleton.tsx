import {
  TenantSearchCarouselSkeleton,
} from "@/components/shared/TenantSearchCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Fallback de Suspense / loading da home pública. */
export function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="relative flex min-h-[280px] items-end justify-center bg-muted/40 px-4 pb-10 pt-24 sm:min-h-[320px]">
        <div className="w-full max-w-3xl space-y-3">
          <Skeleton className="mx-auto h-8 w-2/3 max-w-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto max-w-screen-2xl px-4 py-10 sm:py-16">
        <Skeleton className="mb-8 h-8 w-64" />
        <TenantSearchCarouselSkeleton />
      </div>
    </div>
  );
}
