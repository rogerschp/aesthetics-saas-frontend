"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Home,
  Calendar,
  CalendarClock,
  LayoutDashboard,
  Store,
  Sparkles,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useSession, signOut } from "next-auth/react";
import { usersService } from "@/lib/api/services/users.service";
import {
  useTenantContext,
  TENANT_STORAGE_KEY,
} from "@/components/providers/TenantProvider";
import { TenantUserRole } from "@/lib/api/types";
import { clearCachedIdToken } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("Header");
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["me", userId],
    queryFn: () => usersService.getMe(),
    enabled: isAuthenticated && !!userId,
  });

  const { memberships, role, isLoading } = useTenantContext();
  const hasPanel = !isLoading && memberships.length > 0;
  const hasProProfile = !!me?.professionalProfile;
  const canSeeReports =
    role === TenantUserRole.OWNER ||
    role === TenantUserRole.ADMIN ||
    role === TenantUserRole.STAFF;

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    queryClient.clear();
    clearCachedIdToken();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TENANT_STORAGE_KEY);
    }
    await signOut({ redirect: false });
    router.push("/");
  };

  const profileName = me?.name ?? me?.email ?? "";
  const avatarLetter = profileName.charAt(0).toUpperCase() || "U";

  const navLinkClass =
    "flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-yellow-500";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link
        href="/"
        prefetch={false}
        className={navLinkClass}
        onClick={onNavigate}
      >
        <Home className="h-4 w-4" />
        {t("home")}
      </Link>
      <Link
        href="/planos"
        prefetch={false}
        className={navLinkClass}
        onClick={onNavigate}
      >
        <Sparkles className="h-4 w-4" />
        {t("plans")}
      </Link>
      {isAuthenticated && (
        <Link
          href="/perfil/me"
          prefetch={false}
          className={navLinkClass}
          onClick={onNavigate}
        >
          <Calendar className="h-4 w-4" />
          {t("myAppointments")}
        </Link>
      )}
      {isAuthenticated && hasProProfile && (
        <Link
          href={`/barbeiro/${me?.id ?? "me"}`}
          prefetch={false}
          className={navLinkClass}
          onClick={onNavigate}
        >
          <CalendarClock className="h-4 w-4" />
          {t("mySchedule")}
        </Link>
      )}
      {isAuthenticated && hasPanel && (
        <Link
          href="/painel"
          prefetch={false}
          className={navLinkClass}
          onClick={onNavigate}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("myDashboard")}
        </Link>
      )}
      {isAuthenticated && hasPanel && canSeeReports && (
        <Link
          href="/painel/relatorios"
          prefetch={false}
          className={navLinkClass}
          onClick={onNavigate}
        >
          <BarChart3 className="h-4 w-4" />
          {t("reports")}
        </Link>
      )}
      {isAuthenticated && !hasPanel && (
        <Link
          href="/painel/estabelecimento/criar"
          prefetch={false}
          className={navLinkClass}
          onClick={onNavigate}
        >
          <Store className="h-4 w-4" />
          {t("createEstablishment")}
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link href="/" prefetch={false} className="min-w-0 shrink">
          <span className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
            BarberShop
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="mr-1 hidden flex-col items-end lg:flex">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("welcome")}
                </span>
                <span className="max-w-[140px] truncate text-sm font-bold text-foreground">
                  {profileName}
                </span>
              </div>
              <Link
                href="/perfil/me"
                prefetch={false}
                className="transition-opacity hover:opacity-80"
              >
                <Avatar className="h-9 w-9 border border-primary/50 shadow-sm shadow-primary/20">
                  {me?.avatarUrl && (
                    <AvatarImage
                      src={me.avatarUrl}
                      alt={profileName}
                      className="object-cover"
                    />
                  )}
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
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" prefetch={false}>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  {t("login")}
                </Button>
              </Link>
              <Link href="/cadastro" prefetch={false}>
                <Button className="px-5 font-semibold">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-white/5 bg-black/95 md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav className="container mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4">
          <NavLinks onNavigate={() => setMenuOpen(false)} />

          <div className="h-px w-full bg-white/10" />

          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/perfil/me"
                prefetch={false}
                className="flex min-w-0 items-center gap-3"
                onClick={() => setMenuOpen(false)}
              >
                <Avatar className="h-9 w-9 border border-primary/50">
                  {me?.avatarUrl && (
                    <AvatarImage
                      src={me.avatarUrl}
                      alt={profileName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary/20 font-bold text-primary">
                    {avatarLetter}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-foreground">
                  {profileName || t("myAppointments")}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link
                href="/cadastro"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
              >
                <Button className="w-full font-semibold">{t("register")}</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
