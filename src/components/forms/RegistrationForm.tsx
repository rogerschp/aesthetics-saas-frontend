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
import { usersService } from "@/lib/api/services/users.service";
import { digitsOnly, maskPhoneBR, phoneToApiDigits } from "@/lib/masks";
import { formatApiError } from "@/lib/api/errors";
import {
  FormErrorBanner,
  FormSuccessBanner,
} from "@/components/shared/FormBanner";

export function RegistrationForm() {
  const t = useTranslations("RegistrationForm");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registrationSchema = useMemo(
    () =>
      z.object({
        nome: z.string().min(3, t("nameError")),
        email: z.string().email(t("emailError")),
        senha: z.string().min(6, t("passwordError")),
        telefone: z
          .string()
          .refine((v) => digitsOnly(v).length >= 10, t("phoneError")),
        localizacao: z.string().min(3, t("locationError")),
      }),
    [t],
  );

  type RegistrationData = z.infer<typeof registrationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const telefoneReg = register("telefone");

  const onSubmit = async (data: RegistrationData) => {
    setIsLoading(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      await usersService.register({
        name: data.nome,
        email: data.email,
        password: data.senha,
        telephone: phoneToApiDigits(data.telefone),
      });

      setSuccessMessage(t("successMessage"));

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Falha ao cadastrar", error);
      const apiMsg = formatApiError(error);
      const fallback = t("errorMessage");
      // Evita mensagem genérica axios/"Erro inesperado" sem código útil
      const looksGeneric =
        !apiMsg ||
        apiMsg === "Erro inesperado. Tente novamente." ||
        /status code|Network Error|Request failed/i.test(apiMsg);
      setGlobalError(looksGeneric ? fallback : apiMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {globalError && <FormErrorBanner message={globalError} />}
      {successMessage && <FormSuccessBanner message={successMessage} />}

      <div className="space-y-1">
        <Label htmlFor="nome">{t("nameLabel")}</Label>
        <Input
          id="nome"
          placeholder={t("namePlaceholder")}
          {...register("nome")}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

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
        <Label htmlFor="senha">{t("passwordLabel")}</Label>
        <Input
          id="senha"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          {...register("senha")}
        />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="telefone">{t("phoneLabel")}</Label>
          <Input
            id="telefone"
            placeholder={t("phonePlaceholder")}
            name={telefoneReg.name}
            ref={telefoneReg.ref}
            onBlur={telefoneReg.onBlur}
            inputMode="tel"
            onChange={(e) => {
              e.target.value = maskPhoneBR(e.target.value);
              void telefoneReg.onChange(e);
            }}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="localizacao">{t("locationLabel")}</Label>
          <Input
            id="localizacao"
            placeholder={t("locationPlaceholder")}
            {...register("localizacao")}
          />
          {errors.localizacao && (
            <p className="text-sm text-destructive">
              {errors.localizacao.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="mt-6 h-12 w-full bg-yellow-500 font-bold text-black hover:bg-yellow-600"
        disabled={isLoading}
      >
        {isLoading ? t("submitLoading") : t("submitBtn")}
      </Button>
    </form>
  );
}
