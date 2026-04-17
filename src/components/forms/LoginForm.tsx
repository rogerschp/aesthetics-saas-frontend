"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Login feito:", data);
    
    // Injeta auth mockado identificando os atores
    let authUser = { id: "cli_001", role: "CLIENT" };
    
    if (data.email.includes("carlos")) {
      authUser = { id: "pro_001", role: "PROFESSIONAL" };
    } else if (data.email.includes("roger")) {
      authUser = { id: "own_001", role: "OWNER" };
    }
    
    localStorage.setItem("@barbershop:user", JSON.stringify(authUser));
    
    setIsLoading(false);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="senha">Senha</Label>
          <a href="#" className="font-semibold text-xs text-yellow-500 hover:text-yellow-400 focus:outline-none focus:underline">Esqueceu a senha?</a>
        </div>
        <Input id="senha" type="password" placeholder="******" {...register("senha")} />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold mt-4 h-12"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar no Sistema"}
      </Button>
    </form>
  );
}
