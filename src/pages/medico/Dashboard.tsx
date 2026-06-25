import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ListChecks,
  PlusCircle,
} from 'lucide-react'
import { listarSolicitudes } from '@/api/solicitudes'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/medico/KpiCard'
import type { EstadoSolicitud, SolicitudResponse } from '@/types/api'

/**
 * Dashboard del médico.
 *
 * Estrategia:
 *  - Hace una sola llamada GET /solicitudes con size=200
 *  - Calcula KPIs en cliente filtrando por estado y prioridad
 *  - Muestra las últimas 5 solicitudes por fechaRegistro
 *
 * Estados:
 *  - loading: skeleton en todas las tarjetas
 *  - error:   mensaje de error con retry
 *  - éxito:   tarjetas con valores calculados
 */
export function Dashboard() {
  const [solicitudes, setSolicitudes] = useState<SolicitudResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    setCargando(true)
    setError(null)
    const res = await listarSolicitudes({ page: 0, size: 200 })
    if (res.ok) {
      setSolicitudes(res.data.content)
    } else {
      setError(res.error)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  // KPIs calculados en cliente
  const kpis = useMemo(() => calcularKpis(solicitudes), [solicitudes])

  // Últimas 5 solicitudes ordenadas por fechaRegistro descendente
  const ultimas = useMemo(() => {
    if (!solicitudes) return []
    return [...solicitudes]
      .sort(
        (a, b) =>
          new Date(b.fechaRegistro).getTime() -
          new Date(a.fechaRegistro).getTime()
      )
      .slice(0, 5)
  }, [solicitudes])

  return (
    <div>
      {/* Encabezado */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-600">
          Resumen general de la lista de espera y solicitudes recientes.
        </p>
      </header>

      {/* Mensaje de error */}
      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                No se pudieron cargar los datos
              </h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={cargar}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs por estado */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Por estado
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard
            label="En espera"
            value={kpis.enEspera}
            icon={Clock}
            accentColor="text-blue-600"
            loading={cargando}
            hint={kpis.enEsperaHoy != null ? `${kpis.enEsperaHoy} nueva${kpis.enEsperaHoy !== 1 ? 's' : ''} hoy` : undefined}
          />
          <KpiCard
            label="Citadas"
            value={kpis.citadas}
            icon={Calendar}
            accentColor="text-indigo-600"
            loading={cargando}
          />
          <KpiCard
            label="Atendidas"
            value={kpis.atendidas}
            icon={CheckCircle2}
            accentColor="text-green-600"
            loading={cargando}
          />
        </div>
      </section>

      {/* KPIs por prioridad */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Solicitudes activas por prioridad
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="GES (P1)"
            value={kpis.prioridad1}
            icon={Flame}
            accentColor="text-red-600"
            loading={cargando}
          />
          <KpiCard
            label="Urgente (P2)"
            value={kpis.prioridad2}
            icon={Activity}
            accentColor="text-orange-600"
            loading={cargando}
          />
          <KpiCard
            label="Vulnerable (P3)"
            value={kpis.prioridad3}
            icon={Activity}
            accentColor="text-amber-600"
            loading={cargando}
          />
          <KpiCard
            label="Electiva (P4)"
            value={kpis.prioridad4}
            icon={Activity}
            accentColor="text-slate-500"
            loading={cargando}
          />
        </div>
      </section>

      {/* Accesos directos */}
      <section className="mb-8 flex flex-wrap gap-3">
        <Button asChild className="bg-primary-600 hover:bg-primary-700">
          <Link to="/medico/registrar">
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar nueva solicitud
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/medico/lista">
            <ListChecks className="w-4 h-4 mr-2" />
            Ver lista de espera completa
          </Link>
        </Button>
      </section>

      {/* Últimas solicitudes */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Últimas solicitudes registradas
        </h2>
        <Card className="p-0 overflow-hidden">
          {cargando ? (
            <SkeletonTabla />
          ) : ultimas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No hay solicitudes registradas todavía.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Paciente</th>
                  <th className="px-4 py-2 text-left">Especialidad</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Registrada</th>
                </tr>
              </thead>
              <tbody>
                {ultimas.map((sol) => (
                  <tr
                    key={sol.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-slate-500">#{sol.id}</td>
                    <td className="px-4 py-3 font-mono">{sol.rutPaciente}</td>
                    <td className="px-4 py-3">{sol.especialidad}</td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={sol.estado} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {tiempoTranscurrido(sol.fechaRegistro)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Cálculo de KPIs
// ──────────────────────────────────────────────────────────────

interface Kpis {
  enEspera: number | null
  enEsperaHoy: number | null
  citadas: number | null
  atendidas: number | null
  prioridad1: number | null
  prioridad2: number | null
  prioridad3: number | null
  prioridad4: number | null
}

function calcularKpis(solicitudes: SolicitudResponse[] | null): Kpis {
  if (!solicitudes) {
    return {
      enEspera: null,
      enEsperaHoy: null,
      citadas: null,
      atendidas: null,
      prioridad1: null,
      prioridad2: null,
      prioridad3: null,
      prioridad4: null,
    }
  }

  const hoyInicio = new Date()
  hoyInicio.setHours(0, 0, 0, 0)

  // Por estado
  const enEspera = solicitudes.filter((s) => s.estado === 'EN_ESPERA').length
  const enEsperaHoy = solicitudes.filter(
    (s) =>
      s.estado === 'EN_ESPERA' &&
      new Date(s.fechaRegistro).getTime() >= hoyInicio.getTime()
  ).length
  const citadas = solicitudes.filter((s) => s.estado === 'CITADO').length
  const atendidas = solicitudes.filter((s) => s.estado === 'ATENDIDO').length

  // Por prioridad — solo solicitudes activas (no terminales)
  const estadosActivos: EstadoSolicitud[] = [
    'EN_ESPERA',
    'CITADO',
    'ATENDIDO',
    'AUSENTE',
  ]
  const activas = solicitudes.filter((s) =>
    estadosActivos.includes(s.estado)
  )

  return {
    enEspera,
    enEsperaHoy,
    citadas,
    atendidas,
    prioridad1: activas.filter((s) => s.prioridad === 1).length,
    prioridad2: activas.filter((s) => s.prioridad === 2).length,
    prioridad3: activas.filter((s) => s.prioridad === 3).length,
    prioridad4: activas.filter((s) => s.prioridad === 4).length,
  }
}

// ──────────────────────────────────────────────────────────────
// Helpers visuales
// ──────────────────────────────────────────────────────────────

function BadgeEstado({ estado }: { estado: EstadoSolicitud }) {
  const colores: Record<EstadoSolicitud, string> = {
    EN_ESPERA: 'bg-blue-100 text-blue-800 border-blue-200',
    CITADO: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ATENDIDO: 'bg-green-100 text-green-800 border-green-200',
    AUSENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CERRADO: 'bg-slate-200 text-slate-700 border-slate-300',
    ANULADO: 'bg-red-100 text-red-800 border-red-200',
    DERIVADO: 'bg-purple-100 text-purple-800 border-purple-200',
    VENCIDO: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${colores[estado]}`}
    >
      {estado}
    </span>
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

function SkeletonTabla() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
