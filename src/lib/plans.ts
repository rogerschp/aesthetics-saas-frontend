import type { Plan, PlanFeatures, PlanName } from "@/lib/api/types";
import { formatPriceBRL } from "@/lib/utils";

/** Número comercial (DDI+DDD+número). Sem gateway: orçamento via WhatsApp. */
export function getSalesWhatsAppDigits(): string | null {
  const raw = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function buildPlanQuoteMessage(opts: {
  planName: string;
  tenantName?: string | null;
  userName?: string | null;
}): string {
  const lines = [
    "Olá! Gostaria de um orçamento do plano Cyacsys.",
    `Plano de interesse: ${opts.planName}`,
  ];
  if (opts.tenantName) lines.push(`Estabelecimento: ${opts.tenantName}`);
  if (opts.userName) lines.push(`Responsável: ${opts.userName}`);
  lines.push("Ainda não usamos pagamento online — podem me passar as condições?");
  return lines.join("\n");
}

export function planQuoteHref(planName: string, extras?: {
  tenantName?: string | null;
  userName?: string | null;
}): string {
  const msg = buildPlanQuoteMessage({
    planName,
    tenantName: extras?.tenantName,
    userName: extras?.userName,
  });
  const wa = getSalesWhatsAppDigits();
  if (wa) {
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  }
  const subject = encodeURIComponent(`Orçamento plano ${planName} — Cyacsys`);
  const body = encodeURIComponent(msg);
  return `mailto:comercial@cyacsys.com?subject=${subject}&body=${body}`;
}

export function formatPlanPrice(plan: Plan): string {
  const value = Number(plan.price);
  if (Number.isNaN(value) || value <= 0) return "Grátis";
  return formatPriceBRL(value);
}

export function formatBillingCycle(cycle: string): string {
  const c = cycle.toUpperCase();
  if (c === "MONTHLY") return "/mês";
  if (c === "YEARLY") return "/ano";
  if (c === "NONE") return "";
  return cycle ? `/${cycle.toLowerCase()}` : "";
}

const REPORTS_LABEL: Record<PlanFeatures["reports"], string> = {
  NONE: "Sem relatórios",
  BASIC: "Relatórios básicos",
  INTERMEDIATE: "Relatórios intermediários",
  ADVANCED: "Relatórios avançados",
};

const CUSTOM_LABEL: Record<PlanFeatures["customization"], string> = {
  NONE: "Tema padrão",
  BASIC: "Customização básica (cores/fonte)",
  INTERMEDIATE: "Customização intermediária",
  FULL: "Customização total da vitrine",
};

/** Bullets comerciais a partir das features reais da API. */
export function planFeatureBullets(features: PlanFeatures): string[] {
  const bullets: string[] = [];

  if (features.maxProfessionals == null) {
    bullets.push("Profissionais ilimitados");
  } else {
    bullets.push(`Até ${features.maxProfessionals} profissionais`);
  }

  bullets.push(REPORTS_LABEL[features.reports] ?? features.reports);
  if (features.reportExport) bullets.push("Exportação de relatórios");
  bullets.push(features.reviews ? "Avaliações de clientes" : "Sem módulo de avaliações");
  bullets.push(CUSTOM_LABEL[features.customization] ?? features.customization);
  if (features.marketplace) bullets.push("Presença no marketplace");
  if (features.regionalHighlight) bullets.push("Destaque regional na busca");
  if (features.eliteBadge) bullets.push("Selo Elite na vitrine");
  if (features.whatsappNotification) bullets.push("Notificações via WhatsApp");

  return bullets;
}

export function planDisplayName(name: PlanName | string): string {
  const map: Record<string, string> = {
    FREE: "Free",
    STANDARD: "Standard",
    PRO: "Pro",
    ELITE: "Elite",
  };
  return map[String(name)] ?? String(name);
}

export function isPaidPlan(plan: Plan): boolean {
  return Number(plan.price) > 0;
}
