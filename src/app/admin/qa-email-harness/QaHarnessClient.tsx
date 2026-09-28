"use client";

import { useState } from "react";
import type { QaScenario } from "./fixtures";
import { previewQaScenario, sendQaTestEmail, type QaPreviewResponse } from "./actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function groupByEmail(scenarios: QaScenario[]) {
  const groups = new Map<number, QaScenario[]>();
  for (const s of scenarios) {
    const list = groups.get(s.emailNumber) ?? [];
    list.push(s);
    groups.set(s.emailNumber, list);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
}

export default function QaHarnessClient({ scenarios }: { scenarios: QaScenario[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<QaPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop");

  // Recipient: NUNCA precargado, NUNCA leído de query params/localStorage/fixtures.
  const [to, setTo] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  const grouped = groupByEmail(scenarios);

  async function handlePreview(id: string) {
    setSelectedId(id);
    setPreview(null);
    setPreviewError(null);
    setConfirming(false);
    setSendResult(null);
    setLoadingPreview(true);
    try {
      const result = await previewQaScenario(id);
      setPreview(result);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Error generando la preview.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleConfirmSend() {
    if (!preview) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await sendQaTestEmail(preview.scenarioId, to);
      setSendResult(
        res.ok
          ? { ok: true, message: "Enviado. Revisá la bandeja de entrada de QA." }
          : { ok: false, message: res.error }
      );
      if (res.ok) setConfirming(false);
    } catch (e) {
      setSendResult({ ok: false, message: e instanceof Error ? e.message : "Error enviando." });
    } finally {
      setSending(false);
    }
  }

  const toValid = EMAIL_RE.test(to.trim());

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      {/* Selector de escenarios */}
      <div className="bg-white rounded-2xl border border-[#E9E2D8] p-4 h-fit">
        {grouped.map(([emailNumber, list]) => (
          <div key={emailNumber} className="mb-4 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9AA0AC] mb-2">
              {list[0].emailLabel}
            </p>
            <div className="space-y-1">
              {list.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handlePreview(s.id)}
                  className={`w-full text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                    selectedId === s.id
                      ? "bg-[#1C3454] text-white"
                      : "bg-[#F5EFE3] text-[#1E293B] hover:bg-[#EFE6D2]"
                  }`}
                >
                  <span className="font-mono text-xs opacity-70 mr-2">
                    {String(s.order).padStart(2, "0")}
                  </span>
                  {s.variantLabel}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Panel de preview + envío */}
      <div className="space-y-4">
        {!selectedId && (
          <div className="bg-white rounded-2xl border border-[#E9E2D8] p-8 text-center text-sm text-[#64748B]">
            Elegí un escenario de la lista para previsualizarlo.
          </div>
        )}

        {loadingPreview && (
          <div className="bg-white rounded-2xl border border-[#E9E2D8] p-8 text-center text-sm text-[#64748B]">
            Generando preview…
          </div>
        )}

        {previewError && (
          <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#991B1B]">
            {previewError}
          </div>
        )}

        {preview && !loadingPreview && (
          <>
            <div className="bg-white rounded-2xl border border-[#E9E2D8] p-5">
              <dl className="grid grid-cols-[100px_1fr] gap-y-1 text-sm mb-4">
                <dt className="text-[#9AA0AC]">EMAIL</dt>
                <dd className="font-semibold text-[#1E293B]">
                  {preview.emailLabel} · {preview.variantLabel}
                </dd>
                <dt className="text-[#9AA0AC]">SUBJECT</dt>
                <dd className="text-[#1E293B]">{preview.subject}</dd>
              </dl>

              <details className="mb-4">
                <summary className="text-xs font-bold uppercase tracking-wide text-[#9AA0AC] cursor-pointer">
                  Variables/fixture utilizado
                </summary>
                <pre className="mt-2 text-xs bg-[#F5EFE3] rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(preview.variablesUsed, null, 2)}
                </pre>
              </details>

              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setViewport("mobile")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${viewport === "mobile" ? "bg-[#1C3454] text-white" : "bg-[#F5EFE3] text-[#1E293B]"}`}
                >
                  Mobile 390px
                </button>
                <button
                  onClick={() => setViewport("desktop")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${viewport === "desktop" ? "bg-[#1C3454] text-white" : "bg-[#F5EFE3] text-[#1E293B]"}`}
                >
                  Desktop 640px
                </button>
              </div>

              <div className="border border-[#E9E2D8] rounded-xl overflow-hidden bg-[#ECE4D3]">
                <iframe
                  key={preview.scenarioId + viewport}
                  title="QA email preview"
                  srcDoc={preview.previewHtml}
                  sandbox=""
                  style={{
                    width: viewport === "mobile" ? "390px" : "640px",
                    height: "900px",
                    maxWidth: "100%",
                    border: "none",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </div>
            </div>

            {/* Envío de prueba */}
            <div className="bg-white rounded-2xl border border-[#E9E2D8] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9AA0AC] mb-3">
                Enviar email de prueba
              </p>

              {!preview.sendEnabled && (
                <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3 text-sm text-[#92400E] mb-3">
                  Envío deshabilitado en este entorno (falta QA_EMAIL_SEND_ENABLED=true). Solo preview disponible.
                </div>
              )}

              <label className="block mb-3">
                <span className="text-sm font-semibold text-[#1E293B] mb-1 block">
                  Dirección de QA (manual, nunca recordada)
                </span>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setConfirming(false);
                    setSendResult(null);
                  }}
                  placeholder="tu-direccion@ejemplo.com"
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#E9E2D8] px-4 py-2.5 text-sm"
                  disabled={!preview.sendEnabled}
                />
              </label>

              {!confirming && (
                <button
                  onClick={() => setConfirming(true)}
                  disabled={!preview.sendEnabled || !toValid}
                  className="bg-[#C79A3E] text-[#1C3454] font-bold rounded-xl px-5 py-2.5 text-sm disabled:opacity-40"
                >
                  Revisar antes de enviar
                </button>
              )}

              {confirming && (
                <div className="border border-[#C79A3E] rounded-xl p-4 bg-[#F5EFE3]">
                  <dl className="grid grid-cols-[90px_1fr] gap-y-1 text-sm mb-4">
                    <dt className="text-[#9AA0AC]">EMAIL</dt>
                    <dd className="font-semibold">{preview.emailLabel} · {preview.variantLabel}</dd>
                    <dt className="text-[#9AA0AC]">TO</dt>
                    <dd className="font-mono">{to.trim()}</dd>
                    <dt className="text-[#9AA0AC]">SUBJECT</dt>
                    <dd>[QA] {preview.subject}</dd>
                  </dl>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmSend}
                      disabled={sending}
                      className="bg-[#1C3454] text-white font-bold rounded-xl px-5 py-2.5 text-sm disabled:opacity-40"
                    >
                      {sending ? "Enviando…" : "ENVIAR EMAIL DE PRUEBA"}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      disabled={sending}
                      className="text-[#64748B] font-semibold text-sm px-3"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {sendResult && (
                <div
                  className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                    sendResult.ok ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                  }`}
                >
                  {sendResult.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
