import { redirect } from 'next/navigation'
import RecuperarContrasenaBienvenidaClient from './RecuperarContrasenaClient'

export const dynamic = 'force-dynamic'

export default async function RecuperarPage() {
  return <RecuperarContrasenaBienvenidaClient />
}
