import { TenantSegment } from "@/lib/api/types";

/** Labels PT para o enum `TenantSegment` (formulários e vitrine). */
export const TENANT_SEGMENT_OPTIONS: {
  value: TenantSegment;
  label: string;
}[] = [
  { value: TenantSegment.BARBERSHOP, label: "Barbearia" },
  { value: TenantSegment.HAIR_SALON, label: "Salão de cabelo" },
  { value: TenantSegment.BEAUTY_SALON, label: "Salão de beleza" },
  { value: TenantSegment.NAIL_STUDIO, label: "Studio de unhas" },
  { value: TenantSegment.TATTOO_STUDIO, label: "Estúdio de tatuagem" },
  { value: TenantSegment.OTHER, label: "Outro" },
];

export function tenantSegmentLabel(
  segment: TenantSegment | null | undefined,
): string | undefined {
  if (!segment) return undefined;
  return TENANT_SEGMENT_OPTIONS.find((o) => o.value === segment)?.label;
}
