/**
 * corpus/policy.ts — Política de producto que el asistente puede afirmar.
 *
 * Cada línea de este archivo es una promesa que hacemos por escrito a un
 * cliente. El listón para añadir algo aquí no es "esto suele ser así", sino
 * "esto lo dice hoy nuestra web o nuestros términos, y lo puedo señalar".
 *
 * Lo que NO está aquí, y por qué:
 *
 * · **Precios y GB.** Salen del catálogo vivo vía \`list_plans\`. Nunca del
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

- El precio mostrado es el precio final, en dólares. No hay cargos ocultos en la
  compra ni renovación automática cobrada por sorpresa.
- **No se puede decir que al agotar los GB «no se cobra nada».** Eso era lo que
  decía la web y no describe bien el producto. Lo que se puede decir está en la
  sección siguiente.

## Qué pasa al agotar los GB

Tres situaciones distintas. Conviene no mezclarlas.

**Dentro de España.** Consumida la bolsa incluida y sin renovar, la conexión no
queda necesariamente bloqueada del todo: sin saldo disponible la velocidad puede
bajar a niveles mínimos, de modo que la línea sigue técnicamente disponible pero
resulta muy limitada para un uso normal. No se dice «te quedás sin conexión», ni
«el servicio se bloquea», ni «se detiene automáticamente»: ninguna de las tres es
lo bastante precisa.

**Fuera de España.** Cada gama tiene un máximo de esa misma bolsa que puede
gastarse fuera de España — el \`outsideSpainMaxGb\` que devuelve \`list_plans\`, y
que hay que consultar ahí en vez de recordarlo. Ese tope es igual para todos los
destinos incluidos. **Lo que no es igual en todos es qué ocurre después**, y ahí
hay que distinguir.

**Roaming en la Unión Europea.** Agotada la franquicia, si la línea tiene saldo
disponible, el consumo adicional puede cobrarse a **1,33 €/GB**. Esta condición
está confirmada para roaming en la Unión Europea y **solo** para ese caso.

Antes de mencionarla hay que cumplir dos requisitos, los dos:

1. que el destino esté **incluido en la cobertura de esa gama** — lo dice
   \`check_coverage\`, no la memoria. Si la gama no cubre el destino no hay
   franquicia que agotar allí, y hablar de precio por giga es responder a otra
   pregunta;
2. que se trate de **roaming en la Unión Europea**.

**Destinos que no son de la Unión Europea.** La cobertura incluye destinos fuera
de la UE. Para ellos **no tenemos confirmada** esa condición, así que no se
menciona el precio: se dice que no está confirmado qué ocurre después de agotar
la franquicia allí y se deriva a soporte si hace falta.

«Fuera de España» y «roaming UE» **no son lo mismo**, y confundirlos es prometer
un precio que nadie ha confirmado. Ante la duda sobre si un destino pertenece a
la Unión Europea, se trata como no confirmado: no se adivina. Aquí no hay dato
que consultar —el catálogo guarda tarifas y gigas, y \`coverage.json\` guarda
dónde funciona cada gama; ninguno de los dos dice qué destino es de la UE—, así
que la única salida honesta cuando no consta es reconocerlo y derivar.

**Renovación.** Aquí hay tres cosas distintas que se confunden con facilidad, y
conviene separarlas cada vez:

1. **La tarjeta con la que se compró.** No hay suscripción ni cargo recurrente:
   Ruta34 no vuelve a cobrar sola en esa tarjeta. A «¿me van a cobrar todos los
   meses?» la respuesta es que no.
2. **El saldo de la línea.** Es otra cosa. La tarifa tiene un ciclo de 28 días
   —el \`validityDays\` del catálogo— y, al terminar, **se renueva
   automáticamente si la línea tiene saldo suficiente**, usando ese saldo. Por
   eso no se puede decir «no se renueva automáticamente» a secas: sí se renueva,
   pero con el saldo de la línea, no cobrando de nuevo en la tarjeta. Sin saldo
   suficiente no se renueva.
3. **La renovación anticipada.** Antes de que terminen los 28 días se puede
   pedir, y es justo lo que sirve cuando alguien gasta los GB a mitad de viaje.
   Es una **gestión de soporte** de Ruta34: se ofrece acompañarla, nunca como
   algo que el cliente ejecute solo desde la web ni que ocurra al instante.

Esa es la salida que se ofrece primero: renovar es mejor respuesta que explicarle
a alguien cuánto le costará cada giga suelto.

## Lo que no se sabe y no se inventa

Sobre todo esto hay cosas que el asistente **no** puede afirmar, ni siquiera
aproximando. Si hacen falta para responder, se reconoce el límite y se deriva a
soporte:

- cómo se ejecuta la renovación por dentro, o cuánto tarda Ruta34 en gestionarla;
- si la renovación anticipada es instantánea;
- cuánto saldo exacto necesita alguien, si no sale del precio vivo del catálogo;
- a qué velocidad concreta queda la línea al agotar los datos, o qué aplicaciones
  seguirán siendo usables;
- cómo se tarifica en una zona concreta si no está documentado aquí;
- condiciones regulatorias de un país en particular;
- qué ocurre en un destino que no esté cubierto.

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
