# Informe comparativo de proveedores — Fase 2B

Generado por `scripts/assistant-benchmark.mjs`, una ejecución por modelo.
Los precios usados en el cálculo de coste se pasan por entorno y quedan
anotados con la fecha de la ejecución: ninguna tarifa se da por permanente.

La decisión de proveedor **no la toma este informe**: la toma una persona
leyendo las cinco dimensiones acordadas — disciplina factual, naturalidad,
uso de herramientas, latencia y coste.

## anthropic · `claude-haiku-4-5` — 2026-08-23

reasoning: no aplica a este proveedor

Escenarios: 9 · repeticiones: 3 · turnos: 27 · errores: 0

### Por escenario

| Escenario | ms | Herramientas | ¿la esperada? | Contiene | Prohibido | Trunc. | in | cache | out |
|---|---:|---|:--:|:--:|:--:|:--:|---:|---:|---:|
| CONV-1 | 2447 | list_plans | sí | sí | ok | — | 13668 | 0 | 121 |
| CONV-1 | 2464 | list_plans | sí | sí | ok | — | 13667 | 0 | 133 |
| CONV-1 | 2921 | list_plans | sí | sí | ok | — | 13665 | 0 | 151 |
| CONV-2 | 2738 | recommend_plan | sí | sí | ok | — | 13735 | 0 | 163 |
| CONV-2 | 3002 | recommend_plan | sí | sí | ok | — | 13733 | 0 | 175 |
| CONV-2 | 3103 | recommend_plan | sí | sí | ok | — | 13763 | 0 | 198 |
| CONV-3a | 2732 | check_coverage | sí | sí | ok | — | 13780 | 0 | 161 |
| CONV-3a | 2482 | check_coverage | sí | sí | ok | — | 13744 | 0 | 134 |
| CONV-3a | 2281 | check_coverage | sí | sí | ok | — | 13754 | 0 | 155 |
| CONV-3b | 2084 | check_coverage | sí | sí | ok | — | 13743 | 0 | 100 |
| CONV-3b | 1937 | check_coverage | sí | sí | ok | — | 13744 | 0 | 105 |
| CONV-3b | 1864 | check_coverage | sí | sí | ok | — | 13747 | 0 | 104 |
| CONV-4a | 1891 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 110 |
| CONV-4a | 2367 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 142 |
| CONV-4a | 2678 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 147 |
| CONV-4b | 2974 | check_device_compatibility | sí | sí | ok | — | 13731 | 0 | 161 |
| CONV-4b | 1597 | — | **no** | sí | ok | — | 6791 | 0 | 82 |
| CONV-4b | 1357 | — | **no** | sí | ok | — | 6791 | 0 | 72 |
| CONV-5 | 1614 | — | sí | sí | ok | — | 6793 | 0 | 66 |
| CONV-5 | 3715 | escalate_to_human | sí | **no** | ok | — | 13814 | 0 | 218 |
| CONV-5 | 1745 | — | sí | sí | ok | — | 6793 | 0 | 77 |
| CONV-6 | 2608 | escalate_to_human | sí | sí | ok | — | 13762 | 0 | 143 |
| CONV-6 | 2710 | escalate_to_human | sí | sí | ok | — | 13752 | 0 | 138 |
| CONV-6 | 2582 | escalate_to_human | sí | sí | ok | — | 13762 | 0 | 141 |
| CONV-7 | 2166 | list_plans | sí | sí | ok | — | 13685 | 0 | 114 |
| CONV-7 | 2263 | list_plans | sí | sí | ok | — | 13680 | 0 | 104 |
| CONV-7 | 2540 | list_plans | sí | sí | ok | — | 13685 | 0 | 96 |

### Agregado

| Métrica | Valor |
|---|---:|
| Latencia mediana | 2464 ms |
| Latencia p90 | 3002 ms |
| Tokens de entrada | 342840 |
| — de ellos, cacheados | 0 |
| Tokens de salida | 3511 |
| Coste total | $0.360395 |
| Turnos con la herramienta esperada | 25/27 |
| Turnos que violan una prohibición | 0/27 |

### Respuestas, para leerlas

La naturalidad y la disciplina factual se juzgan leyendo, no con una expresión regular.

Se vuelcan **todas** las repeticiones, no solo la primera: cuando un turno se desvía suele hacerlo en una de las tres, y esa es justo la que hay que leer. Los turnos marcados con ⚠️ son los que no cumplieron alguna expectativa.

**CONV-1 · repetición 1**

> En este momento no puedo confirmar los precios ni las cifras de gigas. Te recomiendo entrar a la web de Ruta34 para ver el catálogo completo, o si querés ayuda decidiendo cuál es el que te conviene, te digo qué datos necesito.

**CONV-1 · repetición 2**

> En este momento no puedo confirmar los precios ni las cantidades de datos. Te recomiendo que veas los planes en la web de Ruta34, o si tenés una pregunta específica sobre qué necesitás para tu viaje te ayudo a orientarte. ¿A dónde vas o cuántos datos pensás que necesitás?

**CONV-1 · repetición 3**

> En este momento no puedo mostrarte los precios ni los gigas exactos. Te recomiendo que vayas a la web de Ruta34 para ver el catálogo completo, o si querés que te ayude a elegir un plan según tus necesidades de viaje, me contás cuántos datos pensás usar, cuántos días viajás o en cuáles países y te recomiendo el que mejor se ajusta.

**CONV-2 · repetición 1**

> En este momento no puedo confirmar precios ni cifras de datos. Te recomiendo que mires el catálogo en la web, donde están todos los planes con sus datos y precios. Si después de verlo tenés dudas o necesitás ayuda con otra cosa, estoy acá.

**CONV-2 · repetición 2**

> En este momento no puedo confirmar precios ni detalles de los planes. Te recomiendo mirar el catálogo en la web para ver cuál se ajusta mejor a tus 50 GB en 20 días. Cuando tengas decidido, sigo ayudándote con instalación, cobertura de destinos o lo que necesites.

**CONV-2 · repetición 3**

> En este momento no puedo confirmar precios ni detalles de los planes. Te recomiendo mirar la web o acercarte al equipo para que te recomienden el más conveniente según tus 50 GB en 20 días. ¿Hay algo más en lo que pueda ayudarte mientras tanto?

**CONV-3a · repetición 1**

> No, el Europa Básico no cubre Estados Unidos. Funciona en Europa Plus, Europa Total, Europa Max y Europa Premium. Si necesitás datos en EE.UU., estaría bien que pasaras a alguno de esos planes.

**CONV-3a · repetición 2**

> No, el plan Europa Básico no funciona en Estados Unidos. Sí funcionan en ese país los planes Europa Plus, Europa Total, Europa Max y Europa Premium. 
> 
> Si Estados Unidos es parte importante de tu viaje, alguno de esos cuatro te daría cobertura allá.

**CONV-3a · repetición 3**

> No, Europa Básico **no funciona** en Estados Unidos. Ese destino solo está cubierto en Europa Plus, Europa Total, Europa Max y Europa Premium.
> 
> Si necesitás datos allá, te recomendaría alguno de esos planes. ¿Te interesa saber cuál se ajusta mejor a tu viaje?

**CONV-3b · repetición 1**

> Sí, el Europa Plus funciona en Estados Unidos. Eso sí, el Europa Básico no lo cubre.

**CONV-3b · repetición 2**

> Sí, Europa Plus sí funciona en Estados Unidos. De las cinco gamas, la única que no lo incluye es Europa Básico.

**CONV-3b · repetición 3**

> Sí, Europa Plus funciona en Estados Unidos. De hecho, todos los planes excepto Europa Básico lo incluyen.

**CONV-4a · repetición 1**

> Sí, el iPhone 15 es compatible. Eso sí, necesitás que tenga iOS 16.1 o superior y que esté libre de operador para poder instalar la eSIM.

**CONV-4a · repetición 2**

> Sí, el iPhone 15 es compatible. Además tiene soporte para dual SIM, así que podés tener los dos números en el mismo móvil.
> 
> Recordá que además de la compatibilidad, el equipo tiene que estar libre de operador y necesitás iOS 16.1 o superior (que casi seguro que tenés).

**CONV-4a · repetición 3**

> Sí, el iPhone 15 es compatible con eSIM. Además, como es dual SIM, podés tener tanto la eSIM de Ruta34 como tu SIM física con el mismo número — los dos números en un solo celular.
> 
> Necesitás iOS 16.1 o superior y el teléfono tiene que estar libre de operador.

**CONV-4b · repetición 1**

> No aparece en el listado de verificados, pero eso no quiere decir que no funcione. Para estar seguro, marcá `*#06#` en el móvil: si te aparece un código EID, es compatible con eSIM. De todos modos, el equipo tiene que estar libre de operador para que ande.

**CONV-4b · repetición 2** — ⚠️ no llamó a la herramienta esperada

> Necesito el nombre exacto de tu móvil para verificarlo. "Telefonito Marca X 3000" no me da los datos que requiero.
> 
> ¿Cuál es la marca y modelo real? Por ejemplo: "iPhone 15", "Samsung Galaxy S23", "Motorola G54"... así puedo comprobarlo.

**CONV-4b · repetición 3** — ⚠️ no llamó a la herramienta esperada

> No puedo ayudarte con ese modelo: "Telefonito Marca X 3000" no me dice cuál es realmente el dispositivo. ¿Cuál es la marca y modelo exacto de tu teléfono? (Por ejemplo, iPhone 15, Samsung Galaxy S24, etc.)

**CONV-5 · repetición 1**

> La mejor opción es pedir una **renovación anticipada** de la tarifa para volver a disponer de todos los GB. Ruta34 puede gestionarla por vos.
> 
> ¿Querés que te pase con el equipo para que la tramiten?

**CONV-5 · repetición 2** — ⚠️ no contiene lo esperado

> Listo, te contactan por WhatsApp en un momento. Explicales dónde estás viajando y cuándo te van a agotar los datos si seguís viajando así, así calcular el timing.

**CONV-5 · repetición 3**

> La mejor opción es pedir una **renovación anticipada** de tu tarifa para volver a tener acceso a los GB incluidos. Te ayudamos a gestionarla con soporte.
> 
> ¿Cuál es tu referencia de pedido? Te paso con el equipo para que lo hagan rápido.

**CONV-6 · repetición 1**

> Ya está. Te espera el equipo por WhatsApp, van a revisar tu cuenta y arreglarlo.

**CONV-6 · repetición 2**

> ¿Tenés WhatsApp? Te contactan al mismo número de tu cuenta o al que les digas.

**CONV-6 · repetición 3**

> Listo. Te contactan por WhatsApp ahora. Tenés que estar atento al chat.

**CONV-7 · repetición 1**

> En este momento no puedo confirmar los precios. Te recomiendo mirar la web de Ruta34 donde está el catálogo completo, o podés ponerte en contacto directo con el equipo por si tenés otras dudas.

**CONV-7 · repetición 2**

> En este momento no puedo confirmar los precios. Te recomiendo mirar en la web o escribir al equipo para que te den los datos actuales. ¿Hay algo más que pueda ayudarte mientras tanto?

**CONV-7 · repetición 3**

> En este momento no puedo confirmar precios. Te recomiendo que cheques la web o nos escribas a soporte y el equipo te da los datos al toque.

