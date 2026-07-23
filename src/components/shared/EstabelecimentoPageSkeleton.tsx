import { Skeleton } from "@/components/ui/skeleton";

export function EstabelecimentoPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Skeleton className="h-[42vh] min-h-[240px] w-full rounded-none" />
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3 max-w-sm" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-4/5 max-w-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
