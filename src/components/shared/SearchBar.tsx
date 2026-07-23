"use client";

import { Search, MapPin, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  q: string;
  onQChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  useGeo: boolean;
  onToggleGeo: () => void;
  onSubmit: () => void;
  loading?: boolean;
  geoLoading?: boolean;
}

export function SearchBar({
  q,
  onQChange,
  location,
  onLocationChange,
  useGeo,
  onToggleGeo,
  onSubmit,
  loading,
  geoLoading,
}: SearchBarProps) {
  const t = useTranslations("SearchBar");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-2xl sm:flex-row sm:items-center"
    >
      <div className="relative w-full min-w-0 flex-[1.5]">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder={t("placeholderSearch")}
          className="h-11 border-none bg-transparent pl-10 text-base shadow-none focus-visible:ring-0 sm:h-12"
        />
      </div>

      <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

      <div className="relative w-full min-w-0 flex-1">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder={t("placeholderLocation")}
          disabled={useGeo}
          className="h-11 border-none bg-transparent pl-10 text-base shadow-none focus-visible:ring-0 disabled:opacity-60 sm:h-12"
        />
      </div>

      <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleGeo}
          title={t("nearMe")}
          className={cn(
            "h-11 flex-1 gap-2 px-3 text-sm font-normal sm:h-12 sm:flex-none",
            useGeo && "text-primary",
          )}
        >
          {geoLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : useGeo ? (
            <Check className="h-5 w-5" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
          <span className="sm:hidden">{t("nearMe")}</span>
          <span className="hidden sm:inline">{t("nearMe")}</span>
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-11 flex-1 rounded-lg px-6 text-base font-bold sm:h-12 sm:w-auto sm:flex-none sm:px-8"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("button")
          )}
        </Button>
      </div>
    </form>
  );
}
