import { Barbearia } from "../types";

const mockBarbers: Barbearia[] = [
  {
    id: "1",
    slug: "vintage-club",
    nome: "Vintage Club Barbearia",
    descricao: "Barbearia clássica focada no estilo old school e navalha.",
    banner: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
    localizacao: "Avenida Paulista, 1578 - São Paulo, SP",
    redesSociais: { instagram: "@vintageclub", facebook: "/vintageclub" },
    servicos: [
      {
        id: "s1",
        titulo: "Cabelo",
        itens: [
          { id: "s1-1", descricao: "Corte Clássico na Tesoura", preco: 65.0 },
          { id: "s1-2", descricao: "Degradê / Fade", preco: 55.0 },
          { id: "s1-3", descricao: "Corte Infantil (Até 12 anos)", preco: 45.0 }
        ]
      },
      {
        id: "s2",
        titulo: "Barba",
        itens: [
          { id: "s2-1", descricao: "Barba Tradicional c/ Toalha Quente", preco: 45.0 },
          { id: "s2-2", descricao: "Modelagem de Barba", preco: 35.0 },
          { id: "s2-3", descricao: "Pigmentação de Barba", preco: 50.0 }
        ]
      },
      {
        id: "s3",
        titulo: "Combos Essenciais",
        itens: [
          { id: "s3-1", descricao: "Corte Clássico + Barba Tradicional", preco: 100.0 },
          { id: "s3-2", descricao: "Degradê + Penteado Pomada", preco: 70.0 }
        ]
      }
    ],
    time: [
      { id: "t1", nome: "Rogério Silva", role: "Barbeiro Chefe", foto: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" },
      { id: "t2", nome: "Lucas Mattos", role: "Especialista em Degradê", foto: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200&auto=format&fit=crop" },
      { id: "t3", nome: "Thiago Omena", role: "Barbeiro Clássico", foto: "https://images.unsplash.com/photo-1566492031523-87d28ebd1051?q=80&w=200&auto=format&fit=crop" }
    ],
    horarios: [
      { diaDaSemana: 0, inicio: "", fim: "", fechado: true },
      { diaDaSemana: 1, inicio: "09:00", fim: "20:00", fechado: false },
      { diaDaSemana: 2, inicio: "09:00", fim: "20:00", fechado: false },
      { diaDaSemana: 3, inicio: "09:00", fim: "20:00", fechado: false },
      { diaDaSemana: 4, inicio: "09:00", fim: "21:00", fechado: false },
      { diaDaSemana: 5, inicio: "09:00", fim: "21:00", fechado: false },
      { diaDaSemana: 6, inicio: "08:00", fim: "18:00", fechado: false }
    ],
    avaliacoes: [
      { id: "a1", nota: 5, comentario: "O melhor fade que já fiz em São Paulo! Ambiente incrível.", usuario: { nome: "João" } },
      { id: "a1-2", nota: 4, comentario: "Muito bom, mas achei um pouco cheio no sábado.", usuario: { nome: "Marcio", foto: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?q=80&w=200&auto=format&fit=crop" } },
      { id: "a1-3", nota: 5, comentario: "Toalha quente é um show a parte. Recomendo demais o Rogerio.", usuario: { nome: "Felipe" } }
    ]
  },
  {
    id: "2",
    slug: "dom-pedro-barbearia",
    nome: "Dom Pedro Barbearia",
    descricao: "Estilo e sofisticação para o homem moderno.",
    banner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1980&auto=format&fit=crop",
    localizacao: "Rio de Janeiro, RJ",
    redesSociais: { instagram: "@dompedrobarber" },
    servicos: [],
    time: [],
    horarios: [],
    avaliacoes: [
      { id: "a2", nota: 4.8, comentario: "Muito bom", usuario: { nome: "Carlos" } }
    ]
  },
  {
    id: "3",
    slug: "the-gentleman",
    nome: "The Gentleman Barber",
    descricao: "O seu momento de cuidado com atendimento premium.",
    banner: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
    localizacao: "Curitiba, PR",
    redesSociais: { instagram: "@gentlemanbarber" },
    servicos: [],
    time: [],
    horarios: [],
    avaliacoes: [
      { id: "a3", nota: 5, comentario: "Sensacional", usuario: { nome: "Pedro" } }
    ]
  },
  {
    id: "4",
    slug: "black-beard",
    nome: "Black Beard Studio",
    descricao: "Especialistas em barba, cabelo e bigode.",
    banner: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop",
    localizacao: "Belo Horizonte, MG",
    redesSociais: { instagram: "@blackbeard" },
    servicos: [],
    time: [],
    horarios: [],
    avaliacoes: [
      { id: "a4", nota: 4.5, comentario: "Lugar bacana", usuario: { nome: "Lucas" } }
    ]
  }
];

/**
 * Simula uma chamada de API com delay (fetch).
 * Para conectar ao backend real, modifique essa função para bater na API.
 */
export async function getBarbershops(): Promise<Barbearia[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBarbers);
    }, 800); // 800ms simulando tempo de rede
  });
}
