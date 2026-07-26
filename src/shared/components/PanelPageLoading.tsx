"use client";

import { useEffect, useState } from "react";
import { PanelPageSkeleton } from "@/shared/components/PanelPageSkeleton";

interface PanelPageLoadingProps {
  slowHint: string;
  slowAfterMs?: number;
}

/** Skeleton do painel com dica de "carregamento lento" após um atraso. */
export function PanelPageLoading({
  slowHint,
  slowAfterMs = 2500,
}: PanelPageLoadingProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), slowAfterMs);
    return () => window.clearTimeout(id);
  }, [slowAfterMs]);

  return (
    <div>
      <PanelPageSkeleton />
      {slow ? (
        <p className="mx-auto max-w-sm px-4 pb-10 text-center text-sm text-muted-foreground">
          {slowHint}
        </p>
      ) : null}
    </div>
  );
}
