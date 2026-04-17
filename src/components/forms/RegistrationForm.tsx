"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

const registrationSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  localizacao: z.string().min(3, "Localização inválida"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Cadastro feito:", data);
    
    // Injeta auth mockado no MVP front-end simulando auto-login
    localStorage.setItem("@barbershop:user", JSON.stringify({ id: "cli_001", role: "CLIENT" }));

    setIsLoading(false);
    
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input id="nome" placeholder="Seu nome" {...register("nome")} />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" placeholder="******" {...register("senha")} />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="telefone">Telefone</Label>
          <Input 
            id="telefone" 
            placeholder="(11) 90000-0000" 
            {...register("telefone")} 
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length > 11) v = v.slice(0, 11);
              if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
              if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
              e.target.value = v;
              // Call the original react-hook-form onChange
              register("telefone").onChange(e);
            }}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="localizacao">Cidade / Estado (UF)</Label>
          <Input id="localizacao" placeholder="Ex: Curitiba, PR" {...register("localizacao")} />
          {errors.localizacao && (
            <p className="text-sm text-destructive">{errors.localizacao.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold mt-6 h-12"
        disabled={isLoading}
      >
        {isLoading ? "Criando Conta..." : "Criar Conta"}
      </Button>
    </form>
  );
}
