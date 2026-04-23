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
      className="inline-grid align-baseline"
      aria-live="polite"
      aria-atomic="true"
    >
      {SEGMENTOS.map((segmento, i) => (
        <span
          key={segmento}
          className={`col-start-1 row-start-1 text-primary drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all duration-500 ease-in-out ${
            i === idx
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none select-none"
          }`}
          aria-hidden={i !== idx}
        >
          {segmento}
        </span>
      ))}
    </span>
  );
}
