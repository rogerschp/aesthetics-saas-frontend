# Report Front → Back — Bugs e GAPs

Levantado durante a integração do front. Atualizado após correções no backend (`feat/guest`).

---

## ✅ Resolvido no backend (front já ajustado)

### BUG 1 — `PATCH`/`DELETE /tenants/:id` → `USER_NOT_IDENTIFIED`
**Status:** corrigido. Guards unificados com `BearerAuthGuard` + `TenantResolverGuard`.
Front: `CancellationSettingsForm` e save do editar (nome/avatar/redes) habilitados.

### GAP 1 — Sem `GET` de lista de bookings
**Status:** corrigido.
- `GET /tenants/:tenantId/bookings?date=&status=` (OWNER/ADMIN/STAFF)
- `GET /tenants/:tenantId/tenant-professionals/:tpId/bookings?date=&status=`
Front: `OpsBookingPanel` agenda do dia + `/barbeiro` agenda do profissional.

### GAP 3 — Busca por cidade
**Status:** corrigido via `city` + `state` em `GET /search/tenants` (sem geocoding).
Front: campo de localização parseia `Cidade` ou `Cidade, UF`; geo continua como “Perto de mim”.

### GAP 4 — `address` não populado
**Status:** corrigido (`findBySlug` / `findById` com `relations: ['address']`).
Front: mapper/vitrine já consomem `tenant.address`.

---

## 🟠 Ainda aberto

### GAP 2 — Guest sem `confirm`/`cancel`
Documentado em `booking.md` (ownership futuro). Front mostra rascunho aguardando unidade, sem botões.

---

## ✅ Validado e funcionando

- Vitrine pública: `by-slug` (+ address), professionals, services, reviews, theme.
- Slots públicos, guest draft, cliente public draft→confirm→me/bookings.
- Políticas de cancelamento e bookingMode.
- Memberships + subscription.
- Listagem ops de bookings + PATCH tenant.
- **Reports** (`/painel/relatorios`): `dashboard` + `topServices` (+ monthly/professional conforme plano); eixo `startsAt`; export PDF/Excel no ELITE; Free → upsell.
- **Reports `?months=`**: Pro 1–3 (default 3); Elite 1–6 (default 6); export Elite com a mesma janela.
