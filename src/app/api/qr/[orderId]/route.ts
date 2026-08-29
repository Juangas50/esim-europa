import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sirve el QR de un pedido desde nuestro propio dominio en vez de exponer
// directo la URL de Supabase Storage — Resend marca imágenes de emails
// alojadas fuera del dominio de envío como señal de riesgo (ver /api/wa).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!UUID_RE.test(orderId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("qr-codes").download(`${orderId}.png`);
  if (error || !data) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
