import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Address } from "@/lib/api/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Monta uma linha legível de endereço a partir do DTO da API. */
export function formatAddressLine(address?: Address | null): string {
  if (!address) return ""
  const left = [address.street, address.number].filter(Boolean).join(", ")
  const right = [address.city, address.state].filter(Boolean).join(" - ")
  return [left, right].filter(Boolean).join(" • ")
}

/** Preço vem como string (ex.: "45.00"); formata em BRL. */
export function formatPriceBRL(price: string | number): string {
  const value = typeof price === "string" ? Number(price) : price
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}
