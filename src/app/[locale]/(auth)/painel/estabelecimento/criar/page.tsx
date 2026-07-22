"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreProfileForm } from "@/components/forms/tenant/StoreProfileForm";
import { HoursInputRepeater } from "@/components/forms/tenant/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/components/forms/tenant/ServiceHierarchyBuilder";
import { TeamBuilder } from "@/components/forms/tenant/TeamBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { catalogService } from "@/lib/api/services/catalog.service";
import { usersService } from "@/lib/api/services/users.service";
import { tenantProfessionalsService } from "@/lib/api/services/tenant-professionals.service";
import { availabilityService } from "@/lib/api/services/availability.service";
import { ProfessionalType } from "@/lib/api/types";

// Schema unificado
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

const defaultValues: Partial<TenantFormValues> = {
  horarios: Array(7).fill({ fechado: false, inicio: "09:00", fim: "18:00" }),
  servicos: [],
  time: []
};

export default function TenantCreatePage() {
  const t = useTranslations("EstabelecimentoForm");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    
    try {
      // 1. Criação do Tenant (e vínculo do usuário como OWNER)
      const tenant = await tenantsService.createWithOwner({
        name: data.nome,
        slug: data.slug,
        telephone: "5511999999999", // TODO: Adicionar campo telefone no formulário UI futuramente
      });

      // 2. Criação dos Serviços e obtenção de seus IDs
      const createdServicesIds: string[] = [];
      for (const cat of data.servicos) {
        for (const item of cat.itens) {
          const service = await catalogService.create(tenant.id, {
            name: `${cat.titulo} - ${item.descricao}`,
            description: cat.titulo, // Categoria salva aqui na V1
            price: item.preco,
            durationInMinutes: 30, // Mockado por enquanto
          });
          createdServicesIds.push(service.id);
        }
      }

      // 3. Garantir que o OWNER tem um perfil profissional global
      try {
        await usersService.createProfessionalProfile({
          displayName: data.nome + " Admin",
          avatarUrl: data.banner || "https://i.pravatar.cc/150",
          professionalType: ProfessionalType.BARBER,
          experienceYears: 1
        });
      } catch (e) {
        // Ignora se o perfil já existir (400 PROFESSIONAL_PROFILE_ALREADY_EXISTS)
      }

      // 4. Vincular o OWNER como profissional ativo deste tenant
      const tp = await tenantProfessionalsService.bindMe(tenant.id);

      // 5. Vincular os serviços ao perfil do profissional
      if (createdServicesIds.length > 0) {
        await tenantProfessionalsService.addOfferedServices(tenant.id, tp.id, createdServicesIds);
      }

      // 6. Realizar o Bootstrap dos horários na agenda do profissional
      const daysMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const closedDays = data.horarios.map((h, i) => h.fechado ? daysMap[i] : null).filter(Boolean) as string[];
      const firstOpen = data.horarios.find(h => !h.fechado);
      const periods = firstOpen ? [{ startTime: firstOpen.inicio, endTime: firstOpen.fim }] : [{ startTime: "09:00", endTime: "18:00" }];

      await availabilityService.bootstrapWeek(tenant.id, tp.id, {
        closedDays,
        periods,
        overwriteExisting: true
      });

      console.log("Tenant orquestrado com sucesso na API!", tenant);
      localStorage.setItem("@barbershop:tenant", tenant.slug);
      router.push("/");
    } catch (error: any) {
      console.error("Erro na orquestração do Tenant", error);
      alert(error?.response?.data?.message || "Ocorreu um erro ao criar o estabelecimento. Verifique se o slug já está em uso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextTab = (next: string) => {
    setActiveTab(next);
  };

  return (
    <div className="min-h-screen bg-black pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-5xl relative z-10 pt-28">
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
            <span className="text-zinc-500 font-medium">Novo Estabelecimento</span>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t("createTitle")}</h1>
                <p className="text-zinc-400 mt-2 text-lg">
                  {t("createSubtitle")}
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold px-8"
              >
                {isLoading ? t("saving") : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("createAccount")}
                  </>
                )}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-zinc-800/80 mb-6 overflow-x-auto scrollbar-hide">
                <TabsList className="bg-transparent h-auto p-0 flex justify-start space-x-6 w-max">
                  <TabsTrigger 
                    value="perfil"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    {t("step1")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expediente"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    {t("step2")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="servicos"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    {t("step3")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="equipe"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    {t("step4")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative">
                <TabsContent value="perfil" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <StoreProfileForm />
                  <div className="mt-8 flex justify-end">
                    <Button type="button" onClick={() => handleNextTab("expediente")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="expediente" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <HoursInputRepeater />
                  <div className="mt-8 flex justify-between">
                    <Button type="button" onClick={() => handleNextTab("perfil")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← {t("back")}
                    </Button>
                    <Button type="button" onClick={() => handleNextTab("servicos")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="servicos" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <ServiceHierarchyBuilder />
                  <div className="mt-8 flex justify-between">
                    <Button type="button" onClick={() => handleNextTab("expediente")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← {t("back")}
                    </Button>
                    <Button type="button" onClick={() => handleNextTab("equipe")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="equipe" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <TeamBuilder />
                  <div className="mt-8 flex justify-start">
                    <Button type="button" onClick={() => handleNextTab("servicos")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← {t("back")}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
