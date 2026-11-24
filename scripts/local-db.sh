#!/usr/bin/env bash
# Levanta un Supabase LOCAL (Docker) con el esquema de producción + las migraciones del wallet
# y datos de ejemplo. NO toca producción: todo vive en contenedores de tu ordenador.
#
# Uso (desde la raíz del repo):   bash scripts/local-db.sh
#
# Requisitos: Docker Desktop ABIERTO y Node (npx).
set -euo pipefail
cd "$(dirname "$0")/.."

LOCAL=".local-supabase"          # proyecto Supabase local (está en .gitignore)
CUTOFF=20261124                  # versión de la primera migración que NO está dentro del volcado
SB="npx --yes supabase"

if ! command -v docker >/dev/null 2>&1; then
  echo "Falta Docker Desktop. Instálalo desde https://www.docker.com/products/docker-desktop y ábrelo." >&2; exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker está instalado pero no está abierto. Ábrelo, espera a que diga que está corriendo y repite." >&2; exit 1
fi
if [ ! -f supabase/baseline_prod.sql ]; then
  echo "No encuentro supabase/baseline_prod.sql (el volcado del esquema de producción)." >&2; exit 1
fi

mkdir -p "$LOCAL"
if [ ! -f "$LOCAL/supabase/config.toml" ]; then
  $SB init --workdir "$LOCAL" --with-vscode-settings=false --with-intellij-settings=false
fi
[ -f "$LOCAL/supabase/config.toml" ] || { echo "No se pudo crear $LOCAL/supabase/config.toml" >&2; exit 1; }

# Migraciones locales = volcado (esquema actual de producción) + migraciones nuevas.
# Las migraciones antiguas del repo ya están dentro del volcado: aplicarlas otra vez chocaría.
MIG="$LOCAL/supabase/migrations"
mkdir -p "$MIG"
find "$MIG" -type f -name '*.sql' -delete
cp supabase/baseline_prod.sql "$MIG/20200101000000_baseline_prod.sql"
for f in supabase/migrations/*.sql; do
  v="$(basename "$f" | cut -c1-8)"
  if [ "$v" -ge "$CUTOFF" ]; then cp "$f" "$MIG/"; fi
done
echo "Migraciones locales:"; ls "$MIG"

$SB start --workdir "$LOCAL"
$SB db reset --workdir "$LOCAL"

# Variables del Supabase local (API_URL, ANON_KEY, SERVICE_ROLE_KEY…)
eval "$($SB status -o env --workdir "$LOCAL")"

SUPABASE_URL="$API_URL" SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" node scripts/local-seed.mjs

cat <<EOF

────────────────────────────────────────────────────────────
Supabase local listo. Para probar la app, crea un archivo .env.local
(NUNCA uses las claves de producción aquí) con:

NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
RESEND_API_KEY=placeholder
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Luego:  npm install   y   npm run dev   → http://localhost:3000/login

Usuarios de prueba (contraseña: Prueba1234!):
  admin@ruta34.test          Admin Ruta34
  prepago@ruta34.test        Agencia PREPAGO  (wallet con saldo)
  postpago@ruta34.test       Agencia POSTPAGO (sin wallet)

Panel de la base local (Studio): http://127.0.0.1:54323
Correos de prueba (Mailpit):     http://127.0.0.1:54324
Para apagar todo:                npx supabase stop --workdir $LOCAL
────────────────────────────────────────────────────────────
EOF
