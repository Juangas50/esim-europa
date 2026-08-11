/**
 * corpus/guides.ts — Guías destiladas desde `/help/*`.
 *
 * Son resúmenes, no copias: la web tiene capturas y la conversación no. Lo que
 * se conserva es la secuencia de pasos y las advertencias, que es lo que
 * resuelve el problema. La guía completa se enlaza con la acción `open_guide`.
 *
 * Se cargan **bajo demanda** mediante la tool `get_guide`. Meter las cuatro en
 * el prefijo del sistema costaría tokens en todas las conversaciones para
 * atender a la fracción que pregunta por instalación.
 */

export const GUIDE_SLUGS = ["install-iphone", "install-android", "qr", "troubleshooting"] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export const GUIDES: Record<GuideSlug, string> = {
  "install-iphone": `
Instalación en iPhone (requiere iOS 16.1 o superior, y WiFi):

1. Ajustes → Datos celulares (o Planes celulares).
2. "Agregar plan celular" / "Crear plan celular", según la versión de iOS.
3. Escanear el QR que llegó por email, bien iluminado.
4. Seguir las instrucciones y elegir si la eSIM será la línea principal o la
   secundaria. Se puede cambiar después.
5. Al llegar a destino, encender los datos móviles. Fuera de España hay que
   activar además la itinerancia de datos en la línea de Ruta34.

Avisos: si no aparece la opción de eSIM, el iPhone puede no ser compatible o
estar bloqueado por el operador. El QR es personal y de un solo uso: no se
comparte con nadie.
`.trim(),

  "install-android": `
Instalación en Android (con WiFi; los menús cambian de nombre según la marca):

1. Ajustes → Conexiones o Redes → SIM / Administrador de SIM.
2. "Agregar eSIM", "Agregar plan móvil" o "Descargar una SIM".
3. Escanear el QR recibido por email.
4. Confirmar la descarga del perfil y darle un nombre a la línea.
5. Activar la línea y, al llegar a destino, encender datos móviles e
   itinerancia de datos.

Avisos: si el menú de eSIM no aparece, el móvil puede no soportarla o estar
bloqueado. Marcar *#06#: si aparece un código EID, el equipo es compatible.
`.trim(),

  qr: `
Sobre el código QR:

- Llega por email dentro del horario de atención (lunes a sábado, 8–21 h hora de
  España). Si la compra se hace fuera de ese horario, se prepara al día
  siguiente.
- Si no aparece, hay que mirar en spam o correo no deseado.
- Es de un solo uso y personal: una vez instalado en un móvil, no se puede
  reutilizar en otro.
- Los días del plan corren desde que se envía el QR, no desde que se instala.
- Si no llega, hay que escribir a soporte con la referencia de pedido y se
  reenvía.
`.trim(),

  troubleshooting: `
La eSIM no funciona — comprobaciones, en orden:

1. ¿El móvil está libre de operador? Si está bloqueado, ninguna línea nueva
   funcionará, aunque sea eSIM.
2. ¿Está la línea de Ruta34 activada en los ajustes de SIM?
3. ¿Están encendidos los datos móviles **para esa línea** y no para la otra?
4. Fuera de España: ¿está activada la itinerancia de datos en esa línea?
5. Reiniciar el móvil, que resuelve buena parte de los casos.
6. Comprobar que la selección de red esté en automático.

Si tras esto sigue sin haber conexión, hay que derivar a soporte con la
referencia de pedido. No pedir nunca el ICCID ni códigos de activación por
chat.
`.trim(),
};
