# 💈 BarberShop SaaS - Documentação do Projeto

Este documento serve como referência central para o desenvolvimento do front-end do BarberShop. Ele foi concebido para guiar o desenvolvimento com padronização e qualidade, e precisa ser atualizado continuamente (Living Document) sempre que novas decisões arquiteturais forem tomadas e novos componentes forem desenvolvidos.

## 1. Visão Geral do Produto
O **BarberShop** (nome provisório) é uma plataforma SaaS multi-tenant que conecta estabelecimentos de beleza e estética (barbearias, salões de beleza e estúdios de tatuagem) e clientes, com funcionalidades de busca e agendamento de serviços, inspirada em arquiteturas de sistemas globais de sucesso (ex: Booksy).
- **Público-alvo:** Proprietários de barbearias, salões de beleza e estúdios de tatuagem que buscam focar no segmento premium, e clientes finais da mesma natureza.
- **Problema que resolve:** Moderniza o processo de gestão, agendamento de equipe e visibilidade digital das barbearias, oferecendo aos clientes uma interface robusta e de alta conversão.
- **Escopo MVP Atual:** Construção do **front-end mockado**. O back-end já se encontra concluído, portanto, a criação desta casca estática já deve preparar o terreno de interface e tipos e a estratégia para integração futura com API REST.

## 2. Stack Tecnológica e Justificativas
- **Next.js 14 (App Router):** Roteamento altamente flexível, gestão otimizada de server components reduzindo envio de JavaScript para o cliente, beneficiando o tempo de carregamento perceptível e o ranqueamento por buscadores (SEO) de páginas públicas.
- **NextAuth.js:** Solução canônica e flexível de ecossistemas Next para gerenciar ciclos de vida de autenticação antes de delegar a credencial via API interna.
  > **⚠️ NOTA IMPORTANTE SOBRE AUTENTICAÇÃO E SESSÃO (MVP):** No momento, o MVP do Front-end utiliza o `localStorage` do navegador para injetar uma chave "fake" (`@barbershop:user`) e simular o estado de "usuário logado". Esta decisão visa entregar uma UX ágil na fase inicial. **Implementação Futura Obrigatória:** Quando o back-end definitivo for integrado, esta lógica no cliente deve ser integralmente substituída pelo **NextAuth**, manipulando cookies de sessão segurados (`httpOnly`) no servidor, evitando brechas de persistência indevida e garantindo segurança canônica nas rotas do Next.js.
- **Tailwind CSS:** Rapidez de desenvolvimento via design baseado em utilitários, diminuindo gargalos na orquestração de arquivos CSS puros, possibilitando tematização agilizada.
- **shadcn/ui:** Componentização UI sem atrito de vendor lock-in. Abstrai a acessibilidade via Radix UI e possibilita customizar cada componente até a medula com precisão.
- **TypeScript:** Contratos estritos facilitando o tracking de erros e manutenção entre features (essencial por se tratar de múltiplos usuários e dados sensíveis de horários).
- **Zod:** Garantia de segurança via parsing e validação rigorosa dos formulários e APIs simuladas.

## 3. Identidade Visual e Design System
O visual das interfaces exige uma pegada de sistema Premium. Interface simples e que transmita profissionalismo e autoridade (focada em excelência e luxo, atendendo perfeitamente barbearias, salões de beleza e estúdios de tatuagem).

- **Fundo / Base:** **Preto** (`bg-black` ou variações de `zinc` muito escuras na paleta de cor).
- **Destaque / Interação:** **Dourado** (`Gold`) para ações positivas principais (CTAs, alertas visuais, indicações premium, ícones de rating estrelar, borda focus).
- **Contraste / Texto:** **Branco** ou gelo escuro (`gray-100` a `gray-400`); Evita-se saturação total excessiva na cor da tipografia base.
- **Estética:** Menos é mais. Fontes bem dimensionadas, espaçamentos generosos para evitar quebra de blocos visuais, sutilidade de animações e transições. 

## 4. Arquitetura de Pastas (Next.js 14 App Router)

A padronização permite escalar a base de código minimizando complexidades cognitivas.

```text
src/
├── app/
│   ├── [locale]/                 # Raiz das rotas internacionalizadas
│   │   ├── (public)/             # Grupo de rotas não autenticadas
│   │   │   ├── estabelecimento/[slug]/ # Visualizar dados específicos do estabelecimento
│   │   │   ├── cadastro/         # Criação de conta
│   │   │   └── page.tsx          # Home / Busca
│   │   ├── (auth)/               # Grupo de rotas autenticadas
│   │   │   ├── painel/estabelecimento/ # Gestão do Estabelecimento (/criar e /editar)
│   │   │   └── perfil/[id]/      # Histórico cliente
│   │   ├── login/                # Acesso de usuários
│   │   └── layout.tsx            # RootLayout base com injeção de Locale
│   └── api/auth/[...nextauth]/   # Endpoints do NextAuth.js (sem i18n)
├── components/
│   ├── ui/                       # Base components estritos do shadcn/ui
│   ├── forms/                    # Elementos unificados para lidar com hooks complexos
│   └── shared/                   # Componentes criados ad-hoc (ex: Navigation, Footer)
├── lib/
│   ├── mock/                     # Exportadores estáticos e funções async com delay artificial
│   └── utils.ts                  # Helpers, ex: `cn`
└── types/
    └── index.ts                  # Contratos de tipagem principais (TypeScript)
```

## 5. Documentação das Páginas

### [1] `/` — Home (Pública)
- **Objetivo:** Ponto de entrada, focado explicitamente em conversão inicial de cliente ou conversão em lead corporativo do sistema de gestão se houver acesso de estabelecimentos.
- **Componentes Visuais:**
  - `HeroSection`: Descrição clara e agressiva do MVP e botão principal.
  - `SearchInput`: Capaz de identificar input para busca de nome ou região.
  - `BarbershopGrid` / Carousel: Estruturação das unidades (geo simulação nos mockups).
- **Comportamento & UX:** Necessidade de feedback sutil quando o formulário de busca de fato executa uma filtragem na array mockada.

### [2] `/estabelecimento/[slug]` — Página Pública do Estabelecimento
- **Objetivo:** Atuar como o site personalizável e agregador das informações vitais da entidade de serviço para o cliente final.
- **Componentes Visuais:**
  - `EstabelecimentoBanner` & `HeaderCover`: Nome grande, banner longo com avatar encaixado com layout sobreposto, e Action Buttons apontando para as redes e "Denúncia".
  - `AddressMapper`: Componente visual mock de GPS/Google Maps.
  - `InstitutionalText`: Área de mark-up para apresentação descritiva.
  - `TeamGallery`: Componente de exibição de lista para a equipe.
  - `WeekTimetable`: Lista resumindo operação em dias e horários.
  - `ServicesAccordion`: Tabela de serviços com subtópicos aninhados mostrando o preço claramente sem demandar cliques excessivos.
  - `ReviewsWall`: Lista com estrelas e feedbacks visíveis.
- **Comportamento & UX:** Abundância de scroll com clareza dos CTAs (Call to actions flutuantes de agendamentos). Informações densas como descritivos de serviços devem ser colapsáveis.

### [3] `/cadastro` — Criação de conta do Usuário (Pública)
- **Objetivo:** Cadastrar o usuário na plataforma (cliente).
- **Componentes Visuais:**
  - `RegistrationForm`: Campos unificados para (Nome, Email, Foto/URL, Senha, Local/Cep e Tel).
- **Comportamento & UX:** Validação por `Zod` essencial no step-by-step; evitar avanço da página se houver erros nos inputs ou semântica preenchida errada.

### [4] `/perfil/[id]` — Visualização de perfil do Usuário
- **Objetivo:** Área do cliente monitorar ações, rastrear o salão/estúdio preferido, e mensurar as interações.
- **Componentes Visuais:**
  - `AvatarResume`: Apresentando os meta-dados cronológicos.
  - `AnalyticMetrics`: Contadores (serviços marcados e comentários realizados).
  - `HistoryTimeline`: Fila de tickets do que já foi completado no sistema.
- **Dados Mock Necessários:** Objeto de usuário englobando instâncias vinculadas a arrays de histórico estático.

### [5] `/painel/estabelecimento/criar` — Criação do estabelecimento (Root/Dono)
- **Objetivo:** Admissão e onboarding no multi-tenant, permitindo configurar a loja.
- **Componentes Visuais:**
  - `StoreProfileForm`: Controle unificado das infos básicas (nome/capa/redes).
  - `HoursInputRepeater`: Lista de sete instâncias de inputs de horário configuráveis.
  - `ServiceHierarchyBuilder`: Montador interativo de árvore (Tópico -> Subtópico + $$$).
  - `TeamBuilder`: Inserção contínua e lista para Roles criadas ao vivo pelo responsável.
- **Comportamento & UX:** O usuário depara-se com um formulário de extrema responsabilidade, portando o save state das seções precisa ser gradativo (sugere-se design baseado em Steps/Tabs).

### [6] `/painel/estabelecimento/editar` — Edição do estabelecimento (Root/Dono)
- **Objetivo:** Manipular ou reciclar o estado do setup gerado outrora. 
- **Comportamento & UX:** Reúso irrestrito de formulários da rota de criação e popular o `defaultValue`/`value` das props com os dados que retornam (visualmente do mock) do back-end para mitigar código dobrado.

### [7] `/login` — Login do sistema
- **Objetivo:** Tela canônica NextAuth via provider Credentials simulando login via e-mail e password. Link redirecionando ao formulário `/cadastro`.

## 6. Papéis do Sistema (RBAC) e Tipagem

Para mantermos a consistência da experiência global do sistema, definimos três atores primários, isolados por nível de acesso:
1. **CLIENT (Cliente Final):** Usuário comum focado em consumir o serviço. Seu espaço de interação concentra-se em buscar barbearias na Home (`/`) e administrar o próprio perfil (`/perfil/[id]`).
2. **PROFESSIONAL (Barbeiro/Tatuador):** Funcionário(a) pertencente a um Tenant. Interação estrita para administrar o próprio dia na rota (`/barbeiro/[id]`), controlando a fila ou pegando o contato do cliente listado na vez.
3. **OWNER (Dono/Gerente):** Administrador soberano do Tenant SaaS. Possui privilégios de Setup de Loja (`/painel/barbearia/criar`) e visualização gerencial global da fila de todos os profissionais.

As chaves do ecossistema base de negócios devem residir em `src/types/index.ts`.

```typescript
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
```

## 7. Estratégia de Mock Data
- Dados falsos consistentes devem ser alocados num file base visando prover robustez (`src/lib/mock/...`). 
- Em server components, usar o padrão de simular requisições de API via async promises artificialmente paralisadas por `setTimeout` para facilitar transição pro framework `fetch` global.
- Evitar ao máximo acoplar o arquivo estático da view interna ao front component `page.tsx`.

## 8. Convenções de Código

1. **Clean Code & Manutenção:** Preferir simplicidade. Um código legível é mil vezes melhor que complexidade desnecessária para performar micro optimals. Nomenclatura explícita de variáveis (evitar siglas como `dt`, prefira `dataCriacao`).
2. **Componentização Restrita:** Crie componentes independentes focados em tarefas e que resolvam único propósito para evitar prop drilling exaustivo.
3. **Idiomas UI:** Todo material entregável ao usuário é exposto em PT-BR.
4. **Resguardos Validation:** Nenhum request interativo escapa do framework Zod para validações do que for imputado pelos fields visuais base (shadcn forms).
5. **Reuso:** Antes de montar componentes novos complexos, certifique e valide as bases do Shadcn e a própria lista descritiva que constará infra neste projeto.
6. **Atualização do Arquivo:** Sempre que se abstrair algo em um Componente reutilizável para escopo de visualização (Cards, Avatares Complexos, Selectors), a Lista de Componentes deve ser retro-alimentada neste `PROJECT.md` conforme requisitado pelas diretrizes. Registre decisões estáticas.

## 9. Roadmap Pós-MVP
- Integração estrita dos contratos Type em interfaces de rede (`Fetch`/`Axios`) consumindo a API REST oficial.
- Gestão e aprofundamento das "Roles Livres" em roles com RBAC em `jwt/sessions` reais da plataforma se necessário para módulos posteriores.
- Sistema transacional de agendamento acoplado com gateway local e webhooks para travar ocupação.

## 10. Progresso do Projeto (Checklist)

### FASE 1: Setup e Infraestrutura
- [x] Configuração inicial do projeto (Next.js 14, Tailwind, TypeScript)
- [x] Setup do shadcn/ui e variáveis globais do tema
- [x] Tipagem principal das entidades (`Barbearia`, `Usuario`, etc.)
- [x] Setup de dados Mock (`src/lib/mock/...`)

### FASE 2: Páginas Públicas (MVP Frontend)
- [x] Rota `/` — Home / Busca
  - [x] `Header` de navegação principal
  - [x] `HeroSection` com estilo premium escuro e dourado
  - [x] `SearchBar` para filtro
  - [x] `BarberShopCard` e listagem na home com grid responsivo
- [x] Rota `/barbearia/[slug]` — Perfil da Barbearia
  - [x] Banner e apresentação (`BarberBanner`, `HeaderCover`)
  - [x] Componente visual de Endereço/Mapa (`AddressMapper`)
  - [x] Equipe (`TeamGallery`) e Horários de funcionamento (`WeekTimetable`)
  - [x] Tabela de preços e serviços (`ServicesAccordion`)
  - [x] Parede de comentários/Avaliações (`ReviewsWall`)

### FASE 3: Autenticação e Perfis (MVP Frontend)
- [x] Rota `/cadastro` — Criação de conta do Cliente
  - [x] `RegistrationForm` com validação Zod
- [x] Rota `/login` — Autenticação do sistema
- [x] Rota `/perfil/[id]` — Dashboard do cliente final
  - [x] Histórico de agendamentos (`HistoryTimeline`)
  - [x] Resumo do perfil e métricas (`AvatarResume`, `AnalyticMetrics`)

### FASE 4: Painel do Proprietário (SaaS Tenant)
- [x] Rota `/painel/estabelecimento/criar` — Setup inicial do lojista
  - [x] Formulário unificado de dados de loja (`StoreProfileForm`)
  - [x] Gestão de expedientes (`HoursInputRepeater`)
  - [x] Montador de serviços (`ServiceHierarchyBuilder`)
  - [x] Gestor de membros da equipe (`TeamBuilder`)
- [x] Rota `/painel/estabelecimento/editar` — Gerenciamento contínuo do estabelecimento

### FASE 5: Portal do Profissional (Agenda e Rotina)
- [x] Rota `/barbeiro/[id]` — Dashboard do Colaborador
  - [x] Timeline de agendamentos pendentes do dia/semana.
  - [x] Integração UI com botão de aprovação rápida e acionador de WhatsApp do cliente.
  - [x] Gestão de status de apontamentos (Concluído/No Show).

### FASE 6: Dashboards Gerenciais e Vitrine SaaS
- [x] Rota `/planos` — Landing page B2B vendendo o sistema para os Estabelecimentos.
- [x] Rota `/painel` — Dashboard Master do proprietário
  - [x] Visualização geral de caixa, agendamentos da equipe inteira.
  - [x] Resoluções analíticas.

### FASE 7: Pivot Multi-Segmento (Concluída)
- [x] Expansão do modelo de dados para Salões de Beleza e Estúdios de Tatuagem
- [x] Refatoração de rotas e nomenclatura (Barbearia -> Estabelecimento)
- [x] Atualização de copy, herói e cards para refletir múltiplos segmentos

### FASE 8: Internacionalização (i18n)
- [ ] Configuração do `next-intl` e middleware de locale (`/pt`, `/en`, `/es`)
- [ ] Dicionários de Tradução para toda a interface estática
- [ ] Componente seletor de idiomas (`LanguageSwitcher`)
- [ ] Refatoração das páginas e componentes para usar chaves de tradução dinâmicas

---

## 🏗️ Lista de Componentes Reutilizáveis a Documentar

> Documente abaixo os componentes que forem sendo criados e incluam suas justificativas de negócio/técnicas, conforme as regras de desenvolvimento do MVP.

- **`[Header]`**: Cabeçalho de navegação fixa com opções primárias de "Entrar/Cadastrar". Usado na rota pública (App wrapper base/home).
- **`[SearchBar]`**: Input agnóstico para pesquisa e localização, envelopando tipografia e os inputs textuais para reutilização (Home primariamente).
- **`[HeroSection]`**: Vitrine primária (banner) visando gerar conversão no cliente apresentando um forte call to action agregado junto à *SearchBar*. Escopo da `/`.
- **`[EstabelecimentoCard]`**: Componente visual unificado para listar o estabelecimento resumidamente em grades/carousel. Ele integra avatar dinâmico, badge de categoria (barbearia/salão/tatuagem) e sistema estático de medições por nota.
- **`[EstabelecimentoBanner]`**: Capa do estabelecimento com título e métricas gerais (usado em `/estabelecimento/[slug]`), traz botões sociais em um layout herói com overlay premium.
- **`[FeaturedCarousel]`**: Container de slides para exibir estabelecimentos em destaque, utilizando Embla Carousel, substituindo o grid infinito.
- **`[RotatingSegmentWord]`**: Componente para animar a troca de palavras-chave no Hero ("Barbearia", "Salão", "Estúdio") reforçando o novo modelo multi-segmento.
- **`[AddressMapper]`**: Card emulando simulação visual de mapa com pino CSS pulsante e box informativo sobre local. Centraliza as referências de contato.
- **`[ServicesAccordion]`**: Listagem de tabela de preços expansiva baseada nos primitivos de componentes Base UI (shadcn), segmentada por categorias baseadas na hierarquia do serviço.
- **`[TeamGallery]`**: Lista de scroll horizontal fluida (snap scroll mobile/desktop) para mapear fotos de membros e cargos sem ocupar o view port extenso na vertical.
- **`[WeekTimetable]`**: Relógio/Lista com base dinâmica de dia realçavel com badge 'Hoje', e com layout estritamente de dados de funcionamento diário.
- **`[ReviewsWall]`**: Componente visual massivo focado em Social Proof exibindo comentários com Stars visuais iterativos em Grid Layout adaptativo.
- **`[RegistrationForm]`**: Formulário blindado com `zod` e `react-hook-form` simulando a criação da conta em step único.
- **`[LoginForm]`**: Formulário focado em conversão de login em `/login`, reaproveitando os hooks de forms para UX coesa e ágil.
- **`[AvatarResume]`**: Componente principal do dashboard do cliente que compila as informações estáticas e a data de ingresso.
- **`[AnalyticMetrics]`**: Exibição dos KPIs macro do cliente (quantos agendamentos concluídos, avaliações) com design em grid e iconografia de destaque.
- **`[HistoryTimeline]`**: Timeline vertical e minimalista utilizando CSS para conectar as etapas de uso do cliente pregressas, informando o dia e estabelecimento onde o serviço foi executado.
