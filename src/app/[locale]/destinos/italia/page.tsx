import { Metadata } from "next";
import { TOTAL_DESTINATIONS } from "@/lib/coverage";
import DestinationHero from "@/components/landing/DestinationHero";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "eSIM para Italia — RUTA34 Telecom",
    description:
      "Internet en Italia con tu eSIM de RUTA34, dentro de los GB que incluye tu plan para usar fuera de España.",
    openGraph: {
      title: "eSIM para Italia — RUTA34 Telecom",
      description: "Internet instantáneo en Italia",
    },
  };
}

export default function ItalyPage() {
  return (
    <>
      <DestinationHero
        country="Italia"
        flag="🇮🇹"
        headline="Conectate en Italia sin roaming"
        subheadline="Italia es uno de los países incluidos en tu plan. Activá en minutos, usá al llegar."
        speed="4G/5G"
      />
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-black text-[#1B2F4E] mb-4">
              Italia lista para tu viaje
            </h2>
            <p className="text-lg text-[#64748B] leading-relaxed">
              Desde Roma hasta Venecia, pasando por Milán y Florencia. Tu eSIM
              RUTA34 te conecta al llegar, sin pasos extra. Italia entra dentro
              de los GB que tu plan permite usar fuera de España.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-black/[0.07] p-6 bg-[#FAF7F2]">
              <h3 className="font-bold text-[#1B2F4E] mb-2">Red</h3>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>✓ Cobertura 4G/5G</li>
                <li>✓ Uno de los {TOTAL_DESTINATIONS} destinos con cobertura</li>
                <li>✓ Sin configuración extra al llegar</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/[0.07] p-6 bg-[#FAF7F2]">
              <h3 className="font-bold text-[#1B2F4E] mb-2">Ciudades principales</h3>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>✓ Roma, Milán, Venecia</li>
                <li>✓ Florencia, Nápoles, Turín</li>
                <li>✓ Costa Amalfitana</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
