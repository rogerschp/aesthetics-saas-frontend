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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    // Simula uma chamada API pesada que constrói todas as tabelas
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Tenant criado com sucesso:", data);
    setIsLoading(false);
    
    // Adiciona mock state para simular transição logada real
    localStorage.setItem("@barbershop:tenant", data.slug);
    
    // Fake redirect
    router.push("/");
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
            Sair
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
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Configure seu Estabelecimento</h1>
                <p className="text-zinc-400 mt-2 text-lg">
                  Preencha as informações para ativar o seu espaço no sistema.
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold px-8"
              >
                {isLoading ? "Processando..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Finalizar Configuração
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
                    1. Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expediente"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    2. Expediente
                  </TabsTrigger>
                  <TabsTrigger 
                    value="servicos"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    3. Serviços
                  </TabsTrigger>
                  <TabsTrigger 
                    value="equipe"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none rounded-none px-1 pb-3 text-zinc-400 font-medium text-base h-auto"
                  >
                    4. Equipe
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative">
                <TabsContent value="perfil" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <StoreProfileForm />
                  <div className="mt-8 flex justify-end">
                    <Button type="button" onClick={() => handleNextTab("expediente")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      Próxima Etapa →
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="expediente" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <HoursInputRepeater />
                  <div className="mt-8 flex justify-between">
                    <Button type="button" onClick={() => handleNextTab("perfil")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← Voltar
                    </Button>
                    <Button type="button" onClick={() => handleNextTab("servicos")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      Próxima Etapa →
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="servicos" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <ServiceHierarchyBuilder />
                  <div className="mt-8 flex justify-between">
                    <Button type="button" onClick={() => handleNextTab("expediente")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← Voltar
                    </Button>
                    <Button type="button" onClick={() => handleNextTab("equipe")} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      Próxima Etapa →
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="equipe" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <TeamBuilder />
                  <div className="mt-8 flex justify-start">
                    <Button type="button" onClick={() => handleNextTab("servicos")} variant="ghost" className="text-zinc-400 hover:text-white">
                      ← Voltar
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
