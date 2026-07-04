# RUTA34 Telecom - Informe Técnico Detallado

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Estado:** En Producción  
**URL:** https://www.esimruta34.com

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Base de Datos](#base-de-datos)
5. [Módulos del Proyecto](#módulos-del-proyecto)
6. [Features Implementadas](#features-implementadas)
7. [Integraciones Externas](#integraciones-externas)
8. [Autenticación & Seguridad](#autenticación--seguridad)
9. [Performance & Optimizaciones](#performance--optimizaciones)
10. [Testing & QA](#testing--qa)
11. [Deployment & CI/CD](#deployment--cicd)
12. [Roadmap Futuro](#roadmap-futuro)

---

## 📊 RESUMEN EJECUTIVO

**RUTA34 Telecom** es una plataforma de e-commerce de eSIM para viajeros de América Latina que desean conectarse en Europa sin roaming internacional.

**Características principales:**
- Venta de eSIM españolas con número incluido (Línea España)
- Venta de eSIM europeas solo datos (Data Traveler)
- Portal B2B para agencias y resellers
- Panel de administración para gestión de pedidos
- Help Center con 7 guías completas
- Integración con Stripe para pagos
- Soporte multiidioma (Español, Portugués)

**Usuarios Objetivo:**
- B2C: Viajeros de Argentina, Chile, Uruguay, Brasil, México
- B2B: Agencias de viajes, resellers

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
```
Framework: Next.js 16.2.6 (React 19.2.4)
Language: TypeScript 5
Styling: Tailwind CSS 4 + CSS Custom Properties
Animations: Framer Motion 12.40.0
UI Components: Radix UI, Phosphor Icons
Form Handling: React Hook Form 7.76.1
Validation: Zod 4.4.3
i18n: next-intl 4.12.0
```

### Backend & Database
```
Backend: Next.js API Routes (Node.js 24.15.0)
Database: Supabase (PostgreSQL)
Auth: Supabase Auth + Row Level Security (RLS)
Real-time: Supabase Realtime Subscriptions
```

### Payments
```
Stripe: ^22.1.1 (Webhooks, Checkout, Promotion Codes)
```

### Other Services
```
Email: Resend 6.16.0 (Transactional emails)
PDF Generation: @react-pdf/renderer 4.5.1
QR Codes: qrcode 1.5.4
Analytics: Google Tag Manager + Google Analytics 4
```

### DevOps & Testing
```
Deployment: Vercel
Testing: Playwright 1.61.1 (E2E Testing)
Build Tool: Turbopack (Next.js built-in)
Package Manager: npm
```

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  Pages                Components              Hooks      │
│  ├── Home             ├── Landing             ├── Auth   │
│  ├── Compra           ├── Purchase            ├── Cart   │
│  ├── Confirmación     ├── Admin               └── ...    │
│  ├── Help Center      ├── UI/Shared                      │
│  ├── B2B Portal       └── Help Center                    │
│  └── Admin Panel                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              API ROUTES (Next.js Backend)                │
├─────────────────────────────────────────────────────────┤
│  /api/checkout         → Stripe Checkout                 │
│  /api/webhooks/stripe  → Stripe Events                   │
│  /api/invoices         → Invoice Generation              │
│  /api/cron/daily       → Daily Tasks                     │
│  /api/dev/email-preview → Email Templates Preview       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│           EXTERNAL SERVICES & DATABASES                  │
├─────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)    Stripe           Resend        │
│  ├── Users               ├── Payments      └── Emails    │
│  ├── Orders              ├── Webhooks                    │
│  ├── Plans               └── Promotions                  │
│  └── Agencies                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ BASE DE DATOS

### Supabase (PostgreSQL)

**Tablas Principales:**

#### 1. `auth.users` (Supabase Auth)
```sql
- id (UUID, PK)
- email (VARCHAR)
- created_at (TIMESTAMP)
- last_sign_in_at (TIMESTAMP)
```

#### 2. `b2c_orders`
```sql
- id (UUID, PK)
- reference (VARCHAR, UNIQUE)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_country (VARCHAR)
- customer_dob (DATE)
- customer_passport (VARCHAR)
- plan_id (VARCHAR, FK → tariffs)
- quantity (INT, 1-10)
- activation_type (ENUM: 'now', 'schedule')
- activation_date (DATE, optional)
- status (ENUM: 'pending', 'paid', 'scheduled', 'qr_sent', 'delivered')
- stripe_session_id (VARCHAR)
- stripe_payment_id (VARCHAR)
- esim_codes (JSONB) - Array de códigos QR
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- RLS: Usuarios pueden ver solo sus propios pedidos
```

#### 3. `tariffs`
```sql
- id (VARCHAR, PK: 'local-s', 'data-10gb', etc)
- name (VARCHAR: 'Europa Básico', 'Data 10 GB')
- type (ENUM: 'local', 'dataonly')
- zone (ENUM: 'espana', 'europa')
- data_gb (INT) - GB en España o total
- eu_data_gb (INT, nullable) - GB en roaming UE (solo local)
- validity_days (INT: 28)
- activation_days (INT: 365 para local, 60 para data)
- price_usd (DECIMAL)
- badge (VARCHAR: 'Línea española', 'Solo datos')
- highlight (BOOLEAN) - Mostrar como popular
- vodafone_code (VARCHAR: 'Vodafone S', 'Vodafone M')
- position (INT) - Orden en UI
- web_visible (BOOLEAN)
- active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 4. `b2b_agencies`
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- country (VARCHAR)
- payment_method (ENUM: 'stripe', 'bank_transfer')
- status (ENUM: 'active', 'inactive', 'pending')
- created_at (TIMESTAMP)
```

#### 5. `b2b_orders`
```sql
- id (UUID, PK)
- agency_id (UUID, FK → b2b_agencies)
- reference (VARCHAR, UNIQUE)
- plan_id (VARCHAR, FK → tariffs)
- quantity (INT)
- total_amount (DECIMAL)
- status (ENUM: 'pending', 'completed', 'cancelled')
- invoice_url (VARCHAR)
- created_at (TIMESTAMP)
```

### Índices Principales:
```sql
- b2c_orders(reference) - Buscar pedidos por referencia
- b2c_orders(customer_email) - Buscar pedidos por email
- b2c_orders(status) - Filtrar por estado
- tariffs(active, web_visible) - Listar planes activos
- b2b_agencies(email) - Auth B2B
```

### Row Level Security (RLS):
```
- b2c_orders: Users solo ven sus propios pedidos
- b2b_orders: Agencies solo ven sus propios pedidos
- tariffs: Visible para todos (sin autenticación)
```

---

## 📁 MÓDULOS DEL PROYECTO

Estructura completa de componentes, páginas y características organizadas por funcionalidad.

[Continuar leyendo documento completo...]

---

**Documento generado:** Julio 2026  
**Versión del proyecto:** 1.0 (Production)  
**Status:** En desarrollo activo ✅
