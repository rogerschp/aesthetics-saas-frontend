/** Utilitários de máscara BR (exibição). Envio à API: sempre `digitsOnly`. */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** CEP: 00000-000 */
export function maskCep(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/**
 * Telefone BR: (00) 0000-0000 ou (00) 00000-0000.
 * Se vier com DDI 55, exibe só o nacional.
 */
export function maskPhoneBR(value: string): string {
  let d = digitsOnly(value);
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Dígitos para API: DDI 55 + nacional (10–11) quando o usuário digitou só BR.
 * Já com DDI → mantém até 13 dígitos.
 */
export function phoneToApiDigits(value: string, country = "55"): string {
  let d = digitsOnly(value);
  if (d.startsWith(country) && d.length >= 12) return d.slice(0, 13);
  if (d.length >= 10 && d.length <= 11) return `${country}${d}`;
  return d.slice(0, 15);
}

/** CNPJ: 00.000.000/0000-00 */
export function maskCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
