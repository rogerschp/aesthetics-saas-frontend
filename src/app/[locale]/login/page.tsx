import { LoginForm } from "@/components/forms/LoginForm";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Login | BarberShop",
  description: "Acesse sua conta para gerenciar seus agendamentos.",
};

export default async function LoginPage() {
  const t = await getTranslations("Login");

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex flex-col items-center group">
          <div className="h-16 w-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3.5 mb-6 group-hover:border-yellow-500/50 transition-colors shadow-lg shadow-black/50">
            <Scissors className="text-yellow-500 w-full h-full" />
          </div>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white mb-2">
            {t("title")}
          </h2>
          <p className="text-center text-sm text-zinc-400">
            {t("subtitle")}
          </p>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[450px]">
        <div className="bg-zinc-900/50 px-6 py-12 border border-zinc-800/80 shadow-2xl sm:rounded-2xl sm:px-12 backdrop-blur-xl relative overflow-hidden">
          {/* Decoração sutil */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          
          <LoginForm />

          <p className="mt-10 text-center text-sm text-zinc-400">
            {t("noAccount")}{" "}
            <Link
              href="/cadastro"
              className="font-semibold leading-6 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
