import { SearchBar } from "./SearchBar";

export function HeroSection() {
  return (
    <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image: Imagem real com brilho adequado para ficar visível */}
      <img 
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
        alt="Background Barbearia" 
        className="absolute inset-0 w-full h-full object-cover opacity-65 blur-[2px] pointer-events-none z-0"
      />
      <div className="absolute inset-0 bg-background/70 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0" />
      
      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center gap-10">
        <div className="space-y-6 max-w-4xl pt-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            Encontre o <span className="text-primary drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]">estilo perfeito</span> <br className="hidden md:block"/>
            perto de você
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto font-medium shadow-black drop-shadow-md">
            A plataforma definitiva para conectar você às melhores barbearias da 
            sua região. Agende seu horário com praticidade.
          </p>
        </div>

        <SearchBar />
      </div>
    </section>
  );
}
