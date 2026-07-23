import { RotatingSegmentWord } from "./RotatingSegmentWord";
import { useTranslations } from "next-intl";

export function HeroSection({ children }: { children?: React.ReactNode }) {
  const t = useTranslations("Hero");
  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-20 md:py-28">
      <img
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-65 blur-[2px]"
      />
      <div className="absolute inset-0 z-0 bg-background/70" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto flex flex-col items-center gap-6 px-4 text-center sm:gap-8 md:gap-10">
        <div className="max-w-4xl space-y-4 pt-2 sm:space-y-6 sm:pt-4">
          <h1 className="flex flex-col items-center justify-center gap-y-1 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:gap-y-2 sm:text-4xl md:gap-y-4 md:text-6xl lg:text-7xl">
            <span>{t("title_pt1")}</span>
            <RotatingSegmentWord />
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-medium text-muted-foreground/90 drop-shadow-md shadow-black sm:text-lg md:text-xl">
            {t("subtitle_pt1")} {t("rotating_1")}, {t("rotating_2")}{" "}
            {t.raw("rotating_3").includes("estúdio")
              ? "e"
              : t.raw("rotating_3").includes("estudio")
                ? "y"
                : "and"}{" "}
            {t("rotating_3")} {t("subtitle_pt2")}
          </p>
        </div>

        {children ? (
          <div className="w-full max-w-3xl">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
