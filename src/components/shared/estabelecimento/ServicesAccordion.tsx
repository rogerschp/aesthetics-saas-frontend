import { ServicoTopico } from "@/types";
import type { VarianteComponente } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServicesAccordionProps {
  servicos: ServicoTopico[];
  variante?: VarianteComponente;
}

/** Formata um valor numérico para moeda BRL */
function formatarPreco(preco: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

/**
 * ServicesAccordion
 *
 * Exibição dos serviços e preços com 3 variantes visuais:
 * - padrão: Accordion expansível agrupado por categoria (original)
 * - alternativo: Grid de cards com preço em destaque
 * - compacto: Lista plana direta sem agrupamento
 */
export function ServicesAccordion({
  servicos,
  variante = "padrao",
}: ServicesAccordionProps) {
  if (!servicos || servicos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum serviço cadastrado.
      </p>
    );
  }

  // Variante Padrão: Accordion (original)
  if (variante === "padrao") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Serviços e Preços</h3>

        <Accordion className="w-full space-y-2">
          {servicos.map((categoria) => (
            <AccordionItem
              key={categoria.id}
              value={categoria.id}
              className="border border-border/50 bg-card rounded-lg px-4 data-[state=open]:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="font-medium text-foreground">
                  {categoria.titulo}
                </span>
                <span className="text-xs text-muted-foreground font-normal ml-2 bg-secondary px-2 py-1 rounded-full">
                  {categoria.itens.length}{" "}
                  {categoria.itens.length === 1 ? "opção" : "opções"}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-3">
                {categoria.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 group cursor-default"
                  >
                    <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                      {item.descricao}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatarPreco(item.preco)}
                    </span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  // Variante Alternativo: Grid de cards com preço em destaque
  if (variante === "alternativo") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Serviços e Preços</h3>

        <div className="space-y-6">
          {servicos.map((categoria) => (
            <div key={categoria.id}>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {categoria.titulo}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoria.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-card border border-border/40 rounded-xl p-4 hover:border-primary/50 transition-colors group"
                  >
                    <span className="text-sm text-card-foreground group-hover:text-primary transition-colors flex-1 mr-3">
                      {item.descricao}
                    </span>
                    <span className="text-base font-bold text-primary shrink-0">
                      {formatarPreco(item.preco)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Variante Compacto: Lista plana sem agrupamento
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Serviços e Preços</h3>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {servicos.flatMap((categoria) =>
          categoria.itens.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center px-5 py-3 border-b border-border/20 last:border-0 hover:bg-muted/5 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {item.descricao}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {categoria.titulo}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground ml-4 shrink-0">
                {formatarPreco(item.preco)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
