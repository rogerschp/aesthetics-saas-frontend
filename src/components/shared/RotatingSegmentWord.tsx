"use client";

import { useEffect, useState } from "react";

const SEGMENTOS = [
  "barbearias",
  "salões de beleza",
  "estúdios de tatuagem",
] as const;

const INTERVAL_MS = 2800;

export function RotatingSegmentWord() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((n) => (n + 1) % SEGMENTOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="inline-block align-baseline"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        key={idx}
        className="inline-block text-primary drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        {SEGMENTOS[idx]}
      </span>
    </span>
  );
}
