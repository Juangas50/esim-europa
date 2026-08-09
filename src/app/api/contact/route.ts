import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "soporte@esimruta34.com";

// ── Rate limiting (in-memory, per serverless instance) ───────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW_MS = 60_000; // 1 minute window
  const MAX_REQ = 5; // max 5 contact requests per IP per minute

  if (rateLimitStore.size > 5000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQ) return true;
  entry.count++;
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(input: string): string {
  return input.replace(/[<>"'&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] ?? c));
}

function validateBody(body: unknown): { valid: true; data: { name: string; email: string; message: string } } | { valid: false; error: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Cuerpo inválido" };
  const b = body as Record<string, unknown>;

  // Honeypot — los bots suelen rellenar todos los campos, incluido este que está oculto para humanos.
  if (typeof b.website === "string" && b.website.length > 0) {
    return { valid: false, error: "Solicitud inválida" };
  }

  if (typeof b.name !== "string" || b.name.trim().length < 2 || b.name.length > 100) {
    return { valid: false, error: "Ingresá tu nombre" };
  }
  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email) || b.email.length > 254) {
    return { valid: false, error: "Email inválido" };
  }
  if (typeof b.message !== "string" || b.message.trim().length < 10 || b.message.length > 2000) {
    return { valid: false, error: "Contanos un poco más en tu mensaje (mínimo 10 caracteres)" };
  }

  return { valid: true, data: { name: b.name.trim(), email: b.email.trim(), message: b.message.trim() } };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá en unos minutos." }, { status: 429 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (rawBody.length > 8192) {
    return NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const validation = validateBody(parsedBody);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { name, email, message } = validation.data;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#1B2F4E;">Nuevo mensaje de contacto — web RUTA34</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="white-space:pre-wrap;background:#F8F8F8;padding:16px;border-radius:8px;">${escapeHtml(message)}</p>
    </div>
  `;

  const { error } = await sendEmail(SUPPORT_EMAIL, `Contacto web: ${name}`, html, undefined, email);

  if (error) {
    return NextResponse.json({ error: "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
