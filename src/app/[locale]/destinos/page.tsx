import { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Destinos — eSIM para Europa | RUTA34 Telecom",
    description:
      "eSIM con cobertura en 34+ países de Europa. Elige tu destino y conectate sin roaming.",
    openGraph: {
      title: "Destinos — eSIM para Europa",
      description: "Cobertura en toda Europa",
    },
  };
}

const DESTINATIONS = [
  { name: "España", slug: "espana", flag: "🇪🇸", coverage: "99%" },
  { name: "Italia", slug: "italia", flag: "🇮🇹", coverage: "98%" },
  { name: "Francia", slug: "francia", flag: "🇫🇷", coverage: "99%" },
  { name: "Alemania", slug: "alemania", flag: "🇩🇪", coverage: "99%" },
  { name: "Portugal", slug: "portugal", flag: "🇵🇹", coverage: "98%" },
  { name: "Suiza", slug: "suiza", flag: "🇨🇭", coverage: "97%" },
  { name: "Reino Unido", slug: "reino-unido", flag: "🇬🇧", coverage: "99%" },
  { name: "Holanda", slug: "holanda", flag: "🇳🇱", coverage: "98%" },
  { name: "Bélgica", slug: "belgica", flag: "🇧🇪", coverage: "99%" },
  { name: "Polonia", slug: "polonia", flag: "🇵🇱", coverage: "97%" },
];

export default function DestinationsPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-[#1B2F4E] mb-4 tracking-tight">
            34+ Destinos en Europa
          </h1>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Elige tu destino y obtén internet instantáneo sin roaming. La misma
            experiencia RUTA34 en todos lados.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/${locale}/destinos/${dest.slug}`}
              className="group"
            >
              <div className="rounded-2xl bg-white border border-black/[0.07] p-8 h-full hover:border-[#C9973A] transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4">{dest.flag}</div>
                <h3 className="text-xl font-bold text-[#1B2F4E] mb-2">
                  {dest.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#94A3B8]">Cobertura</span>
                  <span className="text-lg font-bold text-[#C9973A]">
                    {dest.coverage}
                  </span>
                </div>
                <div className="mt-4 text-sm font-semibold text-[#C9973A] group-hover:translate-x-1 transition-transform">
                  Ver detalles →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="mt-16 rounded-2xl bg-white border border-black/[0.07] p-8">
          <h2 className="text-2xl font-bold text-[#1B2F4E] mb-4">
            ¿Tu destino no está listado?
          </h2>
          <p className="text-[#64748B] mb-4">
            RUTA34 cubre 34+ países en Europa. Si tu destino no aparece aquí,
            contactanos y lo agregamos. Cada semana sumamos nuevos países a
            nuestra red.
          </p>
          <a
            href="mailto:soporte@ruta34.com"
            className="text-[#C9973A] font-semibold hover:underline"
          >
            soporte@ruta34.com
          </a>
        </div>
      </div>
    </div>
  );
}
