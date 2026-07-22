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
import { usersService } from "@/lib/api/services/users.service";
import { digitsOnly, maskPhoneBR, phoneToApiDigits } from "@/lib/masks";

export function RegistrationForm() {
  const t = useTranslations("RegistrationForm");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registrationSchema = useMemo(() => z.object({
    nome: z.string().min(3, t("nameError")),
    email: z.string().email(t("emailError")),
    senha: z.string().min(6, t("passwordError")),
    telefone: z
      .string()
      .refine((v) => digitsOnly(v).length >= 10, t("phoneError")),
    localizacao: z.string().min(3, t("locationError")),
  }), [t]);

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
      // Cadastrar na API real
      await usersService.register({
        name: data.nome,
        email: data.email,
        password: data.senha,
        telephone: phoneToApiDigits(data.telefone),
      });

      // Sucesso
      setSuccessMessage(t("successMessage") || "Conta criada com sucesso! Redirecionando para login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: any) {
      console.error("Falha ao cadastrar", error);
      
      let errorMsg = t("errorMessage") || "Erro ao realizar cadastro. Tente novamente.";
      if (error?.message) {
        errorMsg = Array.isArray(error.message) ? error.message.join(", ") : error.message;
      }
      
      setGlobalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {globalError && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-500 text-sm font-medium">
          {globalError}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-500 text-sm font-medium">
          {successMessage}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="nome">{t("nameLabel")}</Label>
        <Input id="nome" placeholder={t("namePlaceholder")} {...register("nome")} />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="senha">{t("passwordLabel")}</Label>
        <Input id="senha" type="password" placeholder={t("passwordPlaceholder")} {...register("senha")} />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message as string}</p>
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
            <p className="text-sm text-destructive">{errors.telefone.message as string}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="localizacao">{t("locationLabel")}</Label>
          <Input id="localizacao" placeholder={t("locationPlaceholder")} {...register("localizacao")} />
          {errors.localizacao && (
            <p className="text-sm text-destructive">{errors.localizacao.message as string}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold mt-6 h-12"
        disabled={isLoading}
      >
        {isLoading ? t("submitLoading") : t("submitBtn")}
      </Button>
    </form>
  );
}
