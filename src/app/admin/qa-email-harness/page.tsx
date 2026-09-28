import { isQaHarnessAllowed } from "@/lib/qa-harness/guard";
import { QA_SCENARIOS } from "./fixtures";
import QaHarnessClient from "./QaHarnessClient";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function QaEmailHarnessPage() {
  const harnessAllowed = isQaHarnessAllowed();

  if (!harnessAllowed) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <div className="bg-white rounded-2xl border border-[#E9E2D8] p-8 text-center">
          <p className="text-3xl mb-4">🚫</p>
          <h1 className="text-lg font-black text-[#1E293B] mb-2">QA Email Harness deshabilitado</h1>
          <p className="text-sm text-[#64748B]">
            Este entorno no cumple los guards requeridos (VERCEL_ENV≠production + QA_HARNESS_ENABLED=true).
            Es un comportamiento esperado — el harness se niega a funcionar fuera de Preview/Development.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#C79A3E] mb-1">FASE 4C · Temporal</p>
        <h1 className="text-2xl font-black text-[#1E293B]">QA Email Harness</h1>
        <p className="text-sm text-[#64748B] mt-1">
          13 escenarios ficticios, sin datos de producción. El envío real requiere un tercer guard
          (QA_EMAIL_SEND_ENABLED) además de los dos que ya habilitan esta página.
        </p>
      </div>
      <QaHarnessClient scenarios={QA_SCENARIOS} />
    </div>
  );
}
