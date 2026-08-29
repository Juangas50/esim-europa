# Informe comparativo de proveedores — Fase 2B

Generado por `scripts/assistant-benchmark.mjs`, una ejecución por modelo.
Los precios usados en el cálculo de coste se pasan por entorno y quedan
anotados con la fecha de la ejecución: ninguna tarifa se da por permanente.

La decisión de proveedor **no la toma este informe**: la toma una persona
leyendo las cinco dimensiones acordadas — disciplina factual, naturalidad,
uso de herramientas, latencia y coste.

## anthropic · `claude-haiku-4-5` — 2026-08-23

> ⚠️ **REFERENCIA HISTÓRICA — NO COMPARAR CON LOS BLOQUES POSTERIORES.**
>
> Esta tirada se ejecutó desde el **contenedor de desarrollo**, no desde el
> despliegue, y en dos aspectos no reproduce las condiciones de la comparativa
> definitiva:
>
> · **CONV-1 y CONV-2 corrieron con el catálogo degradado.** No había
>   credenciales de Supabase, así que `getPlansWithSource` devolvió el fallback
>   y la regla de puertas cerradas impidió dar precios y gigas. Su
>   comportamiento con el catálogo vivo no está medido aquí.
> · **La latencia es la de esa máquina**, con su propia salida a internet.
>
> Las otras tres dimensiones —disciplina factual fuera de los escenarios de
> catálogo, uso de herramientas y tokens— sí valen como primera lectura, y de
> ellas salieron los hallazgos anotados en `DECISION_LOG.md` §4.3.
>
> La decisión de proveedor se toma con la comparativa Vercel↔Vercel, donde los
> dos modelos se miden en el mismo despliegue y con el mismo catálogo.

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


---

# Comparativa Vercel↔Vercel — 2026-08-29

Los dos bloques que siguen se midieron en **el mismo despliegue**, con el mismo
prompt, corpus, dispatcher, herramientas y catálogo real, 9 escenarios × 3
repeticiones, alternando modelos escenario a escenario. Son los que sostienen la
decisión de proveedor.

> **La comparación de coste no es cache-equivalent: OpenAI aplica caching
> automático y el adaptador Anthropic actual no envía cache_control. Las
> dimensiones factualidad, naturalidad, uso de herramientas y latencia sí son
> comparables bajo el mismo deployment, prompt, corpus, tools y catálogo.**

## openai · `gpt-5.6-luna` — 2026-08-29

reasoning.effort: `low`

Entorno de ejecución: **despliegue de Vercel (Preview `5eF5ScSdqg7N5FcTXSa5L7jZKUoJ`), catálogo real de Supabase**

Escenarios: 9 · repeticiones: 3 · turnos: 27 · errores: 0

### Por escenario

| Escenario | ms | Herramientas | ¿la esperada? | Contiene | Prohibido | Trunc. | in | cache | out |
|---|---:|---|:--:|:--:|:--:|:--:|---:|---:|---:|
| CONV-1 | 5625 | list_plans | sí | sí | ok | — | 9506 | 4500 | 212 |
| CONV-1 | 4007 | list_plans | sí | sí | ok | — | 9506 | 9500 | 203 |
| CONV-1 | 4060 | list_plans | sí | sí | ok | — | 9506 | 9500 | 195 |
| CONV-2 | 2936 | — | **no** | sí | ok | — | 4518 | 4492 | 64 |
| CONV-2 | 1596 | — | **no** | sí | ok | — | 4518 | 4515 | 55 |
| CONV-2 | 2421 | — | **no** | sí | ok | — | 4518 | 4515 | 79 |
| CONV-3a | 2598 | check_coverage | sí | sí | ok | — | 9130 | 8999 | 66 |
| CONV-3a | 4965 | check_coverage | sí | sí | ok | — | 9130 | 9124 | 66 |
| CONV-3a | 2167 | check_coverage | sí | sí | ok | — | 9130 | 9124 | 66 |
| CONV-3b | 2467 | check_coverage | sí | sí | ok | — | 9128 | 8998 | 62 |
| CONV-3b | 2852 | check_coverage | sí | sí | ok | — | 9128 | 9122 | 62 |
| CONV-3b | 2353 | check_coverage | sí | sí | ok | — | 9128 | 9122 | 61 |
| CONV-4a | 3132 | check_device_compatibility | sí | sí | ok | — | 9096 | 8997 | 58 |
| CONV-4a | 2781 | check_device_compatibility | sí | sí | ok | — | 9096 | 9090 | 69 |
| CONV-4a | 2380 | check_device_compatibility | sí | sí | ok | — | 9096 | 9090 | 58 |
| CONV-4b | 2786 | check_device_compatibility | sí | sí | ok | — | 9114 | 9001 | 85 |
| CONV-4b | 2594 | check_device_compatibility | sí | sí | ok | — | 9114 | 9108 | 89 |
| CONV-4b | 2877 | check_device_compatibility | sí | sí | ok | — | 9114 | 9108 | 80 |
| CONV-5 | 1328 | — | sí | sí | ok | — | 4515 | 4492 | 44 |
| CONV-5 | 3067 | — | sí | sí | ok | — | 4515 | 4512 | 45 |
| CONV-5 | 1399 | — | sí | sí | ok | — | 4515 | 4512 | 42 |
| CONV-6 | 3176 | escalate_to_human | sí | sí | ok | — | 9133 | 9001 | 103 |
| CONV-6 | 2924 | escalate_to_human | sí | sí | ok | — | 9137 | 9018 | 107 |
| CONV-6 | 2476 | escalate_to_human | sí | sí | ok | — | 9137 | 9018 | 87 |
| CONV-7 | 4295 | list_plans | sí | sí | ok | — | 9078 | 8996 | 76 |
| CONV-7 | 2475 | list_plans | sí | sí | ok | — | 9078 | 9072 | 77 |
| CONV-7 | 2388 | list_plans | sí | sí | ok | — | 9078 | 9072 | 76 |

### Agregado

| Métrica | Valor |
|---|---:|
| Latencia mediana | 2781 ms |
| Latencia p90 | 4295 ms |
| Tokens de entrada | 219662 |
| — de ellos, cacheados | 213598 |
| Tokens de salida | 2287 |
| Coste total | $0.008229 |
| Turnos con la herramienta esperada | 24/27 |
| Turnos que violan una prohibición | 0/27 |

### Respuestas, para leerlas

La naturalidad y la disciplina factual se juzgan leyendo, no con una expresión regular.

Se vuelcan **todas** las repeticiones, no solo la primera: cuando un turno se desvía suele hacerlo en una de las tres, y esa es justo la que hay que leer. Los turnos marcados con ⚠️ son los que no cumplieron alguna expectativa.

**CONV-1 · repetición 1**

> Estos son los planes vigentes, todos con **28 días de validez**, número español y llamadas y SMS ilimitados dentro de España:
> 
> - **Europa Básico:** 90 GB totales, hasta 15 GB fuera de España — **US$15**
> - **Europa Plus:** 270 GB totales, hasta 23 GB fuera de España — **US$20**
> - **Europa Total:** 330 GB totales, hasta 30 GB fuera de España — **US$30**
> - **Europa Max:** 380 GB totales, hasta 45 GB fuera de España — **US$40**
> - **Europa Premium:** 430 GB totales, hasta 60 GB fuera de España — **US$50**
> 
> Los GB de fuera de España están incluidos dentro del total; no se suman. El QR puede activarse dentro de una ventana de **365 días**.

**CONV-1 · repetición 2**

> Tenemos cinco planes, todos con 28 días de vigencia:
> 
> - **Europa Básico:** 90 GB totales, hasta 15 GB fuera de España — **USD 15**
> - **Europa Plus:** 270 GB totales, hasta 23 GB fuera de España — **USD 20**
> - **Europa Total:** 330 GB totales, hasta 30 GB fuera de España — **USD 30**
> - **Europa Max:** 380 GB totales, hasta 45 GB fuera de España — **USD 40**
> - **Europa Premium:** 430 GB totales, hasta 60 GB fuera de España — **USD 50**
> 
> La bolsa de datos es única: los GB fuera de España están incluidos dentro del total, no se suman. Todos incluyen número español y llamadas y SMS ilimitados dentro de España.

**CONV-1 · repetición 3**

> Tenemos cinco planes, todos con **28 días de vigencia**, número español y llamadas y SMS ilimitados dentro de España:
> 
> - **Europa Básico:** 90 GB totales, hasta 15 GB fuera de España — **US$15**
> - **Europa Plus:** 270 GB totales, hasta 23 GB fuera de España — **US$20**
> - **Europa Total:** 330 GB totales, hasta 30 GB fuera de España — **US$30**
> - **Europa Max:** 380 GB totales, hasta 45 GB fuera de España — **US$40**
> - **Europa Premium:** 430 GB totales, hasta 60 GB fuera de España — **US$50**
> 
> Los GB de fuera de España están incluidos dentro del total; no se suman.

**CONV-2 · repetición 1** — ⚠️ no llamó a la herramienta esperada

> ¿Cuántos de esos 50 GB calculás usar fuera de España? Con ese dato te recomiendo el plan más barato que te cubra los 20 días.

**CONV-2 · repetición 2** — ⚠️ no llamó a la herramienta esperada

> ¿De esos 50 GB, cuántos calculás gastar fuera de España? Con ese dato te recomiendo el plan más barato para tus 20 días.

**CONV-2 · repetición 3** — ⚠️ no llamó a la herramienta esperada

> ¿De esos 50 GB, cuántos estimás gastar fuera de España? Con ese dato te recomiendo el plan más barato para tus 20 días.

**CONV-3a · repetición 1**

> No. **Europa Básico no incluye Estados Unidos**; ese destino está cubierto por Europa Plus, Europa Total, Europa Max y Europa Premium.

**CONV-3a · repetición 2**

> No. **Europa Básico no incluye Estados Unidos**; ese destino está cubierto por Europa Plus, Europa Total, Europa Max y Europa Premium.

**CONV-3a · repetición 3**

> No. **Europa Básico no incluye Estados Unidos**; ese destino está cubierto por Europa Plus, Europa Total, Europa Max y Europa Premium.

**CONV-3b · repetición 1**

> Sí, **Europa Plus incluye cobertura en Estados Unidos**. La gama que no lo incluye es **Europa Básico**.

**CONV-3b · repetición 2**

> Sí, **Europa Plus funciona en Estados Unidos**. La gama que no lo incluye es **Europa Básico**.

**CONV-3b · repetición 3**

> Sí, **Europa Plus funciona en Estados Unidos**. La gama Europa Básico es la que no incluye ese destino.

**CONV-4a · repetición 1**

> Sí, tu iPhone 15 es compatible con eSIM. Tiene que estar libre de operador y vas a necesitar Wi‑Fi para instalarla.

**CONV-4a · repetición 2**

> Sí, tu iPhone 15 está confirmado como compatible con eSIM. Tiene que estar libre de operador; además, para instalarla necesitás WiFi y iOS 16.1 o superior.

**CONV-4a · repetición 3**

> Sí, tu iPhone 15 es compatible con eSIM. Tiene que estar libre de operador; además, necesitás WiFi para instalarla.

**CONV-4b · repetición 1**

> No está confirmado en la lista de dispositivos verificados. Marcá *#06# en el teléfono: si aparece un código EID, admite eSIM; además tiene que estar liberado de operador.

**CONV-4b · repetición 2**

> No está confirmado en la lista de dispositivos verificados. Marcá *#06# y fijate si aparece un código **EID**; si aparece, admite eSIM. Además, el teléfono tiene que estar libre de operador.

**CONV-4b · repetición 3**

> No está confirmado en nuestra lista. Marcá *#06# en el teléfono: si aparece un código **EID**, admite eSIM; además, tiene que estar libre de operador.

**CONV-5 · repetición 1**

> Podés pedir una **renovación anticipada** de la tarifa; no hace falta esperar a que terminen los 28 días. Es una gestión que te ayudamos a hacer desde soporte.

**CONV-5 · repetición 2**

> Podés pedir una **renovación anticipada** de la tarifa; no hace falta esperar a que terminen los 28 días. Es una gestión que te ayudamos a tramitar con soporte.

**CONV-5 · repetición 3**

> Podés pedir una **renovación anticipada** de la tarifa; no hace falta esperar a que termine el ciclo. Es una gestión que te ayudamos a tramitar con soporte.

**CONV-6 · repetición 1**

> Te paso con el equipo por WhatsApp para que revisen el cobro duplicado y te ayuden a resolverlo. No hace falta que compartas por acá datos de tarjeta ni códigos.

**CONV-6 · repetición 2**

> Te paso con el equipo por WhatsApp para que revisen el cobro duplicado de tu pedido. No hace falta que compartas por acá datos de tarjeta ni códigos.

**CONV-6 · repetición 3**

> Te paso con el equipo por WhatsApp para que revisen el cobro duplicado de tu pedido.

**CONV-7 · repetición 1**

> En este momento no puedo confirmar los precios porque el catálogo no está disponible. Podés consultar la web de Ruta34 y, si querés, te ayudo a elegir según la duración y el consumo de tu viaje.

**CONV-7 · repetición 2**

> En este momento no puedo confirmar el precio porque el catálogo no está disponible. Podés consultar la web de Ruta34 y, si querés, te ayudo a elegir según los días del viaje y el consumo estimado.

**CONV-7 · repetición 3**

> En este momento no puedo confirmar los precios porque el catálogo no está disponible. Podés consultar la web de Ruta34 y, si querés, te ayudo a elegir según los días del viaje y el consumo estimado.


## anthropic · `claude-haiku-4-5` — 2026-08-29

reasoning: no aplica a este proveedor

Entorno de ejecución: **despliegue de Vercel (Preview `5eF5ScSdqg7N5FcTXSa5L7jZKUoJ`), catálogo real de Supabase**

Escenarios: 9 · repeticiones: 3 · turnos: 27 · errores: 0

### Por escenario

| Escenario | ms | Herramientas | ¿la esperada? | Contiene | Prohibido | Trunc. | in | cache | out |
|---|---:|---|:--:|:--:|:--:|:--:|---:|---:|---:|
| CONV-1 | 2965 | list_plans | sí | sí | ok | — | 14220 | 0 | 228 |
| CONV-1 | 2844 | list_plans | sí | sí | ok | — | 14219 | 0 | 210 |
| CONV-1 | 2752 | list_plans | sí | sí | ok | — | 14224 | 0 | 230 |
| CONV-2 | 3695 | recommend_plan | sí | sí | ok | — | 13875 | 0 | 198 |
| CONV-2 | 2542 | recommend_plan | sí | sí | ok | — | 13860 | 0 | 154 |
| CONV-2 | 2613 | recommend_plan | sí | sí | ok | — | 13877 | 0 | 161 |
| CONV-3a | 2191 | check_coverage | sí | sí | ok | — | 13751 | 0 | 131 |
| CONV-3a | 2259 | check_coverage | sí | sí | ok | — | 13743 | 0 | 140 |
| CONV-3a | 1891 | check_coverage | sí | sí | ok | — | 13745 | 0 | 118 |
| CONV-3b | 1769 | check_coverage | sí | sí | ok | — | 13744 | 0 | 103 |
| CONV-3b | 2057 | check_coverage | sí | sí | ok | — | 13744 | 0 | 111 |
| CONV-3b | 1748 | check_coverage | sí | sí | ok | — | 13747 | 0 | 103 |
| CONV-4a | 2950 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 125 |
| CONV-4a | 2865 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 147 |
| CONV-4a | 2263 | check_device_compatibility | sí | sí | ok | — | 13686 | 0 | 96 |
| CONV-4b | 1450 | — | **no** | sí | ok | — | 6791 | 0 | 123 |
| CONV-4b | 1332 | — | **no** | sí | ok | — | 6791 | 0 | 64 |
| CONV-4b | 1839 | — | **no** | sí | ok | — | 6791 | 0 | 84 |
| CONV-5 | 1479 | — | sí | sí | ok | — | 6793 | 0 | 74 |
| CONV-5 | 1656 | — | sí | sí | ok | — | 6793 | 0 | 93 |
| CONV-5 | 1717 | — | sí | sí | ok | — | 6793 | 0 | 117 |
| CONV-6 | 2537 | escalate_to_human | sí | sí | ok | — | 13753 | 0 | 156 |
| CONV-6 | 2372 | escalate_to_human | sí | sí | ok | — | 13764 | 0 | 157 |
| CONV-6 | 2807 | escalate_to_human | sí | sí | ok | — | 13751 | 0 | 153 |
| CONV-7 | 2453 | list_plans | sí | sí | ok | — | 13680 | 0 | 119 |
| CONV-7 | 2173 | list_plans | sí | sí | ok | — | 13681 | 0 | 117 |
| CONV-7 | 2145 | list_plans | sí | sí | ok | — | 13686 | 0 | 119 |

### Agregado

| Métrica | Valor |
|---|---:|
| Latencia mediana | 2259 ms |
| Latencia p90 | 2950 ms |
| Tokens de entrada | 330874 |
| — de ellos, cacheados | 0 |
| Tokens de salida | 3631 |
| Coste total | $0.349029 |
| Turnos con la herramienta esperada | 24/27 |
| Turnos que violan una prohibición | 0/27 |

### Respuestas, para leerlas

La naturalidad y la disciplina factual se juzgan leyendo, no con una expresión regular.

Se vuelcan **todas** las repeticiones, no solo la primera: cuando un turno se desvía suele hacerlo en una de las tres, y esa es justo la que hay que leer. Los turnos marcados con ⚠️ son los que no cumplieron alguna expectativa.

**CONV-1 · repetición 1**

> Tenemos cinco planes, todos con línea española, llamadas y SMS ilimitados en España, y válidos por 28 días:
> 
> - **Europa Básico**: 90 GB totales (15 fuera de España) — $15 USD
> - **Europa Plus**: 270 GB totales (23 fuera de España) — $20 USD
> - **Europa Total**: 330 GB totales (30 fuera de España) — $30 USD
> - **Europa Max**: 380 GB totales (45 fuera de España) — $40 USD
> - **Europa Premium**: 430 GB totales (60 fuera de España) — $50 USD
> 
> ¿Cuál te llama la atención o hacia dónde viajas?

**CONV-1 · repetición 2**

> Tenemos cinco planes, todos con número español, llamadas y SMS ilimitados en España, y válidos 28 días:
> 
> - **Europa Básico**: 90 GB totales (15 fuera de España) — $15
> - **Europa Plus**: 270 GB totales (23 fuera de España) — $20
> - **Europa Total**: 330 GB totales (30 fuera de España) — $30
> - **Europa Max**: 380 GB totales (45 fuera de España) — $40
> - **Europa Premium**: 430 GB totales (60 fuera de España) — $50
> 
> ¿Cuántos datos te parece que necesitás?

**CONV-1 · repetición 3**

> Tenemos cinco planes de 28 días, todos con número español, llamadas y SMS ilimitados en España, más datos para roaming:
> 
> - **Europa Básico**: 90 GB totales, 15 GB fuera de España → USD $15
> - **Europa Plus**: 270 GB totales, 23 GB fuera de España → USD $20
> - **Europa Total**: 330 GB totales, 30 GB fuera de España → USD $30
> - **Europa Max**: 380 GB totales, 45 GB fuera de España → USD $40
> - **Europa Premium**: 430 GB totales, 60 GB fuera de España → USD $50
> 
> ¿A dónde viajás? Te ayudo a elegir.

**CONV-2 · repetición 1**

> Te va bien el **Europa Básico** a **15 USD**. Te da 90 GB totales, más que suficiente para los 50 que necesitás, y cuesta lo mínimo. Además incluye un número español con llamadas y SMS ilimitados en España.
> 
> ¿Cuántos de esos 50 GB pensás gastar fuera de España? Por si hace falta saber si hay margen.

**CONV-2 · repetición 2**

> Con 50 GB para 20 días, te conviene el **Europa Básico**: 90 GB totales (de los cuales 15 como máximo fuera de España) a USD 15. Tenés cobertura sobrada y es el más barato que se ajusta a lo que necesitás.

**CONV-2 · repetición 3**

> Europa Básico es el más barato: **USD 15**, con 90 GB totales de los que podés gastar hasta 15 GB fuera de España. Te sobra para los 20 días. ¿Sabés en dónde viajás?

**CONV-3a · repetición 1**

> No, el plan Europa Básico **no incluye** Estados Unidos. 
> 
> Sí funciona en Estados Unidos con Europa Plus, Europa Total, Europa Max o Europa Premium. Si necesitás ir allá, alguno de esos te sirve.

**CONV-3a · repetición 2**

> No, el plan Europa Básico **no incluye** Estados Unidos. En cambio, sí funciona con Europa Plus, Europa Total, Europa Max y Europa Premium.
> 
> Si tu viaje es a Estados Unidos, necesitaría uno de esos planes. ¿Querés que vea cuál te conviene más?

**CONV-3a · repetición 3**

> No, el Europa Básico no cubre Estados Unidos. Funciona en Europa Plus, Europa Total, Europa Max y Europa Premium.
> 
> Si necesitás uno de esos planes, te ayudo a decidir cuál.

**CONV-3b · repetición 1**

> Sí, el Europa Plus funciona en Estados Unidos. De hecho, lo incluyen todos los planes excepto el Europa Básico.

**CONV-3b · repetición 2**

> Sí, el Europa Plus funciona en Estados Unidos. Las gamas que lo cubren son Plus, Total, Max y Premium; solo Básico queda afuera.

**CONV-3b · repetición 3**

> Sí, el Europa Plus funciona en Estados Unidos. Las gamas que no lo cubren son solo Europa Básico.

**CONV-4a · repetición 1**

> Sí, el iPhone 15 es compatible con eSIM. Además está normalmente configurado como dual SIM, así que podés tener dos números en el mismo teléfono sin problemas.
> 
> ¿Hay algo más que necesites saber antes de comprar?

**CONV-4a · repetición 2**

> Sí, el iPhone 15 es compatible con eSIM. Además, tu equipo es normalmente dual SIM, así que podés tener dos números en el mismo móvil: el tuyo y el de Ruta34.
> 
> Recordá que el teléfono tiene que estar libre de operador. ¿Necesitás ayuda con algo más?

**CONV-4a · repetición 3**

> Sí, el iPhone 15 es compatible. Solo verificá que esté libre de operador y que tengas iOS 16.1 o superior.

**CONV-4b · repetición 1** — ⚠️ no llamó a la herramienta esperada

> No tengo registro de un modelo llamado "Telefonito Marca X 3000". ¿Podés decirme la marca y el modelo exactos de tu teléfono? Por ejemplo: iPhone 15, Samsung Galaxy S23, Xiaomi 13, etc.
> 
> Si no estás seguro, hay un método universal: marcá **\*#06#** en tu teléfono. Si aparece un código EID, el equipo admite eSIM. Además tiene que estar libre de operador.

**CONV-4b · repetición 2** — ⚠️ no llamó a la herramienta esperada

> Te busco la información. ¿Me confirmas el modelo exacto? Si es algo como "Marca X 3000", necesito el nombre completo y la marca real (por ejemplo, "Samsung Galaxy A12" o "iPhone 14 Pro") para verificarlo.

**CONV-4b · repetición 3** — ⚠️ no llamó a la herramienta esperada

> No tengo claro cuál es el modelo exacto que mencionás. ¿Podés darme la marca y el modelo tal cual aparecen en el teléfono? Por ejemplo, "iPhone 15", "Galaxy S23 Ultra", "Motorola Edge 50"...
> 
> Una vez que lo sepa, verifico la compatibilidad.

**CONV-5 · repetición 1**

> Podés pedir una **renovación anticipada** de la tarifa para volver a disponer de todos los GB incluidos. Ruta34 te ayuda a gestionarla.
> 
> ¿Querés que te ponga con el equipo para hacerlo, o tenés otras preguntas antes?

**CONV-5 · repetición 2**

> Lo mejor es pedir una **renovación anticipada** de la tarifa para volver a tener tus GB disponibles. No hay que esperar al día 28.
> 
> ¿Tenés una referencia de pedido a mano? Me la pasás y te ayudo a gestionarlo con el equipo, o si preferís podés escribirles directamente a soporte por WhatsApp.

**CONV-5 · repetición 3**

> Lo mejor es pedir una **renovación anticipada** de la tarifa para volver a tener los GB incluidos. Ruta34 te ayuda a gestionarla: escribís a soporte con tu referencia de pedido y ellos la procesan.
> 
> Es más rápido y seguro que esperar al día 28 o andar preocupándote por cargos adicionales. ¿Necesitás la referencia de algún pedido específico para contactarlos?

**CONV-6 · repetición 1**

> Perfecto, te voy a conectar por WhatsApp ahora. El equipo te va a responder allá y resuelven el doble cobro.

**CONV-6 · repetición 2**

> Listo, te escriben por WhatsApp en los próximos minutos. Tené a mano la referencia del pedido para que vayan más rápido.

**CONV-6 · repetición 3**

> Listo. Vas a recibir un mensaje por WhatsApp en los próximos minutos con alguien del equipo que te va a ayudar a resolver esto.

**CONV-7 · repetición 1**

> En este momento no puedo confirmar precios. Te recomiendo que mires la web de Ruta34 o me cuentes qué necesitás exactamente para viajar —días, gigas estimados, destino— y te ayudo a elegir el plan que se adapte mejor.

**CONV-7 · repetición 2**

> En este momento no puedo confirmar precios. Te recomiendo mirar el catálogo en la web de Ruta34, o escribir al equipo si tenés dudas sobre un plan concreto. ¿Hay algo más en lo que pueda ayudarte?

**CONV-7 · repetición 3**

> En este momento no puedo confirmar precios. Te recomiendo que mires la web directamente o te contactes con el equipo por WhatsApp para que te den los detalles actuales. ¿Hay algo más en lo que pueda ayudarte?

