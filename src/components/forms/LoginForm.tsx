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
import { useQueryClient } from "@tanstack/react-query";
import { TENANT_STORAGE_KEY } from "@/components/providers/TenantProvider";
import { clearCachedIdToken } from "@/lib/api/client";
import { FormErrorBanner } from "@/components/shared/FormBanner";

export function LoginForm() {
  const t = useTranslations("LoginForm");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("emailError")),
        senha: z.string().min(1, t("passwordError")),
      }),
    [t],
  );

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
    setFormError(null);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.senha,
        redirect: false,
      });

      if (res?.error) {
        setFormError(t("errorMessage"));
        return;
      }

      queryClient.clear();
      clearCachedIdToken();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TENANT_STORAGE_KEY);
      }

      router.push("/");
    } catch (error) {
      console.error("Falha no login (NextAuth)", error);
      setFormError(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && <FormErrorBanner message={formError} />}

      <div className="space-y-1">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha">{t("passwordLabel")}</Label>
          <a
            href="#"
            className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 focus:underline focus:outline-none"
          >
            {t("forgotPassword")}
          </a>
        </div>
        <Input
          id="senha"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          {...register("senha")}
        />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-4 h-12 w-full bg-yellow-500 font-bold text-black hover:bg-yellow-600"
        disabled={isLoading}
      >
        {isLoading ? t("submitLoading") : t("submitBtn")}
      </Button>
    </form>
  );
}
