import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TenantSearchCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-xl border-border bg-card p-0">
      <Skeleton className="h-40 w-full rounded-none" />
      <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function TenantSearchGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <TenantSearchCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TenantSearchCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="min-w-0 shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
        >
          <TenantSearchCardSkeleton />
        </div>
      ))}
    </div>
  );
}
