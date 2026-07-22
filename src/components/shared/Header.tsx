"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Home, Calendar, LayoutDashboard, Store, Sparkles, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useSession, signOut } from "next-auth/react";
import { usersService } from "@/lib/api/services/users.service";
import { useTenantContext } from "@/components/providers/TenantProvider";
import { TenantUserRole } from "@/lib/api/types";

export function Header() {
  const t = useTranslations("Header");
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;

  const { data: me } = useQuery({
    queryKey: ["me", userId],
    queryFn: () => usersService.getMe(),
    enabled: isAuthenticated && !!userId,
  });

  const { memberships, role } = useTenantContext();
  const hasPanel = memberships.length > 0;
  const canSeeReports =
    role === TenantUserRole.OWNER ||
    role === TenantUserRole.ADMIN ||
    role === TenantUserRole.STAFF;

  const handleLogout = async () => {
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("@barbershop:tenant");
    }
    await signOut({ redirect: false });
    router.push("/");
  };

  const profileName = me?.name ?? me?.email ?? "";
  const avatarLetter = profileName.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              BarberShop
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
            >
              <Home className="h-4 w-4" />
              {t("home")}
            </Link>

            <Link
              href="/planos"
              className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
            >
              <Sparkles className="h-4 w-4" />
              {t("plans")}
            </Link>

            {isAuthenticated && (
              <Link
                href="/perfil/me"
                className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
              >
                <Calendar className="h-4 w-4" />
                {t("myAppointments")}
              </Link>
            )}

            {isAuthenticated && hasPanel && (
              <Link
                href="/painel"
                className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("myDashboard")}
              </Link>
            )}

            {isAuthenticated && hasPanel && canSeeReports && (
              <Link
                href="/painel/relatorios"
                className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
              >
                <BarChart3 className="h-4 w-4" />
                {t("reports")}
              </Link>
            )}

            {isAuthenticated && !hasPanel && (
              <Link
                href="/painel/estabelecimento/criar"
                className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-yellow-500"
              >
                <Store className="h-4 w-4" />
                {t("createEstablishment")}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="flex items-center gap-5">
              <div className="mr-1 hidden flex-col items-end sm:flex">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("welcome")}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {profileName}
                </span>
              </div>
              <Link
                href="/perfil/me"
                className="transition-opacity hover:opacity-80"
              >
                <Avatar className="h-9 w-9 border border-primary/50 shadow-sm shadow-primary/20">
                  <AvatarFallback className="bg-primary/20 font-bold text-primary">
                    {avatarLetter}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="px-6 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                  {t("register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
