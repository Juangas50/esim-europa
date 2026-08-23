/**
 * ts-register.mjs — Registra los hooks de resolución antes del módulo principal.
 *
 * Se carga con `node --import ./scripts/ts-register.mjs …`, que Node ejecuta
 * antes de evaluar el script de entrada. Los hooks corren en su propio hilo,
 * así que tienen que registrarse desde aquí y no desde el script mismo: cuando
 * el benchmark empieza a ejecutarse ya es tarde para influir en cómo se
 * resolvieron sus propios imports.
 */

import { register } from "node:module";

register("./ts-hooks.mjs", import.meta.url);
