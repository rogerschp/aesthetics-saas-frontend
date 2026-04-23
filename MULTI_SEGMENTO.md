# Pivô Multi-Segmento — Plano de Migração

Documento de tracking para a expansão do produto de **barbearia-only** para uma plataforma que atende também **salões de beleza** e **estúdios de tatuagem**. Este é um Living Document operacional que caminha ao lado do `PROJECT.md`. Quando todas as fases estiverem concluídas, o `PROJECT.md` será atualizado (Fase D) e este arquivo poderá ser arquivado.

## Contexto

O produto nasceu focado em barbearias premium. A equipe de produto decidiu expandir para atender salões de beleza e estúdios de tatuagem sem descaracterizar a identidade. A equipe de criativo ainda está trabalhando em um novo nome — por isso o nome "BarberShop" permanece **como marca do produto** (header/footer/landing), mas o **domínio interno** é generalista.

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| Nome do produto | Permanece "BarberShop" até novo nome ser definido pelo time de criativo |
| Paleta visual | Preto + Dourado mantidos |
| Termo guarda-chuva no domínio | `Estabelecimento` (substitui `Barbearia` onde se refere à entidade genérica) |
| Rotas | Migrar `/barbearia/[slug]` → `/estabelecimento/[slug]` e `/painel/barbearia/*` → `/painel/estabelecimento/*` (breaking change aceitável, ainda MVP) |
| Categorias | Union de string literals: `"barbearia" \| "salao" \| "tatuagem"` |
| Estratégia de branches | Uma branch por fase — merge controlado pelo usuário |

---

## Fase A — Categorias + mock data ✅ **CONCLUÍDA**

**Branch:** `feat/categoria-estabelecimento`
**Objetivo:** Modelo de dados suportando os 3 segmentos, sem mexer em nomenclatura.

- [x] Adicionar tipo `CategoriaEstabelecimento = "barbearia" | "salao" | "tatuagem"` em `src/types/index.ts`
- [x] Adicionar campo obrigatório `categoria` no tipo `Barbearia`
- [x] Popular mock data com exemplos dos 3 segmentos:
  - [x] 4 barbearias existentes receberam `categoria: "barbearia"`
  - [x] 2 salões adicionados (Studio Beauté *fleshed out*, Rosa & Co *minimal*)
  - [x] 2 estúdios de tatuagem adicionados (Ink & Soul *fleshed out*, Norte Tattoo *minimal*)
- [x] Corrigir bug de import path pré-existente em `src/lib/mock/barbershops.ts` (`../types` → `../../types`)
- [x] Typecheck limpo

### Tarefa acessória incluída na mesma branch

Mid-flight o usuário pediu para trocar o grid infinito da home por um carousel:

- [x] Instalar shadcn `Carousel` (traz `embla-carousel-react`)
- [x] Criar `src/components/shared/FeaturedCarousel.tsx` (Client Component)
- [x] Atualizar `src/app/(public)/page.tsx` para usar o carousel com limite `MAX_DESTAQUES = 8`
- [x] Ajustar posicionamento das setas para ficarem afastadas dos cards (`-left-10 xl:-left-12`, padding `px-12 xl:px-14` no wrapper)

> **Pendente no controle de versão:** alterações ainda não commitadas. O usuário decide quando commitar/mergear.

---

## Fase B — Rename de domínio `Barbearia` → `Estabelecimento` ✅ **CONCLUÍDA**

**Branch:** `refactor/estabelecimento` (merge em main)
**Objetivo:** Refactor puro de nomenclatura. Nada visual deve mudar exceto URLs.

### Tipos (`src/types/index.ts`)
- [x] Renomear interface `Barbearia` → `Estabelecimento`
- [x] Renomear campos downstream que referenciam "barbearia" (ex: `Agendamento.barbeariaSlug` → `estabelecimentoSlug`, `Usuario.historico[].barbeariaSlug` etc.)

### Rotas (App Router)
- [x] `src/app/(public)/barbearia/[slug]/` → `src/app/(public)/estabelecimento/[slug]/`
- [x] `src/app/(auth)/painel/barbearia/criar/` → `src/app/(auth)/painel/estabelecimento/criar/`
- [x] `src/app/(auth)/painel/barbearia/editar/` → `src/app/(auth)/painel/estabelecimento/editar/`
- [x] Atualizar todos os `<Link href="/barbearia/...">` para `/estabelecimento/...`

### Componentes (`src/components/shared/`)
- [x] `BarberShopCard` → `EstabelecimentoCard`
- [x] `BarberBanner` → `EstabelecimentoBanner` (e pasta `barbearia/` → `estabelecimento/`)
- [x] Atualizar imports de todos os consumidores

### Mock layer
- [x] `src/lib/mock/barbershops.ts` → `src/lib/mock/estabelecimentos.ts`
- [x] `getBarbershops()` → `getEstabelecimentos()`
- [x] Atualizar todos os imports e chamadas

### "BarberShop" que deve **permanecer** (marca do produto)
- [x] Logo/nome no Header
- [x] Copyright no Footer
- [x] Texto da landing `/planos`

### Validação
- [x] `tsc --noEmit` limpo
- [x] `npm run build` passa
- [x] Navegação manual: home, perfil do estabelecimento, painel, cadastro, login

---

## Fase C — Copy e UI multi-segmento ✅ **CONCLUÍDA**

**Branch:** `feat/ui-multi-segmento` (merge em main)
**Objetivo:** Experiência visível reflete que a plataforma atende 3 segmentos.

- [x] Hero reescrito para falar dos 3 segmentos (ou rotação/animação entre eles, a avaliar)
- [x] Badge de categoria no `EstabelecimentoCard` (ícone + rótulo) mantendo preto/dourado
- [x] Copy das páginas públicas: "Barbearia" genérica → "Estabelecimento"
- [x] Landing `/planos` menciona os 3 segmentos
- [x] (Opcional, avaliar) Filtro por categoria na home
- [x] Revisar copy do cadastro e login se mencionam "barbearia"

---

## Fase D — Atualizar `PROJECT.md` ✅ **CONCLUÍDA**

**Branch:** `main`
**Objetivo:** Sincronizar o Living Document com o novo estado.

- [x] Seção **1. Visão Geral**: atualizar público-alvo (barbearias + salões + estúdios de tatuagem)
- [x] Seção **3. Identidade Visual**: dizer que a paleta atende os 3 segmentos
- [x] Seção **4. Arquitetura de Pastas**: refletir rotas renomeadas
- [x] Seção **5. Documentação das Páginas**: atualizar rotas e componentes
- [x] Seção **6. RBAC e Tipagem**: atualizar snippet TypeScript com `Estabelecimento` e `CategoriaEstabelecimento`
- [x] Seção **10. Checklist**: refletir trabalho multi-segmento
- [x] Seção final: atualizar lista de componentes reutilizáveis com os novos nomes
- [x] Arquivar este `MULTI_SEGMENTO.md` ou removê-lo

---

## Estado atual

**Data:** 2026-04-23
**Fase ativa:** D (Concluída)
**Próxima ação:** Processo de pivot finalizado. Este arquivo pode ser arquivado em uma pasta `docs` ou excluído caso o time não queira mantê-lo. Todo o tracking final agora está consolidado no `PROJECT.md`.
