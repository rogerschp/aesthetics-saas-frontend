import { cn } from "@/lib/utils";

/** Banner de erro inline para formulários (substitui `alert()`). */
export function FormErrorBanner({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-destructive/50 bg-destructive/15 px-3 py-2 text-sm font-medium text-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function FormSuccessBanner({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={cn(
        "rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-400",
        className,
      )}
    >
      {message}
    </div>
  );
}
