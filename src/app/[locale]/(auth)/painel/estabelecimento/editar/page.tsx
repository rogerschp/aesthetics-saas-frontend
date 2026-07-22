"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StoreProfileForm } from "@/components/forms/tenant/StoreProfileForm";
import { HoursInputRepeater } from "@/components/forms/tenant/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/components/forms/tenant/ServiceHierarchyBuilder";
import { TeamBuilder } from "@/components/forms/tenant/TeamBuilder";
import { AparenciaEditor } from "@/components/forms/tenant/AparenciaEditor";
import {
  EditarEstabelecimentoSidebar,
  type SecaoEdicao,
} from "@/components/shared/estabelecimento/EditarEstabelecimentoSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Building2, Paintbrush } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { TenantTema } from "@/types";
import { TEMA_PADRAO } from "@/lib/mock/temas";

// Schema unificado (Mesmo do Criar, exportado num arquivo lib/schemas futuramente)
const tenantSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  slug: z.string().min(3, "Slug muito curto").regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  banner: z.string().optional(),
  localizacao: z.string().min(5, "Localização é obrigatória"),
  redesSociais: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }),
  horarios: z.array(
    z.object({
      fechado: z.boolean(),
      inicio: z.string(),
      fim: z.string(),
    })
  ).length(7),
  servicos: z.array(
    z.object({
      titulo: z.string().min(1, "Obrigatório"),
      itens: z.array(
        z.object({
          descricao: z.string().min(1, "Obrigatório"),
          preco: z.number().min(0, "Deve ser maior ou igual a 0"),
        })
      )
    })
  ),
  time: z.array(
    z.object({
      nome: z.string(),
      role: z.string(),
      foto: z.string().optional(),
    })
  )
});

type TenantFormValues = z.infer<typeof tenantSchema>;

// Dados mockados que viriam da API para popular Edição
const mockEditData: Partial<TenantFormValues> = {
  nome: "Classic Barber (Unidade Centro)",
  slug: "barbearia-classic",
  descricao: "A barbearia clássica do centro da cidade. Tradição e cortes premium desde 1999.",
  localizacao: "Av. Paulista, 1000 - São Paulo, SP",
  redesSociais: {
    instagram: "https://instagram.com/classicbarber",
    facebook: ""
  },
  horarios: [
    { fechado: true, inicio: "09:00", fim: "18:00" }, // Dom
    { fechado: false, inicio: "10:00", fim: "19:00" }, // Seg
    { fechado: false, inicio: "09:00", fim: "20:00" }, // Ter
    { fechado: false, inicio: "09:00", fim: "20:00" }, // Qua
    { fechado: false, inicio: "09:00", fim: "20:00" }, // Qui
    { fechado: false, inicio: "09:00", fim: "21:00" }, // Sex
    { fechado: false, inicio: "08:00", fim: "19:00" }  // Sab
  ],
  servicos: [
    {
      titulo: "Cortes de Cabelo",
      itens: [
        { descricao: "Corte na Tesoura Especial", preco: 65 },
        { descricao: "Corte Degradê na Máquina", preco: 50 },
      ]
    },
    {
      titulo: "Barba e Tratamentos",
      itens: [
        { descricao: "Barba Completa com Toalha Quente", preco: 45 },
        { descricao: "Terapia Capilar Regenerativa", preco: 120 },
      ]
    }
  ],
  time: [
    { nome: "Roger M.", role: "Barbeiro Sênior", foto: "https://i.pravatar.cc/150?u=roger" },
    { nome: "Carlos Adão", role: "Especialista Terapia Capilar", foto: "https://i.pravatar.cc/150?u=carlos" }
  ]
};

export default function TenantEditPage() {
  const t = useTranslations("EstabelecimentoForm");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoEdicao>("informacoes");
  const [tema, setTema] = useState<TenantTema>(TEMA_PADRAO);

  // Reset assíncrono para replicar buscar da API
  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      horarios: Array(7).fill({ fechado: false, inicio: "09:00", fim: "18:00" }),
      servicos: [],
      time: []
    }, // Fallback preventivo
  });

  useEffect(() => {
    // Simula tempo de rede carregando o Estabelecimento que ele vai editar
    setTimeout(() => {
      methods.reset(mockEditData as TenantFormValues);
    }, 500);
  }, [methods]);

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    // Simula API UPDATE action
    await new Promise(resolve => setTimeout(resolve, 1500));
    // TODO(security): No ambiente de produção, os dados devem ser enviados via HTTPS
    // e validados server-side antes de persistir
    console.log("Tenant atualizado com sucesso");
    setIsLoading(false);
    
    router.push("/");
  };

  /**
   * Renderiza o conteúdo da seção ativa.
   * Cada seção carrega seu formulário/componente específico.
   */
  const renderizarConteudo = () => {
    switch (secaoAtiva) {
      case "informacoes":
        return <StoreProfileForm />;
      case "expediente":
        return <HoursInputRepeater />;
      case "servicos":
        return <ServiceHierarchyBuilder />;
      case "equipe":
        return <TeamBuilder />;
      case "aparencia":
        return <AparenciaEditor tema={tema} onTemaChange={setTema} />;
      default:
        return <StoreProfileForm />;
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10 pt-28">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            {t("back")}
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <span className="text-zinc-500 font-medium tracking-wide">{t("managerPanel")}</span>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                  <Paintbrush className="h-8 w-8 text-yellow-500" />
                  {t("editTitle")}
                </h1>
                <p className="text-zinc-400 mt-2 text-lg">
                  {t("editSubtitle")}
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold px-8 shadow-lg shadow-yellow-500/20"
              >
                {isLoading ? t("saving") : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("saveChanges")}
                  </>
                )}
              </Button>
            </div>

            {/* Layout principal: Sidebar + Conteúdo */}
            <div className="flex flex-col lg:flex-row gap-6">
              <EditarEstabelecimentoSidebar
                secaoAtiva={secaoAtiva}
                onMudarSecao={setSecaoAtiva}
              />

              {/* Área de conteúdo principal */}
              <div className="flex-1 min-w-0">
                <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative">
                  {renderizarConteudo()}
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
