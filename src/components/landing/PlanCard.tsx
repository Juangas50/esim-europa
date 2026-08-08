'use client'

import { motion } from 'framer-motion'
import { Star, Info, WifiHigh } from '@phosphor-icons/react'
import { useTranslations, useLocale } from 'next-intl'
import Badge from '@/components/ui/Badge'
import PremiumTooltip from '@/components/ui/PremiumTooltip'
import FlagIcon from '@/components/ui/FlagIcon'
import { formatUSD } from '@/lib/utils'
import { analytics } from '@/lib/analytics'
import { trackSelectPlan } from '@/lib/analytics-ga4'
import { useMetaEvents } from '@/hooks/useMetaEvents'
import type { Plan } from '@/types'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function PlanCard({
  plan,
  index,
  isPopular,
}: {
  plan: Plan
  index: number
  isPopular: boolean
}) {
  const t = useTranslations('plans')
  const locale = useLocale()
  const { trackAddToCart } = useMetaEvents()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: EASE_OUT }}
      className={`relative flex flex-col rounded-2xl lg:rounded-3xl p-3.5 md:p-4 lg:p-4 transition-all bg-white ${
        isPopular
          ? 'border-2 border-[var(--color-gold)] shadow-lg'
          : 'border border-[var(--color-border)]'
      }`}
    >
      {/* Top: WiFi Icon + Badge "Más Elegido" */}
      <div className="flex items-start justify-between mb-2.5">
        <WifiHigh size={16} weight="bold" className="text-[var(--color-gold)]" />
        {isPopular && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-gold)] rounded-full">
            <Star size={12} weight="fill" className="text-[var(--color-navy)]" />
            <span className="text-[11px] font-bold text-[var(--color-navy)] whitespace-nowrap">
              Más elegido
            </span>
          </div>
        )}
      </div>

      {/* Plan Name */}
      <h3 className="text-lg md:text-xl lg:text-[20px] font-black mb-3 text-[var(--color-ink)] uppercase tracking-wide">
        {plan.name}
      </h3>

      {/* Primary Data Value — Large & Gold (Spain usage) */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl md:text-5xl lg:text-[48px] font-black leading-none text-[var(--color-gold)]">
            {plan.data_gb}
          </span>
          <span className="text-base md:text-lg lg:text-[16px] font-bold text-[var(--color-ink-2)]">
            GB
          </span>
        </div>
        <p className="text-[13px] text-[var(--color-ink-2)] font-medium mt-1">
          para usar en España
        </p>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-[var(--color-border)]" />

      {/* EUROPA Block (if eu_data_gb exists) — Prominent */}
      <div className="flex-1 mb-3">
        {plan.eu_data_gb && (
          <div className="flex items-start gap-2.5 p-2.5 bg-[var(--color-warm-white)] rounded-lg">
            <span className="text-xl flex-shrink-0">🌍</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-[13px] font-bold text-[var(--color-ink)] leading-tight">
                  {plan.eu_data_gb} GB en Europa
                </p>
                <PremiumTooltip
                  title="Cómo funcionan tus datos en Europa"
                  content={
                    <div className="space-y-3 text-sm text-[var(--color-ink)]">
                      <p className="leading-relaxed">
                        Tu plan incluye <strong>{plan.data_gb} GB</strong> totales. Cuando viajes por los países
                        incluidos fuera de España, podrás utilizar hasta <strong>{plan.eu_data_gb} GB</strong> de esos
                        mismos <strong>{plan.data_gb} GB</strong>.
                      </p>
                      <p className="leading-relaxed font-semibold text-[var(--color-navy)]">
                        ✓ No son GB adicionales
                      </p>
                      <p className="text-xs text-[var(--color-ink-2)]">
                        Una vez que uses los {plan.eu_data_gb} GB en roaming, solo podrás seguir usando datos dentro de
                        España.
                      </p>
                    </div>
                  }
                  footer="Los datos se cuentan en forma conjunta desde cualquier país."
                  cta={{
                    label: 'Ver países incluidos',
                    onClick: () => {
                      const comoFuncionaSection = document.getElementById('como-funciona')
                      if (comoFuncionaSection) {
                        comoFuncionaSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setTimeout(() => {
                          window.scrollBy(0, -100)
                        }, 500)
                      }
                    },
                  }}
                  icon="ⓘ"
                >
                  <button
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all hover:scale-110 bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
                    aria-label="Cómo funcionan los datos cuando viajo por Europa"
                    type="button"
                  >
                    <Info size={10} weight="bold" />
                  </button>
                </PremiumTooltip>
              </div>
              <p className="text-[12px] text-[var(--color-ink-2)] leading-tight">
                incluidos dentro de tus {plan.data_gb} GB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mb-3 border-t border-[var(--color-border)]" />

      {/* Benefits — Clean List with Emoji Anchors */}
      <div className="space-y-1.5 mb-3">
        {/* Calling */}
        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">📞</span>
          <span className="text-[12px] font-semibold text-[var(--color-ink)] flex-1">
            Llamadas España ↔ Latinoamérica
          </span>
          <PremiumTooltip
            title="Llamadas incluidas"
            content={
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--color-ink)] leading-relaxed mb-3">
                    Todas las tarifas incluyen:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
                      <span className="text-emerald-500 font-bold">✅</span>
                      <span>Llamadas ilimitadas dentro de España</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
                      <span className="text-lg">🌎</span>
                      <span>Minutos internacionales incluidos</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-navy)] mb-2">
                    Destinos destacados
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'AR', country: 'Argentina' },
                      { code: 'BR', country: 'Brasil' },
                      { code: 'UY', country: 'Uruguay' },
                      { code: 'CL', country: 'Chile' },
                      { code: 'PY', country: 'Paraguay' },
                    ].map((item) => (
                      <div
                        key={item.country}
                        className="flex items-center gap-1.5 text-xs text-[var(--color-ink)]"
                      >
                        <FlagIcon code={item.code} size="sm" />
                        <span>{item.country}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-ink-2)] mt-2">
                    ➕ Más de 60 destinos internacionales.
                  </p>
                </div>
              </div>
            }
            footer="Los minutos disponibles dependen de la tarifa contratada y del país de destino."
            cta={{
              label: 'Ver detalle completo',
              onClick: () => {
                window.location.hash = 'faq-international_calls'
              },
            }}
            icon="ⓘ"
          >
            <button className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <Info size={14} weight="bold" className="text-[var(--color-gold)]" />
            </button>
          </PremiumTooltip>
        </div>

        {/* Duration */}
        {plan.duration_days && (
          <div className="flex items-center gap-3">
            <span className="text-lg flex-shrink-0">📅</span>
            <span className="text-[12px] font-semibold text-[var(--color-ink)]">
              {plan.duration_days} días
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-[var(--color-border)]" />

      {/* Price — Large & Prominent */}
      <div className="mb-3">
        <p className="text-4xl md:text-4xl lg:text-[40px] font-black leading-none mb-1 text-[var(--color-gold)]">
          {formatUSD(plan.price_usd)}
        </p>
        <p className="text-[13px] text-[var(--color-ink-2)] font-medium">
          por {plan.duration_days} días
        </p>
      </div>

      {/* CTA Button */}
      <a
        href={`/${locale}/compra?plan=${plan.id}`}
        onClick={() => {
          analytics.planSelected(plan)
          trackSelectPlan({
            id: plan.id,
            name: plan.name,
            price: plan.price_usd,
            size: plan.size,
          })
          trackAddToCart({ id: plan.id, name: plan.name, price_usd: plan.price_usd })
        }}
        className={`w-full py-2.5 rounded-lg font-bold text-center text-sm transition-all active:scale-[0.97] hover:scale-[1.02] ${
          isPopular
            ? 'bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)] shadow-lg'
            : 'border-2 border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white'
        }`}
      >
        {t('buyPlan')}
      </a>
    </motion.div>
  )
}
