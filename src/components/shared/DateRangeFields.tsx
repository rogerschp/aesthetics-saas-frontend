"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Diferença inclusiva em dias entre duas datas `yyyy-MM-dd`. */
export function daysInclusive(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

export function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultRange(daysBack = 0, daysForward = 0): {
  from: string;
  to: string;
} {
  const today = todayISO();
  return {
    from: shiftISO(today, -daysBack),
    to: shiftISO(today, daysForward),
  };
}

interface DateRangeFieldsProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  fromLabel: string;
  toLabel: string;
  /** Se definido, mostra aviso quando o intervalo for inválido/grande. */
  maxDays?: number;
  rangeError?: string | null;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
}

export function DateRangeFields({
  from,
  to,
  onFromChange,
  onToChange,
  fromLabel,
  toLabel,
  maxDays,
  rangeError,
  onClear,
  clearLabel,
  className,
}: DateRangeFieldsProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="range-from" className="mb-1.5 block text-sm">
            {fromLabel}
          </Label>
          <Input
            id="range-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </div>
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="range-to" className="mb-1.5 block text-sm">
            {toLabel}
          </Label>
          <Input
            id="range-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onToChange(e.target.value)}
          />
        </div>
        {onClear && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {clearLabel ?? "Limpar"}
          </Button>
        )}
      </div>
      {rangeError && (
        <p className="mt-2 text-sm text-destructive">{rangeError}</p>
      )}
      {maxDays != null && from && to && !rangeError && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {daysInclusive(from, to)} / {maxDays} dias
        </p>
      )}
    </div>
  );
}
