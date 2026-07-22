"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { authService } from "@/lib/api/services/auth.service";

export function LoginForm() {
  const t = useTranslations("LoginForm");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t("emailError")),
    senha: z.string().min(1, t("passwordError")),
  }), [t]);

  type LoginData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      // 1. Tentar via NextAuth
      const res = await signIn("credentials", {
        email: data.email,
        password: data.senha,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push("/");
    } catch (error) {
      console.error("Falha no login (NextAuth)", error);
      alert(t("errorMessage") || "Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="senha">{t("passwordLabel")}</Label>
          <a href="#" className="font-semibold text-xs text-yellow-500 hover:text-yellow-400 focus:outline-none focus:underline">{t("forgotPassword")}</a>
        </div>
        <Input id="senha" type="password" placeholder={t("passwordPlaceholder")} {...register("senha")} />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message as string}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold mt-4 h-12"
        disabled={isLoading}
      >
        {isLoading ? t("submitLoading") : t("submitBtn")}
      </Button>
    </form>
  );
}
