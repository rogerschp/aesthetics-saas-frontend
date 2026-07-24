"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { teamService } from "@/lib/api/services/team.service";
import { formatApiError } from "@/lib/api/errors";
import {
  TenantInvitationStatus,
  TenantUserRole,
  TenantUserStatus,
} from "@/lib/api/types";

const ROLE_OPTIONS: TenantUserRole[] = [
  TenantUserRole.BARBER,
  TenantUserRole.STAFF,
  TenantUserRole.ADMIN,
  TenantUserRole.OWNER,
];

const selectClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

type TeamManagerProps = {
  tenantId: string;
  canManage: boolean;
};

export function TeamManager({ tenantId, canManage }: TeamManagerProps) {
  const t = useTranslations("TeamManager");
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantUserRole>(TenantUserRole.BARBER);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ["tenant-team-members", tenantId],
    queryFn: () => teamService.listMembers(tenantId),
    enabled: !!tenantId,
  });

  const invitationsQuery = useQuery({
    queryKey: ["tenant-team-invitations", tenantId],
    queryFn: () =>
      teamService.listInvitations(tenantId, TenantInvitationStatus.PENDING),
    enabled: !!tenantId && canManage,
  });

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: ["tenant-team-members", tenantId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["tenant-team-invitations", tenantId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["tenant-edit-team", tenantId],
    });
  }

  const onboardMutation = useMutation({
    mutationFn: () => teamService.onboard(tenantId, { email, role }),
    onSuccess: (res) => {
      setError(null);
      setEmail("");
      if (res.kind === "MEMBER_ADDED") {
        setFeedback(
          res.tenantProfessionalId
            ? t("successMemberLinked", { name: res.member.name })
            : t("successMember", { name: res.member.name }),
        );
      } else {
        setFeedback(t("successInvite", { email: res.invitation.email }));
      }
      invalidate();
    },
    onError: (err) => {
      setFeedback(null);
      setError(formatApiError(err));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) =>
      teamService.cancelInvitation(tenantId, invitationId),
    onSuccess: () => {
      setError(null);
      setFeedback(t("inviteCancelled"));
      invalidate();
    },
    onError: (err) => {
      setFeedback(null);
      setError(formatApiError(err));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeMember(tenantId, userId),
    onMutate: (userId) => setRemovingUserId(userId),
    onSuccess: () => {
      setError(null);
      setFeedback(t("memberRemoved"));
      invalidate();
    },
    onError: (err) => {
      setFeedback(null);
      setError(formatApiError(err));
    },
    onSettled: () => setRemovingUserId(null),
  });

  const members = membersQuery.data;
  const invitations = invitationsQuery.data ?? [];

  const ownerCount = useMemo(
    () =>
      (members ?? []).filter((m) => m.role === TenantUserRole.OWNER).length,
    [members],
  );

  const roleLabel = useMemo(
    () =>
      ({
        [TenantUserRole.OWNER]: t("roleOwner"),
        [TenantUserRole.ADMIN]: t("roleAdmin"),
        [TenantUserRole.BARBER]: t("roleBarber"),
        [TenantUserRole.STAFF]: t("roleStaff"),
      }) as Record<TenantUserRole, string>,
    [t],
  );

  function handleOnboard() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("emailRequired"));
      return;
    }
    setFeedback(null);
    onboardMutation.mutate();
  }

  function canRemoveMember(userId: string, memberRole: TenantUserRole) {
    if (!canManage) return false;
    if (sessionUserId && userId === sessionUserId) return false;
    if (memberRole === TenantUserRole.OWNER && ownerCount <= 1) return false;
    return true;
  }

  function removeDisabledReason(
    userId: string,
    memberRole: TenantUserRole,
  ): string | null {
    if (sessionUserId && userId === sessionUserId) return t("cannotRemoveSelf");
    if (memberRole === TenantUserRole.OWNER && ownerCount <= 1) {
      return t("cannotRemoveLastOwner");
    }
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground">
          <Users className="h-5 w-5 text-primary" />
          {t("title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {canManage && (
        // Sem <form>: esta tela vive dentro do form de edição do tenant
        // (HTML não permite forms aninhados — causava reload da página).
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="h-4 w-4 text-primary" />
            {t("addTitle")}
          </div>
          <p className="text-xs text-muted-foreground">{t("addHint")}</p>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="team-email">{t("email")}</Label>
              <Input
                id="team-email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={onboardMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleOnboard();
                  }
                }}
              />
            </div>
            <div className="space-y-2 sm:w-44">
              <Label htmlFor="team-role">{t("role")}</Label>
              <select
                id="team-role"
                className={selectClass}
                value={role}
                onChange={(e) => setRole(e.target.value as TenantUserRole)}
                disabled={onboardMutation.isPending}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel[r]}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              disabled={onboardMutation.isPending}
              onClick={handleOnboard}
            >
              {onboardMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {t("addBtn")}
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t("notifyHint")}</span>
          </div>

          {feedback && (
            <p className="text-sm text-primary" role="status">
              {feedback}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {!canManage && (
        <p className="text-sm text-muted-foreground">{t("readOnly")}</p>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("membersTitle")}
        </h4>
        {membersQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : membersQuery.isError ? (
          <p className="text-sm text-destructive">
            {formatApiError(membersQuery.error)}
          </p>
        ) : !members || members.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            {t("membersEmpty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => {
              const removeOk = canRemoveMember(m.userId, m.role);
              const reason = removeDisabledReason(m.userId, m.role);
              const isRemoving =
                removeMutation.isPending && removingUserId === m.userId;

              return (
                <li
                  key={m.membershipId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {m.name}
                      {sessionUserId === m.userId ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({t("you")})
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{roleLabel[m.role]}</Badge>
                    <Badge
                      className={
                        m.status === TenantUserStatus.ACTIVE
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-zinc-500/15 text-zinc-400"
                      }
                    >
                      {m.status === TenantUserStatus.ACTIVE
                        ? t("statusActive")
                        : t("statusInactive")}
                    </Badge>
                    {canManage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={!removeOk || removeMutation.isPending}
                        title={reason ?? t("removeMember")}
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            !window.confirm(
                              t("removeConfirm", { name: m.name }),
                            )
                          ) {
                            return;
                          }
                          removeMutation.mutate(m.userId);
                        }}
                      >
                        {isRemoving ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="mr-1.5 h-4 w-4" />
                        )}
                        {t("removeMember")}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canManage && (
        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Mail className="h-4 w-4" />
            {t("invitesTitle")}
          </h4>
          {invitationsQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invitationsQuery.isError ? (
            <p className="text-sm text-destructive">
              {formatApiError(invitationsQuery.error)}
            </p>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("invitesEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabel[inv.role]} · {t("expiresAt")}{" "}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={cancelMutation.isPending}
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        !window.confirm(t("cancelConfirm"))
                      ) {
                        return;
                      }
                      cancelMutation.mutate(inv.id);
                    }}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    {t("cancelInvite")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">{t("acceptGap")}</p>
        </section>
      )}
    </div>
  );
}

/** Aba Equipe no fluxo de criação — onboard só após existir tenant. */
export function TeamSetupHint() {
  const t = useTranslations("TeamManager");
  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-border/60 p-8 text-center">
      <Users className="mx-auto h-10 w-10 text-primary/80" />
      <h3 className="text-lg font-bold text-foreground">{t("createTitle")}</h3>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">
        {t("createHint")}
      </p>
    </div>
  );
}
