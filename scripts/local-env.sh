#!/usr/bin/env bash
# Crea .env.local apuntando al Supabase LOCAL, leyendo las claves directamente de `supabase status`
# (así no hay que copiar claves a mano: al pegarlas desde un chat o una web pueden quedar tapadas con "•••").
#
# Uso (desde la raíz del repo, con el Supabase local encendido):   bash scripts/local-env.sh
set -euo pipefail
cd "$(dirname "$0")/.."

LOCAL=".local-supabase"
SB="${SB:-npx --yes supabase}"
ENV_FILE="${ENV_FILE:-.env.local}"

# Si ya hay un .env.local que NO es el local (puede tener claves de producción), se aparta, no se pisa.
if [ -f "$ENV_FILE" ] && ! grep -q "127.0.0.1" "$ENV_FILE"; then
  if [ -e "$ENV_FILE.produccion" ]; then
    echo "Ya existe $ENV_FILE.produccion y $ENV_FILE parece de producción. No toco nada: revisa a mano." >&2; exit 1
  fi
  mv "$ENV_FILE" "$ENV_FILE.produccion"
  echo "Tu $ENV_FILE anterior quedó guardado como $ENV_FILE.produccion"
fi

eval "$($SB status -o env --workdir "$LOCAL")"
: "${API_URL:?No se pudo leer API_URL: ¿está encendido el Supabase local? (bash scripts/local-db.sh)}"
: "${ANON_KEY:?No se pudo leer ANON_KEY}"
: "${SERVICE_ROLE_KEY:?No se pudo leer SERVICE_ROLE_KEY}"

# Una clave real solo tiene caracteres ASCII; si hay otra cosa, algo salió mal.
for v in "$ANON_KEY" "$SERVICE_ROLE_KEY"; do
  if printf '%s' "$v" | LC_ALL=C grep -q '[^ -~]'; then
    echo "La clave leída tiene caracteres raros. Abortando para no escribir un .env.local roto." >&2; exit 1
  fi
done

cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
RESEND_API_KEY=placeholder
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF

echo "Listo: $ENV_FILE apunta a $API_URL"
echo "Reinicia la app (Ctrl+C y npm run dev) para que lea el archivo nuevo."
