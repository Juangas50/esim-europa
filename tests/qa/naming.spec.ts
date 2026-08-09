import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Guardarraíles de la regla de negocio "identidad comercial ≠ provisión interna".
 *
 * La provisión mayorista se contrata con Vodafone España, pero Ruta34 no
 * comercializa bajo ese naming. Los únicos nombres públicos del producto son
 * Europa Básico / Plus / Total / Max / Premium.
 *
 * Estos tests fallan si metadata interna de provisión vuelve a filtrarse a una
 * superficie pública — incluido el payload RSC, que va incrustado en el HTML y
 * es legible desde "ver código fuente" aunque nunca se renderice en pantalla.
 */

// Naming del mayorista y de operadoras concretas: nada de esto es identidad de
// producto Ruta34, así que no debe aparecer en nada que sirva la web.
const FORBIDDEN_IN_PUBLIC = [
  /vodafone/i,
  /vodafone_code/i,
  /provisioning_?code/i,
  /movistar/i,
  /\borange\b/i,
]

// Páginas públicas + documentos machine-readable servidos desde /public.
const PUBLIC_PATHS = [
  '/es',
  '/pt',
  '/es/compra',
  '/es/destinos',
  '/es/destinos/espana',
  '/es/destinos/italia',
  '/es/help',
  '/es/help/faq',
  '/es/compatibility',
  '/es/terminos',
  '/pricing.md',
  '/llms.txt',
  '/agents.md',
]

test.describe('NAMING — la metadata de provisión no llega a superficies públicas', () => {
  for (const path of PUBLIC_PATHS) {
    test(`NM-001 ${path}: sin naming de proveedor ni código de provisión`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status(), `${path} debería responder correctamente`).toBeLessThan(400)

      // El HTML incluye el payload RSC serializado: si un componente cliente
      // recibe un objeto con metadata interna, aparece aquí aunque no se pinte.
      const body = await res.text()

      for (const pattern of FORBIDDEN_IN_PUBLIC) {
        const match = body.match(pattern)
        expect(
          match,
          `${path} expone metadata interna de provisión: "${match?.[0]}". ` +
            `Revisá que el DTO público Plan no incluya campos de provisión y que ninguna ` +
            `consulta desde el cliente use select("*").`
        ).toBeNull()
      }
    })
  }

  test('NM-002: los nombres comerciales Ruta34 sí están presentes en la home', async ({ request }) => {
    // Contraprueba: confirma que el test anterior no pasa simplemente porque la
    // página no cargó el catálogo.
    const body = await (await request.get('/es')).text()
    expect(body).toMatch(/Europa (Básico|Plus|Total|Max|Premium)/)
  })
})

test.describe('NAMING — barrera estática entre cliente y servidor', () => {
  test('NM-003: ningún componente cliente importa plans-server', () => {
    const SRC = join(process.cwd(), 'src')

    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) return walk(full)
        return /\.(ts|tsx)$/.test(entry) ? [full] : []
      })

    const offenders = walk(SRC).filter((file) => {
      const src = readFileSync(file, 'utf-8')
      const isClient = /^\s*['"]use client['"]/m.test(src)
      const importsPlansServer = /from\s+['"]@\/lib\/plans-server['"]/.test(src)
      return isClient && importsPlansServer
    })

    expect(
      offenders,
      `Estos componentes cliente importan plans-server, que contiene la referencia ` +
        `de provisión: ${offenders.join(', ')}. Los planes deben llegar como props desde el servidor.`
    ).toEqual([])
  })

  test('NM-004: el DTO público Plan no declara campos de provisión', () => {
    const types = readFileSync(join(process.cwd(), 'src/types/index.ts'), 'utf-8')
    expect(types).not.toMatch(/vodafone_code/i)
    expect(types).not.toMatch(/PlanSize/)
  })
})
