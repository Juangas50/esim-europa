"use client";

const DESTINATIONS = [
  { flag: "🇦🇷", name: "Argentina (fijo)", basico: 200, plus: 400, total: 500, max: 550, premium: 600 },
  { flag: "🇦🇷", name: "Argentina (móvil)", basico: 50, plus: 75, total: 100, max: 150, premium: 200 },
  { flag: "🇧🇷", name: "Brasil", basico: 500, plus: 2000, total: 3000, max: 3000, premium: 3000 },
  { flag: "🇺🇾", name: "Uruguay (fijo)", basico: 200, plus: 300, total: 400, max: 450, premium: 500 },
  { flag: "🇺🇾", name: "Uruguay (móvil)", basico: 50, plus: 75, total: 100, max: 150, premium: 200 },
  { flag: "🇵🇾", name: "Paraguay", basico: 200, plus: 300, total: 400, max: 450, premium: 500 },
  { flag: "🇨🇱", name: "Chile", basico: 200, plus: 400, total: 500, max: 550, premium: 600 },
];

const PLANS = [
  { name: "Básico", color: "bg-slate-100", textColor: "text-slate-700" },
  { name: "Plus", color: "bg-blue-100", textColor: "text-blue-700" },
  { name: "Total", color: "bg-emerald-100", textColor: "text-emerald-700" },
  { name: "Max", color: "bg-amber-100", textColor: "text-amber-700" },
  { name: "Premium", color: "bg-purple-100", textColor: "text-purple-700" },
];

export default function InternationalCallsTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-[var(--color-navy)] text-white">
            <th className="p-3 text-left font-bold">Destino</th>
            {PLANS.map((plan) => (
              <th key={plan.name} className="p-3 text-center font-bold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {DESTINATIONS.map((dest, idx) => (
            <tr
              key={`${dest.name}-${idx}`}
              className={`border-b border-[var(--color-border)] ${
                idx % 2 === 0 ? "bg-white" : "bg-[var(--color-warm-white)]"
              } hover:bg-[var(--color-gold)]/5 transition-colors`}
            >
              {/* Destination */}
              <td className="p-3 font-semibold text-[var(--color-navy)] whitespace-nowrap">
                <span className="mr-2">{dest.flag}</span>
                {dest.name}
              </td>

              {/* Minutes per plan */}
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold">
                  {dest.basico}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold">
                  {dest.plus}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold">
                  {dest.total}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-amber-100 text-amber-700 font-bold">
                  {dest.max}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-purple-100 text-purple-700 font-bold">
                  {dest.premium}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
