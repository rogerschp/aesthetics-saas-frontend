# Cyacsys API — Guia de Integração para o Front-end

Documento de referência completa para conectar o front-end à API do back-end (NestJS + Firebase Auth + PostgreSQL).
Todos os endpoints, regras de negócio, payloads (entrada e saída) e tipos estão descritos aqui.

> Use este documento como **fonte única de verdade** para a integração. O Swagger fica em `GET /api` quando a API está rodando **fora de produção**, ou em produção com `EXPOSE_SWAGGER=true` (padrão local: `http://localhost:3000/api`).

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Convenções e autenticação](#2-convenções-e-autenticação) — inclui CORS, rate limit, envelope de erros
3. [Modelos de domínio (TypeScript)](#3-modelos-de-domínio-typescript)
4. [Enums](#4-enums)
5. [Endpoints](#5-endpoints)
   - [5.1 Auth](#51-auth-auth)
   - [5.2 Users](#52-users-users)
   - [5.3 Professional Profile (global)](#53-professional-profile-usersmeprofessional-profile)
   - [5.4 Tenants](#54-tenants-tenants)
   - [5.5 Tenant Members](#55-tenant-members-tenantstenantidmembers)
   - [5.6 Tenant Professionals](#56-tenant-professionals-tenantstenantidtenant-professionals)
   - [5.7 Services](#57-services-tenantstenantidservices)
   - [5.8 Availability](#58-availability)
   - [5.9 Booking](#59-booking)
6. [Códigos de erro de negócio](#6-códigos-de-erro-de-negócio)
7. [Fluxos típicos do front-end](#7-fluxos-típicos-do-front-end)

---

## 1. Visão geral

API REST **multi-tenant** para profissionais de estética (barbearias, tatuadores, manicures, etc.).

Hierarquia de entidades:

```
User (global)
 └── ProfessionalProfile (1:1 — identidade profissional global)
       └── TenantProfessional (1:N — vínculo do profissional com cada tenant)
              ├── WorkingHours / TimeOff / Block / OfferedServices
              └── Booking
Tenant (estabelecimento)
 ├── TenantUser (membership: OWNER / ADMIN / STAFF / BARBER)
 └── Service (catálogo)
```

**Conceitos-chave**

- Um usuário pode ser **cliente e profissional** ao mesmo tempo. Não existe flag `isProfessional`.  
  Detecção no front-end: `user.professionalProfile !== null`.
- Para a agenda e booking, sempre use o ID `tenantProfessional.id` (e **não** `professionalProfile.id`).
- O fuso horário (`tenant.timezone`, IANA) define como `date`/`HH:mm` são interpretados pelo back-end.

---

## 2. Convenções e autenticação

### 2.1 Base URL

```
http://localhost:3000
```

### 2.2 Autenticação

Header obrigatório nas rotas protegidas:

```
Authorization: Bearer <idToken>
```

O `idToken` é um JWT do Firebase Auth, obtido em `POST /auth/login` ou `POST /auth/refresh`.

Tokens revogados (após logout) são rejeitados na validação do Bearer.

### 2.3 CORS (front-end em outro domínio)

Em produção/staging, configure no back-end a variável `CORS_ORIGINS` com origens permitidas separadas por vírgula:

```
CORS_ORIGINS=http://localhost:5173,https://app.seudominio.com
```

Sem essa variável, o CORS fica **desabilitado** (apenas same-origin).  
Headers permitidos: `Authorization`, `Content-Type`, `X-Tenant`.

### 2.4 Rate limiting

Limite global: **60 requisições por minuto por IP**. Ao exceder → **429 Too Many Requests**.

### 2.5 Validação de payloads

- Campos extras no body (não declarados no DTO) → **400** (`forbidNonWhitelisted`).
- Apenas campos documentados abaixo devem ser enviados.
- `telephone` deve ser sempre **string** (não envie como número JSON).

### 2.6 Formato

- Todos os payloads são **JSON** (`Content-Type: application/json`).
- Datas em respostas: ISO 8601 (`2026-03-21T14:00:00.000Z`).
- Datas em inputs: `yyyy-MM-dd` (data civil no fuso do tenant).
- Horários: `HH:mm` 24h (no fuso do tenant).
- Valores monetários (`price`): **string decimal** (`"45.00"`) nas respostas, **number** (`45.0`) nos inputs.
- UUIDs v4.

### 2.7 Envelope de erros

Todas as respostas de erro seguem o formato:

```ts
{
  statusCode: number;
  requestId: string;       // ecoa X-Request-Id se enviado; senão UUID gerado
  timestamp: string;       // ISO 8601
  message: string | string[];
  code?: string;           // BusinessRuleException (regras de negócio)
  error?: string;          // rótulo HTTP (ex.: "Bad Request")
}
```

Erros de validação de DTO (`400`) costumam trazer `message` como **array** de strings.

### 2.8 Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 / 201 | OK / Created |
| 400 | DTO inválido **ou** regra de negócio (`BusinessRuleException`) |
| 401 | Token ausente / inválido / expirado |
| 403 | Sem permissão (papel insuficiente, sem membership ativa, escopo de agenda) |
| 404 | Recurso não encontrado |
| 409 | Conflito (slug duplicado, vínculo duplicado, e-mail em uso) |
| 429 | Rate limit excedido |

### 2.9 Multi-tenant — pipeline de autorização

Toda rota sob `/tenants/:tenantId/...` passa por:

1. `BearerAuthGuard` → resolve `req.user.dbUser`
2. `TenantResolverGuard` / `TenantInterceptor` → resolve `req.tenant`
3. `TenantMembershipGuard` → exige `tenant_users.status === ACTIVE`
4. `TenantRolesGuard` → valida `@TenantRoles` da rota

#### Hierarquia de papéis (roles efetivas)

- **OWNER** ⇒ satisfaz `OWNER`, `ADMIN`, `STAFF`, `BARBER`
- **ADMIN** ⇒ satisfaz `ADMIN`, `STAFF`
- **STAFF** ⇒ satisfaz `STAFF`
- **BARBER** ⇒ satisfaz `BARBER`

#### Escopo do BARBER (availability + booking)

`OWNER / ADMIN / STAFF` podem operar a agenda de **qualquer** `tenantProfessionalId` do tenant.  
`BARBER` só pode operar a **própria** agenda (`professionalProfile.userId === userId logado`). Caso contrário → **403**.

Se o membership do tenant não propagar o papel corretamente, o back-end **nega** acesso (fail-closed), em vez de liberar por padrão.

---

## 3. Modelos de domínio (TypeScript)

Tipos prontos para copiar para o front-end.

```ts
// ============ Address ============
export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;     // 2 caracteres (ex.: "SP")
  zipCode: string;   // formato "00000-000"
  country: string;
  complement?: string;
}

// ============ User ============
export interface User {
  id: string;
  firebaseUid: string | null;
  email: string;
  name: string;
  status: UserStatus;
  role: Role;                    // role global (não confundir com TenantUserRole)
  telephone: string;             // ex.: "5511992834085"
  address: Address | null;
  professionalProfile: ProfessionalProfile | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Tenant ============
export interface Tenant {
  id: string;
  slug: string;                  // imutável após criação
  name: string;
  status: TenantStatus;
  telephone: string;
  cnpj?: string | null;          // 14 dígitos
  socialMedia?: Record<string, string> | null;
  address: Address | null;
  timezone: string;              // IANA, ex.: "America/Sao_Paulo"
}

// ============ Tenant Member (membership) ============
export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  createdAt: string;
}

// ============ Professional Profile (global) ============
export interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode: BookingMode;
  whatsappNumber: string | null; // apenas dígitos
  instagramUsername: string | null; // sem @
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Tenant Professional (vínculo) ============
export interface TenantProfessional {
  id: string;                    // <-- use este ID na URL de agenda/booking
  tenantId: string;
  professionalProfileId: string;
  role: TenantUserRole;
  status: TenantProfessionalStatus;
  joinedAt: string;
  leftAt: string | null;
  createdAt: string;
  professionalProfile: ProfessionalProfile; // sempre aninhado nas respostas
}

// ============ Service ============
export interface Service {
  id: string;
  tenantId: string;
  name: string;                  // único por tenant
  description: string | null;
  price: string;                 // decimal como string, ex.: "45.00"
  durationInMinutes: number;     // >= 5
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Availability ============
export interface WorkingHoursPeriod {
  id: string;
  workingHoursId: string;
  startTime: string;             // "HH:mm"
  endTime: string;               // "HH:mm"
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  periods?: WorkingHoursPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeOff {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  date: string;                  // "yyyy-MM-dd"
  startTime: string | null;      // null = dia inteiro
  endTime: string | null;
  reason: TimeOffReason;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityBlock {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  date: string;                  // "yyyy-MM-dd"
  startTime: string;             // "HH:mm"
  endTime: string;               // "HH:mm"
  reason: BlockReason;
  bookingId: string | null;
  createdAt: string;
}

export interface OfferedService {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  serviceId: string;
  isActive: boolean;
  createdAt: string;
}

export interface AvailableSlotsResponse {
  date: string;                  // "yyyy-MM-dd"
  timezone: string;              // IANA
  slots: string[];               // ["09:00", "09:30", ...]
}

// ============ Booking ============
export interface Booking {
  id: string;
  tenantId: string;
  tenantProfessionalId: string;
  serviceId: string;
  startsAt: string;              // ISO UTC
  endsAt: string;                // ISO UTC
  status: BookingStatus;
  createdByTenantUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Enums

```ts
// users.role (papel global, usado p/ classificação geral)
export enum Role {
  SUPER_ADMIN  = 'super_admin',
  ADMIN        = 'admin',
  CLIENT       = 'client',
  BARBER       = 'barber',
  RECEPTIONIST = 'receptionist',
  MANAGER      = 'manager',
}

export enum UserStatus {
  ACTIVE    = 'ACTIVE',
  INACTIVE  = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum TenantStatus {
  ACTIVE    = 'ACTIVE',
  INACTIVE  = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// Papel POR ESTABELECIMENTO (usado em todas as rotas /tenants/:tenantId/...)
export enum TenantUserRole {
  OWNER  = 'OWNER',
  ADMIN  = 'ADMIN',
  BARBER = 'BARBER',
  STAFF  = 'STAFF',
}

export enum TenantUserStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TenantProfessionalStatus {
  ACTIVE    = 'ACTIVE',
  INACTIVE  = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  LEFT      = 'LEFT',
}

export enum ProfessionalType {
  BARBER           = 'BARBER',
  TATTOO_ARTIST    = 'TATTOO_ARTIST',
  HAIRDRESSER      = 'HAIRDRESSER',
  MANICURE         = 'MANICURE',
  ESTHETICIAN      = 'ESTHETICIAN',
  LASH_DESIGNER    = 'LASH_DESIGNER',
  EYEBROW_DESIGNER = 'EYEBROW_DESIGNER',
}

export enum BookingMode {
  DIRECT_BOOKING = 'DIRECT_BOOKING', // permite agendamento online
  QUOTE_REQUIRED = 'QUOTE_REQUIRED', // exige orçamento → bloqueia draft
  WHATSAPP_ONLY  = 'WHATSAPP_ONLY',  // só via WhatsApp → bloqueia draft
}

export enum BookingStatus {
  DRAFT     = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum DayOfWeek {
  MONDAY    = 'MONDAY',
  TUESDAY   = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY  = 'THURSDAY',
  FRIDAY    = 'FRIDAY',
  SATURDAY  = 'SATURDAY',
  SUNDAY    = 'SUNDAY',
}

export enum TimeOffReason {
  HOLIDAY  = 'HOLIDAY',
  DAY_OFF  = 'DAY_OFF',
  SICK     = 'SICK',
  PERSONAL = 'PERSONAL',
}

export enum BlockReason {
  LUNCH    = 'LUNCH',
  PERSONAL = 'PERSONAL',
  BOOKING  = 'BOOKING', // reservado ao módulo de booking — não enviar manualmente
}
```

---

## 5. Endpoints

---

### 5.1 Auth (`/auth`)

Autenticação via Firebase (e-mail + senha). Logout revoga refresh tokens.

#### POST `/auth/login` — Público

Login com e-mail/senha. Valida no Firebase; usuário precisa existir no banco e estar `ACTIVE`.

**Body**
```ts
{
  email: string;       // formato e-mail
  password: string;    // mínimo 6 caracteres
}
```

**Response 201**
```ts
{
  idToken: string;       // JWT do Firebase para usar como Bearer
  refreshToken: string;
  expiresIn: number;     // segundos
}
```

**Erros**
- `400` dados inválidos
- `401` credenciais inválidas — mensagem genérica: `"Credenciais inválidas"` (não expõe se o e-mail existe)
- `403` usuário não existe no banco ou está inativo

---

#### POST `/auth/refresh` — Público

Renova o `idToken` usando o `refreshToken`.

**Body**
```ts
{ refreshToken: string; }
```

**Response 200** — mesmo shape do `/auth/login`.

**Erros**
- `400` refresh token ausente/inválido
- `401` refresh expirado — mensagem: `"Refresh token inválido ou expirado"`

---

#### POST `/auth/logout` — Bearer

Revoga refresh tokens do usuário autenticado.

**Body** — nenhum

**Response 200**
```ts
{ message: 'Logged out successfully' }
```

---

### 5.2 Users (`/users`)

Usuários globais (identidade base do Firebase).

#### Resumo de autorização

| Rota | Auth | Quem |
|------|------|------|
| `POST /users` | — | Público (cadastro) |
| `GET /users/me` | Bearer | Usuário autenticado |
| `PATCH /users/me` | Bearer | Usuário autenticado (self-service) |
| `GET /users/by-email` | Bearer | `ADMIN` ou `SUPER_ADMIN` (role global) |
| `GET /users/:id` | Bearer | `ADMIN` ou `SUPER_ADMIN` |
| `PATCH /users/:id` | Bearer | `ADMIN` ou `SUPER_ADMIN` |
| `DELETE /users/:id` | Bearer | `ADMIN` ou `SUPER_ADMIN` |

> O `role` global (`users.role`) **não** substitui `TenantUserRole`. Para permissões dentro de um estabelecimento, use sempre o membership em `tenant_users`.

---

#### POST `/users` — Público

Cadastro de novo usuário (banco + Firebase). **Sempre cria com `role = CLIENT`** — não é possível escolher outro papel pelo cadastro público.

**Body** (`RegisterUserDto`)
```ts
{
  email: string;             // e-mail válido, único
  name: string;
  password: string;          // mínimo 6 caracteres
  telephone: string;         // string, ex.: "5511992834085"
  address?: Address;         // opcional
}
```

**Response 201** → `User`

**Erros**: `400` dados inválidos ou campos extras · `409` e-mail em uso

---

#### GET `/users/me` — Bearer

Retorna o usuário autenticado, incluindo `professionalProfile` quando existir.

**Response 200** → `User` · **401** token ausente/inválido/revogado

> Use este endpoint para decidir se o usuário é profissional (`user.professionalProfile !== null`).

---

#### PATCH `/users/me` — Bearer

Atualiza o **próprio** perfil. Alterações de senha são sincronizadas no Firebase.

**Body** (`UpdateMyUserDto`) — todos opcionais:
```ts
{
  name?: string;
  telephone?: string;
  password?: string;         // mínimo 6
  address?: Address;
}
```

Não altera `role` nem `status`.

**Response 200** → `User` · **401** token ausente/inválido

---

#### GET `/users/by-email?email=...` — Bearer + ADMIN/SUPER_ADMIN

Busca usuário por e-mail (uso administrativo).

**Query**: `email` (obrigatório).  
**Response 200** → `User` · **401** / **403** · **404** se não encontrado

---

#### GET `/users/:id` — Bearer + ADMIN/SUPER_ADMIN

Busca usuário por UUID.

**Response 200** → `User` · **401** / **403** · **404** se não encontrado

---

#### PATCH `/users/:id` — Bearer + ADMIN/SUPER_ADMIN

Atualiza usuário (admin; alterações sincronizadas no Firebase).

**Body** (`UpdateUserDto`) — todos os campos opcionais:
```ts
{
  name?: string;
  status?: UserStatus;
  telephone?: string;
  role?: Role;
  password?: string;         // mínimo 6
  address?: Address;
}
```

**Response 200** → `User` · **401** / **403** · **404** se não encontrado

---

#### DELETE `/users/:id` — Bearer + ADMIN/SUPER_ADMIN

Soft delete + desabilita no Firebase.

**Response 200** — corpo vazio. · **401** / **403** · **404** se não encontrado

---

### 5.3 Professional Profile (`/users/me/professional-profile`)

Identidade profissional **global** do usuário autenticado.  
Todas as rotas exigem **Bearer**. Sempre operam sobre o próprio perfil (não há `/users/:id/professional-profile`).

#### Regras de negócio

- **Um único perfil ativo (não deletado)** por usuário. Tentar criar segundo → `400 PROFESSIONAL_PROFILE_ALREADY_EXISTS`.
- `displayName`: obrigatório, máx. 255 caracteres.
- `avatarUrl`: obrigatório, URL válida.
- `professionalType`: enum `ProfessionalType`.
- `bookingMode`: enum `BookingMode`, default = `DIRECT_BOOKING`.
- `whatsappNumber`: opcional, 10–15 dígitos (armazenado só com dígitos).
- `instagramUsername`: opcional, sem `@` (máx. 32).
- `experienceYears`: inteiro `>= 0`.
- `bio`: opcional, máx. 2000 caracteres.

#### POST `/users/me/professional-profile` — Bearer

Cria o perfil global do usuário autenticado.

**Body** (`CreateProfessionalProfileDto`)
```ts
{
  displayName: string;
  avatarUrl: string;
  professionalType: ProfessionalType;
  bookingMode?: BookingMode;          // default DIRECT_BOOKING
  whatsappNumber?: string;
  instagramUsername?: string;
  experienceYears: number;
  bio?: string | null;
}
```

**Response 201** → `ProfessionalProfile`

**Erros**: `400` (`PROFESSIONAL_PROFILE_ALREADY_EXISTS`, `INVALID_EXPERIENCE_YEARS`, `INVALID_WHATSAPP_NUMBER`, `INVALID_INSTAGRAM_USERNAME`)

---

#### GET `/users/me/professional-profile` — Bearer

Retorna o perfil global do usuário autenticado.

**Response 200** → `ProfessionalProfile` · **404** se ainda não criado.

---

#### PATCH `/users/me/professional-profile` — Bearer

Atualiza campos enviados. Para limpar `whatsappNumber` / `instagramUsername` / `bio`, envie `null`.

**Body** — todos opcionais; mesmo shape do create.

**Response 200** → `ProfessionalProfile`

---

#### PATCH `/users/me/professional-profile/deactivate` — Bearer

Define `isActive = false` no perfil global (**não** remove vínculos em tenants — para isso use `PATCH /tenants/.../tenant-professionals/:id/leave`).

**Response 200** → `ProfessionalProfile`

---

### 5.4 Tenants (`/tenants`)

Estabelecimentos (barbearias / studios).

#### Regras de negócio

- **`slug`** é gerado a partir do `name` se omitido; normalizado, único globalmente, **imutável** após criação e **não reutilizado** após soft delete.
- **`timezone`** define como o back-end interpreta `date` + `HH:mm` (default `America/Sao_Paulo`).
- **`telephone`**: string com **10–15 dígitos** e código do país (ex.: `"5511992834085"`). Prefixo `+` opcional. Não use máscara `(11) 99283-4085`.
- **`cnpj`** opcional, 14 dígitos.
- **`socialMedia`** é um objeto livre (`Record<string, string>`).
- Soft delete preserva o slug.

---

#### GET `/tenants/validate-slug?slug=...` — Público

Verifica disponibilidade de slug.

**Response 200**
```ts
{ available: boolean; reason?: 'invalid_format' }
```

---

#### GET `/tenants/by-id/:id` — Público

**Response 200** → `Tenant` · **404** se não encontrado.

---

#### GET `/tenants/by-slug/:slug` — Público

**Response 200** → `Tenant` · **404** se não encontrado.

---

#### POST `/tenants` — Público

Cria tenant **sem** vínculo automático de owner. Prefira `with-owner` para fluxos de cadastro logado.

**Body** (`CreateTenantDto`)
```ts
{
  name: string;
  slug?: string;                            // opcional; gerado se omitido
  telephone: string;                        // 10–15 dígitos, ex.: "5511992834085"
  cnpj?: string;                            // 14 dígitos
  socialMedia?: Record<string, string>;
  address?: Address;
}
```

**Response 201** → `Tenant`  
**Erros**: `400` (slug inválido) · `409` (`slug em uso`)

---

#### POST `/tenants/with-owner` — Bearer

Cria tenant **e** vincula o usuário autenticado como `OWNER` em `tenant_users`. Transação única.

**Body**: mesmo de `POST /tenants`.

**Response 201** → `Tenant`  
**Erros**: `400`, `401`, `409` (slug em uso)

---

#### PATCH `/tenants/:id` — Bearer + OWNER/ADMIN

Atualiza tenant. Todos os campos opcionais.

**Body** (`UpdateTenantDto`)
```ts
{
  name?: string;
  status?: TenantStatus;
  timezone?: string;                        // IANA, máx. 64 chars
  address?: Address;
  telephone?: string;                       // 10–15 dígitos, ex.: "5511992834085"
  cnpj?: string;
  socialMedia?: Record<string, string>;
}
```

**Response 200** → `Tenant`

---

#### DELETE `/tenants/:id` — Bearer + OWNER/ADMIN

Soft delete. **Response 200** — corpo vazio.

---

### 5.5 Tenant Members (`/tenants/:tenantId/members`)

Vínculo `User ↔ Tenant` (papel + status). Todas as rotas exigem **Bearer + membership ativo**.

#### Regras de negócio

- Par `(tenantId, userId)` único → tentativa duplicada → `409`.
- Tenant e usuário precisam existir.
- Remover apaga **apenas o vínculo**, não o `User`.

---

#### POST `/tenants/:tenantId/members` — OWNER, ADMIN

**Body** (`AddMemberToTenantDto`)
```ts
{
  userId: string;          // UUID v4
  role: TenantUserRole;    // OWNER | ADMIN | BARBER | STAFF
}
```

**Response 201** → `TenantMember`  
**Erros**: `404` tenant/usuário · `409` vínculo duplicado

---

#### GET `/tenants/:tenantId/members/:userId` — qualquer membro ativo

**Response 200** → `TenantMember`

---

#### DELETE `/tenants/:tenantId/members/:userId` — OWNER, ADMIN

**Response 200** — corpo vazio.

---

### 5.6 Tenant Professionals (`/tenants/:tenantId/tenant-professionals`)

Vínculo operacional `ProfessionalProfile ↔ Tenant`.  
**Importante:** o `id` retornado por estas rotas é o **`tenantProfessionalId`** que deve ser usado nas URLs de agenda e booking.

#### Regras de negócio

- Único por `(tenantId, professionalProfileId)`.
- Vínculo `LEFT` pode ser **reativado** (novo `joinedAt`).
- `GET ?activeOnly=true` retorna apenas vínculos `ACTIVE` cujo perfil global esteja ativo.
- Auto-vínculo (`POST /me`) exige que o usuário **já tenha perfil global** + membership `BARBER` ou `OWNER` no tenant.

---

#### POST `/tenants/:tenantId/tenant-professionals/me` — BARBER, OWNER

Vincula o perfil profissional do usuário autenticado ao tenant.

**Body**: vazio.

**Response 201** → `TenantProfessional`  
**Erros**: `400 INVALID_TENANT_MEMBERSHIP_ROLE` · `404` (perfil global inexistente)

---

#### POST `/tenants/:tenantId/tenant-professionals` — OWNER, ADMIN, STAFF

Vincula um perfil global ao tenant.

**Body** (`LinkProfessionalToTenantDto`)
```ts
{
  professionalProfileId: string;            // UUID do perfil global
  role: TenantUserRole;                     // tipicamente BARBER ou OWNER
}
```

**Response 201** → `TenantProfessional`  
**Erros**: `404` perfil não encontrado · `409` vínculo duplicado

---

#### GET `/tenants/:tenantId/tenant-professionals` — OWNER, ADMIN, STAFF, BARBER

Lista vínculos com `professionalProfile` aninhado.

**Query**
```ts
{ activeOnly?: 'true' | 'false' }
```

**Response 200** → `TenantProfessional[]`

---

#### GET `/tenants/:tenantId/tenant-professionals/:id` — OWNER, ADMIN, STAFF, BARBER

**Response 200** → `TenantProfessional`

---

#### PATCH `/tenants/:tenantId/tenant-professionals/:id/status` — OWNER, ADMIN

**Body** (`UpdateTenantProfessionalStatusDto`)
```ts
{ status: TenantProfessionalStatus; }       // ACTIVE | INACTIVE | SUSPENDED | LEFT
```

**Response 200** → `TenantProfessional`

---

#### PATCH `/tenants/:tenantId/tenant-professionals/:id/leave` — OWNER, ADMIN, BARBER (próprio)

Encerra o vínculo (`status = LEFT`, `leftAt = now()`).  
BARBER só pode encerrar o **próprio** vínculo.

**Body**: vazio. **Response 200** → `TenantProfessional`

---

### 5.7 Services (`/tenants/:tenantId/services`)

Catálogo do tenant.

#### Regras de negócio

- **Nome único por tenant** entre não-deletados (`SERVICE_NAME_ALREADY_EXISTS`).
- `price >= 0` (até 2 casas decimais).
- `durationInMinutes >= 5`.
- Serviço inativo (`isActive = false`) não entra em `available-slots` nem em booking (`SERVICE_INACTIVE`).
- Para agendar, o serviço precisa estar em **`offered-services`** do profissional.
- BARBER **não** tem acesso a este módulo (criação/listagem de serviços é de gestão).

---

#### POST `/tenants/:tenantId/services` — OWNER, ADMIN

**Body** (`CreateServiceDto`)
```ts
{
  name: string;                             // único por tenant, máx. 255
  description?: string | null;              // máx. 2000
  price: number;                            // >= 0, 2 casas decimais
  durationInMinutes: number;                // >= 5
}
```

**Response 201** → `Service`

---

#### GET `/tenants/:tenantId/services` — OWNER, ADMIN, STAFF

Lista todos (ativos + inativos, **exclui soft-deleted**).

**Response 200** → `Service[]`

---

#### GET `/tenants/:tenantId/services/:id` — OWNER, ADMIN, STAFF

**Response 200** → `Service`

---

#### PATCH `/tenants/:tenantId/services/:id` — OWNER, ADMIN

**Body** (`UpdateServiceDto`) — todos opcionais:
```ts
{
  name?: string;
  description?: string | null;
  price?: number;
  durationInMinutes?: number;
  isActive?: boolean;
}
```

**Response 200** → `Service`

---

#### PATCH `/tenants/:tenantId/services/:id/deactivate` — OWNER, ADMIN

Define `isActive = false`.

**Response 200** → `Service`

---

### 5.8 Availability

**Prefixo:** `/tenants/:tenantId/tenant-professionals/:tenantProfessionalId/...`  
**Papéis:** `OWNER, ADMIN, STAFF, BARBER` (BARBER só na **própria** agenda).

> Use sempre o `id` retornado por `POST .../tenant-professionals/me` ou `POST .../tenant-professionals` — **não** confunda com o `professionalProfile.id` (resultará em 404).

#### Regras gerais

- Configurar agenda **não** valida `bookingMode`. Mesmo profissionais `WHATSAPP_ONLY` podem manter jornada (referência operacional).
- Períodos `[startTime, endTime)` em `HH:mm` no fuso do tenant; **sem sobreposição** no mesmo dia.
- Jornada **ativa** exige ao menos um período.
- Slots seguem `durationInMinutes` do serviço; antecedência mínima = **15 min** (`BOOKING_MIN_LEAD_NOT_MET`).
- A listagem `GET available-slots` **não** desconta horários já com booking DRAFT/CONFIRMED — o conflito é detectado ao criar o draft (ver Booking).

---

#### GET `/.../available-slots`

Lista horários livres no dia, para um serviço.

**Query** (`GetAvailableSlotsQueryDto`)
```ts
{
  serviceId: string;         // UUID
  date: string;              // "yyyy-MM-dd" (no fuso do tenant)
}
```

**Response 200**
```ts
AvailableSlotsResponse {
  date: string;              // "yyyy-MM-dd"
  timezone: string;          // IANA
  slots: string[];           // ["09:00", "09:30", ...]
}
```

**Pré-condições internas:** vínculo `ACTIVE`, perfil global ativo, serviço ativo, link `offered-services` ativo, jornada do dia ativa com períodos.

---

#### Offered services (vínculo profissional ↔ serviço)

Necessários para `available-slots` e booking funcionarem.

##### GET `/.../offered-services`

**Response 200** → `OfferedService[]`

##### POST `/.../offered-services`

**Body** (`CreateProfessionalServiceLinkDto`)
```ts
{ serviceId: string; }                      // UUID
```

**Response 201** → `OfferedService`

##### PATCH `/.../offered-services/:linkId`

**Body** (`UpdateProfessionalServiceLinkDto`)
```ts
{ isActive?: boolean; }
```

##### DELETE `/.../offered-services/:linkId`

**Response 200** — corpo vazio.

---

#### Working hours (jornadas semanais)

Uma jornada por `DayOfWeek` por profissional.

##### GET `/.../working-hours`

**Response 200** → `WorkingHours[]` (com `periods` inclusos).

##### POST `/.../working-hours`

**Body** (`CreateWorkingHoursDto`)
```ts
{
  dayOfWeek: DayOfWeek;
  isActive?: boolean;                       // default true
  periods?: Array<{                         // obrigatório se isActive=true
    startTime: string;                      // "HH:mm"
    endTime: string;                        // "HH:mm"
  }>;
}
```

**Erros**: `400 WORKING_HOURS_ALREADY_EXISTS` se já existir para esse dia.

##### GET `/.../working-hours/:workingHoursId` → `WorkingHours`

##### PATCH `/.../working-hours/:workingHoursId`

**Body** (`UpdateWorkingHoursDto`)
```ts
{
  dayOfWeek?: DayOfWeek;
  isActive?: boolean;
}
```

##### DELETE `/.../working-hours/:workingHoursId` — soft delete.

---

##### POST `/.../working-hours/bootstrap-week` ⭐ recomendado

Configura **toda a semana** de uma vez. Quando `overwriteExisting=true` (default), substitui períodos existentes e ajusta `isActive`.

**Body** (`BootstrapWorkingWeekDto`)
```ts
{
  closedDays?: DayOfWeek[];                 // dias fechados (ex.: [SUNDAY])
  periods: Array<{                          // padrão dos dias abertos
    startTime: string;                      // "HH:mm"
    endTime: string;                        // "HH:mm"
  }>;
  overwriteExisting?: boolean;              // default true
}
```

**Exemplo de body**
```json
{
  "closedDays": ["SUNDAY"],
  "periods": [
    { "startTime": "09:00", "endTime": "12:00" },
    { "startTime": "13:00", "endTime": "18:00" }
  ],
  "overwriteExisting": true
}
```

**Response 201** (`BootstrapWorkingWeekResponseDto`)
```ts
{ created: number; updated: number; skipped: number; }
```

---

#### Períodos da jornada (`working-hours/:id/periods`)

Use estas rotas para gerenciar períodos individualmente após o bootstrap.

##### POST `/.../working-hours/:workingHoursId/periods`

**Body** (`CreateWorkingHoursPeriodDto`)
```ts
{
  startTime: string;                        // "HH:mm"
  endTime: string;                          // "HH:mm"
}
```

##### PATCH `/.../working-hours/:workingHoursId/periods/:periodId`

**Body** (`UpdateWorkingHoursPeriodDto`)
```ts
{
  startTime?: string;
  endTime?: string;
}
```

##### DELETE `/.../working-hours/:workingHoursId/periods/:periodId` — soft delete.

---

#### Time off (folgas por data)

Dia inteiro: `startTime` e `endTime` `null`. Parcial: ambos preenchidos.

##### GET `/.../time-offs` → `TimeOff[]`

##### POST `/.../time-offs`

**Body** (`CreateTimeOffDto`)
```ts
{
  date: string;                             // "yyyy-MM-dd"
  startTime?: string | null;                // "HH:mm" ou null
  endTime?: string | null;
  reason: TimeOffReason;                    // HOLIDAY | DAY_OFF | SICK | PERSONAL
}
```

##### PATCH `/.../time-offs/:timeOffId`

**Body** (`UpdateTimeOffDto`) — campos opcionais:
```ts
{
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: TimeOffReason;
}
```

##### DELETE `/.../time-offs/:timeOffId`

---

#### Blocks (bloqueios pontuais — almoço/pessoal)

Só permita `LUNCH` ou `PERSONAL`. `BOOKING` é reservado ao módulo de booking (criado automaticamente ao reservar).

##### GET `/.../blocks` → `AvailabilityBlock[]`

##### POST `/.../blocks`

**Body** (`CreateBlockDto`)
```ts
{
  date: string;                             // "yyyy-MM-dd"
  startTime: string;                        // "HH:mm"
  endTime: string;                          // "HH:mm"
  reason: BlockReason.LUNCH | BlockReason.PERSONAL;
}
```

##### PATCH `/.../blocks/:blockId`

**Body** (`UpdateBlockDto`) — todos opcionais:
```ts
{
  date?: string;
  startTime?: string;
  endTime?: string;
  reason?: BlockReason.LUNCH | BlockReason.PERSONAL;
}
```

##### DELETE `/.../blocks/:blockId`

---

### 5.9 Booking

**Prefixo:** `/tenants/:tenantId/tenant-professionals/:tenantProfessionalId/bookings`  
**Papéis:** mesmos da Availability (`OWNER, ADMIN, STAFF, BARBER` com escopo próprio).

#### Regras de negócio

##### `bookingMode` (no perfil global) controla `POST /draft`

| Modo | `POST /draft` |
|------|---------------|
| `DIRECT_BOOKING` | ✅ permitido |
| `QUOTE_REQUIRED` | ❌ `400 BOOKING_REQUIRES_QUOTE` |
| `WHATSAPP_ONLY`  | ❌ `400 BOOKING_WHATSAPP_ONLY`  |

Para alterar: `PATCH /users/me/professional-profile` (campo `bookingMode`).

##### Pré-condições do draft

1. Acesso à agenda do `tenantProfessionalId`.
2. Vínculo tenant `ACTIVE` (`TENANT_PROFESSIONAL_INACTIVE`) e perfil global `isActive` (`PROFESSIONAL_INACTIVE`).
3. `bookingMode === DIRECT_BOOKING`.
4. Serviço existe no tenant e está ativo (`SERVICE_INACTIVE`).
5. `startTime` consta na lista de `available-slots` (`SLOT_NOT_AVAILABLE`).
6. Início estritamente no **futuro** (`BOOKING_IN_THE_PAST`).
7. Antecedência mínima **15 min** (`BOOKING_MIN_LEAD_NOT_MET`).
8. Usuário tem membership ativa.

##### Conflito de horário

- Transação com `FOR UPDATE` em `tenant_professionals`.
- Overlap com bookings `DRAFT`/`CONFIRMED` do mesmo profissional → `400 SLOT_NOT_AVAILABLE`.
- Índice único parcial `(tenant_professional_id, starts_at) WHERE status IN ('DRAFT','CONFIRMED')`.

##### Ciclo de vida

```
POST /draft  ─►  DRAFT  ─┬─► PATCH /confirm ─► CONFIRMED
                         └─► PATCH /cancel  ─► CANCELLED
```

- **Confirm:** só `DRAFT`; início ainda no futuro; revalida overlap.
- **Cancel:** só `DRAFT` → `CANCELLED`.

---

#### POST `/.../bookings/draft`

Cria rascunho (segura o slot).

**Body** (`CreateBookingDraftDto`)
```ts
{
  serviceId: string;         // UUID v4
  date: string;              // "yyyy-MM-dd" (calendário do tenant)
  startTime: string;         // "HH:mm" alinhado a available-slots
}
```

**Response 201** → `Booking`  
- `startsAt` / `endsAt` voltam em **UTC** (`endsAt = startsAt + service.durationInMinutes`).

**Erros frequentes** (todos `400` com `code` no body):
- `BOOKING_REQUIRES_QUOTE`, `BOOKING_WHATSAPP_ONLY`
- `TENANT_PROFESSIONAL_INACTIVE`, `PROFESSIONAL_INACTIVE`
- `SERVICE_INACTIVE`
- `SLOT_NOT_AVAILABLE` (slot indisponível ou conflito)
- `BOOKING_IN_THE_PAST`, `BOOKING_MIN_LEAD_NOT_MET`
- `INVALID_SLOT` (data/hora inválida para o fuso)

---

#### PATCH `/.../bookings/:bookingId/confirm`

Confirma definitivamente o rascunho.

**Body**: vazio. **Response 200** → `Booking` (com `status = CONFIRMED`).

---

#### PATCH `/.../bookings/:bookingId/cancel`

Cancela o rascunho e libera o horário.

**Body**: vazio. **Response 200** → `Booking` (com `status = CANCELLED`).

---

## 6. Códigos de erro de negócio

Respostas de erro incluem sempre `statusCode`, `requestId` e `timestamp` (ver [§2.7](#27-envelope-de-erros)).

Quando a API retorna `400` com `BusinessRuleException`, o body inclui também:

```ts
{
  statusCode: 400,
  requestId: string,
  timestamp: string,
  code: string,        // ver tabela
  message: string,     // mensagem amigável em PT-BR
  error?: string
}
```

| Código | Quando |
|--------|--------|
| `PROFESSIONAL_PROFILE_ALREADY_EXISTS` | Tentar criar 2º perfil global do mesmo usuário |
| `INVALID_EXPERIENCE_YEARS` | `experienceYears < 0` |
| `INVALID_WHATSAPP_NUMBER` | Fora do padrão (10–15 dígitos) |
| `INVALID_INSTAGRAM_USERNAME` | Username inválido |
| `INVALID_TENANT_MEMBERSHIP_ROLE` | `POST /tenant-professionals/me` sem BARBER/OWNER |
| `SERVICE_NAME_ALREADY_EXISTS` | Nome de serviço duplicado no tenant |
| `SERVICE_INACTIVE` | Serviço usado em booking/slots está inativo |
| `WORKING_HOURS_ALREADY_EXISTS` | Já existe jornada para o `dayOfWeek` |
| `PROFESSIONAL_SERVICE_NOT_OFFERED` | Serviço não está em `offered-services` |
| `TENANT_PROFESSIONAL_INACTIVE` | Vínculo do profissional no tenant não é `ACTIVE` |
| `PROFESSIONAL_INACTIVE` | Perfil global com `isActive=false` |
| `BOOKING_REQUIRES_QUOTE` | `bookingMode = QUOTE_REQUIRED` |
| `BOOKING_WHATSAPP_ONLY` | `bookingMode = WHATSAPP_ONLY` |
| `SLOT_NOT_AVAILABLE` | Slot fora da disponibilidade ou em conflito |
| `BOOKING_IN_THE_PAST` | `startTime` no passado |
| `BOOKING_MIN_LEAD_NOT_MET` | Antecedência < 15 min |
| `INVALID_SLOT` | Data/hora inválida para o fuso |

---

## 7. Fluxos típicos do front-end

### 7.1 Onboarding do dono de um estabelecimento

```
1. POST /users                              → cadastro público (sempre CLIENT)
2. POST /auth/login                         → obtém idToken
3. POST /tenants/with-owner                 → cria tenant + OWNER (telephone obrigatório)
4. (opcional) PATCH /users/me               → atualizar perfil pessoal
5. (opcional, se o owner também atende):
   POST /users/me/professional-profile      → perfil profissional global
   POST /tenants/:t/tenant-professionals/me → vincula como profissional
6. POST /tenants/:t/services                → catálogo de serviços
7. POST /tenants/:t/tenant-professionals/:tp/offered-services
                                            → vincula serviços oferecidos
8. POST /tenants/:t/tenant-professionals/:tp/working-hours/bootstrap-week
                                            → configura a semana
```

### 7.2 Onboarding de um barbeiro (já existe tenant)

```
1. POST /users                              → cria usuário (ou login existente)
2. POST /auth/login                         → idToken
3. POST /users/me/professional-profile      → perfil profissional global
4. POST /tenants/:t/members                 → OWNER/ADMIN do tenant adiciona
                                              o barbeiro como membership BARBER
5. POST /tenants/:t/tenant-professionals/me → barbeiro se auto-vincula
                                              (precisa do membership BARBER/OWNER)
6. POST /tenants/:t/tenant-professionals/:tp/offered-services
7. POST /tenants/:t/tenant-professionals/:tp/working-hours/bootstrap-week
```

### 7.3 Cliente agendando um horário (DIRECT_BOOKING)

```
1. GET /tenants/by-slug/:slug                                              → identifica tenant
2. GET /tenants/:t/tenant-professionals?activeOnly=true                    → lista profissionais
3. GET /tenants/:t/services                                                → lista serviços
4. GET /tenants/:t/tenant-professionals/:tp/offered-services               → serviços do profissional
5. GET /tenants/:t/tenant-professionals/:tp/available-slots?serviceId=&date=
                                                                           → slots livres
6. POST /tenants/:t/tenant-professionals/:tp/bookings/draft                → segura o slot
7. PATCH /tenants/:t/tenant-professionals/:tp/bookings/:id/confirm         → confirma
   (ou /cancel para liberar)
```

### 7.4 Detectar se o usuário logado é profissional

```ts
const me = await api.get<User>('/users/me');
const isProfessional = me.professionalProfile !== null;
const bookingMode    = me.professionalProfile?.bookingMode; // se for
```

### 7.5 Mudar modo de atendimento (`bookingMode`)

```http
PATCH /users/me/professional-profile
Content-Type: application/json

{ "bookingMode": "WHATSAPP_ONLY" }
```

Efeito: `POST .../bookings/draft` passa a retornar `400 BOOKING_WHATSAPP_ONLY`.  
A agenda (`working-hours`, `available-slots`) continua funcionando para exibição.

---

### 7.6 Atualizar perfil do usuário logado

```http
PATCH /users/me
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "name": "João Silva",
  "telephone": "5511992834085"
}
```

Use esta rota para edição de perfil pelo próprio usuário. Alterações administrativas (`role`, `status`) exigem `PATCH /users/:id` com token de `ADMIN`/`SUPER_ADMIN`.

---

## Apêndice — Headers de exemplo

```http
GET /users/me HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
Accept: application/json
```

```http
POST /tenants/123e4567-e89b-12d3-a456-426614174000/tenant-professionals/55c0e.../bookings/draft HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
Content-Type: application/json

{
  "serviceId": "9f2ad0f4-...",
  "date": "2026-04-06",
  "startTime": "14:00"
}
```
