SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."esim_type" AS ENUM (
    'prepago',
    'dataonly'
);


ALTER TYPE "public"."esim_type" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'pending',
    'paid',
    'overdue'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending_review',
    'scheduled',
    'qr_sent',
    'activated',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'partner'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_agency"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_agency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agency_pricing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "tariff_id" "uuid" NOT NULL,
    "cost_price" numeric(10,2) NOT NULL,
    "pvp" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."agency_pricing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b2c_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_ref" "text" NOT NULL,
    "tariff_id" "uuid",
    "customer_name" "text" NOT NULL,
    "customer_lastname" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "customer_country" "text" NOT NULL,
    "activation_date" "date",
    "status" "text" DEFAULT 'pending_payment'::"text" NOT NULL,
    "payment_method" "text",
    "payment_id" "text",
    "amount_usd" numeric(10,2),
    "qr_sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "activation_string" "text",
    "confirmation_code" "text",
    "delivery_error" "text",
    "reschedule_token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reminder_sent_at" timestamp with time zone,
    "customer_passport" "text",
    "customer_dob" "date",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "utm_content" "text",
    CONSTRAINT "b2c_orders_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['stripe'::"text", 'mercadopago'::"text"]))),
    CONSTRAINT "b2c_orders_status_check" CHECK (("status" = ANY (ARRAY['pending_payment'::"text", 'paid'::"text", 'processing'::"text", 'qr_sent'::"text", 'active'::"text", 'expired'::"text", 'cancelled'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."b2c_orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."b2c_orders"."delivery_error" IS 'Último error de generación/subida de QR o envío de entrega. NULL si no hubo fallos o si se resolvió.';



COMMENT ON COLUMN "public"."b2c_orders"."reschedule_token" IS 'Token opaco para el link público de reprogramación (nunca reutilizar el id del pedido, que aparece en URLs de admin).';



COMMENT ON COLUMN "public"."b2c_orders"."reminder_sent_at" IS 'Timestamp del recordatorio 24h-antes enviado por el cron diario. Se resetea a null si el cliente reprograma la fecha, para que se dispare un nuevo recordatorio.';



COMMENT ON COLUMN "public"."b2c_orders"."customer_passport" IS 'N° de pasaporte del titular. Requisito para registrar la línea española. Null en pedidos previos a 2026-08-09.';



COMMENT ON COLUMN "public"."b2c_orders"."customer_dob" IS 'Fecha de nacimiento del titular. El checkout exige +18. Null en pedidos previos a 2026-08-09.';



COMMENT ON COLUMN "public"."b2c_orders"."utm_campaign" IS 'Campaña de atribución (ej. victoria_niza) capturada en /api/checkout desde la cookie ruta34_attribution. Null = tráfico sin campaña asociada.';



CREATE TABLE IF NOT EXISTS "public"."campaign_link_visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "utm_content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."campaign_link_visits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "tariff_name" "text" NOT NULL,
    "units" integer NOT NULL,
    "cost_price" numeric(10,2) NOT NULL,
    "total" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."invoice_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_ref" "text" NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "status" "public"."invoice_status" DEFAULT 'pending'::"public"."invoice_status" NOT NULL,
    "pdf_url" "text",
    "due_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_ref" "text" NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "tariff_id" "uuid" NOT NULL,
    "type" "public"."esim_type" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_lastname" "text" NOT NULL,
    "customer_passport" "text" NOT NULL,
    "customer_nationality" "text" DEFAULT 'Argentina'::"text" NOT NULL,
    "customer_dob" "date" NOT NULL,
    "customer_email" "text" NOT NULL,
    "activation_date" "date",
    "status" "public"."order_status" DEFAULT 'pending_review'::"public"."order_status" NOT NULL,
    "pvp_at_time" numeric(10,2) NOT NULL,
    "cost_at_time" numeric(10,2) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "activation_string" "text",
    "confirmation_code" "text"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tariffs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."esim_type" NOT NULL,
    "data_gb" integer NOT NULL,
    "validity_days" integer,
    "badge" "text",
    "highlight" boolean DEFAULT false,
    "active" boolean DEFAULT true,
    "price_usd" numeric(10,2),
    "zone" "text" DEFAULT 'europa'::"text",
    "countries_count" integer DEFAULT 30,
    "activation_days" integer DEFAULT 365,
    "position" integer,
    "eu_data_gb" integer,
    "web_visible" boolean DEFAULT true,
    "vodafone_code" "text",
    CONSTRAINT "tariffs_position_check" CHECK ((("position" >= 1) AND ("position" <= 10))),
    CONSTRAINT "tariffs_zone_check" CHECK (("zone" = ANY (ARRAY['espana'::"text", 'europa'::"text"])))
);


ALTER TABLE "public"."tariffs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tariffs"."price_usd" IS 'Precio de venta al público en USD (web B2C)';



COMMENT ON COLUMN "public"."tariffs"."zone" IS 'Cobertura geográfica: espana = solo España, europa = multi-país';



COMMENT ON COLUMN "public"."tariffs"."countries_count" IS 'Número de países cubiertos (se muestra en la tarjeta del plan)';



COMMENT ON COLUMN "public"."tariffs"."activation_days" IS 'Días desde la compra para activar la eSIM';



COMMENT ON COLUMN "public"."tariffs"."position" IS 'Posición en la home (1 = izquierda, 5 = derecha). Nulo = al final por precio. Determina también la talla S/M/L/XL/XXL.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "agency_id" "uuid",
    "role" "public"."user_role" DEFAULT 'partner'::"public"."user_role" NOT NULL,
    "full_name" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "must_change_password" boolean DEFAULT false,
    "email" "text",
    "password_reset_token" "text",
    "password_reset_expires" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agencies"
    ADD CONSTRAINT "agencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_pricing"
    ADD CONSTRAINT "agency_pricing_agency_id_tariff_id_key" UNIQUE ("agency_id", "tariff_id");



ALTER TABLE ONLY "public"."agency_pricing"
    ADD CONSTRAINT "agency_pricing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2c_orders"
    ADD CONSTRAINT "b2c_orders_order_ref_key" UNIQUE ("order_ref");



ALTER TABLE ONLY "public"."b2c_orders"
    ADD CONSTRAINT "b2c_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_link_visits"
    ADD CONSTRAINT "campaign_link_visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_ref_key" UNIQUE ("invoice_ref");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_ref_key" UNIQUE ("order_ref");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tariffs"
    ADD CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "b2c_orders_created_idx" ON "public"."b2c_orders" USING "btree" ("created_at" DESC);



CREATE INDEX "b2c_orders_email_idx" ON "public"."b2c_orders" USING "btree" ("customer_email");



CREATE UNIQUE INDEX "b2c_orders_reschedule_token_idx" ON "public"."b2c_orders" USING "btree" ("reschedule_token");



CREATE INDEX "b2c_orders_status_idx" ON "public"."b2c_orders" USING "btree" ("status");



CREATE INDEX "b2c_orders_tariff_idx" ON "public"."b2c_orders" USING "btree" ("tariff_id");



CREATE INDEX "b2c_orders_utm_campaign_idx" ON "public"."b2c_orders" USING "btree" ("utm_campaign");



CREATE INDEX "campaign_link_visits_created_idx" ON "public"."campaign_link_visits" USING "btree" ("created_at" DESC);



CREATE INDEX "campaign_link_visits_slug_idx" ON "public"."campaign_link_visits" USING "btree" ("slug");



CREATE UNIQUE INDEX "idx_users_email_unique" ON "public"."users" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_users_password_reset_token" ON "public"."users" USING "btree" ("password_reset_token");



CREATE OR REPLACE TRIGGER "b2c_orders_updated_at" BEFORE UPDATE ON "public"."b2c_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."agency_pricing"
    ADD CONSTRAINT "agency_pricing_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agency_pricing"
    ADD CONSTRAINT "agency_pricing_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b2c_orders"
    ADD CONSTRAINT "b2c_orders_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id");



ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."agencies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agencies_admin_all" ON "public"."agencies" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "agencies_partner_own" ON "public"."agencies" FOR SELECT USING (("id" = "public"."get_user_agency"()));



ALTER TABLE "public"."agency_pricing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2c_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_link_visits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deny_anon" ON "public"."b2c_orders" TO "anon" USING (false);



ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invoice_lines_admin_all" ON "public"."invoice_lines" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "invoice_lines_partner_own" ON "public"."invoice_lines" FOR SELECT USING (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."agency_id" = "public"."get_user_agency"()))));



ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invoices_admin_all" ON "public"."invoices" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "invoices_partner_own" ON "public"."invoices" FOR SELECT USING (("agency_id" = "public"."get_user_agency"()));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_admin_all" ON "public"."orders" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "orders_partner_insert" ON "public"."orders" FOR INSERT WITH CHECK (("agency_id" = "public"."get_user_agency"()));



CREATE POLICY "orders_partner_select" ON "public"."orders" FOR SELECT USING (("agency_id" = "public"."get_user_agency"()));



CREATE POLICY "pricing_admin_all" ON "public"."agency_pricing" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "pricing_partner_own" ON "public"."agency_pricing" FOR SELECT USING (("agency_id" = "public"."get_user_agency"()));



CREATE POLICY "service_role_all" ON "public"."b2c_orders" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."tariffs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tariffs_admin_all" ON "public"."tariffs" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "tariffs_partner_read" ON "public"."tariffs" FOR SELECT USING ((("public"."get_user_role"() = 'partner'::"text") AND ("active" = true)));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_admin_all" ON "public"."users" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "users_partner_own" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_agency"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_agency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_agency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."agencies" TO "anon";
GRANT ALL ON TABLE "public"."agencies" TO "authenticated";
GRANT ALL ON TABLE "public"."agencies" TO "service_role";



GRANT ALL ON TABLE "public"."agency_pricing" TO "anon";
GRANT ALL ON TABLE "public"."agency_pricing" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_pricing" TO "service_role";



GRANT ALL ON TABLE "public"."b2c_orders" TO "anon";
GRANT ALL ON TABLE "public"."b2c_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."b2c_orders" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_link_visits" TO "anon";
GRANT ALL ON TABLE "public"."campaign_link_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_link_visits" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_lines" TO "anon";
GRANT ALL ON TABLE "public"."invoice_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_lines" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."tariffs" TO "anon";
GRANT ALL ON TABLE "public"."tariffs" TO "authenticated";
GRANT ALL ON TABLE "public"."tariffs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
