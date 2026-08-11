/**
 * corpus/faq.ts — Preguntas frecuentes destiladas de `messages/es.json`.
 *
 * Solo las que se responden con hechos estables. Las que dependen del catálogo
 * (precio, GB de cada gama) no están aquí: esas se contestan con `list_plans` o
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

**¿Hay costes ocultos o renovación automática?** No. El precio mostrado es el
final y no se renueva solo.

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
