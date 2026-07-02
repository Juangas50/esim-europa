# RUTA34 eSIM - Plan de Testing/QA Completo

**Fecha:** 2026-07-02  
**Estado:** EN PROGRESS  
**Versión:** 1.0

---

## 📋 ÍNDICE DE TESTING

### MÓDULO 1: B2C (Web - esimruta34.com)
- [ ] Flujo de compra completo
- [ ] Validaciones de formularios
- [ ] Manejo de errores
- [ ] Email confirmación
- [ ] Responsivo (móvil/tablet/desktop)

### MÓDULO 2: B2B (Portal Partner)
- [ ] Login con credenciales
- [ ] Crear nuevo pedido
- [ ] Validaciones de cliente
- [ ] Ver mis pedidos (tabla + filtros)
- [ ] Ver facturas
- [ ] Responsivo

### MÓDULO 3: Admin Dashboard
- [ ] Login admin
- [ ] Gestión de pedidos (modal)
- [ ] Entrega de eSIM (validaciones)
- [ ] Gestión de agencias
- [ ] Gestión de tarifas
- [ ] Responsivo

### MÓDULO 4: Performance & UX
- [ ] Core Web Vitals (LCP, INP, CLS)
- [ ] Velocidad de carga
- [ ] Animaciones suaves
- [ ] Scroll performance
- [ ] Mobile FPS

### MÓDULO 5: Seguridad
- [ ] HTTPS en todas las rutas
- [ ] Validación de inputs (XSS, SQL Injection)
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Secrets no expuestos

### MÓDULO 6: Edge Cases
- [ ] Datos inválidos
- [ ] Timeouts de red
- [ ] Concurrencia (múltiples admins)
- [ ] Estados inconsistentes

---

## 🧪 CASOS DE PRUEBA DETALLADOS

### B2C - FLUJO DE COMPRA

#### TC-001: Compra exitosa - Prepago
**Pre-requisitos:** Usuario no autenticado
**Pasos:**
1. Ir a esimruta34.com
2. Seleccionar plan "Europa Plus" (Prepago)
3. Ingresar datos válidos:
   - Nombre: Juan
   - Apellido: García
   - Pasaporte: ABC123456
   - Nacionalidad: Argentina
   - DOB: 01/01/1995
   - Email: test@example.com
4. Seleccionar "Activar hoy"
5. Proceder a pago con Stripe (test card: 4242 4242 4242 4242)
6. Confirmar compra

**Expected:** ✅ Orden creada con status 'paid', Email de confirmación recibido

---

#### TC-002: Compra con activación programada
**Pasos:** (Mismo que TC-001)
5. Seleccionar "Programar fecha"
6. Ingresar fecha: 10/07/2026
7. Proceder a pago

**Expected:** ✅ Orden creada con status 'scheduled'

---

#### TC-003: Validación de email inválido
**Pasos:**
1-3. (Igual)
4. Ingresar email: "invalido@"
5. Intentar continuar

**Expected:** ❌ Error: "Email inválido"

---

#### TC-004: Cliente menor de 18 años
**Pasos:**
1-3. (Igual)
4. Ingresar DOB: 01/01/2010 (16 años)
5. Intentar continuar

**Expected:** ❌ Error: "El cliente debe ser mayor de 18 años"

---

#### TC-005: Compra DataOnly
**Pasos:**
1. Seleccionar plan DataOnly
2. (Datos válidos)
3. NO aparece opción "Activar hoy" / "Programar fecha"
4. Proceder a pago

**Expected:** ✅ Orden tipo 'dataonly', cliente tiene 60 días para activar

---

### B2B - PORTAL PARTNER

#### TC-B2B-001: Login exitoso
**Pasos:**
1. Ir a localhost:3002/login
2. Ingresar email: partner@ejemplo.com
3. Ingresar contraseña: (válida)
4. Clic "Entrar"

**Expected:** ✅ Redirige a /pedidos

---

#### TC-B2B-002: Crear nuevo pedido
**Pasos:**
1. Clic "+ Nuevo pedido"
2. Seleccionar "eSIM Prepago"
3. Seleccionar tarifa "Europa Plus"
4. Ingresar datos cliente:
   - Nombre: Maria
   - Apellidos: López García
   - Pasaporte: XYZ789012
   - Nacionalidad: Uruguay
   - DOB: 15/05/1990
   - Email: maria@email.com
5. Seleccionar "Activar hoy"
6. Clic "Confirmar pedido"

**Expected:** ✅ Modal de éxito, orden creada

---

#### TC-B2B-003: Validación - Campos vacíos
**Pasos:** (Igual TC-B2B-002)
4. Dejar campos vacíos
5. Intentar confirmar

**Expected:** ❌ Botón deshabilitado, mensaje "Completá todos los campos"

---

#### TC-B2B-004: Ver mis pedidos - Filtros
**Pasos:**
1. Ir a /pedidos
2. Filtrar por estado "Tramitar"
3. Buscar por nombre
4. Filtrar por canal "Agencias"

**Expected:** ✅ Tabla actualiza correctamente

---

#### TC-B2B-005: Ver facturas
**Pasos:**
1. Ir a /facturas
2. Verificar listado de facturas mensuales
3. Descargar PDF

**Expected:** ✅ PDF descargable con estructura correcta

---

### ADMIN - GESTIÓN DE PEDIDOS

#### TC-ADM-001: Abrir modal de pedido
**Pasos:**
1. Ir a localhost:3002/admin/pedidos
2. Clic en un pedido de la tabla
3. Verificar que abre modal overlay

**Expected:** ✅ Modal visible, overlay oscuro, scroll interno funciona

---

#### TC-ADM-002: Entrega exitosa - B2C pagado
**Pasos:**
1. Abrir pedido B2C (status 'paid')
2. Ir a sección "⚡ ENTREGAR ESIM"
3. Ingresar cadena: 1$eu-prod$ABC123DEF456
4. Ingresar código: 628471
5. Clic "Generar QR y enviar al cliente"

**Expected:** ✅ QR generado, email enviado, status cambió a 'qr_sent'

---

#### TC-ADM-003: Validación - Cadena inválida
**Pasos:** (Igual TC-ADM-002)
3. Ingresar: "texto_invalido"
4. Verificar validación

**Expected:** ❌ Error rojo: "Formato no válido"

---

#### TC-ADM-004: Validación - Código inválido
**Pasos:** (Igual TC-ADM-002)
4. Ingresar código: "12" (solo 2 dígitos)

**Expected:** ❌ Error rojo, botón deshabilitado

---

#### TC-ADM-005: Entrega rechazada - QR ya enviado
**Pasos:**
1. Abrir pedido con status 'qr_sent'
2. Intentar ingresar cadena

**Expected:** ❌ Formulario NO aparece (estado no válido para entrega)

---

#### TC-ADM-006: Reenvío de email
**Pasos:**
1. Abrir pedido con status 'qr_sent'
2. Ir a "Cadena de activación enviada"
3. Campo "Reenviar a": cambiar email
4. Clic "Reenviar email al cliente"

**Expected:** ✅ Email reenviado a nuevo correo, confirmación verde

---

#### TC-ADM-007: Cambio de estado manual
**Pasos:**
1. Abrir pedido
2. Dropdown "Cambiar estado"
3. Seleccionar "Activado"
4. Clic "Confirmar"

**Expected:** ✅ Status actualizado, modal cierra

---

### RESPONSIVO DESIGN

#### TC-RES-001: Mobile - B2C
**Device:** iPhone 12 (390x844)
**Pasos:**
1. Ir a esimruta34.com
2. Realizar flujo de compra
3. Verificar:
   - Inputs legibles y clicables
   - Botones min 44x44px
   - Sin horizontal scroll

**Expected:** ✅ Funcionamiento completo, sin scroll horizontal

---

#### TC-RES-002: Mobile - Admin
**Device:** iPhone 12
**Pasos:**
1. Ir a localhost:3002/admin/pedidos
2. Clic en pedido
3. Modal debe adaptarse
4. Scroll interno funciona

**Expected:** ✅ Modal centrado, scrollable

---

#### TC-RES-003: Tablet - B2B
**Device:** iPad (768x1024)
**Pasos:**
1. Ir a localhost:3002/pedidos
2. Verificar tabla responsiva
3. Verificar modal en desktop

**Expected:** ✅ Layout correcto para tablet

---

### PERFORMANCE

#### TC-PERF-001: Core Web Vitals
**Tool:** Google PageSpeed Insights / Lighthouse
**Métricas:**
- LCP (Largest Contentful Paint): < 2.5s ✅
- INP (Interaction to Next Paint): < 200ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

---

#### TC-PERF-002: Tiempo de carga - B2C
**Pasos:**
1. Abrir DevTools (Network)
2. Ir a esimruta34.com
3. Medir tiempo hasta "interactive"

**Expected:** ✅ < 3 segundos

---

#### TC-PERF-003: Smooth scrolling
**Pasos:**
1. Ir a página con contenido largo
2. Scrollear rápidamente
3. Verificar FPS

**Expected:** ✅ 60 FPS constantes

---

### SEGURIDAD

#### TC-SEC-001: HTTPS en todas las rutas
**Pasos:**
1. Verificar URL inicia con https://
2. Clic en lock icon
3. Verificar certificado válido

**Expected:** ✅ Certificado válido, conexión segura

---

#### TC-SEC-002: XSS Protection
**Pasos:**
1. En campo de email, ingresar: `<script>alert('xss')</script>`
2. Enviar

**Expected:** ✅ Script no se ejecuta, se sanitiza

---

#### TC-SEC-003: CSRF Protection
**Pasos:**
1. Realizar acción sensible (cambiar estado)
2. Verificar que lleva CSRF token

**Expected:** ✅ Token presente en request

---

#### TC-SEC-004: Rate Limiting
**Pasos:**
1. Hacer 100 requests en 1 minuto al API
2. Verificar rate limit

**Expected:** ✅ Request bloqueado con 429 Too Many Requests

---

#### TC-SEC-005: No secrets expuestos
**Pasos:**
1. Inspeccionar Network tab
2. Revisar Headers y Body
3. Buscar API keys, tokens

**Expected:** ✅ Sin secrets en cliente

---

### EDGE CASES

#### TC-EDGE-001: Timeout de red
**Pasos:**
1. Simular conexión lenta (Chrome DevTools)
2. Intentar comprar
3. Esperar timeout

**Expected:** ✅ Error legible, botón retry habilitado

---

#### TC-EDGE-002: Dos admins entreган mismo pedido
**Pasos:**
1. Admin A abre pedido
2. Admin B abre mismo pedido
3. Admin A hace entrega
4. Admin B intenta hacer entrega

**Expected:** ✅ Admin B ve error: "Este pedido ya tiene el QR enviado"

---

#### TC-EDGE-003: Cadena duplicada
**Pasos:**
1. Admin intenta usar cadena ya usada en otro pedido
2. Ingresar cadena

**Expected:** ❌ Error: "Esta cadena ya fue asignada al pedido XXX"

---

## 📊 MATRIZ DE TESTING

| Módulo | TC-ID | Estado | Resultado | Notas |
|--------|-------|--------|-----------|-------|
| B2C | TC-001 | Pendiente | - | - |
| B2C | TC-002 | Pendiente | - | - |
| B2B | TC-B2B-001 | Pendiente | - | - |
| Admin | TC-ADM-001 | Pendiente | - | - |
| Responsivo | TC-RES-001 | Pendiente | - | - |
| Performance | TC-PERF-001 | Pendiente | - | - |
| Seguridad | TC-SEC-001 | Pendiente | - | - |

---

## ✅ CRITERIOS DE ÉXITO

Para pasar QA:
- ✅ 100% de TC funcionales pasando
- ✅ Cero errores críticos
- ✅ Performance: LCP < 2.5s, CLS < 0.1
- ✅ Mobile: 100% responsive
- ✅ Security: Todos los checks pasando
- ✅ Documentación completa

---

## 🚀 NEXT STEPS

1. Ejecutar testing manual en orden
2. Registrar fallos en este documento
3. Crear issues en GitHub si hay bugs
4. Iterar hasta 100% passing
5. Proceder a FASE 9: Deploy

---

**Responsable:** QA Team  
**Fecha inicio:** 2026-07-02  
**Fecha target:** 2026-07-05
