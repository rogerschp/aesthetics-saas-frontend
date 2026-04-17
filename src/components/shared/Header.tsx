"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Home, Calendar, LayoutDashboard, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  id: string;
  role: "CLIENT" | "PROFESSIONAL" | "OWNER";
}

export function Header() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const router = useRouter();

  // Verifica o estado de login
  const checkAuth = () => {
    try {
      const stored = localStorage.getItem("@barbershop:user");
      if (stored) {
        setAuth(JSON.parse(stored));
      } else {
        setAuth(null);
      }
    } catch {
      setAuth(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    return () => {
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@barbershop:user");
    setAuth(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  // Profile data mocked for Header display
  const isOwner = auth?.role === "OWNER";
  const isPro = auth?.role === "PROFESSIONAL";
  const isClient = auth?.role === "CLIENT";

  const profileName = isOwner ? "Roger M." : (isPro ? "Carlos Adão" : "Lucas Moreira");
  const avatarLetter = profileName.charAt(0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">BarberShop</span>
          </Link>

          {/* Global Dynamic Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
              <Home className="h-4 w-4" />
              Início
            </Link>

            {/* Contextual Links */}
            {!auth && (
              <Link href="/planos" className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
                <Store className="h-4 w-4" />
                Para Barbearias
              </Link>
            )}

            {isClient && (
              <Link href={`/perfil/${auth.id}`} className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
                <Calendar className="h-4 w-4" />
                Meus Agendamentos
              </Link>
            )}

            {isPro && (
              <Link href={`/barbeiro/${auth.id}`} className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
                <Calendar className="h-4 w-4" />
                Minha Agenda
              </Link>
            )}

            {isOwner && (
              <>
                <Link href="/painel" className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  Meu Painel
                </Link>
                <Link href="/painel/barbearia/editar" className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
                  <Store className="h-4 w-4" />
                  Gerenciar Barbearia
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Interactive Auth */}
        <div className="flex items-center gap-4">
          {auth ? (
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-xs text-muted-foreground font-medium">Bem-vindo,</span>
                <span className="text-sm font-bold text-foreground">{profileName}</span>
              </div>
              <Link href={`/perfil/${auth.id}`} className="hover:opacity-80 transition-opacity">
                <Avatar className="h-9 w-9 border border-primary/50 shadow-sm shadow-primary/20">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${auth.id}`} alt="Perfil" />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">{avatarLetter}</AvatarFallback>
                </Avatar>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="font-semibold px-6 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all">
                  Cadastrar-se
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
