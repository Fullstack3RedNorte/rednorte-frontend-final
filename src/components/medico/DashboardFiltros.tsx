import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { listarEspecialidades } from '@/api/especialidades'
import type { EspecialidadResponse } from '@/types/api'
import type { KpiFiltros, PresetRango } from '@/types/api-kpis'

const HOY = () => new Date().toISOString().slice(0, 10)
const HACE = (dias: number) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}
const INICIO_ANO = () => `${new Date().getFullYear()}-01-01`

interface Props {
  onChange: (filtros: KpiFiltros) => void
}

/**
 * Barra de filtros del dashboard médico.
 *
 * Estado local:
 *   - especialidadId: id o undefined (todas)
 *   - preset: 7d | 30d | 90d | ano | personalizado
 *   - fechaDesde / fechaHasta: strings ISO cuando preset = personalizado
 *
 * Cada cambio dispara onChange con el filtro resuelto para que el
 * Dashboard vuelva a pedir los KPIs.
 */
export function DashboardFiltros({ onChange }: Props) {
  const [especialidades, setEspecialidades] = useState<EspecialidadResponse[]>([])
  const [especialidadId, setEspecialidadId] = useState<string>('todas')
  const [preset, setPreset] = useState<PresetRango>('30d')
  const [desde, setDesde] = useState<string>(HACE(30))
  const [hasta, setHasta] = useState<string>(HOY())

  // Cargar especialidades una sola vez
  useEffect(() => {
    listarEspecialidades().then((res) => {
      if (res.ok) setEspecialidades(res.data)
    })
  }, [])

  // Recalcular fechas cuando cambia el preset
  useEffect(() => {
    let d = desde
    let h = hasta
    switch (preset) {
      case '7d':   d = HACE(7);   h = HOY(); break
      case '30d':  d = HACE(30);  h = HOY(); break
      case '90d':  d = HACE(90);  h = HOY(); break
      case 'ano':  d = INICIO_ANO(); h = HOY(); break
      case 'personalizado': /* respetar lo que haya */ break
    }
    setDesde(d)
    setHasta(h)
  }, [preset])

  // Emitir el filtro cada vez que cambia algo relevante
  useEffect(() => {
    const filtros: KpiFiltros = {
      fechaDesde: desde,
      fechaHasta: hasta,
    }
    if (especialidadId !== 'todas') {
      filtros.especialidadId = Number(especialidadId)
    }
    onChange(filtros)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [especialidadId, desde, hasta])

  function resetear() {
    setEspecialidadId('todas')
    setPreset('30d')
    setDesde(HACE(30))
    setHasta(HOY())
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Especialidad */}
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs text-slate-600 mb-1 block">Especialidad</Label>
          <Select value={especialidadId} onValueChange={setEspecialidadId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las especialidades</SelectItem>
              {especialidades.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preset de rango */}
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs text-slate-600 mb-1 block">Rango</Label>
          <Select
            value={preset}
            onValueChange={(v) => setPreset(v as PresetRango)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="ano">Este año</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rango personalizado */}
        {preset === 'personalizado' && (
          <>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Desde</Label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="h-9 rounded-md border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Hasta</Label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                min={desde}
                className="h-9 rounded-md border border-slate-200 px-3 text-sm"
              />
            </div>
          </>
        )}

        {/* Rango efectivo cuando NO es personalizado */}
        {preset !== 'personalizado' && (
          <div className="text-xs text-slate-500 self-center">
            <span className="font-mono">{desde}</span>
            {' → '}
            <span className="font-mono">{hasta}</span>
          </div>
        )}

        {/* Reset */}
        <Button variant="outline" size="sm" onClick={resetear}>
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Limpiar
        </Button>
      </div>
    </Card>
  )
}
