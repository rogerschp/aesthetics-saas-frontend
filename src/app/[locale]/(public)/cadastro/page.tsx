import { RegistrationForm } from "@/components/forms/RegistrationForm";
import Link from "next/link";
import { Scissors } from "lucide-react";

export const metadata = {
  title: "Cadastro | BarberShop",
  description: "Crie sua conta para agendar em barbearias, salões de beleza e estúdios de tatuagem.",
};

export default function CadastroPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-6">
        <Link href="/" className="flex flex-col items-center group">
          <div className="h-14 w-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3 mb-4 group-hover:border-yellow-500/50 transition-colors shadow-lg shadow-black/50">
            <Scissors className="text-yellow-500 w-full h-full" />
          </div>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white mb-2">
            Crie sua conta
          </h2>
          <p className="text-center text-sm text-zinc-400">
            Junte-se aos melhores estabelecimentos da sua região.
          </p>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[500px]">
        <div className="bg-zinc-950/50 px-6 py-12 border border-zinc-800/60 shadow-xl shadow-black/80 sm:rounded-2xl sm:px-12 backdrop-blur-xl">
          <RegistrationForm />

          <p className="mt-10 text-center text-sm text-zinc-400">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
