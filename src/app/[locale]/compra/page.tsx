import { Metadata } from "next";
import PurchaseFlow from "@/components/purchase/PurchaseFlow";
import GeoProtectedCheckout from "@/components/geo/GeoProtectedCheckout";
import { getPlans } from "@/lib/plans-server";
import { isPlanCompatibleWithCountry } from "@/lib/plan-compatibility";

export const metadata: Metadata = {
  title: "Comprar eSIM — RUTA34 Telecom",
  description: "Completá tu compra de eSIM para Europa. Proceso rápido y seguro.",
  robots: { index: false }, // No indexar el flujo de compra
};

interface CompraPageProps {
  searchParams: Promise<{ plan?: string; compatible_with?: string }>;
}

export default async function CompraPage({ searchParams }: CompraPageProps) {
  const { plan, compatible_with } = await searchParams;
  let plans = await getPlans();

  // Filtrar planes si se especifica compatibilidad con un país
  if (compatible_with) {
    plans = plans.filter((p) => isPlanCompatibleWithCountry(p.id, compatible_with));
  }

  return (
    <GeoProtectedCheckout>
      <PurchaseFlow plans={plans} initialPlanId={plan} compatibleWith={compatible_with} />
    </GeoProtectedCheckout>
  );
}
