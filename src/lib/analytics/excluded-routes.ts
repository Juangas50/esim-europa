// Rutas que nunca deben cargar/disparar analytics client-side de terceros
// (GTM, Meta Pixel — cualquier script que lea location.href).
//
// /reprogramar lleva tokens de autorización en la query string
// (?ref=&token= o ?rows=ref:token,...) que nunca deben llegar a
// page_location / eventos automáticos de GA4, GTM o Meta Pixel.
// La protección es no cargar el script en absoluto en esta ruta —
// así no hay ninguna librería de terceros que pueda leer location.href,
// en vez de depender de configuración del lado del container (opaca,
// no auditable desde este repo).
const EXCLUDED_ROUTE_RE = /^\/(es|pt)\/reprogramar(\/|$)/;

export function isAnalyticsExcludedRoute(pathname: string): boolean {
  return EXCLUDED_ROUTE_RE.test(pathname);
}
