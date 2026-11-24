# Plan de pruebas del wallet (entorno LOCAL)

Pensado para ejecutarlo a mano o con Claude en Chrome. **Solo contra http://localhost:3000** (Supabase local).
Nunca contra producción: las pruebas crean y anulan pedidos y recargas.

Usuarios (contraseña `Prueba1234!`): `prepago@ruta34.test`, `postpago@ruta34.test`, `admin@ruta34.test`.
Estado inicial (`bash scripts/local-db.sh`): agencia prepago con **$500.00**; planes S $25 / M $40 / L $65 / Data 10 $18.
Para volver al estado inicial: `bash scripts/local-db.sh`.

Los correos no se envían (clave de Resend de mentira). El mensaje `Email error` en la consola de `npm run dev` es esperado.

## A. Agencia PREPAGO (`prepago@ruta34.test`)

| # | Qué hacer | Resultado esperado |
|---|-----------|--------------------|
| A1 | Entrar en /login. | Va a `/pedidos/nuevo`. Arriba a la derecha: **SALDO $500.00**. El menú tiene "Mi wallet". Los títulos tienen tamaño normal. |
| A2 | Sin escribir nada, mirar el botón. | "Vender eSIM · $25.00" desactivado. "Datos completos 0 de 5". Texto "Falta: nombre, apellido, pasaporte, email, fecha de nacimiento." |
| A3 | Escribir `abc` en Email y salir del campo. | Error bajo el campo: "Revisa el email…". Con fecha de nacimiento de hace 10 años: "El titular debe ser mayor de 18 años." |
| A4 | Elegir **Plan M**. Rellenar: Camila / Ortiz / AAB123456 / nacimiento 1990-05-14 / camila@ejemplo.com. | Resumen: Saldo actual $500.00, Se descuenta **-$40.00**, Saldo después **$460.00**. Botón activo. |
| A5 | Pulsar "Vender eSIM". | Aviso verde "Venta R34-XXXXXX registrada". Saldo arriba **$460.00**. El formulario se vacía y el cursor vuelve a "Nombre". Abajo, en "Últimas ventas", primera fila: Plan M, $40.00, **Pendiente**, con botón Cancelar. |
| A6 | Pulsar Cancelar y confirmar. | Aviso "Pedido … cancelado. Se devolvieron $40.00". Saldo **$500.00**. Estado **Cancelado**, sin botón. |
| A7 | Ir a "Mi wallet". | Movimientos: Recarga +$500.00; Venta -$40.00; Devolución por cancelación +$40.00. Cada uno con saldo resultante. |
| A8 | Vender **Plan L** 7 veces seguidas (con datos distintos o los mismos). | Saldo: 435, 370, 305, 240, 175, 110, **45**. Al llegar a $45.00 el saldo se pone ámbar y aparece el aviso "Saldo bajo". |
| A9 | Con saldo $45.00, elegir **Plan L**. | Salta una ventana "Saldo insuficiente… Faltan $20.00". El plan aparece marcado "Saldo insuficiente". Plan S ($25) sigue pudiendo venderse. |

## B. ADMIN (`admin@ruta34.test`)  — salir de la sesión de la agencia antes

| # | Qué hacer | Resultado esperado |
|---|-----------|--------------------|
| B1 | /admin/pedidos: abrir un pedido pendiente de la agencia prepago. | En el detalle: PVP agencia, Precio acordado, **Costo Vodafone** y **Margen RUTA34** (por ejemplo, Plan L: 65 − 39 = $26.00). |
| B2 | En ese pedido: "Cambiar estado" → "Empezar a gestionar". | Aviso "En gestión. La agencia ya no puede cancelar…". Estado "En gestión". |
| B3 | En otro pedido pendiente: "Cambiar estado" → "Anular pedido…". Escribir `corto`. | El botón "Anular y devolver saldo" sigue desactivado (mínimo 10 caracteres). |
| B4 | Escribir un motivo largo y confirmar. | Aviso "Pedido anulado. Se devolvió el saldo a la agencia." Estado cancelado. |
| B5 | Intentar poner "Cancelar" por el desplegable en un pedido de agencia. | No existe esa opción (solo "Anular pedido…"). |
| B6 | /admin/tarifas. | Cada tarifa muestra "Costo Vodafone (USD, interno)": 14.5 / 23 / 39 / 9. Cambiar uno y salir del campo: aviso "Costo de Vodafone guardado". |
| B7 | /admin/agencias → Viajes Sur → pestaña **Wallet**. Recargar 100 con referencia `TRF-TEST`. | Aviso "Recarga de $100.00 registrada. Falta adjuntar la factura de Qonto". Saldo sube $100. |
| B8 | En esa recarga: "Falta la factura de Qonto: adjuntar" → número `2026-0099`, fecha de hoy → Guardar. | Aviso "Factura adjuntada". La recarga muestra "Factura 2026-0099". |

## C. Agencia PREPAGO otra vez

| # | Qué hacer | Resultado esperado |
|---|-----------|--------------------|
| C1 | /pedidos/nuevo → Últimas ventas, o /pedidos. | El pedido de B2 dice "En gestión: ya no se puede cancelar" y **no tiene botón Cancelar**. |
| C2 | Ver el pedido de B4. | Cancelado. El saldo subió en el precio del plan anulado. |
| C3 | /wallet. | Aparece "Devolución por anulación" y la recarga de B7 con "Factura 2026-0099". Saldo = suma de todos los movimientos. |
| C4 | Buscar en cualquier pantalla de la agencia la palabra "Vodafone". | **No aparece en ninguna parte.** |

## D. Agencia POSTPAGO (`postpago@ruta34.test`)

| # | Qué hacer | Resultado esperado |
|---|-----------|--------------------|
| D1 | Entrar. | **No hay** saldo arriba ni "Mi wallet" en el menú. |
| D2 | Ir a http://localhost:3000/wallet. | Redirige a `/pedidos/nuevo`. |
| D3 | Vender un plan. | El resumen dice "Se factura a fin de mes", sin "Saldo actual / después". La venta funciona y el pedido tiene botón Cancelar. |
| D4 | Cancelar ese pedido. | Aviso "Pedido … cancelado." sin mención de devolución. |

## Cómo informar

Para cada prueba: **OK** o **FALLA**, qué se esperaba, qué se vio, y una captura si falla. No corregir el código: solo informar.
