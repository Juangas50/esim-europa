# Asistente Ruta34 — registro de decisiones

Estado del documento: **vivo**. Cada entrada lleva fecha y nivel de verificación.
Las decisiones marcadas como *pendientes* bloquean lo que dice su columna, y
nada más.

Última actualización: 2026-08-10.

---

## 1. Decisiones cerradas

### D-A · El catálogo falla cerrado

Si `getPlansWithSource()` no devuelve `source: "supabase"`, el asistente **no
entrega precios ni gigas como datos actuales**. Ni del fallback de `plans.ts`,
ni aproximados, ni «según nuestra información habitual».

El fallback existe para que la tienda no se quede en blanco durante una caída:
el usuario ve una página, y hay contexto alrededor. Una conversación no tiene
ese contexto. «El Europa Plus son 20 dólares» dicho por el asistente es una
afirmación de precio en primera persona.

Implementado en `src/lib/assistant/server/catalog.ts`. Verificado por
`tests/unit/assistant/sec-catalog-failclosed.spec.ts`, que recorre los cuatro
caminos de fallo (fallback, excepción, respuesta vacía, plan que no valida) y
comprueba además que ningún número del catálogo aparece en el payload que
llega al modelo.

### D-B · La semántica de los gigas se protege en la forma del dato

`Plan.data_gb` y `Plan.eu_data_gb` invitan a sumarse. No se suman: el segundo
es el tope de gasto fuera de España *dentro* de la misma bolsa.

El DTO del asistente los renombra a `totalGb` y `outsideSpainMaxGb`, dentro de
un objeto con discriminador `kind`, y un `refine` de Zod rechaza
`outsideSpainMaxGb > totalGb`. La contradicción no es representable.

La regla también está escrita en el system prompt, pero esa es la segunda
línea: las frases se olvidan bajo presión conversacional, los esquemas no.

### D-C · `check_coverage` consume la fuente canónica

Resuelta la decisión comercial (D1), la herramienta ya no está degradada:
responde desde `src/lib/coverage.ts`, **la misma fuente que consumen el buscador
de la portada y el modal de países**. Una lista, tres superficies.

Antes solo sabía confirmar España, porque las tres listas que existían en la web
se contradecían entre sí y ninguna tenía autoridad para respaldar un «sí, te
sirve». Ese estado provisional termina aquí.

Lo que la herramienta sigue sin saber, a propósito: **gigas**. La cobertura dice
dónde funciona cada producto; cuántos datos se pueden gastar fuera de España es
un dato del catálogo vivo. «¿Cuántos GB tengo en Francia con el Plus?» se
responde componiendo `check_coverage` + `list_plans`, nunca guardando esa cifra
en la tabla de países — sería una segunda verdad que envejecería en silencio.

`TOOL_FLAGS.check_coverage` sigue existiendo para poder apagarla sin tocar el
dispatcher.

### D-D · `check_device_compatibility` no puede decir «no sirve»

El enum de salida es `supported | unknown`. `not_supported` no existe en el
esquema Zod, así que ninguna versión futura del módulo puede emitirlo.

`esim-devices.json` es una lista de modelos verificados (248 modelos, 16
marcas), no un censo del mercado. Que un móvil no aparezca significa que no lo
hemos comprobado. Decirle a alguien que su móvil no sirve es perder una venta
con una afirmación que no podemos sostener.

### D-E · Seis herramientas, no cinco

`list_plans`, `recommend_plan`, `check_coverage`,
`check_device_compatibility`, `get_guide`, `escalate_to_human`.

El diseño previo proponía cinco por economía de tokens. Eliminar la de
compatibilidad de dispositivos habría sacrificado una consulta frecuente y
perfectamente respondible por una cifra estética.

### D-F · `recommend_plan` es determinista o se calla

Algoritmo: **el plan más barato que satisface las restricciones numéricas
explícitas del usuario, cuando ese plan es uno solo.**

Funciona porque los planes vivos forman una cadena totalmente ordenada — al
ordenarlos por precio, los gigas totales y el tope fuera de España crecen a la
vez. En una cadena así, «el más barato que cumple» es una respuesta única y
demostrable, no una opinión.

Esa propiedad es del catálogo de hoy, no una ley, así que **se verifica en cada
llamada**. Si una tarifa futura la rompe, o si conviven varios tipos de
producto, la herramienta devuelve `no_deterministic_recommendation` y el modelo
pasa a comparar con `list_plans`.

Sin criterios explícitos devuelve `insufficient_criteria` con la lista de lo
que falta. El presupuesto nunca degrada la recomendación por debajo de lo que
el usuario dijo necesitar: devuelve el plan correcto más un aviso
`budget_exceeded`.

**Empate de precio** (revisión del 2026-08-10): si dos o más planes que cumplen
las restricciones cuestan exactamente lo mismo, «el más barato» deja de
designar a uno solo y la herramienta se retira igualmente. Se descartó
desempatar por «más gigas por el mismo precio»: acertaría casi siempre, pero es
justo el tipo de preferencia implícita que esta herramienta existe para no
tener. La misma regla se aplica al techo del catálogo cuando nada cumple.

### D-G · El prompt no nombra lo que oculta

La regla de confidencialidad del system prompt es genérica: no revelar ni
especular sobre infraestructura, proveedores o configuración interna. **No
nombra** al mayorista de la línea, ni al proveedor del modelo, ni columnas de
la base de datos.

Nombrar el secreto lo mete en el contexto: basta una desviación de la
instrucción para que salga. La protección real es que no esté escrito.

`tests/unit/assistant/sec-prompt-hygiene.spec.ts` verifica que ni el prompt, ni
el corpus, ni las guías, ni las definiciones de herramientas contienen ninguno
de los términos prohibidos. La lista vive en el test, que nunca se envía a
ningún modelo.

### D-H · `plan-compatibility.ts` no es fuente de cobertura

Mide el país del **comprador** para decidir qué planes ofrecerle, no la
cobertura del servicio. Cubre 4 de los 5 planes vivos y sus comentarios
arrastran naming interno ya retirado del DTO.

Se le ha añadido una cabecera de aviso. **No se ha tocado su lógica.**

---

## 2. Decisiones de negocio

### D1 · Lista contractual canónica de países — **RESUELTA (2026-08-10)**

Cobertura confirmada por negocio: **39 destinos**.

- los 27 de la Unión Europea, más Reino Unido, Islandia, Liechtenstein,
  Noruega, Suiza, Turquía, Ucrania, Moldavia, Kosovo, Vaticano y Mónaco → **38
  destinos incluidos en las cinco gamas**;
- **Estados Unidos** es la única excepción: incluido en Europa Plus, Total, Max
  y Premium; **no incluido en Europa Básico**.

Por tanto: Europa Básico cubre 38 destinos, las otras cuatro gamas cubren 39.

Vive en `src/data/coverage.json`, validado al importar por `src/lib/coverage.ts`.
No se modelan promociones ni fechas de expiración: si la cobertura cambia
comercialmente, se edita la fuente a mano.

### D2 · Estados Unidos en `CountriesModal` — **RESUELTA (2026-08-10)**

No era un error: Estados Unidos está cubierto, pero **no por Europa Básico**. El
modal lo publicaba sin esa distinción, así que la promesa estaba incompleta, no
falsa.

Corregido de raíz: el modal ya no tiene lista propia, consume la fuente canónica
y marca explícitamente los destinos con excepciones. Y la cabecera ha dejado de
decir «39+ países» sobre una lista cerrada de 39; ahora dice «39 destinos».

### D3 · Rate limiting distribuido — *pendiente, Fase 2D*

El limitador del checkout guarda estado en un `Map` en memoria, con un
comentario en el propio código admitiéndolo. En Vercel las instancias no
comparten memoria: N conexiones paralelas son N cubos independientes.

Para el checkout es tolerable. Para un endpoint que convierte peticiones en
gasto de proveedor, no es una defensa.

**Durante desarrollo:** best-effort + tope duro de gasto del proveedor.
**Antes de producción pública:** contador distribuido obligatorio, además del
firewall y el tope de gasto.

Los límites diarios por IP quedan **provisionales** hasta medir comportamiento
real: NAT, redes móviles, hoteles y aeropuertos comparten IP entre muchos
usuarios legítimos.

### D3b · `AbortSignal` en herramientas con E/S — *requisito de la Fase 2D*

El `AbortSignal` del turno llega hoy al proveedor, no a las herramientas. Es
correcto mientras todas sean lo que son ahora: funciones puras sobre datos ya en
memoria, sin nada que cancelar.

Deja de serlo en cuanto una herramienta haga E/S. En ese momento el turno
respondería «timeout» al usuario mientras la herramienta sigue corriendo y
sigue costando dinero.

**Toda herramienta futura que haga E/S deberá aceptar el `AbortSignal` en su
`ToolContext` y respetarlo.** No se implementa ahora porque no hay nada que
cancelar y una abstracción sin uso envejece mal. Anotado en la cabecera de
`dispatcher.ts` y aquí.

### D4 · RGPD / DPA — *pendiente, bloqueante para producción*

No bloquea implementación ni pruebas internas. Sí bloquea la apertura al
público. La sanitización de PII previa al modelo (D-I) es una precondición
técnica, no un sustituto del acuerdo.

### D5 · Proveedor de modelo — *pendiente, se decide en Fase 2B*

Ver la sección 4. **No se selecciona hasta ver los resultados de la suite CONV.**

---

## 3. Sanitización de PII

Se redacta antes de que el texto llegue al modelo: cadenas de activación LPA,
correos, EID (32 dígitos), ICCID (prefijo 89, 18–22 dígitos), IMEI (15
dígitos), tarjetas de pago (13–19 dígitos **con Luhn**), tiradas de 16+
dígitos, teléfonos y tokens de 28+ caracteres que mezclen letras y dígitos.

La mitad difícil es la contraria: **no destruir lo que hace falta para
conversar.** «270 GB», «28 días», «39,90 USD», «iPhone 15 Pro Max», «Galaxy S24
Ultra 5G», fechas, rutas de la web y referencias de pedido tienen que
sobrevivir intactos.

**URLs** (añadido el 2026-08-10). Política asimétrica a propósito, porque un
enlace no es un dato que el asistente necesite para razonar y en cambio la
query y el fragmento son por donde viajan los tokens:

- host de Ruta34 (`esimruta34.com`, `www.esimruta34.com`) → se conserva origen y
  ruta; **la query y el fragmento se tiran siempre**, sin mirar qué llevan;
- ruta con ocho o más dígitos seguidos, o con caracteres fuera del alfabeto de
  una ruta pública → se descarta también la ruta;
- cualquier otro host → se redacta el enlace entero;
- rutas sueltas con `?` o `#` → se conserva la ruta, se tira lo demás.

Una credencial dentro de una URL no sobrevive por estar dentro de una URL.

Cada regla que podía morder datos legítimos lleva un candado en vez de una
ampliación: Luhn para tarjetas, exigencia de letra + dígito para tokens,
longitudes mínimas altas para las tiradas numéricas.

`sec-sanitize.spec.ts` afirma las dos mitades, con el mismo peso.

---

## 4. Modelos y precios

**Ningún precio de esta tabla debe tratarse como permanente.** Revalidar antes
de seleccionar proveedor y antes de cada revisión de coste.

| Modelo | Entrada $/M | Cacheada $/M | Salida $/M | Fecha | Fuente | Verificación |
|---|---|---|---|---|---|---|
| Claude Haiku 4.5 | 1,00 | 0,10 (lectura) · 1,25 (escritura 5 min) | 5,00 | 2026-08-10 | Documentación oficial de Anthropic | Verificado directamente contra documentación oficial durante esta auditoría |
| GPT-5.6 Luna | 0,20 | 0,02 | 1,20 | 2026-08-10 | Aportado por el responsable del proyecto | Official pricing externally verified on 2026-08-10; revalidate before provider selection |
| GPT-5.6 Terra | 2,00 | 0,20 | 12,00 | 2026-08-10 | Aportado por el responsable del proyecto | Official pricing externally verified on 2026-08-10; revalidate before provider selection |
| GPT-5.6 Sol | 5,00 | 0,50 | 30,00 | 2026-08-10 | Aportado por el responsable del proyecto | Official pricing externally verified on 2026-08-10; revalidate before provider selection |

**Nota sobre el modelo de caché.** Anthropic cobra una prima por *escribir* en
caché (1,25× la entrada con TTL de 5 minutos) y descuenta la *lectura* a 0,1×.
Los precios de OpenAI aportados solo recogen la tarifa cacheada; el cálculo de
abajo asume que no hay prima de escritura en ese lado. Si la hubiera, la
diferencia entre ambos se estrecha ligeramente.

### 4.1 Estimación de coste por 1.000 conversaciones

Medido, no supuesto: el prefijo cacheable real (system prompt + corpus +
definiciones de las seis herramientas) son **3.463 tokens** estimados —
2.264 del prompt, 1.199 de las herramientas.

Supuestos del modelo de coste, explícitos para poder discutirlos:

- 9 llamadas al modelo por conversación (≈6 turnos de usuario más las vueltas
  por uso de herramientas);
- prefijo cacheado a partir de la segunda llamada;
- el historial crece unos 250 tokens por llamada;
- 200 tokens de salida por llamada.

| Modelo | $/conversación | $/1.000 conversaciones |
|---|---|---|
| GPT-5.6 Luna | 0,0054 | **5,42** |
| Claude Haiku 4.5 | 0,0262 | **26,18** |
| GPT-5.6 Terra | 0,0542 | 54,23 |
| GPT-5.6 Sol | 0,1356 | 135,57 |

Factor Haiku / Luna: **≈4,8×**.

Una estimación previa de este proyecto situaba a Haiku en ~31 $ y a Luna en «un
quinto del coste» a partir de fuentes secundarias. Con las cifras oficiales
aportadas y el prefijo ya medido, las dos cifras se corrigen a la baja y el
factor real es 4,8×, no 5×. La conclusión operativa no cambia: **la diferencia
de coste no basta para decidir sin medir calidad.**

### 4.2 Criterios de selección (Fase 2B)

La suite CONV se ejecuta contra Luna y Haiku con el mismo dispatcher, las
mismas herramientas y el mismo prompt — si cada uno arrastra su propio bucle,
lo que se compara son dos integraciones, no dos modelos. Cinco dimensiones:

1. **Disciplina factual** — ¿inventa precios cuando el catálogo está caído?
   ¿confirma cobertura no verificable? ¿suma los gigas?
2. **Naturalidad** — registro rioplatense, brevedad, ausencia de entusiasmo
   comercial.
3. **Uso de herramientas** — ¿llama a la que toca? ¿respeta los topes?
   ¿relata el resultado o lo adorna?
4. **Latencia** — percibida en el primer token y total del turno.
5. **Coste** — medido con `usage` real, no con la estimación de arriba.

### 4.3 Hallazgos pendientes de la tirada de Haiku — *no accionar todavía*

De la primera mitad de la Fase 2B-B (27 turnos contra `claude-haiku-4-5`, informe
completo en `PROVIDER_REPORT.md`). Están anotados, no corregidos, **y es
deliberado**: Luna tiene que ejecutarse contra exactamente el mismo prompt,
corpus, dispatcher y herramientas. Tocar cualquiera de estos puntos antes de esa
segunda tirada convertiría la comparación en dos sistemas distintos medidos por
separado, que es justo lo que 4.2 dice que no se hace.

Se revisan **después** de tener las dos mitades:

1. **Lenguaje demasiado afirmativo tras `escalate_to_human` — CONFIRMADO
   (comparativa Vercel↔Vercel, 2026-08-29).** Regla que se establece: **el
   asistente no promete acciones ni plazos del equipo humano, porque no controla
   ninguna de las dos cosas.** Puede decir qué acaba de hacer él —dejar el caso
   en manos del equipo— y nada más.

   Reproducido en las tres repeticiones de CONV-6 con Haiku: «Listo, te escriben
   por WhatsApp en los próximos minutos», «Vas a recibir un mensaje por WhatsApp
   en los próximos minutos», «El equipo te va a responder allá y resuelven el
   doble cobro». Las dos primeras prometen un plazo; la tercera promete un
   desenlace.

   Luna no incurre: «Te paso con el equipo por WhatsApp para que revisen el cobro
   duplicado», que describe la acción sin comprometer a nadie. Es decir, el
   comportamiento correcto es alcanzable con el prompt actual, así que la
   corrección va en el prompt y no en la herramienta.
2. **La frase de dual SIM.** Observada: «podés tener tanto la eSIM de Ruta34
   como tu SIM física con el mismo número — los dos números en un solo celular».
   Se contradice dentro de la misma línea y puede leerse como que las dos SIM
   comparten número, que es falso.
3. **Inconsistencia en CONV-4b (2 de 3).** Ante un modelo inventado, dos
   repeticiones pidieron marca y modelo reales en lugar de llamar a
   `check_device_compatibility`. Ninguna llegó a decir que fuera incompatible,
   así que la prohibición se respetó; lo que falla es la constancia.
4. **CONV-5 (1 de 3).** Una repetición escaló sin explicar antes la renovación
   anticipada. Las otras dos la explicaron primero, que es el orden correcto.
5. **Caché de prompt a cero y contexto real de ~6.800 tokens.** Ninguno de los
   27 turnos reportó tokens cacheados: el adaptador no envía `cache_control`.
   Además la primera llamada consume ~6.800 tokens de entrada —y ~13.700 con una
   ida y vuelta de herramienta—, frente a los 3.463 estimados en 4.1. Las cifras
   de coste de esa sección se quedan cortas **para los dos proveedores**, así que
   el orden relativo probablemente aguanta, pero las magnitudes no.

6. **CONV-2 — recomendación formalmente correcta y materialmente insegura —
   CONFIRMADO (comparativa Vercel↔Vercel, 2026-08-29).**

   Es el único hallazgo de la comparativa con impacto sobre un cliente real: un
   comprador podría llevarse un plan que se le queda corto por más de tres veces
   en lo único que le importa.

   Los hechos, en orden:

   - **El prompt de CONV-2 no dice cuántos de los 50 GB se usarán fuera de
     España.** «Viajo 20 días y necesito unos 50 GB, ¿cuál me conviene?» El dato
     que decide la respuesta no está en la pregunta, y eso es deliberado: los
     clientes tampoco lo dicen.
   - **`recommend_plan` distingue correctamente `totalGb` y `outsideSpainMaxGb`**
     —son dos filtros duros independientes— **pero solo evalúa el segundo cuando
     recibe `estimatedGbOutsideSpain`.** La capacidad existe; sin ese argumento
     no se usa.
   - **Con `{estimatedTotalGb: 50, tripDays: 20}` recomienda Europa Básico**,
     porque 90 ≥ 50 y es el más barato que cumple **las restricciones que
     recibió**. Reproducido contra el catálogo real. El resultado no incluye
     `meets_outside_spain_gb`, y esa ausencia es la señal de que el tope de
     roaming nunca se evaluó.
   - **Esa recomendación no es materialmente segura para un viaje por Europa**
     mientras no se sepa cuánto consumo ocurrirá fuera de España: el tope de
     Básico son 15 GB. Con el mismo usuario y el dato añadido, la herramienta
     devuelve Europa Premium — $50 en vez de $15.
   - **Luna pidió el dato que faltaba**, que es lo correcto.
   - **Haiku llamó a la herramienta ajustándose al schema vigente**, pero
     presentó la recomendación como suficiente —«te sobra», «más que
     suficiente»— **incluso habiendo visto el límite de 15 GB fuera de España**,
     que llegó a citar.
   - **Por tanto, el 24/27 de uso de herramientas no significa que Haiku actuara
     mejor en CONV-2.** Los dos fallan tres turnos, pero no son fallos
     equivalentes.

   **Limitación conocida del benchmark.** Esta métrica penaliza una aclaración
   correcta y premia una llamada formalmente esperada aunque falte un criterio
   material. Mide adherencia al contrato de la herramienta, no acierto
   comercial, y hay que leerla sabiéndolo. Se anota aquí en vez de cambiar la
   métrica: alterarla ahora rompería la comparabilidad de la tirada.

   **Corrección futura acordada, pendiente de implementar:**

   1. `recommend_plan` devuelve `insufficient_criteria` cuando hay una necesidad
      total de GB pero falta la estimación relevante de consumo fuera de España.
      Es el arreglo estructural: no depende de que el modelo lea bien.
   2. `tripDays` por sí solo no habilita una recomendación de precio. Hoy sí lo
      hace, y no filtra nada.
   3. Un estado o aviso explícito equivalente a `outside_spain_not_evaluated`,
      para que el modelo no pueda presentar como verificada una dimensión que
      nadie miró.
   4. Actualizar descripción y schema para que el modelo sepa cuándo tiene que
      pedir aclaración. Hoy la descripción dice lo contrario: que con una sola
      cifra basta.

   **Cuándo.** No ahora. Cambiar la herramienta altera el sistema medido e
   invalidaría la comparativa, así que se aplica **después** de elegir proveedor
   con los tres candidatos, y se revalida solo contra el elegido.

Activar la caché es la que más peso tiene en el coste y la que más tienta a tocar
ya. No se toca: o se activa en los dos lados o se anota que ninguno la usa.

### 4.4 `/api/assistant/bench` — **bloqueante de producción**

La ruta existe porque la comparativa necesita medir a los dos modelos desde el
mismo sitio, con el catálogo real delante, y el entorno de desarrollo del
proyecto no tiene salida hacia OpenAI. Es instrumental, no producto:

- **Es exclusivamente una herramienta temporal de Preview.** No forma parte de
  ninguna funcionalidad del asistente ni de la web.
- **Production no debe tener `BENCH_ENABLED=true`** en ningún momento. Sin esa
  variable la ruta responde 404, que es su estado por defecto.
- **Antes del release final hay que verificar que la ruta queda deshabilitada o
  eliminada.** Verificarlo, no suponerlo: comprobar que la variable no está en
  el entorno de Production y, preferiblemente, borrar la ruta cuando la Fase 2B
  cierre.
- **`BENCH_SECRET` no se reutiliza como secreto de ninguna otra
  funcionalidad.** Es el único guardia de una superficie que gasta dinero real
  al recibir una petición; compartirlo extendería ese riesgo a todo lo que lo
  usara, y rotarlo por un incidente ajeno obligaría a tocar esta ruta.

---

## 5. Estado de las fases

| Fase | Contenido | Estado |
|---|---|---|
| 2A | DTOs, esquemas, corpus, prompt, registro, herramientas, proveedor falso, dispatcher, límites, sanitización, tests SEC | **Implementada** |
| 2B | Adaptadores OpenAI y Anthropic, configuración, suite CONV, informe comparativo | Pendiente |
| 2C | `/api/assistant/chat`, SSE sobre POST, `HttpTransport`, eventos con lista blanca, UI a prueba de fallos | Pendiente |
| 2D | Rate limiting distribuido, tope de gasto, firewall, cortacircuitos de presupuesto, revisión de PII, DPA/RGPD, suite de seguridad, kill switch | Pendiente |

### Garantía de la Fase 2A

La Fase 2A **no abre un solo socket**. No es una promesa documental: cada
`*.spec.ts` de `tests/unit/assistant/` instala un candado que sustituye
`fetch`, `http`/`https`, `net` y la resolución de DNS por funciones que lanzan,
y `sec-no-network.spec.ts` comprueba estáticamente que ningún spec de la
carpeta se lo salta.

Además: no se instaló ningún SDK de proveedor, el único `LlmProvider` que
existe es `FakeProvider`, y `createProvider()` tiene un solo caso en su
`switch`.

---

## 6. Límites aprobados

| Límite | Valor |
|---|---|
| Caracteres por mensaje | 1.000 |
| Mensajes por request | 24 |
| Tamaño de body | 32 KB |
| Contexto | ~15.000 tokens, comprobados **antes de cada llamada** al modelo |
| Tokens de salida | 600 |
| Tool calls por turno | 3 |
| Iteraciones del bucle | 4 |
| Timeout de turno | 25 s |
| Mensajes por sesión | 30 |
| Vida de sesión | 45 min |

Punto de partida, no cifras definitivas. Los límites diarios por IP quedan
fuera hasta medir comportamiento real (ver D3).

El de contexto se reaplica en cada iteración del bucle, no solo al empezar el
turno. Se recorta el historial previo por el principio; lo producido dentro del
turno —los pares `tool_use` / `tool_result`— **no se toca nunca**: truncar el
resultado de una herramienta cambiaría el dato que esa herramienta existía para
fundamentar. Si ni siquiera eso cabe, el turno falla con `limit_exceeded`.

---

## 7. Observabilidad

`logTurn` se invoca en los dos caminos de `dispatchTurn`, con éxito y con error.
Registra exactamente: `sessionId`, `locale`, `providerId`, `model`, `turn`,
`iterations`, `toolsCalled`, `redactions` (categoría → conteo), `durationMs`,
`outcome`, `errorCode` y `usage`.

No registra, y hay un test que compara el conjunto **exacto** de claves para que
siga siendo así: mensaje del usuario, respuesta del modelo, argumentos o
resultados de herramientas, PII, `AssistantError.detail`, mensajes internos del
catálogo, trazas de pila, variables de entorno ni claves de API.

La diferencia entre comprobar «no aparece esta cadena» y «no hay ninguna clave
fuera de la lista» es la que hay entre protegerse de lo que se te ocurrió hoy y
protegerse de lo que añada alguien dentro de un año.

---

## 8. Fuente única de cobertura

`src/data/coverage.json` + `src/lib/coverage.ts`. Tres consumidores, una lista:

| Superficie | Antes | Ahora |
|---|---|---|
| Buscador de la portada (`Benefits.tsx`) | `COUNTRY_DATA` local, 39 entradas, campos `allPlans`/`excludes` que **nadie leía**, y un UUID escrito a mano decidiendo de verdad | `findCoverageCountry` + `planCoversCountry` |
| Modal del hero (`CountriesModal.tsx`) | Segunda lista, 39 strings planos, sin códigos ni distinción por gama | `COVERAGE_COUNTRIES` |
| `check_coverage` del asistente | Solo España, por falta de lista contractual | Misma fuente |

**Identidad de producto.** Los planes se referencian por clave comercial
(`europa-basico`…), nunca por UUID, talla ni identificador de proveedor. La
clave se deriva del nombre público con `toPlanKey()` (`src/lib/plan-key.ts`), y
eso resuelve el problema que bloqueaba el refactor: el catálogo vivo ya la
generaba así, y el fallback tenía identificadores heredados escritos a mano. Se
normalizó el fallback. **No hizo falta columna nueva en la base de datos.**

**Qué NO guarda esta fuente.** Gigas, precios y disponibilidad. La cobertura
dice dónde funciona cada gama; el resto es del catálogo vivo. Una pregunta como
«¿cuántos GB tengo en Francia con el Plus?» se compone entre las dos fuentes.

**Validación al importar.** Códigos ISO bien formados, sin duplicados, y
`excludedPlans` solo con claves comerciales vigentes. Un error tipográfico es un
fallo al arrancar, no una cobertura mal calculada que nadie nota.

---

## 9. Verificación de integración y deuda conocida

La refactorización de cobertura se verificó de extremo a extremo antes de
cerrar la fase: portada, buscador, modal, flujo de compra y suite existente.
Lo que salió de ahí se reparte en dos montones: una regresión que introdujo
este trabajo —corregida— y tres defectos anteriores, que se documentan aquí
para no volver a descubrirlos desde cero.

### 9.1 Corregido: `?plan=` acepta las dos identidades

El enlace del buscador pasó a llevar la clave comercial (`europa-plus`), pero
`PurchaseFlow` resolvía el plan solo por identificador de fila. Con el catálogo
vivo daba igual —el enlace lleva el id de la fila—, pero sirviendo el catálogo
local el comprador que ya había elegido tenía que volver a elegir.

Ahora se aceptan las dos: `p.id === initialPlanId || p.slug === initialPlanId`.

Es seguro porque los dos espacios de identificadores son **disjuntos**: los ids
son UUID (catálogo vivo) o identificadores heredados (catálogo local), y las
claves comerciales son `europa-*`. Ninguna clave puede resolver al plan
equivocado, y hay un test que lo comprueba sobre las dos formas del catálogo en
vez de fiarse de la inspección. Si algún día un id empezara a parecerse a una
clave, ese test falla antes de que nadie pague de más.

### 9.2 Deuda: el UUID en la URL pública

`?plan=<uuid>` funciona y el UUID **no es un secreto**: identifica una tarifa
publicada, no a una persona ni una credencial. Pero es identidad interna
asomando en una URL que el comprador ve, comparte y pega.

La sustitución natural es la clave comercial estable, que ya existe y ya se
acepta. Se evalúa en una fase posterior. **No se mezcla con este trabajo**:
tocaría el enlace de la sección de precios, el `cancel_url` de Stripe y el
`compatible_with` de la página de compra, y eso es routing y checkout.

### 9.3 Deuda preexistente (no introducida por este trabajo)

Los tres se comprobaron también sobre `HEAD` sin estos cambios. Ninguno bloquea
la Fase 2A.

**El catálogo local no llega a servirse en el navegador.** En
`supabase-plans.ts`, el cliente se construye *fuera* del `try`. Si faltan las
variables públicas, eso lanza antes de entrar, la promesa nunca resuelve y la
rejilla de planes de la portada se queda vacía: el fallback existe y es
inalcanzable por ese camino. Arreglo: mover una línea dentro del `try`.
Mientras tanto, los tests de integración doblan la respuesta del catálogo, y se
saltan solos si no pueden.

**El modal de países no tiene quien lo abra.** `Hero.tsx` lo monta y declara su
estado, pero `setShowCountries(true)` no se llama en ningún sitio del
repositorio. El modal es correcto —consume la fuente única y cuenta los
destinos en vez de escribirlos—, pero hoy no es alcanzable, así que se verifica
a nivel de fuente y no de navegador.

**`?compatible_with=` puede vaciar la página de compra.** Filtra por los UUID
escritos a mano en `plan-compatibility.ts`. Sirviendo el catálogo local, esos
UUID no existen y el filtro no deja ningún plan. Es el mismo fichero que la
sección 8 marca como no consumible: la solución de fondo es que ese filtro deje
de existir o pase a la clave comercial, no parchear la lista.

### 9.4 Alcance de la verificación

Cubierto en navegador: la portada carga y muestra las cinco gamas en el orden
del catálogo; buscar Francia no oculta ninguna; las cuatro grafías de Estados
Unidos dejan cuatro y solo esconden Europa Básico, con catálogo vivo y con
catálogo local; una consulta parcial no oculta nada; vaciar la búsqueda
restaura las cinco; `?plan=` preselecciona con las dos identidades; una clave
desconocida degrada al selector en vez de romperse.

Fuera de alcance, y por qué: la base de datos real (no hay credenciales), el
pago de extremo a extremo (no hay claves de Stripe), y el modal en navegador
(no es alcanzable, ver 9.3).
