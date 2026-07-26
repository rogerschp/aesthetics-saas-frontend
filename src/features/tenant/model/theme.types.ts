// ============ Theme ============
export enum FonteDisponivel {
  INTER = 'Inter',
  PLAYFAIR = 'Playfair Display',
  ROBOTO = 'Roboto',
  OUTFIT = 'Outfit',
  BEBAS_NEUE = 'Bebas Neue',
  MONTSERRAT = 'Montserrat',
  POPPINS = 'Poppins',
}

export enum BorderRadiusOpcao {
  NONE = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  FULL = 'full',
}

export enum TipoSecao {
  PROFISSIONAIS = 'profissionais',
  HORARIOS = 'horarios',
  SERVICOS = 'servicos',
  AVALIACOES = 'avaliacoes',
  SOBRE = 'sobre',
  ENDERECO = 'endereco',
}

export enum VarianteComponente {
  PADRAO = 'padrao',
  CARDS = 'cards',
  LISTA = 'lista',
  GRID = 'grid',
}

export interface SecaoLayout {
  id: string;
  tipo: TipoSecao | string;
  visivel: boolean;
  ordem: number;
  variante: VarianteComponente | string;
}

export interface TenantThemeData {
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  fonte: FonteDisponivel | string;
  borderRadius: BorderRadiusOpcao | string;
  secoesLayout: SecaoLayout[];
}

export interface TenantThemeResponse {
  tenantId: string;
  theme: TenantThemeData | null;
  plan: string;
}
