import { ServicoTopico } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServicesAccordionProps {
  servicos: ServicoTopico[];
}

export function ServicesAccordion({ servicos }: ServicesAccordionProps) {
  if (!servicos || servicos.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum serviço cadastrado.</p>;
  }

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
              <span className="font-medium text-foreground">{categoria.titulo}</span>
              <span className="text-xs text-muted-foreground font-normal ml-2 bg-secondary px-2 py-1 rounded-full">
                {categoria.itens.length} {categoria.itens.length === 1 ? 'opção' : 'opções'}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {categoria.itens.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 group cursor-default">
                  <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">{item.descricao}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
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
