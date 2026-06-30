import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, RotateCw, Search, X,
  Users, Clock, Calendar, CheckCircle2,
  UserX, Ban, Flame, Activity, TrendingUp,
} from 'lucide-react'
import { listarEspecialidades } from '@/api/especialidades'
import { listarSolicitudes } from '@/api/solicitudes'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BadgeEstado, BadgePrioridad } from '@/components/medico/BadgeEstado'
import { DetalleSheet } from '@/components/medico/DetalleSheet'
import type {
  EspecialidadResponse, EstadoSolicitud, PageResponse, SolicitudResponse,
} from '@/types/api'

const PAGE_SIZE = 10

const ESTADOS_FILTRO: { value: EstadoSolicitud; label: string }[] = [
  { value: 'EN_ESPERA', label: 'En espera' },
  { value: 'CITADO',    label: 'Citado' },
  { value: 'ATENDIDO',  label: 'Atendido' },
  { value: 'AUSENTE',   label: 'Ausente' },
  { value: 'CERRADO',   label: 'Cerrado' },
  { value: 'ANULADO',   label: 'Anulado' },
  { value: 'DERIVADO',  label: 'Derivado' },
  { value: 'VENCIDO',   label: 'Vencido' },
]

interface Filtros {
  rutPaciente: string
  especialidadId: number | null
  estado: EstadoSolicitud | null
}

const FILTROS_INICIALES: Filtros = { rutPaciente: '', especialidadId: null, estado: null }

// ── KPI Card ──────────────────────────────────────────────────

interface ResumenCardProps {
  label: string
  value: number | null
  icon: React.ElementType
  colorClass: string
  bgClass: string
  hint?: string
}

function ResumenCard({ label, value, icon: Icon, colorClass, bgClass, hint }: ResumenCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${bgClass}`}>
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </span>
      </div>
      {value === null
        ? <Skeleton className="h-7 w-16" />
        : <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      }
      {hint && <span className="text-[11px] text-slate-400 mt-0.5">{hint}</span>}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────

export function ListaEspera() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(FILTROS_INICIALES)
  const [especialidades, setEspecialidades] = useState<EspecialidadResponse[]>([])
  const [page, setPage] = useState<PageResponse<SolicitudResponse> | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)

  // Carga global para KPIs (independiente de la paginación)
  const [todos, setTodos] = useState<SolicitudResponse[] | null>(null)
  const [cargandoKpis, setCargandoKpis] = useState(true)

  const [idDetalle, setIdDetalle] = useState<number | null>(null)

  useEffect(() => {
    listarEspecialidades().then((res) => { if (res.ok) setEspecialidades(res.data) })
  }, [])

  // Carga global para KPIs una sola vez al montar
  useEffect(() => {
    setCargandoKpis(true)
    listarSolicitudes({ page: 0, size: 200 }).then((res) => {
      if (res.ok) setTodos(res.data.content)
      setCargandoKpis(false)
    })
  }, [])

  useEffect(() => { buscar(paginaActual) }, [filtrosAplicados, paginaActual])

  async function buscar(pagina: number) {
    setCargando(true); setError(null)
    const res = await listarSolicitudes({
      especialidadId: filtrosAplicados.especialidadId ?? undefined,
      estado:         filtrosAplicados.estado ?? undefined,
      rutPaciente:    filtrosAplicados.rutPaciente.trim() || undefined,
      page: pagina, size: PAGE_SIZE,
    })
    if (res.ok) setPage(res.data)
    else { setError(res.error); setPage(null) }
    setCargando(false)
  }

  function aplicarFiltros() { setPaginaActual(0); setFiltrosAplicados(filtros) }
  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES); setFiltrosAplicados(FILTROS_INICIALES); setPaginaActual(0)
  }
  function quitarFiltro(campo: keyof Filtros) {
    const nuevos = { ...filtrosAplicados, [campo]: campo === 'rutPaciente' ? '' : null }
    setFiltros(nuevos); setFiltrosAplicados(nuevos); setPaginaActual(0)
  }

  // KPIs calculados sobre todos los registros sin filtro
  const kpis = useMemo(() => {
    if (!todos) return null
    const total     = todos.length
    const enEspera  = todos.filter((s) => s.estado === 'EN_ESPERA').length
    const citadas   = todos.filter((s) => s.estado === 'CITADO').length
    const atendidas = todos.filter((s) => s.estado === 'ATENDIDO').length
    const ausentes  = todos.filter((s) => s.estado === 'AUSENTE').length
    const anuladas  = todos.filter((s) => s.estado === 'ANULADO').length
    const p1 = todos.filter((s) => s.prioridad === 1).length
    const p2 = todos.filter((s) => s.prioridad === 2).length
    const p3 = todos.filter((s) => s.prioridad === 3).length
    const p4 = todos.filter((s) => s.prioridad === 4).length
    const pctAtendidas = total > 0 ? Math.round((atendidas / total) * 100) : 0
    const pctEspera    = total > 0 ? Math.round((enEspera  / total) * 100) : 0

    // Solicitud más antigua EN_ESPERA
    const enEsperaLista = todos.filter((s) => s.estado === 'EN_ESPERA')
    const masAntigua = enEsperaLista.length
      ? enEsperaLista.reduce((a, b) =>
          new Date(a.fechaRegistro) < new Date(b.fechaRegistro) ? a : b)
      : null
    const diasMasAntigua = masAntigua
      ? Math.floor((Date.now() - new Date(masAntigua.fechaRegistro).getTime()) / 86400000)
      : null

    return {
      total, enEspera, citadas, atendidas, ausentes, anuladas,
      p1, p2, p3, p4, pctAtendidas, pctEspera, diasMasAntigua,
    }
  }, [todos])

  const chipsActivos = useMemo(() => {
    const chips: { campo: keyof Filtros; label: string }[] = []
    if (filtrosAplicados.rutPaciente)
      chips.push({ campo: 'rutPaciente', label: `RUT: ${filtrosAplicados.rutPaciente}` })
    if (filtrosAplicados.especialidadId) {
      const esp = especialidades.find((e) => e.id === filtrosAplicados.especialidadId)
      chips.push({ campo: 'especialidadId', label: `Especialidad: ${esp?.nombre ?? '...'}` })
    }
    if (filtrosAplicados.estado) {
      const est = ESTADOS_FILTRO.find((e) => e.value === filtrosAplicados.estado)
      chips.push({ campo: 'estado', label: `Estado: ${est?.label ?? filtrosAplicados.estado}` })
    }
    return chips
  }, [filtrosAplicados, especialidades])

  const loadingKpis = cargandoKpis || kpis === null

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Lista de espera</h1>
        <p className="text-slate-500 text-sm">
          {page
            ? `${page.totalElements} solicitud${page.totalElements !== 1 ? 'es' : ''} encontrada${page.totalElements !== 1 ? 's' : ''}`
            : 'Cargando solicitudes…'}
        </p>
      </header>

      {/* ── KPIs por estado ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resumen general
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <ResumenCard
            label="Total" value={loadingKpis ? null : kpis!.total}
            icon={Users} colorClass="text-slate-700" bgClass="bg-slate-100"
            hint={loadingKpis ? undefined : `${kpis!.pctEspera}% en espera`}
          />
          <ResumenCard
            label="En espera" value={loadingKpis ? null : kpis!.enEspera}
            icon={Clock} colorClass="text-blue-600" bgClass="bg-blue-50"
            hint={loadingKpis || kpis!.diasMasAntigua === null
              ? undefined
              : `Más antigua: ${kpis!.diasMasAntigua}d`}
          />
          <ResumenCard
            label="Citadas" value={loadingKpis ? null : kpis!.citadas}
            icon={Calendar} colorClass="text-indigo-600" bgClass="bg-indigo-50"
          />
          <ResumenCard
            label="Atendidas" value={loadingKpis ? null : kpis!.atendidas}
            icon={CheckCircle2} colorClass="text-green-600" bgClass="bg-green-50"
            hint={loadingKpis ? undefined : `${kpis!.pctAtendidas}% del total`}
          />
          <ResumenCard
            label="Ausentes" value={loadingKpis ? null : kpis!.ausentes}
            icon={UserX} colorClass="text-yellow-600" bgClass="bg-yellow-50"
          />
          <ResumenCard
            label="Anuladas" value={loadingKpis ? null : kpis!.anuladas}
            icon={Ban} colorClass="text-red-500" bgClass="bg-red-50"
          />
        </div>
      </section>

      {/* ── KPIs por prioridad ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Por prioridad (total acumulado)
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResumenCard
            label="P1 · GES" value={loadingKpis ? null : kpis!.p1}
            icon={Flame} colorClass="text-red-600" bgClass="bg-red-50"
          />
          <ResumenCard
            label="P2 · Urgente" value={loadingKpis ? null : kpis!.p2}
            icon={Activity} colorClass="text-orange-600" bgClass="bg-orange-50"
          />
          <ResumenCard
            label="P3 · Vulnerable" value={loadingKpis ? null : kpis!.p3}
            icon={Activity} colorClass="text-amber-600" bgClass="bg-amber-50"
          />
          <ResumenCard
            label="P4 · Electiva" value={loadingKpis ? null : kpis!.p4}
            icon={Activity} colorClass="text-slate-500" bgClass="bg-slate-100"
          />
        </div>
      </section>

      {/* ── Barras de progreso visual ── */}
      {!loadingKpis && kpis!.total > 0 && (
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Distribución visual por estado
          </h3>
          <div className="space-y-3">
            {[
              { label: 'En espera', value: kpis!.enEspera, color: 'bg-blue-500' },
              { label: 'Citadas',   value: kpis!.citadas,  color: 'bg-indigo-500' },
              { label: 'Atendidas', value: kpis!.atendidas,color: 'bg-green-500' },
              { label: 'Ausentes',  value: kpis!.ausentes, color: 'bg-yellow-500' },
              { label: 'Anuladas',  value: kpis!.anuladas, color: 'bg-red-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {item.value}
                    <span className="ml-1 font-normal text-slate-400">
                      ({Math.round((item.value / kpis!.total) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                    style={{ width: `${(item.value / kpis!.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filtros ── */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por RUT del paciente"
                value={filtros.rutPaciente}
                onChange={(e) => setFiltros({ ...filtros, rutPaciente: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="pl-9"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <Select
              value={filtros.especialidadId?.toString() ?? 'all'}
              onValueChange={(v) =>
                setFiltros({ ...filtros, especialidadId: v === 'all' ? null : Number(v) })
              }
            >
              <SelectTrigger><SelectValue placeholder="Especialidad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp.id} value={esp.id.toString()}>{esp.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select
              value={filtros.estado ?? 'all'}
              onValueChange={(v) =>
                setFiltros({ ...filtros, estado: v === 'all' ? null : (v as EstadoSolicitud) })
              }
            >
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ESTADOS_FILTRO.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button onClick={aplicarFiltros} className="flex-1 bg-primary-600 hover:bg-primary-700">
              Buscar
            </Button>
            <Button variant="outline" onClick={limpiarFiltros}>Limpiar</Button>
          </div>
        </div>

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

      {/* ── Error ── */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">No se pudo cargar la lista</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                variant="outline" size="sm"
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

      {/* ── Tabla ── */}
      <Card className="overflow-hidden">
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
                  <TableCell className="font-mono text-slate-500">#{sol.id}</TableCell>
                  <TableCell className="font-mono text-sm">{sol.rutPaciente}</TableCell>
                  <TableCell>{sol.especialidad}</TableCell>
                  <TableCell><BadgePrioridad prioridad={sol.prioridad} /></TableCell>
                  <TableCell><BadgeEstado estado={sol.estado} /></TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {tiempoTranscurrido(sol.fechaRegistro)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Paginación ── */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline" size="sm"
            onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}
            disabled={paginaActual === 0}
          >
            « Anterior
          </Button>
          <span className="text-slate-600">
            Página <strong>{paginaActual + 1}</strong> de {page.totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPaginaActual((p) => p + 1)}
            disabled={paginaActual + 1 >= page.totalPages}
          >
            Siguiente »
          </Button>
        </div>
      )}

      {/* ── Sheet de detalle ── */}
      <DetalleSheet
        idSolicitud={idDetalle}
        onClose={() => setIdDetalle(null)}
        onEstadoCambiado={() => buscar(paginaActual)}
      />
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────

function tiempoTranscurrido(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  return `hace ${Math.floor(horas / 24)}d`
}
