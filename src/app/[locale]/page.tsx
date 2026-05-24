import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import Plans from "@/components/landing/Plans";
import HowItWorks from "@/components/landing/HowItWorks";
import Compatibility from "@/components/landing/Compatibility";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "RUTA34 Telecom — eSIM para Europa | Conectate al instante",
  description:
    "eSIM instantánea para argentinos, uruguayos, chilenos y brasileños que viajan a Europa. Activá en minutos, olvidate del roaming. 20 GB desde USD 39.90.",
  keywords:
    "eSIM Europa Argentina, chip virtual Europa viaje, internet Europa sin roaming, eSIM viaje Europa, esim españa latinoamerica",
  openGraph: {
    title: "RUTA34 Telecom — Llegás a Europa y ya estás conectado",
    description:
      "eSIM instantánea para viajeros latinoamericanos. Activá en minutos y navegá en 30+ países europeos.",
    type: "website",
    url: "https://ruta34.com",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Plans />
        <HowItWorks />
        <Compatibility />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
