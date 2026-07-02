"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CaretDown, DeviceMobile, WhatsappLogo, QrCode } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ── Lista completa de dispositivos compatibles ───────────────────────────────
const DEVICE_BRANDS = [
  {
    brand: "Apple",
    models:
      "iPhone 17 Air, iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, iPhone 17e, iPhone 16 Pro Max, iPhone 16 Pro, iPhone 16 Plus, iPhone 16, iPhone 15 Pro Max, iPhone 15 Pro, iPhone 15 Plus, iPhone 15, iPhone 14 Pro Max, iPhone 14 Pro, iPhone 14 Plus, iPhone 14, iPhone 13 Pro Max, iPhone 13 Pro, iPhone 13 Mini, iPhone 13, iPhone 12 Pro Max, iPhone 12 Pro, iPhone 12, iPhone 12 Mini, iPhone 11 Pro Max, iPhone 11 Pro, iPhone 11, iPhone XS Max, iPhone XS, iPhone XR, iPhone SE (2ª gen. y posteriores)",
  },
  {
    brand: "Samsung",
    models:
      "Galaxy S26/S25/S24/S23/S22/S21/S20 series, Galaxy Note 20 series, Galaxy Z Fold 2–7, Galaxy Z Flip / Z Flip 3–7, Galaxy A35 5G, A54 5G, A55 5G, A56 5G, A57",
  },
  {
    brand: "Google Pixel",
    models:
      "Pixel 10, 10 Pro, 10 Pro XL, 10 Pro Fold, 10a · Pixel 9, 9 Pro, 9 Pro XL, 9 Pro Fold, 9a · Pixel 8, 8 Pro, 8a · Pixel 7, 7 Pro · Pixel 6, 6 Pro, 6a · Pixel 5a · Pixel 4, 4 XL, 4a · Pixel 3, 3 XL, 3a, 3a XL · Pixel Fold",
  },
  {
    brand: "Motorola",
    models:
      "Razr 2019/2022/5G, Razr 40/50/60/70 series, Razr Fold · Edge 40/50/60/70 series · Moto G Power, G34/35/53/54/55/56/67/75/84/85/86 5G",
  },
  {
    brand: "Xiaomi",
    models:
      "14, 14 Pro, 14T, 14T Pro · 15, 15 Ultra, 15T · 17, 17 Ultra · 13 Lite, 13T, 13T Pro · 12T Pro · Redmi Note 13 Pro/Pro+ 5G, Note 14 Pro/Pro+ 5G, Note 15 Pro/Pro+ 5G",
  },
  {
    brand: "Oppo",
    models:
      "Find X3 Pro, X5, X5 Pro, X8, X8 Pro, X8 Ultra, X9, X9 Pro, X9 Ultra · Find N2 Flip · Reno 5A, 6 Pro, 9A, Reno 13/14/15 series · A55s 5G, A6 Pro 5G",
  },
  {
    brand: "Honor",
    models:
      "Magic 6 Pro, Magic V4 Pro, Magic V5, Magic V5 Pro, Magic V7 Lite, Magic 7 Pro, Magic 8 Lite, Magic 8 Pro · 90 5G, 200/400/600 series",
  },
  {
    brand: "Sony Xperia",
    models: "Xperia 1 IV, 1 V · Xperia 5 IV · Xperia 10 III Lite, 10 IV, 10 V · Xperia Ace III",
  },
  {
    brand: "Huawei",
    models: "P40, P40 Pro · Mate 40 Pro · Pura 70 Pro",
  },
  {
    brand: "Nokia",
    models: "G60 5G · X30 · XR21",
  },
  {
    brand: "Alcatel / TCL",
    models: "TCL 50 5G, 50 Nxtpaper 5G, 50 Pro Nxtpaper 5G · TCL 60 5G, 60 Ultra Nxtpaper 5G · TCL 70 Pro Nxtpaper 5G",
  },
  {
    brand: "Vivo",
    models: "V50 Lite 5G · V29 5G · X300 / X300 Pro / X300 Ultra / X300 FE 5G · Y31 5G",
  },
  {
    brand: "ZTE",
    models: "Nubia Flip 5G · Libero 5G III",
  },
  {
    brand: "Realme",
    models: "Realme 14 Pro 5G",
  },
];

// ── Sub-componente: item acordeón ────────────────────────────────────────────
function FAQItem({
  icon,
  question,
  children,
}: {
  icon: React.ReactNode;
  question: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ backgroundColor: "var(--color-warm-white)" }}
        className="w-full flex items-center justify-between gap-3 py-4 text-left rounded-xl px-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-gold)] shrink-0">{icon}</span>
          <span className="text-base font-semibold text-[var(--color-navy)]">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="text-[var(--color-ink-2)] shrink-0"
        >
          <CaretDown size={16} weight="bold" />
        </motion.div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: open ? 1 : 0, height: open ? "auto" : 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="overflow-hidden"
      >
        <div className="pb-4 px-2 pl-12">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-componente: lista de dispositivos ────────────────────────────────────
function DeviceList({ label }: { label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p className="text-sm text-[var(--color-ink)] leading-relaxed mb-4">{label}</p>

      <motion.button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] hover:underline mb-3 transition-transform"
      >
        <DeviceMobile size={14} weight="fill" />
        {expanded ? "Ocultar lista" : "Ver lista completa de modelos compatibles"}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <CaretDown size={12} weight="bold" />
        </motion.div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: expanded ? 1 : 0, height: expanded ? "auto" : 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="overflow-hidden space-y-3 mt-3"
      >
        {DEVICE_BRANDS.map((b) => (
          <div key={b.brand}>
            <p className="text-xs font-bold text-[var(--color-navy)] mb-1">{b.brand}</p>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">{b.models}</p>
          </div>
        ))}
        <p className="text-xs text-[var(--color-ink)] bg-[var(--color-warm-white)] border border-[var(--color-gold)]/20 rounded-lg p-3 leading-relaxed">
          Si compraste tu iPhone en EE.UU. sin ranura SIM física (iPhone 16 en adelante), solo podés usar eSIM — es totalmente compatible.
        </p>
      </motion.div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function PurchaseFAQ() {
  const t = useTranslations("purchase.faq");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="rounded-2xl bg-white border border-[var(--color-border)] p-6 shadow-sm"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-2)] mb-6">{t("title")}</p>

      <FAQItem
        icon={<DeviceMobile size={16} weight="fill" />}
        question={t("compatible.q")}
      >
        <DeviceList label={t("compatible.tip")} />
      </FAQItem>

      <FAQItem
        icon={<WhatsappLogo size={16} weight="fill" />}
        question={t("whatsapp.q")}
      >
        <p className="text-sm text-[var(--color-ink)] leading-relaxed">{t("whatsapp.a")}</p>
      </FAQItem>

      <FAQItem
        icon={<QrCode size={16} weight="fill" />}
        question={t("qr.q")}
      >
        <p className="text-sm text-[var(--color-ink)] leading-relaxed">{t("qr.a")}</p>
      </FAQItem>
    </motion.div>
  );
}
