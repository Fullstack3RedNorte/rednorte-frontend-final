import { apiClient, safeRequest, type ApiResult } from './client'
import type { KpiFiltros, KpisResponse } from '../types/api-kpis'

/**
 * GET /bff/lista-espera/solicitudes/kpis
 *
 * Retorna KPIs del dashboard, opcionalmente filtrados por especialidad
 * y/o rango de fechas. Todos los parámetros son opcionales.
 */
export async function obtenerKpis(
  filtros: KpiFiltros = {}
): Promise<ApiResult<KpisResponse>> {
  const params: Record<string, string | number> = {}
  if (filtros.especialidadId != null) params.especialidadId = filtros.especialidadId
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta

  return safeRequest(() =>
    apiClient.get<KpisResponse>('/bff/lista-espera/solicitudes/kpis', { params })
  )
}
