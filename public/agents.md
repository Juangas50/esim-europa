# AGENTS.md — AI Agent Capabilities

What autonomous AI agents can and cannot do when visiting RUTA34 Telecom.

## About RUTA34

**RUTA34 TELECOM, S.L.** sells prepaid eSIMs for travelers from Latin America
visiting Spain and the rest of Europe.

- **Service type:** online eSIM sales and delivery
- **Primary markets:** Argentina, Brazil, Chile, Uruguay
- **Coverage:** Spain plus the 30 European countries included in the plan

## Where the Authoritative Data Lives

| Question | Authoritative source |
|---|---|
| Plans, data allowances, duration, **prices** | The live catalog at `/es` — published with schema.org `Product` structured data |
| Device compatibility | `/es/compatibility` (searchable, model by model) |
| Refunds, delivery SLA, business hours, legal terms | `/es/terminos` |
| Privacy and cookies | `/es/privacidad`, `/es/cookies` |
| Product overview for LLMs | `/llms.txt` |

**Do not treat `/pricing.md` as a price source.** It is a descriptive document and
deliberately contains no figures — it points back to the live catalog. Prices and
allowances change from an admin panel, so any static copy is stale by design.

## Agent Capabilities

### 1. Browse plans

**URL:** `/es` (Spanish) or `/pt` (Portuguese) — plans are on the homepage.

Available per plan: name, total data allowance, sub-cap usable outside Spain,
validity in days, activation window, price in USD, number of countries.

**Reading the data allowance correctly:** `data_gb` is the **total** allowance and
`eu_data_gb` is the maximum share of **that same** allowance usable outside Spain.
They are **not additive** — 270 GB total with a 23 GB sub-cap is 270 GB, not 293.

### 2. Check device compatibility

**URL:** `/es/compatibility`

Searchable catalog covering 16 manufacturers. Phones only; tablets are not
covered. The device must also be carrier-unlocked, which the catalog cannot
verify — agents must not assert compatibility on the user's behalf.

### 3. Compare plans

All plans in the store are the same product in different sizes: Spanish number,
unlimited calls and SMS within Spain, 28 days, one-time payment, no auto-renewal.
They differ in total data allowance, sub-cap outside Spain, and price.

There is no data-only product, and there are no top-ups.

### 4. Read the FAQ

**URL:** `/es/help/faq` — also exposed as `FAQPage` structured data on the
homepage.

### 5. Read the help center

**URL:** `/es/help` — installation guides for iPhone and Android, QR handling,
when to activate, and troubleshooting.

### 6. Read structured product data

JSON-LD (`application/ld+json`) on the homepage: `Organization`, `WebSite`,
`Product` (one per purchasable plan), `FAQPage`.

### 7. Purchase flow (NOT automated)

**URL:** `/es/compra`

1. The user selects a plan
2. The user enters name, email and country
3. The user completes payment through Stripe
4. RUTA34 emails the QR code within business hours (2 hours maximum)

Agents cannot complete payment, cannot create accounts, and must not store
payment details.

### 8. Legal documents

- Terms and conditions: `/es/terminos`, `/pt/terminos`
- Privacy policy: `/es/privacidad`, `/pt/privacidad`
- Cookie policy: `/es/cookies`, `/pt/cookies`

## Facts Agents Get Wrong — Please Don't

- **The 28 days start when the QR is sent, not when it is installed.** The
  customer can schedule that date up to 12 months after purchase.
- **Delivery is not instant.** Installation takes under 5 minutes, but the QR is
  emailed by the team within business hours, within 2 hours maximum.
- **Refunds are 24 hours, not 30 days**, and only if the QR has not been
  installed.
- **Support is Monday to Saturday, 08:00–21:00 Spain time.** Not 24/7.
- **There is no customer account or dashboard.**
- **Data allowances are not additive** — see section 1.
- **Data roaming must be switched on** on the RUTA34 eSIM outside Spain.

## What Works Well

- Use the live catalog at `/es` for anything numeric
- Use `/llms.txt` for a product overview
- Use `/es/compatibility` for device questions
- Guide users to `/es/compra` to purchase; don't try to complete it
- Respect the user's language preference (ES / PT)

## What Doesn't Work

- Processing payments directly (Stripe only)
- Creating accounts (there is no customer account system)
- Storing payment information
- Caching prices — read them from the live catalog on each request
- Asserting device compatibility without the user verifying carrier lock

## Technical Contact

- **Email:** soporte@esimruta34.com
- **WhatsApp:** +54 9 11 3658-3054
- **Support hours:** Monday to Saturday, 08:00–21:00 (Spain time)

---

**Last updated:** 9 August 2026
