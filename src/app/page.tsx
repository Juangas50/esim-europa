import { redirect } from "next/navigation";

// El middleware de next-intl redirige automáticamente a /es o /pt
// Esta página es un fallback de seguridad
export default function RootPage() {
  redirect("/es");
}
