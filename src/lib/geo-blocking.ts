const BLOCKED_COUNTRIES = ["CN"]; // China

export function isCountryBlocked(country: string | null): boolean {
  if (!country) return false;
  return BLOCKED_COUNTRIES.includes(country);
}

export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const directIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  return forwarded?.split(",")[0].trim() || directIP || cfConnectingIP || null;
}
