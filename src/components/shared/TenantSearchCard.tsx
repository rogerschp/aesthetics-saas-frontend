import { Link } from "@/i18n/routing";
import { Star, MapPin, Crown, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TenantSearchResult } from "@/lib/api/types";

export function TenantSearchCard({ tenant }: { tenant: TenantSearchResult }) {
  const t = useTranslations("SearchCard");
  const rating =
    tenant.totalReviews > 0 ? tenant.averageRating.toFixed(1) : t("new");

  return (
    <Link href={`/estabelecimento/${tenant.slug}`} prefetch={false}>
      <Card className="group flex h-full cursor-pointer flex-col gap-0 overflow-hidden rounded-xl border-border bg-card p-0 transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
        <div className="relative h-40 w-full transform-gpu overflow-hidden bg-muted">
          {tenant.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL dinâmica do tenant (CDN/API)
            <img
              src={tenant.avatarUrl}
              alt={tenant.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
                  {tenant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="absolute right-3 top-3 z-20 flex gap-1.5">
            {tenant.plan.eliteBadge && (
              <Badge className="gap-1 border border-primary/40 bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase text-primary backdrop-blur-md">
                <Crown className="h-3 w-3" /> {t("elite")}
              </Badge>
            )}
            {tenant.plan.regionalHighlight && (
              <Badge className="gap-1 border border-primary/30 bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase text-primary backdrop-blur-md">
                <Sparkles className="h-3 w-3" /> {t("highlight")}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col justify-between p-5 pt-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="line-clamp-1 text-lg font-bold text-foreground">
                {tenant.name}
              </h3>
              {(tenant.city || tenant.distanceKm != null) && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">
                    {tenant.city}
                    {tenant.distanceKm != null &&
                      ` • ${tenant.distanceKm.toFixed(1)} km`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-bold text-foreground">{rating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
