/**
 * Helper para manejar el RUT del paciente entre páginas.
 *
 * Usa sessionStorage en lugar de Context porque:
 *  - Persiste si el paciente refresca la página por accidente
 *  - Se borra al cerrar la pestaña (no es información sensible permanente)
 *  - No requiere envolver toda la app en un Provider
 *
 * NOTA: Esto NO es autenticación real. Es solo una forma simple de mantener
 * el RUT consultado entre vistas. El backend no valida ownership por ahora
 * (deuda técnica documentada).
 */

const KEY = 'rednorte:paciente:rut'

export function guardarRutPaciente(rut: string): void {
  sessionStorage.setItem(KEY, rut.trim())
}

export function obtenerRutPaciente(): string | null {
  return sessionStorage.getItem(KEY)
}

export function limpiarRutPaciente(): void {
  sessionStorage.removeItem(KEY)
}
