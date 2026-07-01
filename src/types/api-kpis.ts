// =============================================================
// Tipos para el endpoint GET /bff/lista-espera/solicitudes/kpis
// =============================================================

export interface ConteoEspecialidad {
  especialidad: string
  total: number
}

export interface ConteoPrioridad {
  p1: number
  p2: number
  p3: number
  p4: number
}

export interface FiltroAplicado {
  especialidadId: number | null
  fechaDesde: string // ISO date "YYYY-MM-DD"
  fechaHasta: string
}

export interface KpisResponse {
  // Snapshot (estado actual)
  totalActivas: number
  enEspera: number
  citadas: number
  backlogMas30Dias: number
  // En rango
  atendidasEnRango: number
  nuevasEnRango: number
  tiempoPromedioEsperaDias: number | null
  tasaAusentismo: number | null
  // Series
  porEspecialidad: ConteoEspecialidad[]
  porPrioridad: ConteoPrioridad
  // Eco del filtro
  filtroAplicado: FiltroAplicado
}

// ─── Parámetros del filtro (client-side) ──────────────────────

export interface KpiFiltros {
  especialidadId?: number
  fechaDesde?: string // "YYYY-MM-DD"
  fechaHasta?: string
}

export type PresetRango = '7d' | '30d' | '90d' | 'ano' | 'personalizado'
