/**
 * QR de QA — genera la MISMA forma de imagen que produce el flujo real
 * (misma librería `qrcode`, mismas opciones), pero codificando siempre el
 * fixture ficticio (ver fixtures.ts): SM-DP+ = "qa-fixture.invalid", un
 * TLD reservado por la IANA (RFC 2606) que está garantizado a no resolver
 * jamás. Un dispositivo real que escaneara este QR fallaría la resolución
 * DNS del SM-DP+ antes de poder aprovisionar nada — no existe ningún
 * servidor real al que pueda conectarse. No usa Storage ni red: `qrcode`
 * codifica el string en una imagen PNG en memoria, nada más.
 */
import QRCode from "qrcode";
import { parseActivationString } from "@/lib/esim/validate";

export async function generateQaQrBuffer(activationString: string): Promise<Buffer> {
  const parsed = parseActivationString(activationString);
  if (!parsed.ok) {
    throw new Error(`Fixture de QA con activationString inválido: ${parsed.error}`);
  }
  return QRCode.toBuffer(parsed.data.lpaUri, {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

export function qrBufferToDataUri(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
