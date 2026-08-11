/**
 * corpus/policy.ts — Política de producto que el asistente puede afirmar.
 *
 * Cada línea de este archivo es una promesa que hacemos por escrito a un
 * cliente. El listón para añadir algo aquí no es "esto suele ser así", sino
 * "esto lo dice hoy nuestra web o nuestros términos, y lo puedo señalar".
 *
 * Lo que NO está aquí, y por qué:
 *
 * · **Precios y GB.** Salen del catálogo vivo vía `list_plans`. Nunca del
 *   corpus, porque un número escrito aquí queda congelado el día que se
 *   escribió y nadie lo actualiza cuando cambia una tarifa.
 * · **Lista de países.** No existe lista contractual canónica: las fuentes
 *   internas se contradicen. Hasta que exista, la cobertura la resuelve
 *   `check_coverage` y nada más.
 * · **Minutos internacionales por plan.** La web publica una tabla por destino
 *   y gama, pero vive en un archivo de copy, no en el catálogo. Afirmar "tenés
 *   400 minutos a Argentina" desde ahí sería exactamente el problema que el
 *   fail closed del catálogo evita. Se reconoce que existen y se deriva.
 */

export const POLICY = `
## Producto

Ruta34 vende eSIM: una SIM digital que se instala escaneando un código QR, sin
tarjeta física y sin ir a una tienda. Funciona igual que un chip físico. Cuando
alguien pregunta por "chip para España" o "chip para Europa", se refiere a esto.

Los planes son una línea española con número, llamadas y SMS ilimitados dentro
de España, más una bolsa de datos. Los nombres comerciales son los únicos
válidos: Europa Básico, Europa Plus, Europa Total, Europa Max, Europa Premium.

### Cómo se leen los gigas

Cada plan tiene una bolsa TOTAL de datos y un tope de cuánto de ESA MISMA bolsa
puede gastarse fuera de España. **No son dos bolsas y no se suman.** Un plan de
270 GB totales con 23 GB fuera de España da 270 GB en total, de los cuales como
mucho 23 se pueden consumir fuera del país. Sumarlos y decir 293 es un error
grave: es prometer datos que no existen.

## Activación y vigencia

- Los días del plan empiezan a correr **cuando enviamos el QR**, no cuando el
  cliente lo instala. Con activación inmediata, dentro de las 24 h siguientes;
  con fecha programada, ese día.
- Recomendamos instalar la eSIM antes de salir del país de origen, con WiFi, y
  encender los datos al aterrizar.
- El QR se envía por email en horario de atención: lunes a sábado, de 8 a 21 h
  hora de España. Las compras fuera de ese horario se preparan al día siguiente.

## Número y WhatsApp

- El número de origen del cliente sigue funcionando en su SIM física. La eSIM se
  añade, no reemplaza.
- WhatsApp no cambia de número ni se pierde.
- El plan incluye además un número español.

## Cobertura

- La cobertura de un destino se consulta **siempre** con \`check_coverage\`, sin
  excepciones, y se dice exactamente lo que devuelva. Ninguna otra fuente de
  esta conversación autoriza a confirmar ni a negar que un destino funcione: ni
  el catálogo, ni lo que se sepa del sector, ni un número de países recordado.
- No todas las gamas cubren exactamente los mismos destinos. Cuando la
  herramienta devuelva que alguna no lo incluye, hay que decirlo **antes** de
  que la persona compre. Enterarse después es un reembolso.
- Que un destino no aparezca en la lista no significa que no funcione:
  significa que no podemos confirmarlo. Se dice así y se ofrece contacto con el
  equipo.
- La cobertura dice dónde funciona el producto, no cuántos datos se pueden
  gastar allí. Para lo segundo hace falta el catálogo.
- Fuera de España hay que activar la itinerancia de datos en la línea de Ruta34.

## Cobros

- El precio mostrado es el precio final, en dólares.
- No hay renovación automática ni cargos ocultos. Cuando se acaban los GB o los
  días, el servicio simplemente deja de dar datos; no se cobra nada extra.

## Llamadas internacionales

Las tarifas incluyen minutos a varios destinos de Latinoamérica, y la cantidad
depende del destino y de la gama. El asistente puede decir que existen, pero
**no puede dar cifras concretas**: hay que remitir a la sección de preguntas
frecuentes de la web o derivar a soporte.

## Requisitos del dispositivo

- El móvil tiene que ser compatible con eSIM y estar **libre de operador**.
- Hace falta WiFi durante la instalación; no se puede instalar con datos
  móviles.
- En iPhone hace falta iOS 16.1 o superior.
`.trim();
