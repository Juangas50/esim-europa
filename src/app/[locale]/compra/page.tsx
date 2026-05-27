import { Metadata } from "next";
import PurchaseFlow from "@/components/purchase/PurchaseFlow";
import { getPlans } from "@/lib/plans-server";

export const metadata: Metadata = {
  title: "Comprar eSIM — RUTA34 Telecom",
  description: "Completá tu compra de eSIM para Europa. Proceso rápido y seguro.",
  robots: { index: false }, // No indexar el flujo de compra
};

interface CompraPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CompraPage({ searchParams }: CompraPageProps) {
  const { plan } = await searchParams;
  const plans = await getPlans();

  return <PurchaseFlow plans={plans} initialPlanId={plan} />;
}
