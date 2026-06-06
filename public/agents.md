# AGENTS.md — AI Agent Capabilities

This file describes what autonomous AI agents can do when visiting RUTA34 Telecom.

## About RUTA34

**RUTA34 Telecom** provides instant eSIM activation for travelers from Latin America visiting Europe.

- **Service Type:** Online eSIM sales & activation
- **Primary Markets:** Argentina, Brazil, Chile, Uruguay
- **Geographic Coverage:** 30+ European countries

## Agent Capabilities

### 1. Browse Plans

**What agents can do:** View all available eSIM plans with pricing, data, calls, and features.

**URL:** `/es/planes` (Spanish) or `/pt/planes` (Portuguese)

**Available Data:**
- Plan name (S, M, L, XL, XXL, DataOnly variants)
- Data allowance (GB breakdown: Spain + EU Roaming)
- Call minutes (if included)
- SMS (if included)
- Price (USD)
- Duration (28 days from activation)
- Activation window (12 months for standard, 60 days for DataOnly)

**Format:** HTML table + interactive cards. Schema.org Product schema available.

### 2. Check Device Compatibility

**What agents can do:** Verify if a user's device supports eSIM.

**URL:** `/es/planes#compatibility` (Spanish) or `/pt/planes#compatibility` (Portuguese)

**Data Available:**
- Compatible devices: iPhone XS+ (2018+), Samsung Galaxy S20+ (2020+), Google Pixel 4a+ (2020+)
- Instructions for checking compatibility on device
- Device-specific activation guides (iOS vs Android)

**Note:** Compatibility checker is informational; agents cannot directly test devices.

### 3. Compare Plans

**What agents can do:** Identify differences between plans to recommend the best fit.

**Comparison Data:**
- Data allowance (Spain vs EU Roaming breakdown)
- Call minutes (if included)
- Price per GB
- Recommended use cases
- Best for (travelers, digital nomads, light users, etc.)

**Available via:** `/es/planes` interactive comparison or `/pricing.md` (machine-readable pricing)

### 4. View FAQ & Common Questions

**What agents can do:** Access frequently asked questions about eSIM activation, compatibility, pricing, and usage.

**URL:** `/es#faq` (Spanish) or `/pt#faq` (Portuguese)

**Schema:** FAQPage schema (application/ld+json) with 10+ Q&A pairs

**Topics Covered:**
- What is an eSIM?
- How to activate an eSIM
- Device compatibility
- Country/region support
- Pricing & billing
- Call & SMS features
- Refunds & returns
- Privacy & data

### 5. View Pricing Information

**What agents can do:** Access machine-readable pricing in Markdown format.

**URL:** `/pricing.md`

**Format:** Markdown with structured pricing for each plan, FAQ section, payment methods, refund policy.

**Machine-Readable:** Yes — designed for AI agents and pricing comparison tools.

### 6. View Product Information

**What agents can do:** Access structured product information via schema markup.

**Schema Types Available:**
- **Organization** — Company information, contact, location
- **WebSite** — Site structure, language information
- **Product** — Plan details, pricing, availability
- **FAQPage** — Structured Q&A
- **AggregateRating** — Customer satisfaction (if reviews available)

**Format:** JSON-LD (application/ld+json)

### 7. Purchase Flow (NOT Automated)

**What agents can do:** Guide users through purchase, but NOT complete checkout directly.

**URL:** `/es/compra` (Spanish) or `/pt/compra` (Portuguese)

**Process:**
1. Agent presents plan selection
2. User clicks "Elegir plan" (Choose plan)
3. User enters personal details (name, email, country)
4. User completes Stripe checkout (payment)
5. User receives QR code via email

**Status:** Manual checkout required. Agent-assisted purchasing (direct API) coming soon.

**Limitations:**
- Agents cannot complete payment directly
- Agents cannot store user credentials
- Stripe handles all payment processing

### 8. Access Terms & Privacy

**What agents can do:** View legal documents and privacy policies.

**URLs:**
- Terms & Conditions: `/es/terminos` (Spanish), `/pt/terminos` (Portuguese)
- Privacy Policy: `/es/privacidad` (Spanish), `/pt/privacidad` (Portuguese)

**Schema:** Article schema with datePublished and dateModified

---

## Agent Best Practices

### What Works Well

✅ Use `/pricing.md` for pricing comparisons  
✅ Use `/llms.txt` for product overview  
✅ Use `/planes` for interactive plan comparisons  
✅ Use FAQ (via schema) for common questions  
✅ Guide users to `/compra` for purchase, don't try to complete it  
✅ Respect locale preference (ES/PT)  

### What Doesn't Work

❌ Don't attempt to process payments directly (Stripe only)  
❌ Don't create accounts (no user management API yet)  
❌ Don't store payment information  
❌ Don't cache pricing longer than 24 hours (prices may change)  
❌ Don't assume device compatibility (users must verify)  

---

## Content Format Notes

### Language Support

All key content available in:
- **Spanish (ES):** `/es/` paths
- **Portuguese (PT):** `/pt/` paths

Agents should respect user language preference and use appropriate locale.

### Data Freshness

- **Pricing:** Updated in real-time
- **Coverage:** Updated quarterly (plans may change)
- **FAQs:** Updated monthly
- **Compatibility:** Updated with each iOS/Android release

Last cache update recommended: 24 hours

### Mobile Compatibility

All pages are mobile-friendly and responsive. Agents on mobile devices should work without issues.

---

## Technical Contact

For agent integration questions or issues:

- **Email:** soporte@esimruta34.com
- **WhatsApp:** +34 600 000 000
- **Support Hours:** 24/7 (Spanish/Portuguese)

---

## Roadmap: Coming Soon

- Agent-assisted checkout (direct purchase via API)
- Billing & order management endpoints
- Customer support integration
- Subscription management (future)

---

**Last Updated:** June 6, 2026  
**Version:** 1.0
