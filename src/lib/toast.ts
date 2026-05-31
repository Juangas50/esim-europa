// Disparar toasts desde cualquier componente client sin contexto
export function toast(
  message: string,
  type: 'success' | 'error' | 'info' = 'success',
) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
}
