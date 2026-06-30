import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, AlertCircle, Calendar, CheckCircle2,
  Clock, Flame, ListChecks, PlusCircle, TrendingUp, Users,
} from 'lucide-react'
import { listarSolicitudes } from '@/api/solicitudes'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/medico/KpiCard'
import type { EstadoSolicitud, SolicitudResponse } from '@/types/api'

export function Dashboard() {
  const [solicitudes, setSolicitudes] = useState<SolicitudResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    setCargando(true); setError(null)
    const res = await listarSolicitudes({ page: 0, size: 200 })
    if (res.ok) setSolicitudes(res.data.content)
    else setError(res.error)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const kpis = useMemo(() => calcularKpis(solicitudes), [solicitudes])
  const ultimas = useMemo(() => {
    if (!solicitudes) return []
    return [...solicitudes]
      .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
      .slice(0, 5)
  }, [solicitudes])

  const total = solicitudes?.length ?? 0
  const tasaAtencion = total > 0 ? Math.round(((kpis.atendidas ?? 0) / total) * 100) : 0

  return (
    <div className="space-y-8">

      {/* ── Encabezado ── */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard médico</h1>
          <p className="text-slate-500 text-sm">Resumen en tiempo real · {total} solicitudes cargadas</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-primary-600 hover:bg-primary-700">
            <Link to="/medico/registrar"><PlusCircle className="w-4 h-4 mr-2" />Nueva solicitud</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/medico/lista"><ListChecks className="w-4 h-4 mr-2" />Lista de espera</Link>
          </Button>
        </div>
      </header>

      {/* ── Error ── */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">No se pudieron cargar los datos</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button size="sm" variant="outline" onClick={cargar} className="border-red-300 text-red-700 hover:bg-red-100">
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Fila 1: KPI Cards ── */}
      <section>
        <SectionTitle icon={TrendingUp} label="Indicadores clave" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <KpiCard label="En espera" value={kpis.enEspera} icon={Clock} accentColor="text-blue-600" loading={cargando}
            hint={kpis.enEsperaHoy != null ? `${kpis.enEsperaHoy} nueva${kpis.enEsperaHoy !== 1 ? 's' : ''} hoy` : undefined} />
          <KpiCard label="Citadas"   value={kpis.citadas}   icon={Calendar}     accentColor="text-indigo-600" loading={cargando} />
          <KpiCard label="Atendidas" value={kpis.atendidas} icon={CheckCircle2} accentColor="text-green-600"  loading={cargando} />
          <KpiCard label="Total" value={total} icon={Users} accentColor="text-slate-600" loading={cargando}
            hint={`${tasaAtencion}% tasa de atención`} />
        </div>
      </section>

      {/* ── Fila 2: Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut: estados */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Distribución por estado
          </h3>
          {cargando
            ? <div className="flex justify-center"><Skeleton className="w-48 h-48 rounded-full" /></div>
            : <DonutChart
                segments={[
                  { label: 'En espera', value: kpis.enEspera ?? 0, color: '#3b82f6' },
                  { label: 'Citadas',   value: kpis.citadas   ?? 0, color: '#6366f1' },
                  { label: 'Atendidas', value: kpis.atendidas ?? 0, color: '#22c55e' },
                  { label: 'Otros',
                    value: total - (kpis.enEspera ?? 0) - (kpis.citadas ?? 0) - (kpis.atendidas ?? 0),
                    color: '#94a3b8' },
                ]}
                total={total}
              />
          }
        </Card>

        {/* Barras: prioridades */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Solicitudes activas por prioridad
          </h3>
          {cargando
            ? <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
            : <BarChart bars={[
                { label: 'GES · P1',        value: kpis.prioridad1 ?? 0, color: '#ef4444', icon: '🔴' },
                { label: 'Urgente · P2',    value: kpis.prioridad2 ?? 0, color: '#f97316', icon: '🟠' },
                { label: 'Vulnerable · P3', value: kpis.prioridad3 ?? 0, color: '#eab308', icon: '🟡' },
                { label: 'Electiva · P4',   value: kpis.prioridad4 ?? 0, color: '#64748b', icon: '⚪' },
              ]} />
          }
        </Card>
      </div>

      {/* ── Fila 3: KPI Prioridades ── */}
      <section>
        <SectionTitle icon={Activity} label="Prioridades activas" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <KpiCard label="GES (P1)"        value={kpis.prioridad1} icon={Flame}    accentColor="text-red-600"    loading={cargando} />
          <KpiCard label="Urgente (P2)"    value={kpis.prioridad2} icon={Activity} accentColor="text-orange-500" loading={cargando} />
          <KpiCard label="Vulnerable (P3)" value={kpis.prioridad3} icon={Activity} accentColor="text-amber-500"  loading={cargando} />
          <KpiCard label="Electiva (P4)"   value={kpis.prioridad4} icon={Activity} accentColor="text-slate-500"  loading={cargando} />
        </div>
      </section>

      {/* ── Últimas solicitudes ── */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Últimas solicitudes registradas</h2>
        <Card className="p-0 overflow-hidden">
          {cargando ? (
            <SkeletonTabla />
          ) : ultimas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No hay solicitudes registradas todavía.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Paciente (RUT)</th>
                  <th className="px-4 py-3 text-left font-medium">Especialidad</th>
                  <th className="px-4 py-3 text-left font-medium">Prioridad</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Registrada</th>
                </tr>
              </thead>
              <tbody>
                {ultimas.map(sol => (
                  <tr key={sol.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">#{sol.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sol.rutPaciente}</td>
                    <td className="px-4 py-3">{sol.especialidad}</td>
                    <td className="px-4 py-3"><BadgePrioridad prioridad={sol.prioridad} /></td>
                    <td className="px-4 py-3"><BadgeEstado estado={sol.estado} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{tiempoTranscurrido(sol.fechaRegistro)}</td>
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

// ── Donut Chart (SVG nativo) ──────────────────────────────────

interface DonutSegment { label: string; value: number; color: string }

function DonutChart({ segments, total }: { segments: DonutSegment[]; total: number }) {
  const R = 70; const cx = 100; const cy = 100; const stroke = 22
  const circumference = 2 * Math.PI * R

  if (total === 0) return (
    <div className="flex flex-col items-center gap-4">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="13">Sin datos</text>
      </svg>
    </div>
  )

  let accumulated = 0
  const arcs = segments.filter(s => s.value > 0).map(seg => {
    const fraction = seg.value / total
    const offset = circumference * (1 - accumulated)
    const dash = circumference * fraction
    accumulated += fraction
    return { ...seg, offset, dash }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width="200" height="200" viewBox="0 0 200 200" className="shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={arc.color} strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={arc.offset} strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        <text x={cx} y={cy - 8}  textAnchor="middle" fill="#0f172a" fontSize="26" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="11">solicitudes</text>
      </svg>
      <ul className="space-y-2 text-sm w-full">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-slate-600">{seg.label}</span>
            </span>
            <span className="font-semibold text-slate-800">
              {seg.value}
              <span className="ml-1 text-xs font-normal text-slate-400">({Math.round(seg.value / total * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Bar Chart horizontal (CSS puro) ──────────────────────────

interface Bar { label: string; value: number; color: string; icon: string }

function BarChart({ bars }: { bars: Bar[] }) {
  const maxVal = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="space-y-4">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <span>{bar.icon}</span>{bar.label}
            </span>
            <span className="text-sm font-bold text-slate-800">{bar.value}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(bar.value / maxVal) * 100}%`, background: bar.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h2>
    </div>
  )
}

function calcularKpis(solicitudes: SolicitudResponse[] | null): Kpis {
  if (!solicitudes) return { enEspera: null, enEsperaHoy: null, citadas: null, atendidas: null, prioridad1: null, prioridad2: null, prioridad3: null, prioridad4: null }
  const hoyInicio = new Date(); hoyInicio.setHours(0, 0, 0, 0)
  const enEspera    = solicitudes.filter(s => s.estado === 'EN_ESPERA').length
  const enEsperaHoy = solicitudes.filter(s => s.estado === 'EN_ESPERA' && new Date(s.fechaRegistro).getTime() >= hoyInicio.getTime()).length
  const citadas     = solicitudes.filter(s => s.estado === 'CITADO').length
  const atendidas   = solicitudes.filter(s => s.estado === 'ATENDIDO').length
  const estadosActivos: EstadoSolicitud[] = ['EN_ESPERA', 'CITADO', 'ATENDIDO', 'AUSENTE']
  const activas = solicitudes.filter(s => estadosActivos.includes(s.estado))
  return {
    enEspera, enEsperaHoy, citadas, atendidas,
    prioridad1: activas.filter(s => s.prioridad === 1).length,
    prioridad2: activas.filter(s => s.prioridad === 2).length,
    prioridad3: activas.filter(s => s.prioridad === 3).length,
    prioridad4: activas.filter(s => s.prioridad === 4).length,
  }
}

interface Kpis {
  enEspera: number | null; enEsperaHoy: number | null
  citadas: number | null;  atendidas: number | null
  prioridad1: number | null; prioridad2: number | null
  prioridad3: number | null; prioridad4: number | null
}

function BadgeEstado({ estado }: { estado: EstadoSolicitud }) {
  const colores: Record<EstadoSolicitud, string> = {
    EN_ESPERA: 'bg-blue-100 text-blue-800 border-blue-200',
    CITADO:    'bg-indigo-100 text-indigo-800 border-indigo-200',
    ATENDIDO:  'bg-green-100 text-green-800 border-green-200',
    AUSENTE:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    CERRADO:   'bg-slate-200 text-slate-700 border-slate-300',
    ANULADO:   'bg-red-100 text-red-800 border-red-200',
    DERIVADO:  'bg-purple-100 text-purple-800 border-purple-200',
    VENCIDO:   'bg-gray-100 text-gray-700 border-gray-200',
  }
  return <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${colores[estado]}`}>{estado.replace('_', ' ')}</span>
}

function BadgePrioridad({ prioridad }: { prioridad: number }) {
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: 'P1 · GES',       cls: 'bg-red-100 text-red-800 border-red-200' },
    2: { label: 'P2 · Urgente',   cls: 'bg-orange-100 text-orange-800 border-orange-200' },
    3: { label: 'P3 · Vulnerable',cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    4: { label: 'P4 · Electiva',  cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  }
  const { label, cls } = map[prioridad] ?? { label: `P${prioridad}`, cls: 'bg-slate-100 text-slate-700 border-slate-200' }
  return <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${cls}`}>{label}</span>
}

function tiempoTranscurrido(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  return `hace ${Math.floor(horas / 24)}d`
}

function SkeletonTabla() {
  return <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
}