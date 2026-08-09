import { Metadata } from "next";
import { useTranslations } from "next-intl";
import DestinationHero from "@/components/landing/DestinationHero";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "eSIM para España — RUTA34 Telecom",
    description:
      "Conectate en España al llegar. eSIM con cobertura nacional 4G/5G y número español incluido.",
    openGraph: {
      title: "eSIM para España — RUTA34 Telecom",
      description: "Internet sin roaming en España",
    },
  };
}

export default function SpainPage() {
  return (
    <>
      <DestinationHero
        country="España"
        flag=""
        headline="Llega a España y ya tenés internet"
        subheadline="Cobertura nacional 4G/5G sobre red española certificada. Instalá antes de viajar y usá al llegar."
        speed="4G/5G"
      />
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-black text-[#1B2F4E] mb-4">
              Cobertura premium en España
            </h2>
            <p className="text-lg text-[#64748B] leading-relaxed">
              Tu eSIM RUTA34 funciona en todos los destinos principales: Madrid,
              Barcelona, Valencia, Sevilla, Bilbao y más. Conectate desde el
              aeropuerto, sin pasar por mostradores ni comprar tarjetas físicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-black/[0.07] p-6 bg-[#FAF7F2]">
              <h3 className="font-bold text-[#1B2F4E] mb-2">Red</h3>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>✓ Red española certificada</li>
                <li>✓ Cobertura 4G/5G</li>
                <li>✓ Número español incluido</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/[0.07] p-6 bg-[#FAF7F2]">
              <h3 className="font-bold text-[#1B2F4E] mb-2">Planes disponibles</h3>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>✓ Europa Básico, Plus, Total, Max y Premium</li>
                <li>✓ 28 días de validez</li>
                <li>✓ Hasta 12 meses para elegir cuándo activar</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
