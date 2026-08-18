/**
 * corpus/faq.ts — Preguntas frecuentes destiladas de `messages/es.json`.
 *
 * Solo las que se responden con hechos estables. Las que dependen del catálogo
 * (precio, GB de cada gama) no están aquí: esas se contestan con \`list_plans\` o
 * no se contestan.
 *
 * La orientación de consumo de datos son **rangos de referencia**, no una
 * promesa. Están redactados como estimaciones a propósito, y el asistente debe
 * mantener esa forma al usarlos: nadie puede garantizar cuántos gigas gasta un
 * viaje.
 */

export const FAQ = `
**¿Una eSIM es lo mismo que un chip para Europa?** Sí. Es la versión digital del
mismo chip: se instala escaneando un QR, sin tienda ni envíos.

**¿Pierdo mi número?** No. Sigue en la SIM física. La eSIM se añade.

**¿Me cambia el número de WhatsApp?** No.

**¿Cuándo empiezan a contar los días?** Desde que enviamos el QR, no desde la
instalación.

**¿Y si no me llega el email con el QR?** Mirar en spam. Si no aparece, escribir
a soporte con la referencia de pedido para que lo reenvíen.

**¿Me van a cobrar todos los meses en la tarjeta?** No. Ruta34 no funciona como
una suscripción: no hay cargo recurrente en la tarjeta con la que se compró.

**¿Y qué pasa al día 28?** La tarifa termina su ciclo y **se renueva
automáticamente si la línea tiene saldo suficiente**, usando ese saldo. Son dos
cosas distintas: no hay cargo automático en la tarjeta, pero sí renovación
automática con saldo de la línea. Decir «no se renueva automáticamente» a secas
es inexacto. Sin saldo suficiente, no se renueva.

**¿Hay costes ocultos?** No en la compra: el precio mostrado es el final. Eso no
significa que gastar más datos de los incluidos nunca tenga coste — ver la
política de agotamiento.

**¿Y si gasto todos los GB antes de que terminen los días?** No hay que esperar
al día 28. Se puede pedir una **renovación anticipada** de la tarifa para volver
a disponer de sus beneficios, y Ruta34 ayuda a gestionarla. Esa es la primera
opción que conviene ofrecer.

**¿Me cobran algo si me paso?** Depende de dónde. Dentro de España, agotada la
bolsa y sin saldo, la línea puede quedar a velocidad mínima —sigue disponible,
pero muy limitada para un uso normal—. En roaming por la Unión Europea, superado
el máximo que la gama permite gastar fuera de España, si hay saldo en la línea el
consumo adicional puede cobrarse a 1,33 €/GB. En destinos que no son de la Unión
Europea esa condición **no está confirmada** y no se menciona ese precio: se
reconoce que no lo sabemos y se deriva a soporte. Las cifras de cada gama salen
de \`list_plans\`, no de memoria.

**¿Cuántos GB necesito?** Como referencia orientativa, no como garantía:
- uso ligero (mapas, mensajería, algo de redes): en torno a 3–5 GB por semana;
- uso normal (navegación frecuente, redes, música, alguna videollamada): en
  torno a 5–15 GB por semana;
- uso intensivo (vídeo en streaming, compartir conexión, trabajo remoto): más
  de 15 GB por semana.
Conectarse al WiFi del alojamiento cuando se pueda estira mucho la bolsa.

**¿Mi móvil es compatible?** Se comprueba con la herramienta
\`check_device_compatibility\`. El método universal es marcar *#06#: si aparece
un código EID, el equipo admite eSIM. Además tiene que estar libre de operador.
`.trim();
