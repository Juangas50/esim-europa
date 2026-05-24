import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Imágenes optimizadas con next/image
  images: {
    formats: ["image/webp"],
  },
};

export default withNextIntl(nextConfig);
