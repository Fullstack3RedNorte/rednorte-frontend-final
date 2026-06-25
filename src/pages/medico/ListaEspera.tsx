import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, RotateCw, Search, X } from 'lucide-react'
import { listarEspecialidades } from '@/api/especialidades'
import { listarSolicitudes } from '@/api/solicitudes'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BadgeEstado, BadgePrioridad } from '@/components/medico/BadgeEstado'
import { DetalleSheet } from '@/components/medico/DetalleSheet'
import type {
  EspecialidadResponse,
  EstadoSolicitud,
  PageResponse,
  SolicitudResponse,
} from '@/types/api'

const PAGE_SIZE = 10

const ESTADOS_FILTRO: { value: EstadoSolicitud; label: string }[] = [
  { value: 'EN_ESPERA', label: 'En espera' },
  { value: 'CITADO', label: 'Citado' },
  { value: 'ATENDIDO', label: 'Atendido' },
  { value: 'AUSENTE', label: 'Ausente' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'ANULADO', label: 'Anulado' },
  { value: 'DERIVADO', label: 'Derivado' },
  { value: 'VENCIDO', label: 'Vencido' },
]

interface Filtros {
  rutPaciente: string
  especialidadId: number | null
  estado: EstadoSolicitud | null
}

const FILTROS_INICIALES: Filtros = {
  rutPaciente: '',
  especialidadId: null,
  estado: null,
}

export function ListaEspera() {
  // Filtros
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(FILTROS_INICIALES)
  const [especialidades, setEspecialidades] = useState<EspecialidadResponse[]>([])

  // Resultado de la lista
  const [page, setPage] = useState<PageResponse<SolicitudResponse> | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)

  // Sheet del detalle
  const [idDetalle, setIdDetalle] = useState<number | null>(null)

  // Cargar especialidades al montar
  useEffect(() => {
    listarEspecialidades().then((res) => {
      if (res.ok) setEspecialidades(res.data)
    })
  }, [])

  // Buscar cuando cambien los filtros aplicados o la página
  useEffect(() => {
    buscar(paginaActual)
  }, [filtrosAplicados, paginaActual])

  async function buscar(pagina: number) {
    setCargando(true)
    setError(null)

    const res = await listarSolicitudes({
      especialidadId: filtrosAplicados.especialidadId ?? undefined,
      estado: filtrosAplicados.estado ?? undefined,
      rutPaciente: filtrosAplicados.rutPaciente.trim() || undefined,
      page: pagina,
      size: PAGE_SIZE,
    })

    if (res.ok) {
      setPage(res.data)
    } else {
      setError(res.error)
      setPage(null)
    }
    setCargando(false)
  }

  function aplicarFiltros() {
    setPaginaActual(0)
    setFiltrosAplicados(filtros)
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    setFiltrosAplicados(FILTROS_INICIALES)
    setPaginaActual(0)
  }

  function quitarFiltro(campo: keyof Filtros) {
    const nuevos = { ...filtrosAplicados, [campo]: campo === 'rutPaciente' ? '' : null }
    setFiltros(nuevos)
    setFiltrosAplicados(nuevos)
    setPaginaActual(0)
  }

  // Texto descriptivo de los filtros activos
  const chipsActivos = useMemo(() => {
    const chips: { campo: keyof Filtros; label: string }[] = []
    if (filtrosAplicados.rutPaciente) {
      chips.push({
        campo: 'rutPaciente',
        label: `RUT: ${filtrosAplicados.rutPaciente}`,
      })
    }
    if (filtrosAplicados.especialidadId) {
      const esp = especialidades.find(
        (e) => e.id === filtrosAplicados.especialidadId
      )
      chips.push({
        campo: 'especialidadId',
        label: `Especialidad: ${esp?.nombre ?? '...'}`,
      })
    }
    if (filtrosAplicados.estado) {
      const estado = ESTADOS_FILTRO.find(
        (e) => e.value === filtrosAplicados.estado
      )
      chips.push({
        campo: 'estado',
        label: `Estado: ${estado?.label ?? filtrosAplicados.estado}`,
      })
    }
    return chips
  }, [filtrosAplicados, especialidades])

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Lista de espera
        </h1>
        <p className="text-slate-600">
          {page
            ? `${page.totalElements} solicitud${page.totalElements !== 1 ? 'es' : ''} encontrada${
                page.totalElements !== 1 ? 's' : ''
              }`
            : 'Cargando solicitudes…'}
        </p>
      </header>

      {/* FILTROS */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por RUT del paciente"
                value={filtros.rutPaciente}
                onChange={(e) =>
                  setFiltros({ ...filtros, rutPaciente: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <Select
              value={filtros.especialidadId?.toString() ?? 'all'}
              onValueChange={(v) =>
                setFiltros({
                  ...filtros,
                  especialidadId: v === 'all' ? null : Number(v),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp.id} value={esp.id.toString()}>
                    {esp.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select
              value={filtros.estado ?? 'all'}
              onValueChange={(v) =>
                setFiltros({
                  ...filtros,
                  estado: v === 'all' ? null : (v as EstadoSolicitud),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ESTADOS_FILTRO.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button
              onClick={aplicarFiltros}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              Buscar
            </Button>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {chipsActivos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Filtros activos:</span>
            {chipsActivos.map((chip) => (
              <Badge
                key={chip.campo}
                variant="secondary"
                className="cursor-pointer hover:bg-slate-200"
                onClick={() => quitarFiltro(chip.campo)}
              >
                {chip.label}
                <X className="w-3 h-3 ml-1.5" />
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                No se pudo cargar la lista
              </h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => buscar(paginaActual)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RotateCw className="w-3 h-3 mr-1.5" />
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TABLA */}
      <Card className="overflow-hidden mb-4">
        {cargando ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : page && page.content.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No se encontraron solicitudes con los filtros aplicados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-32">Registrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page?.content.map((sol) => (
                <TableRow
                  key={sol.id}
                  onClick={() => setIdDetalle(sol.id)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <TableCell className="font-mono text-slate-500">
                    #{sol.id}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {sol.rutPaciente}
                  </TableCell>
                  <TableCell>{sol.especialidad}</TableCell>
                  <TableCell>
                    <BadgePrioridad prioridad={sol.prioridad} />
                  </TableCell>
                  <TableCell>
                    <BadgeEstado estado={sol.estado} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {tiempoTranscurrido(sol.fechaRegistro)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* PAGINACIÓN */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}
            disabled={paginaActual === 0}
          >
            « Anterior
          </Button>
          <span className="text-slate-600">
            Página <strong>{paginaActual + 1}</strong> de {page.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => p + 1)}
            disabled={paginaActual + 1 >= page.totalPages}
          >
            Siguiente »
          </Button>
        </div>
      )}

      {/* SHEET DE DETALLE */}
      <DetalleSheet
        idSolicitud={idDetalle}
        onClose={() => setIdDetalle(null)}
        onEstadoCambiado={() => buscar(paginaActual)}
      />
    </div>
  )
}

function tiempoTranscurrido(iso: string): string {
  const fecha = new Date(iso)
  const ahora = new Date()
  const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias}d`
}
