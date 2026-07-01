import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Hourglass,
  ListChecks,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { obtenerKpis } from '@/api/kpis'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/medico/KpiCard'
import { DashboardFiltros } from '@/components/medico/DashboardFiltros'
import type { KpiFiltros, KpisResponse } from '@/types/api-kpis'

/**
 * Dashboard del médico — con filtros por especialidad y rango de fechas.
 *
 * KPIs "snapshot" (estado actual) — solo se ven afectados por el
 * filtro de especialidad:
 *   1. Total activas   (EN_ESPERA + CITADO)
 *   2. En espera
 *   3. Citadas
 *   4. Backlog > 30 días
 *
 * KPIs "en rango" — dependen del rango de fechas y del filtro:
 *   5. Atendidas en el rango
 *   6. Nuevas en el rango
 *   7. Tiempo promedio de espera → CITADO (días)
 *   8. Tasa de ausentismo (%)
 *
 * Gráficos:
 *   - Top 8 especialidades por solicitudes activas
 *   - Distribución por prioridad P1–P4
 */
export function Dashboard() {
  const [kpis, setKpis] = useState<KpisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState<KpiFiltros>({})

  const cargar = useCallback(async (f: KpiFiltros) => {
    setCargando(true)
    setError(null)
    const res = await obtenerKpis(f)
    if (res.ok) {
      setKpis(res.data)
    } else {
      setError(res.error)
    }
    setCargando(false)
  }, [])

  // Recargar cuando cambian los filtros
  useEffect(() => {
    cargar(filtros)
  }, [filtros, cargar])

  return (
    <div>
      {/* Encabezado */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-600">
          Resumen operacional de la lista de espera. Ajusta los filtros para
          explorar por especialidad o rango de fechas.
        </p>
      </header>

      {/* Barra de filtros */}
      <DashboardFiltros onChange={setFiltros} />

      {/* Mensaje de error */}
      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                No se pudieron cargar los KPIs
              </h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => cargar(filtros)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Fila 1: snapshot */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Estado actual
          {kpis?.filtroAplicado.especialidadId != null && (
            <span className="ml-2 text-slate-400 normal-case font-normal">
              · especialidad filtrada
            </span>
          )}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Activas"
            value={kpis?.totalActivas ?? null}
            icon={Users}
            accentColor="text-slate-700"
            loading={cargando}
            hint="EN_ESPERA + CITADO"
          />
          <KpiCard
            label="En espera"
            value={kpis?.enEspera ?? null}
            icon={Clock}
            accentColor="text-blue-600"
            loading={cargando}
          />
          <KpiCard
            label="Citadas"
            value={kpis?.citadas ?? null}
            icon={Calendar}
            accentColor="text-indigo-600"
            loading={cargando}
          />
          <KpiCard
            label="Backlog > 30d"
            value={kpis?.backlogMas30Dias ?? null}
            icon={AlertTriangle}
            accentColor="text-red-600"
            loading={cargando}
            hint="en espera sin citar"
          />
        </div>
      </section>

      {/* Fila 2: en rango */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          En el rango seleccionado
          {kpis?.filtroAplicado && (
            <span className="ml-2 text-slate-400 normal-case font-normal font-mono">
              {kpis.filtroAplicado.fechaDesde} → {kpis.filtroAplicado.fechaHasta}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Atendidas"
            value={kpis?.atendidasEnRango ?? null}
            icon={CheckCircle2}
            accentColor="text-green-600"
            loading={cargando}
          />
          <KpiCard
            label="Nuevas"
            value={kpis?.nuevasEnRango ?? null}
            icon={Sparkles}
            accentColor="text-emerald-600"
            loading={cargando}
          />
          <KpiCard
            label="T. espera prom."
            value={kpis?.tiempoPromedioEsperaDias ?? null}
            icon={Hourglass}
            accentColor="text-cyan-600"
            loading={cargando}
            hint="días hasta ser citado"
          />
          <KpiCard
            label="Ausentismo"
            value={kpis?.tasaAusentismo ?? null}
            icon={Activity}
            accentColor="text-orange-600"
            loading={cargando}
            hint="% en el rango"
          />
        </div>
      </section>

      {/* Gráficos */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Solicitudes activas por especialidad
            </h3>
            <p className="text-xs text-slate-500">Top 8 — EN_ESPERA + CITADO</p>
          </div>
          {cargando ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <GraficoEspecialidades data={kpis?.porEspecialidad ?? []} />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Distribución por prioridad
            </h3>
            <p className="text-xs text-slate-500">
              Solicitudes activas segmentadas por criterio de urgencia
            </p>
          </div>
          {cargando ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <GraficoPrioridades data={kpis?.porPrioridad} />
          )}
        </Card>
      </section>

      {/* Accesos directos */}
      <section className="flex flex-wrap gap-3">
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
        <Button
          variant="outline"
          onClick={() => cargar(filtros)}
          disabled={cargando}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recargar
        </Button>
      </section>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Gráficos
// ──────────────────────────────────────────────────────────────

function GraficoEspecialidades({
  data,
}: {
  data: { especialidad: string; total: number }[]
}) {
  const top = data.slice(0, 8)
  if (top.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        Sin datos para el filtro seleccionado
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={top} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="especialidad"
          width={140}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v: number) => [`${v} solicitudes`, 'Activas']}
        />
        <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const COLORES_PRIORIDAD: Record<string, string> = {
  'GES (P1)': '#dc2626',
  'Urgente (P2)': '#ea580c',
  'Vulnerable (P3)': '#d97706',
  'Electiva (P4)': '#64748b',
}

function GraficoPrioridades({
  data,
}: {
  data?: { p1: number; p2: number; p3: number; p4: number }
}) {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        Sin datos para mostrar
      </div>
    )
  }
  const chart = [
    { name: 'GES (P1)', value: data.p1 },
    { name: 'Urgente (P2)', value: data.p2 },
    { name: 'Vulnerable (P3)', value: data.p3 },
    { name: 'Electiva (P4)', value: data.p4 },
  ].filter((d) => d.value > 0)

  if (chart.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        Sin solicitudes activas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chart}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {chart.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORES_PRIORIDAD[entry.name] ?? '#94a3b8'}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v: number) => [`${v} solicitudes`, 'Total']}
        />
        <Legend
          verticalAlign="bottom"
          height={30}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
