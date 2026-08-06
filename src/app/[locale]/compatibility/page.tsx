import { Metadata } from "next";
import Compatibility from "@/components/landing/Compatibility";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "compatibility" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default function CompatibilityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Compatibility />
    </main>
  );
}
