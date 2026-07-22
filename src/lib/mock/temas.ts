import { TenantTema, SecaoLayout } from "@/types";

/**
 * Layout padrão das seções da página pública.
 * Usado quando o estabelecimento não tem tema customizado.
 */
export const SECOES_LAYOUT_PADRAO: SecaoLayout[] = [
  { id: "sec-sobre", tipo: "sobre", visivel: true, ordem: 0, variante: "padrao" },
  { id: "sec-profissionais", tipo: "profissionais", visivel: true, ordem: 1, variante: "padrao" },
  { id: "sec-servicos", tipo: "servicos", visivel: true, ordem: 2, variante: "padrao" },
  { id: "sec-horarios", tipo: "horarios", visivel: true, ordem: 3, variante: "padrao" },
  { id: "sec-avaliacoes", tipo: "avaliacoes", visivel: true, ordem: 4, variante: "padrao" },
  { id: "sec-endereco", tipo: "endereco", visivel: true, ordem: 5, variante: "padrao" },
];

/**
 * Tema visual padrão do sistema (usado quando não há customização).
 */
export const TEMA_PADRAO: TenantTema = {
  corPrimaria: "#D4AF37",
  corSecundaria: "#1C1C1E",
  corFundo: "#09090B",
  corTexto: "#FAFAFA",
  fonte: "Inter",
  borderRadius: "lg",
  secoesLayout: SECOES_LAYOUT_PADRAO,
};

/** Definição de uma paleta pré-configurada */
export interface PaletaPreDefinida {
  id: string;
  nome: string;
  cores: {
    primaria: string;
    secundaria: string;
    fundo: string;
    texto: string;
  };
}

/**
 * Paletas de cores pré-definidas para seleção rápida.
 * Cada paleta oferece uma identidade visual coerente.
 */
export const PALETAS_PRE_DEFINIDAS: PaletaPreDefinida[] = [
  {
    id: "classico-dourado",
    nome: "Clássico Dourado",
    cores: { primaria: "#D4AF37", secundaria: "#1C1C1E", fundo: "#09090B", texto: "#FAFAFA" },
  },
  {
    id: "moderno-azul",
    nome: "Moderno Azul",
    cores: { primaria: "#3B82F6", secundaria: "#1E293B", fundo: "#0F172A", texto: "#F1F5F9" },
  },
  {
    id: "minimalista",
    nome: "Minimalista",
    cores: { primaria: "#A3A3A3", secundaria: "#262626", fundo: "#171717", texto: "#E5E5E5" },
  },
  {
    id: "verde-floresta",
    nome: "Verde Floresta",
    cores: { primaria: "#22C55E", secundaria: "#14532D", fundo: "#052E16", texto: "#F0FDF4" },
  },
  {
    id: "roxo-neon",
    nome: "Roxo Neon",
    cores: { primaria: "#A855F7", secundaria: "#2E1065", fundo: "#0C0A1A", texto: "#FAF5FF" },
  },
  {
    id: "vermelho-intenso",
    nome: "Vermelho Intenso",
    cores: { primaria: "#EF4444", secundaria: "#450A0A", fundo: "#1A0505", texto: "#FEF2F2" },
  },
];
