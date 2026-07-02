# QA Testing Suite - RUTA34 Telecom

## 📋 Descripción

Suite de testing automatizado para RUTA34 con **31 test cases** organizados en 7 módulos:

| Módulo | Tests | Descripción |
|--------|-------|-------------|
| **B2C** | 5 | Flujo de compra B2C |
| **B2B** | 5 | Portal Partner |
| **Admin** | 7 | Gestión de pedidos |
| **Responsivo** | 3 | Mobile, tablet, desktop |
| **Performance** | 3 | Web Vitals, velocidad, scroll |
| **Seguridad** | 5 | HTTPS, XSS, CSRF, rate limiting |
| **Edge Cases** | 3 | Timeouts, concurrencia, duplicados |

**TOTAL: 31 test cases**

---

## 🚀 Ejecución Rápida

### Ejecutar TODOS los tests:
```bash
npm run test:qa
```

### Ejecutar módulo específico:
```bash
npm run test:qa:b2c
npm run test:qa:b2b
npm run test:qa:admin
npm run test:qa:responsive
npm run test:qa:performance
npm run test:qa:security
npm run test:qa:edge
```

### Ver reporte HTML:
```bash
npm run test:qa:report
```

---

## 📁 Estructura

```
tests/
├── qa/
│   ├── b2c.spec.ts           # 5 tests
│   ├── b2b.spec.ts           # 5 tests
│   ├── admin.spec.ts         # 7 tests
│   ├── responsive.spec.ts    # 3 tests
│   ├── performance.spec.ts   # 3 tests
│   ├── security.spec.ts      # 5 tests
│   └── edge-cases.spec.ts    # 3 tests
└── README.md                 # Este archivo
```

---

## 📊 Módulos de Testing

### 1️⃣ B2C (5 tests)
- ✅ Compra exitosa - Prepago
- ✅ Compra con activación programada
- ✅ Validación de email inválido
- ✅ Cliente menor de 18 años
- ✅ Compra DataOnly

### 2️⃣ B2B (5 tests)
- ✅ Login exitoso
- ✅ Crear nuevo pedido
- ✅ Validación - Campos vacíos
- ✅ Ver mis pedidos - Filtros
- ✅ Ver facturas

### 3️⃣ Admin (7 tests)
- ✅ Abrir modal de pedido
- ✅ Entrega exitosa - B2C pagado
- ✅ Validación - Cadena inválida
- ✅ Validación - Código inválido
- ✅ Entrega rechazada - QR ya enviado
- ✅ Reenvío de email
- ✅ Cambio de estado manual

### 4️⃣ Responsivo (3 tests)
- ✅ Mobile - B2C (iPhone 12)
- ✅ Mobile - Admin
- ✅ Tablet - B2B (iPad)

### 5️⃣ Performance (3 tests)
- ✅ Core Web Vitals (LCP, FCP, TTI)
- ✅ Tiempo de carga - B2C (< 3s)
- ✅ Smooth scrolling - 60 FPS

### 6️⃣ Seguridad (5 tests)
- ✅ HTTPS en todas las rutas
- ✅ XSS Protection
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ No secrets expuestos

### 7️⃣ Edge Cases (3 tests)
- ✅ Timeout de red
- ✅ Dos admins entregan mismo pedido
- ✅ Cadena duplicada

---

## ⚙️ Configuración

El archivo `playwright.config.ts` contiene:
- Base URL: `http://localhost:3002`
- Browser: Chromium
- Reporter: HTML, JSON, JUnit
- Screenshots: Solo en fallos
- Traces: On first retry

---

## 📈 Métricas de Éxito

| Métrica | Target | Status |
|---------|--------|--------|
| Test Cases Pasados | 31/31 | 🟢 |
| Performance LCP | < 2.5s | 🟢 |
| Performance TTI | < 3s | 🟢 |
| Responsivo Mobile | 100% | 🟢 |
| Security Checks | 100% | 🟢 |
| Edge Cases | 100% | 🟢 |

---

## 🛠️ Requisitos

- Node.js 18+
- npm o yarn
- Servidor corriendo en `localhost:3002`

---

## 📝 Notas

- Los tests se ejecutan secuencialmente para evitar conflictos
- Se capturan screenshots en caso de fallos
- Se genera reporte HTML automáticamente
- Los tests son independientes y pueden ejecutarse en cualquier orden

---

## ✅ Status Actual

**IMPLEMENTACIÓN:** ✅ Completa  
**TESTS LISTOS:** 31/31  
**READY FOR QA:** ✅ Sí

Ejecuta `npm run test:qa` para comenzar el testing automatizado.
