import { Usuario } from "../../types";

export const mockClient: Usuario = {
  id: "cli_001",
  nome: "Lucas Moreira",
  email: "lucas.moreira@example.com",
  foto: "https://i.pravatar.cc/150?u=lucas",
  telefone: "(11) 98765-4321",
  localizacao: "São Paulo, SP",
  dataCriacao: "2023-11-15T10:00:00Z",
  role: "CLIENT",
  estatisticas: {
    totalServicos: 14,
    totalAvaliacoes: 5,
  },
  agendamentosEmAndamento: [
    {
      id: "age_001",
      estabelecimentoSlug: "barbearia-classic",
      estabelecimentoNome: "Classic Barber",
      servicoNome: "Corte Degradê + Barba",
      data: "2024-04-20T10:00:00Z",
      status: "confirmado",
      localizacao: "Av. Paulista, 1000 - São Paulo, SP",
    }
  ],
  historico: []
};

export const mockProfessional: Usuario = {
  id: "pro_001",
  nome: "Carlos Adão",
  email: "carlos@classicbarber.com",
  foto: "https://i.pravatar.cc/150?u=carlos",
  telefone: "(11) 91111-2222",
  localizacao: "São Paulo, SP",
  dataCriacao: "2022-01-10T10:00:00Z",
  role: "PROFESSIONAL",
  estatisticas: {
    totalServicos: 350,
    totalAvaliacoes: 120,
  },
  agendamentosEmAndamento: [
    {
      id: "age_pro_001",
      estabelecimentoSlug: "barbearia-classic",
      estabelecimentoNome: "Classic Barber",
      servicoNome: "Corte na Tesoura + Progressiva",
      data: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), // Hoje 10h
      status: "concluido",
      localizacao: "Av. Paulista, 1000 - São Paulo, SP",
      clienteNome: "Marcos Túlio",
      clienteTelefone: "5511999998888"
    },
    {
      id: "age_pro_002",
      estabelecimentoSlug: "barbearia-classic",
      estabelecimentoNome: "Classic Barber",
      servicoNome: "Corte Degradê",
      data: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), // Hoje 14:30
      status: "confirmado",
      localizacao: "Av. Paulista, 1000 - São Paulo, SP",
      clienteNome: "Fábio R.",
      clienteTelefone: "5511977776666" // Formato puro para href Whatsapp
    },
    {
      id: "age_pro_003",
      estabelecimentoSlug: "barbearia-classic",
      estabelecimentoNome: "Classic Barber",
      servicoNome: "Barba Terapia Completa",
      data: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), // Hoje 16h
      status: "pendente",
      localizacao: "Av. Paulista, 1000 - São Paulo, SP",
      clienteNome: "Alan Silva",
      clienteTelefone: "5511955554444"
    }
  ],
  historico: []
};

export const mockOwner: Usuario = {
  id: "own_001",
  nome: "Roger M.",
  email: "roger@classicbarber.com",
  foto: "https://i.pravatar.cc/150?u=roger",
  telefone: "(11) 99999-9999",
  localizacao: "São Paulo, SP",
  dataCriacao: "2021-05-20T10:00:00Z",
  role: "OWNER",
  estatisticas: {
    totalServicos: 0,
    totalAvaliacoes: 0,
  },
  agendamentosEmAndamento: [],
  historico: []
};

export const allMockUsers = [mockClient, mockProfessional, mockOwner];

// Retorna null por padrão na versão pública, para visualização moca no login pegamos pelo id
export async function getMockUser(id: string): Promise<Usuario | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = allMockUsers.find(u => u.id === id);
      resolve(user || null);
    }, 800);
  });
}
