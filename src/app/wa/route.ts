import { NextResponse } from "next/server";

// Redirect propio para que los links "Escribinos por WhatsApp" de los emails
// salgan del dominio de envío (esimruta34.com) en vez de linkear directo a
// wa.me — Resend marca ese mismatch de dominio como señal de riesgo.
export async function GET() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34647204011";
  return NextResponse.redirect(`https://wa.me/${number}`, { status: 302 });
}
