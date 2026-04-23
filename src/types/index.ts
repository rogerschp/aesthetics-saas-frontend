export interface Membro {
  id: string;
  nome: string;
  foto?: string;
  role: string; // ex: "Tatuador", "Barbeiro Chefe" (sem RBAC)
}

export interface ServicoSubtopico {
  id: string;
  descricao: string; // Ex: "Corte na Tesoura"
  preco: number;
}

export interface ServicoTopico {
  id: string;
  titulo: string; // Ex: "Corte", "Tatuagem"
  itens: ServicoSubtopico[];
}

export interface Horario {
  diaDaSemana: number; // 0 = Dom, 1 = Seg ...
  inicio: string;
  fim: string;
  fechado: boolean;
}

export interface Avaliacao {
  id: string;
  usuario: {
    nome: string;
    foto?: string;
  };
  nota: number; // 1-5 estrelas
  comentario: string;
}

export type CategoriaEstabelecimento = "barbearia" | "salao" | "tatuagem";

export interface Estabelecimento {
  id: string;
  slug: string;
  nome: string;
  categoria: CategoriaEstabelecimento;
  descricao: string;
  banner?: string;
  redesSociais: {
    instagram?: string;
    facebook?: string;
  };
  localizacao: string; // String genérica no escopo do MVP mockado
  horarios: Horario[];
  servicos: ServicoTopico[];
  time: Membro[];
  avaliacoes: Avaliacao[];
}

export interface Agendamento {
  id: string;
  estabelecimentoSlug: string;
  estabelecimentoNome: string;
  servicoNome: string;
  data: string; // ISO string
  status: "confirmado" | "pendente" | "cancelado" | "concluido";
  localizacao: string;
  clienteNome?: string;
  clienteTelefone?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  telefone?: string;
  localizacao?: string;
  senha?: string; // Jamais deve transitar fora do escopo de auth real
  dataCriacao: string;
  estatisticas: {
    totalServicos: number;
    totalAvaliacoes: number;
  };
  role: "CLIENT" | "PROFESSIONAL" | "OWNER";
  agendamentosEmAndamento: Agendamento[];
  historico: {
    estabelecimentoSlug: string;
    estabelecimentoNome: string;
    servicoNome: string;
    data: string;
  }[];
}
