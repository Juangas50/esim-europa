<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CI y protección de `main`

Desde 2026-08-10 hay un ruleset de GitHub en `main` (Settings → Rulesets →
`main-protection`) + `.github/workflows/ci.yml`:

- Cada push/PR corre `npm run build` (bloqueante) y `npm run lint`
  (informativo, hay deuda técnica vieja de `no-explicit-any` sin resolver).
- El rol `Repository admin` está en la bypass list del ruleset con "Always
  allow" → **el push directo a `main` sigue funcionando igual que siempre**,
  para el dueño del repo y para Claude operando con su sesión. El PR +
  check obligatorio solo aplica a quien no tenga ese bypass. No cambia el
  flujo de trabajo de todos los días.
- Se creó después de un incidente donde un build roto en `main` (error de
  sintaxis en `src/lib/resend/index.ts`) bloqueó en silencio el deploy de un
  fix urgente de checkout — nadie se enteró hasta revisar los logs de
  Vercel a mano.

## Gotcha de migraciones Supabase

Supabase deriva la versión de cada migración del prefijo numérico del
nombre de archivo (todo antes del primer `_`). Dos migraciones creadas el
mismo día con el mismo prefijo de 8 dígitos (`YYYYMMDD`) colisionan en
`supabase_migrations.schema_migrations` y rompen `supabase db push` con un
error genérico ("Remote migration versions not found..."). Ya pasó dos
veces (2026-07 y 2026-08-09). Si se crea más de una migración el mismo día,
usar sufijo de hora para desambiguar: `20260809000001_algo.sql`,
`20260809000002_otra_cosa.sql`, etc.
