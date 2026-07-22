"use client";

import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTenantContext } from "@/components/providers/TenantProvider";

const ROLE_KEY: Record<string, string> = {
  OWNER: "roleOwner",
  ADMIN: "roleAdmin",
  STAFF: "roleStaff",
  BARBER: "roleBarber",
};

export function TenantSwitcher() {
  const t = useTranslations("TenantSwitcher");
  const { memberships, current, setCurrentTenantId } = useTenantContext();

  if (memberships.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Store className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        {memberships.length > 1 ? (
          <select
            value={current?.tenant.id ?? ""}
            onChange={(e) => setCurrentTenantId(e.target.value)}
            className="rounded-md border border-border bg-card px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
          >
            {memberships.map((m) => (
              <option key={m.tenant.id} value={m.tenant.id}>
                {m.tenant.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-semibold text-foreground">
            {current?.tenant.name}
          </span>
        )}
        {current && (
          <span className="text-xs text-muted-foreground">
            {ROLE_KEY[current.role] ? t(ROLE_KEY[current.role]) : current.role}
          </span>
        )}
      </div>
    </div>
  );
}
