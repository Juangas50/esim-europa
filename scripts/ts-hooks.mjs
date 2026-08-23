/**
 * ts-hooks.mjs — Resolución de módulos para ejecutar TypeScript del proyecto
 * directamente con Node.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ HACE FALTA
 *
 * `node --experimental-transform-types` sabe convertir un `.ts` en JavaScript,
 * pero no cambia cómo Node resuelve los especificadores, y el código del
 * proyecto está escrito para el resolutor de TypeScript, que es más permisivo
 * en tres cosas:
 *
 *   · **Extensiones implícitas.** `import { FakeProvider } from "./fake"` es
 *     válido para TS y para el bundler de Next, pero el ESM de Node exige la
 *     ruta completa y responde `ERR_MODULE_NOT_FOUND`.
 *   · **El alias `@/`.** Lo define `tsconfig.json` (`@/*` → `./src/*`) y lo
 *     entienden TS y Next; Node lo lee como un paquete de `node_modules` que no
 *     existe.
 *   · **Los `.json` sin atributo de importación**, y las subrutas de paquete
 *     que Next publica sin declarar (`next/headers`).
 *
 * Nota sobre el flag: hace falta `--experimental-transform-types` y no basta
 * `--experimental-strip-types`, porque el proyecto usa *parameter properties*
 * —`constructor(private readonly x: T)`—, que no se pueden quitar borrando
 * tipos: declaran un campo y hay que generarlo.
 *
 * La alternativa habría sido añadir extensiones a los imports de `src/` o meter
 * un runner de TypeScript como dependencia. Lo primero cambia código de
 * producción para arreglar una herramienta; lo segundo añade una dependencia a
 * un proyecto que no la necesita para nada más. Este hook no hace ninguna de
 * las dos: vive en `scripts/`, solo se carga cuando se lanza el benchmark, y el
 * código de `src/` sigue exactamente igual.
 *
 * No transforma nada: únicamente decide a qué fichero apunta cada import y deja
 * que Node haga el resto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = process.cwd();

/** En el orden en que TypeScript las probaría. */
const EXTENSIONES = [".ts", ".tsx", ".mjs", ".js", ".json"];

function esDirectorio(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Devuelve el fichero al que apunta una ruta sin extensión, o `null`.
 *
 * Se prueba primero la ruta tal cual —por si ya traía extensión—, luego con
 * cada extensión, y por último como directorio con `index`.
 */
function resolverFichero(base) {
  if (path.extname(base) && existsSync(base) && !esDirectorio(base)) return base;

  for (const ext of EXTENSIONES) {
    const candidato = base + ext;
    if (existsSync(candidato) && !esDirectorio(candidato)) return candidato;
  }

  if (esDirectorio(base)) {
    for (const ext of EXTENSIONES) {
      const candidato = path.join(base, `index${ext}`);
      if (existsSync(candidato)) return candidato;
    }
  }

  return null;
}

/**
 * Empaqueta un fichero ya localizado como respuesta del hook.
 *
 * Los `.json` necesitan que se declare el atributo de importación: TS y el
 * bundler aceptan `import datos from "./x.json"` a secas, y el ESM de Node
 * exige `with { type: "json" }`. Añadirlo aquí evita tener que tocar cada
 * import del proyecto por una diferencia que solo existe fuera de Next.
 */
function resultado(destino) {
  const url = pathToFileURL(destino).href;
  return path.extname(destino) === ".json"
    ? { url, importAttributes: { type: "json" }, shortCircuit: true }
    : { url, shortCircuit: true };
}

export async function resolve(especificador, contexto, siguiente) {
  // `@/loquesea` → `<raíz>/src/loquesea`. Solo ese prefijo exacto: los
  // paquetes con ámbito (`@supabase/supabase-js`) tienen que seguir su camino
  // normal hacia `node_modules`.
  if (especificador.startsWith("@/")) {
    const destino = resolverFichero(path.join(RAIZ, "src", especificador.slice(2)));
    if (destino) return resultado(destino);
  }

  if (especificador.startsWith("./") || especificador.startsWith("../")) {
    const padre = contexto.parentURL;
    if (padre?.startsWith("file:")) {
      const base = path.resolve(path.dirname(fileURLToPath(padre)), especificador);
      const destino = resolverFichero(base);
      if (destino) return resultado(destino);
    }
  }

  // Todo lo demás —paquetes, `node:*`, rutas que ya resuelven— va por el camino
  // normal.
  try {
    return await siguiente(especificador, contexto);
  } catch (error) {
    // Subrutas de paquete sin extensión (`next/headers`). Next las publica como
    // ficheros sueltos sin declararlas en `exports`, así que su bundler las
    // encuentra y el ESM de Node no. El propio error de Node sugiere la ruta
    // con extensión; se prueba esa antes de rendirse.
    const esSubrutaDePaquete =
      error?.code === "ERR_MODULE_NOT_FOUND" &&
      !especificador.startsWith(".") &&
      !especificador.startsWith("/") &&
      !especificador.startsWith("node:") &&
      especificador.includes("/") &&
      !path.extname(especificador);

    if (esSubrutaDePaquete) {
      try {
        return await siguiente(`${especificador}.js`, contexto);
      } catch {
        // Se ignora y se propaga el error original, que describe mejor lo que
        // se pidió de verdad.
      }
    }

    throw error;
  }
}
