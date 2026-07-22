import { Estabelecimento, TenantTema } from "../../types";

const mockEstabelecimentos: Estabelecimento[] = [
  {
    id: "1",
    slug: "vintage-club",
    nome: "Vintage Club Barbearia",
    categoria: "barbearia",
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
    categoria: "barbearia",
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
    categoria: "barbearia",
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
    categoria: "barbearia",
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
  },
  {
    id: "5",
    slug: "studio-beaute",
    nome: "Studio Beauté",
    categoria: "salao",
    descricao: "Salão de beleza premium especializado em coloração, tratamentos capilares e estética.",
    banner: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop",
    localizacao: "Rua Oscar Freire, 825 - São Paulo, SP",
    redesSociais: { instagram: "@studiobeaute", facebook: "/studiobeaute" },
    servicos: [
      {
        id: "s5-1",
        titulo: "Cabelo",
        itens: [
          { id: "s5-1-1", descricao: "Corte Feminino", preco: 120.0 },
          { id: "s5-1-2", descricao: "Escova Modeladora", preco: 80.0 },
          { id: "s5-1-3", descricao: "Hidratação Profunda", preco: 95.0 }
        ]
      },
      {
        id: "s5-2",
        titulo: "Coloração",
        itens: [
          { id: "s5-2-1", descricao: "Mechas / Luzes", preco: 280.0 },
          { id: "s5-2-2", descricao: "Tintura Completa", preco: 180.0 },
          { id: "s5-2-3", descricao: "Correção de Cor", preco: 350.0 }
        ]
      },
      {
        id: "s5-3",
        titulo: "Manicure & Pedicure",
        itens: [
          { id: "s5-3-1", descricao: "Manicure Clássica", preco: 45.0 },
          { id: "s5-3-2", descricao: "Pedicure Spa", preco: 75.0 },
          { id: "s5-3-3", descricao: "Combo Mãos + Pés", preco: 100.0 }
        ]
      }
    ],
    time: [
      { id: "t5-1", nome: "Camila Ferraz", role: "Colorista Sênior", foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop" },
      { id: "t5-2", nome: "Juliana Prado", role: "Cabeleireira", foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" },
      { id: "t5-3", nome: "Beatriz Amaral", role: "Manicure", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" }
    ],
    horarios: [
      { diaDaSemana: 0, inicio: "", fim: "", fechado: true },
      { diaDaSemana: 1, inicio: "", fim: "", fechado: true },
      { diaDaSemana: 2, inicio: "10:00", fim: "20:00", fechado: false },
      { diaDaSemana: 3, inicio: "10:00", fim: "20:00", fechado: false },
      { diaDaSemana: 4, inicio: "10:00", fim: "21:00", fechado: false },
      { diaDaSemana: 5, inicio: "10:00", fim: "21:00", fechado: false },
      { diaDaSemana: 6, inicio: "09:00", fim: "18:00", fechado: false }
    ],
    avaliacoes: [
      { id: "a5-1", nota: 5, comentario: "A Camila entendeu exatamente a cor que eu queria. Saí apaixonada!", usuario: { nome: "Marina" } },
      { id: "a5-2", nota: 5, comentario: "Ambiente lindo e atendimento impecável. Recomendo a escova da Ju.", usuario: { nome: "Larissa" } },
      { id: "a5-3", nota: 4, comentario: "Serviço ótimo, só achei os preços um pouco acima da média.", usuario: { nome: "Patrícia" } }
    ]
  },
  {
    id: "6",
    slug: "rosa-cabeleireiros",
    nome: "Rosa & Co Cabeleireiros",
    categoria: "salao",
    descricao: "Tradição em cuidados capilares no coração da Zona Sul.",
    banner: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2070&auto=format&fit=crop",
    localizacao: "Ipanema, Rio de Janeiro - RJ",
    redesSociais: { instagram: "@rosacabeleireiros" },
    servicos: [],
    time: [],
    horarios: [],
    avaliacoes: [
      { id: "a6", nota: 4.7, comentario: "Excelente atendimento", usuario: { nome: "Sofia" } }
    ]
  },
  {
    id: "7",
    slug: "ink-soul-tattoo",
    nome: "Ink & Soul Tattoo Studio",
    categoria: "tatuagem",
    descricao: "Estúdio de tatuagem autoral especializado em fineline, blackwork e realismo.",
    banner: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=2070&auto=format&fit=crop",
    localizacao: "Rua Augusta, 2690 - São Paulo, SP",
    redesSociais: { instagram: "@inksoul.studio", facebook: "/inksoulstudio" },
    servicos: [
      {
        id: "s7-1",
        titulo: "Tatuagens",
        itens: [
          { id: "s7-1-1", descricao: "Tatuagem Pequena (até 10cm)", preco: 350.0 },
          { id: "s7-1-2", descricao: "Tatuagem Média (10-20cm)", preco: 650.0 },
          { id: "s7-1-3", descricao: "Sessão Completa (4h)", preco: 1200.0 }
        ]
      },
      {
        id: "s7-2",
        titulo: "Estilos Especializados",
        itens: [
          { id: "s7-2-1", descricao: "Fineline / Delicada", preco: 400.0 },
          { id: "s7-2-2", descricao: "Blackwork", preco: 550.0 },
          { id: "s7-2-3", descricao: "Realismo (por hora)", preco: 450.0 }
        ]
      },
      {
        id: "s7-3",
        titulo: "Piercings",
        itens: [
          { id: "s7-3-1", descricao: "Piercing na Orelha", preco: 120.0 },
          { id: "s7-3-2", descricao: "Piercing no Septo", preco: 180.0 }
        ]
      }
    ],
    time: [
      { id: "t7-1", nome: "Rafael Cruz", role: "Tatuador Autoral", foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
      { id: "t7-2", nome: "Mariana Lopez", role: "Especialista em Fineline", foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
      { id: "t7-3", nome: "Diego Ramos", role: "Realismo e Blackwork", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" }
    ],
    horarios: [
      { diaDaSemana: 0, inicio: "", fim: "", fechado: true },
      { diaDaSemana: 1, inicio: "", fim: "", fechado: true },
      { diaDaSemana: 2, inicio: "13:00", fim: "21:00", fechado: false },
      { diaDaSemana: 3, inicio: "13:00", fim: "21:00", fechado: false },
      { diaDaSemana: 4, inicio: "13:00", fim: "22:00", fechado: false },
      { diaDaSemana: 5, inicio: "13:00", fim: "22:00", fechado: false },
      { diaDaSemana: 6, inicio: "11:00", fim: "20:00", fechado: false }
    ],
    avaliacoes: [
      { id: "a7-1", nota: 5, comentario: "Rafa é um artista. Traço impecável e atendimento humano.", usuario: { nome: "Guilherme" } },
      { id: "a7-2", nota: 5, comentario: "Estúdio extremamente limpo e profissional. Fineline da Mari é perfeito.", usuario: { nome: "Amanda" } },
      { id: "a7-3", nota: 4, comentario: "Trabalho sensacional, só demoraram pra responder no direct.", usuario: { nome: "Bruno" } }
    ],
    tema: {
      corPrimaria: "#EF4444",
      corSecundaria: "#1C1917",
      corFundo: "#0C0A09",
      corTexto: "#F5F5F4",
      fonte: "Bebas Neue",
      borderRadius: "none",
      secoesLayout: [
        { id: "sec-servicos", tipo: "servicos", visivel: true, ordem: 0, variante: "alternativo" },
        { id: "sec-profissionais", tipo: "profissionais", visivel: true, ordem: 1, variante: "compacto" },
        { id: "sec-avaliacoes", tipo: "avaliacoes", visivel: true, ordem: 2, variante: "padrao" },
        { id: "sec-sobre", tipo: "sobre", visivel: false, ordem: 3, variante: "padrao" },
        { id: "sec-horarios", tipo: "horarios", visivel: true, ordem: 4, variante: "alternativo" },
        { id: "sec-endereco", tipo: "endereco", visivel: true, ordem: 5, variante: "padrao" },
      ],
    } as TenantTema,
  },
  {
    id: "8",
    slug: "norte-tattoo",
    nome: "Norte Tattoo Studio",
    categoria: "tatuagem",
    descricao: "Tradicional old school e neo-tradicional no sul do país.",
    banner: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?q=80&w=2070&auto=format&fit=crop",
    localizacao: "Porto Alegre, RS",
    redesSociais: { instagram: "@nortetattoo" },
    servicos: [],
    time: [],
    horarios: [],
    avaliacoes: [
      { id: "a8", nota: 4.6, comentario: "Trabalho muito caprichado", usuario: { nome: "Henrique" } }
    ]
  }
];

/**
 * Simula uma chamada de API com delay (fetch).
 * Para conectar ao backend real, modifique essa função para bater na API.
 */
export async function getEstabelecimentos(): Promise<Estabelecimento[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEstabelecimentos);
    }, 800); // 800ms simulando tempo de rede
  });
}
