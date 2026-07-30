# ⚡ QUICK REFERENCE - INTERACCIONES RUTA34 HOME

## 🎯 Eventos Propuestos (Recomendados)

```
CRÍTICA (Implementar Week 1-2)
├─ begin_checkout      Plan selection → GA4 + Meta
├─ cta_click           Button clicks → GA4 + Meta
├─ section_view        Section entry → GA4 + Meta
├─ plan_view           Plans loaded → GA4 + Meta
├─ navigation_click    Links clicked → GA4 only
├─ language_switch     Idioma cambio → GA4 only
├─ faq_open/close      FAQ toggle → GA4 only
├─ compatibility_search Device search → GA4 + Meta
├─ contact_initiate    Contact actions → GA4 + Meta
├─ search_submit       Country search → GA4 only
├─ mobile_menu_open/close Menu state → GA4 only
└─ social_click        Social links → GA4 + Meta

ALTA (Week 3-4)
├─ form_focus          Input focus → GA4 only
├─ badge_view          Trust signals → GA4 only
├─ guarantee_view      Guarantees → GA4 only
├─ testimonial_view    Social proof → GA4 only
├─ tooltip_view        Tooltips → GA4 only
└─ state_view          Empty/error states → GA4 only
```

---

## 🗂️ Componentes (15 Total)

| # | Componente | Interacciones | Status | Priority |
|---|-----------|---|--------|----------|
| 1 | Navbar | 11 | 60% tracked | P1 |
| 2 | Hero | 7 | 50% tracked | P1 ⚠️ DUPLO |
| 3 | Plans | 8 | 30% tracked | P1 🔴 DUPLO |
| 4 | HowItWorks | 5 | 0% tracked | P3 |
| 5 | Definition | 3 | 0% tracked | P3 |
| 6 | Benefits | 12 | 50% tracked | P2 |
| 7 | Testimonials | 6 | 0% tracked | P3 |
| 8 | Compatibility | 13 | 60% tracked | P2 |
| 9 | FAQ | 8 | 0% tracked | P2 |
| 10 | PaymentMethods | 4 | 0% tracked | P4 |
| 11 | TrustBadges | 3 | 0% tracked | P4 |
| 12 | Guarantees | 3 | 0% tracked | P4 |
| 13 | Contact | 6 | 50% tracked | P2 |
| 14 | SocialLinks | 4 | 0% tracked | P3 |
| 15 | Footer | 10 | 0% tracked | P3 |

---

## 📍 Riesgos Críticos (Fijar Week 1)

### 🔴 1. Plan Selection DUPLICACIÓN
**Ubicación:** `Plans.tsx:232-241`  
**Impacto:** CRÍTICO  
**Fix:** Consolidar 3 tracking calls en 1 función centralizada  
**Tiempo:** 30 min

### 🔴 2. Hero CTA DUPLICACIÓN
**Ubicación:** `Hero.tsx:94,182`  
**Impacto:** CRÍTICO  
**Fix:** Deduplicar por session ID (no disparar 2+ veces)  
**Tiempo:** 30 min

### 🔴 3. Meta Pixel INCOMPLETO
**Ubicación:** Multiple components  
**Impacto:** CRÍTICO  
**Fix:** Extender Meta a 10+ eventos faltantes  
**Tiempo:** 2 horas

### 🔴 4. Mobile Menu NO TRACKED
**Ubicación:** `Navbar.tsx:118-146`  
**Impacto:** CRÍTICO  
**Fix:** Agregar `mobile_menu_open/close` events  
**Tiempo:** 1 hora

**Total Phase 1:** ~4 horas

---

## 🎯 Top 12 Events (Prioridad Alta)

| Event | GA4 | Meta | Ubicación | Status |
|-------|-----|------|-----------|--------|
| `begin_checkout` | ✅ | ✅ | Plans | 🟡 DUPLO |
| `cta_click` | ✅ | ✅ | Navbar, Hero, HowItWorks, FAQ | 🟡 PARTIAL |
| `section_view` | ✅ | ✅ | ALL | ❌ MISSING |
| `plan_view` | ✅ | ✅ | Plans | ✅ TRACKED |
| `faq_open` | ✅ | ❌ | FAQ | ❌ MISSING |
| `navigation_click` | ✅ | ❌ | Navbar, Footer | ❌ MISSING |
| `language_switch` | ✅ | ❌ | Navbar | ❌ MISSING |
| `mobile_menu_open` | ✅ | ❌ | Navbar | ❌ MISSING |
| `compatibility_search` | ✅ | ✅ | DeviceCompatibilityFinder | 🟡 PARTIAL |
| `contact_initiate` | ✅ | ✅ | Contact, Compatibility | 🟡 PARTIAL |
| `social_click` | ✅ | ✅ | SocialLinks, Footer | ❌ MISSING |
| `search_submit` | ✅ | ✅ | Benefits, Compatibility | ❌ MISSING |

---

## 📊 Coverage Comparison

### Current (Before Phase 1)
```
GA4:  ████░░░░░░░░░░░░░░░░ 35%
Meta: ███░░░░░░░░░░░░░░░░░ 40%
```

### After Phase 1 (Week 2)
```
GA4:  ███████░░░░░░░░░░░░░ 55%
Meta: ██████░░░░░░░░░░░░░░ 60%
```

### After Phase 3 (Week 6)
```
GA4:  ████████████████░░░░ 85%
Meta: █████████████░░░░░░░ 75%
```

---

## ⏱️ Timeline (Estimated)

```
Week 1:  Deduplication + Meta Extension  (4-6 hrs)
         ├─ Plans event consolidation     (1 hr)
         ├─ Hero CTA dedup               (0.5 hr)
         ├─ Meta Pixel extend            (2 hrs)
         └─ Hook setup + testing         (1.5 hrs)

Week 2:  Mobile + FAQ + Contact          (6-8 hrs)
         ├─ Mobile menu tracking         (1 hr)
         ├─ FAQ tracking                 (1.5 hrs)
         ├─ Device finder contact path   (1 hr)
         └─ Full testing + deploy        (2-3 hrs)

Week 3-4: Comprehensive + Optimization   (6-10 hrs)
         ├─ Navigation tracking          (1.5 hrs)
         ├─ Social + testimonials        (1.5 hrs)
         ├─ Section entry events         (2 hrs)
         └─ QA + monitoring              (1-4 hrs)

TOTAL:   16-24 developer hours (~3-4 devs × 1 week)
```

---

## 🧪 Validation Checklist

### Before Deploy (Staging)
- [ ] Analytics Debugger Chrome extension verificado
- [ ] Todos los eventos aparecen en debug mode
- [ ] Parámetros correctos en cada evento
- [ ] No hay eventos duplicados (session check)
- [ ] No hay PII en parámetros
- [ ] TypeScript compilation limpio
- [ ] No hay console errors
- [ ] Mobile + Desktop + Tablet testado

### After Deploy (Production)
- [ ] GA4 Real Time muestra eventos (5-10 min delay)
- [ ] Meta Events Manager muestra eventos
- [ ] Event count es el esperado (no explosion de events)
- [ ] Usuarios no ven impacto visual
- [ ] Performance no se degradó (< 2s latencia events)
- [ ] No hay alertas de errores

---

## 🚨 Known Issues (Pre-Audit)

| Issue | Component | Severity | Fix Time |
|-------|-----------|----------|----------|
| Event duplicación (3x) | Plans | 🔴 Critical | 30 min |
| Event duplicación (2x) | Hero | 🔴 Critical | 30 min |
| Meta Pixel incomplete | Multiple | 🔴 Critical | 2 hrs |
| Mobile menu no tracked | Navbar | 🔴 Critical | 1 hr |
| FAQ deep links no track | FAQ | 🟠 High | 1 hr |
| Device not compatible no track | Compatibility | 🟠 High | 30 min |
| Search params inconsistent | Benefits/Compatibility | 🟠 High | 1 hr |
| Nav clicks no track | Footer | 🟠 High | 1 hr |
| Social clicks no track | SocialLinks | 🟡 Medium | 30 min |
| Section entries no track | All | 🟡 Medium | 2 hrs |

---

## 📐 Parameter Quick Reference

### Global (All Events)
```
page_path: string          // "/es" | "/pt"
page_title: string         // "RUTA34 Home"
section: string            // navbar, hero, plans, etc
device_type: string        // desktop, tablet, mobile
language: string           // es, pt
timestamp: ISO8601        // Auto
```

### Plan Events
```
plan_id: string
plan_name: string
price_usd: number
plan_size: string
is_popular: boolean
element_position: number
```

### Navigation Events
```
link_key: string
destination_url: string
link_type: string         // company, legal, support
element_text?: string
```

### Search Events
```
query_text: string
query_length: number
results_count: number
search_type: string       // country, device
```

### Contact Events
```
contact_channel: string   // whatsapp, email, phone
destination_url: string
source: string            // contact_section, device_finder, etc
```

---

## 🔗 Interacciones por Sección

### NAVBAR (11)
```
1. Logo click → navigation_click
2. "Cómo funciona" → navigation_click
3. "Planes" → navigation_click + scroll
4. "FAQ" → navigation_click + scroll
5. Language switcher → language_switch
6. "Comprar Ahora" CTA → cta_click + scroll
7. Mobile menu open → mobile_menu_open
8. Mobile menu close → mobile_menu_close
9. Mobile nav items → navigation_click (cierra menu)
10. Navbar hide on scroll → UX metric (optional)
11. Navbar show on scroll → UX metric (optional)
```

### HERO (7)
```
1. Main CTA click → cta_click [DUPLO]
2. Metric view (100K+) → metric_impression
3. Metric view (2min) → metric_impression
4. Metric view (30+) → metric_impression
5. Metric view (24/7) → metric_impression
6. Price anchor display → price_impression
7. Section entry → section_view
```

### PLANS (8)
```
1. Section entry → section_view
2. Plan card view → plan_view [TRACKED pero check]
3. Click plan CTA → begin_checkout [DUPLO x3]
4. Plan hover (optional) → element_hover
5. Tooltip open → tooltip_view
6. Tooltip CTA → navigation_click
7. Popular badge → badge_view
8. Footer info → text_impression
```

### FAQ (8)
```
1. Section entry → section_view
2. Open accordion → faq_open
3. Close accordion → faq_close
4. Answer viewed → content_view
5. Intl calls table viewed → content_view
6. WhatsApp CTA → cta_click
7. Tooltip link (from Plans) → navigation_click
8. Hash navigation → faq_open + deep_link=true
```

### COMPATIBILITY (13)
```
1. Section entry → section_view
2. Badge view → badge_view
3. Search focus → form_focus
4. Type query → search_query
5. Submit search → search_submit
6. Featured country click → filter_apply
7. Search result view → search_result_view
8. Click result → compatibility_search
9. Compatible result → compatibility_check
10. Not compatible result → compatibility_check
11. "Comprar eSIM" (compatible) → begin_checkout
12. "Consultar WhatsApp" (not compatible) → contact_initiate
13. Verification tip view → info_view
```

### BENEFITS (12)
```
1. Section entry → section_view
2. Benefit card view → benefit_view (4 cards)
3. Search focus → form_focus
4. Type country → search_query
5. Submit search → search_submit
6. Featured country chip → filter_apply
7. Search result view → search_result_view
8. Click search result → plan_select
9. Plan card click (within) → begin_checkout
10. No results state → state_view
11. Pricing disclaimer → text_impression
12. Hover benefit card → element_hover (optional)
```

---

## 💾 File Locations

| Documento | Ruta | Tamaño | Lectura |
|-----------|------|--------|----------|
| README | `.analytics-audit/README.md` | 5KB | 5 min |
| EXECUTIVE_SUMMARY | `.analytics-audit/EXECUTIVE_SUMMARY.md` | 14KB | 10 min |
| AUDIT_HOME_ANALYTICS | `.analytics-audit/AUDIT_HOME_ANALYTICS.md` | 39KB | 30 min |
| TECHNICAL_SPECS | `.analytics-audit/TECHNICAL_SPECS.md` | 17KB | 45 min |
| QUICK_REFERENCE | `.analytics-audit/QUICK_REFERENCE.md` | 8KB | 5 min |

**Total:** 83KB documentación

---

## ✅ Sign-Off Checklist

- [ ] He leído EXECUTIVE_SUMMARY.md
- [ ] Entiendo los 4 riesgos críticos
- [ ] Apruebo el roadmap de 4 fases
- [ ] Mi team está disponible para Week 1
- [ ] Se asignó ownership por componente
- [ ] Se confirma timeline (4-6 horas Phase 1)
- [ ] Se setup testing infrastructure
- [ ] Se configuró GA4 + Meta monitoring

---

**Auditoría Completada:** 30 de Julio, 2026  
**Status:** LISTO PARA IMPLEMENTACIÓN  
**Próximo:** Phase 1 - Week 1 (Deduplicación)

