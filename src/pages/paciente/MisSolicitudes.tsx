import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Hospital,
  Inbox,
  LogOut,
  XCircle,
} from 'lucide-react'
import {
  consultarDetallePortal,
  consultarSolicitudesPortal,
} from '@/api/portal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  limpiarRutPaciente,
  obtenerRutPaciente,
} from '@/lib/paciente-storage'
import type {
  HistorialEstadoResponse,
  SolicitudDetallePortalResponse,
  SolicitudResumenResponse,
} from '@/types/api'

/**
 * Página principal del portal paciente: muestra todas sus solicitudes.
 *
 * Diseño orientado al paciente final:
 *  - Lenguaje natural (no técnico)
 *  - Cards amigables con iconos emocionales
 *  - Información relevante para el paciente (no para el médico)
 *  - Si no hay RUT en sessionStorage, redirige al login
 */
export function MisSolicitudes() {
  const navigate = useNavigate()
  const [rut] = useState(() => obtenerRutPaciente())

  const [solicitudes, setSolicitudes] = useState<
    SolicitudResumenResponse[] | null
  >(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Si no hay RUT en sessionStorage, redirigir al login
  useEffect(() => {
    if (!rut) {
      navigate('/paciente')
    }
  }, [rut, navigate])

  // Cargar las solicitudes
  useEffect(() => {
    if (!rut) return
    cargar()
  }, [rut])

  async function cargar() {
    if (!rut) return
    setCargando(true)
    setError(null)
    const res = await consultarSolicitudesPortal(rut, 0, 50)
    if (res.ok) {
      setSolicitudes(res.data.content)
    } else {
      setError(res.error)
      setSolicitudes(null)
    }
    setCargando(false)
  }

  function cambiarRut() {
    limpiarRutPaciente()
    navigate('/paciente')
  }

  if (!rut) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header simple */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-secondary-600 flex items-center justify-center text-white">
              <Hospital className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">
                RedNorte
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight">
                Portal del paciente
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={cambiarRut}>
            <LogOut className="w-4 h-4 mr-2" />
            Cambiar de RUT
          </Button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Saludo */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Hola
          </h1>
          <p className="text-slate-600">
            Estas son tus solicitudes de atención registradas.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-sm">
            <span className="text-slate-500">Identificado como</span>
            <span className="font-mono font-semibold text-slate-900">
              {rut}
            </span>
          </div>
        </div>

        {/* Estados de carga */}
        {cargando && <ListaSkeleton />}

        {/* Error */}
        {error && !cargando && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>No pudimos cargar tus solicitudes.</strong>
              <p className="mt-1 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={cargar}
                className="mt-3"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Sin solicitudes */}
        {!cargando && !error && solicitudes && solicitudes.length === 0 && (
          <Card className="p-12 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No hay solicitudes registradas
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              No encontramos solicitudes asociadas al RUT{' '}
              <span className="font-mono">{rut}</span>. Si crees que es un
              error, contáctate con tu centro de salud.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="mt-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Card>
        )}

        {/* Lista de solicitudes */}
        {!cargando && !error && solicitudes && solicitudes.length > 0 && (
          <div className="space-y-4">
            {solicitudes.map((sol) => (
              <CardSolicitudPaciente key={sol.id} solicitud={sol} rut={rut} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Card de solicitud (perspectiva del paciente)
// ──────────────────────────────────────────────────────────────

function CardSolicitudPaciente({
  solicitud,
  rut,
}: {
  solicitud: SolicitudResumenResponse
  rut: string
}) {
  const [expandida, setExpandida] = useState(false)
  const [detalle, setDetalle] =
    useState<SolicitudDetallePortalResponse | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  async function toggleExpandir() {
    if (expandida) {
      setExpandida(false)
      return
    }
    setExpandida(true)
    if (!detalle) {
      setCargandoDetalle(true)
      const res = await consultarDetallePortal(solicitud.id, rut)
      if (res.ok) setDetalle(res.data)
      setCargandoDetalle(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Encabezado de la card */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <h3 className="text-xl font-bold text-slate-900">
            {solicitud.especialidad}
          </h3>
          <EstadoVisualPaciente estado={solicitud.estado} />
        </div>

        {/* Información clave en lenguaje natural */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-slate-700">
            <FileText className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <span>
              Solicitud registrada{' '}
              <span className="font-semibold">
                {tiempoTranscurrido(solicitud.fechaRegistro)}
              </span>
            </span>
          </div>

          {solicitud.fechaCita ? (
            <div className="flex items-start gap-2 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 text-secondary-900">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Tu cita:</strong>{' '}
                {formatearFechaAmigable(solicitud.fechaCita)}
              </div>
            </div>
          ) : esEnEspera(solicitud.estado) ? (
            <div className="flex items-start gap-2 text-slate-500 italic">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Aún no se ha asignado una fecha de cita</span>
            </div>
          ) : null}
        </div>

        {/* Botón de ver más */}
        <button
          onClick={toggleExpandir}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-700 hover:text-secondary-900 transition-colors"
        >
          {expandida ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver más detalles
            </>
          )}
        </button>
      </div>

      {/* Detalle expandido */}
      {expandida && (
        <div className="border-t border-slate-100 bg-slate-50 p-5">
          {cargandoDetalle ? (
            <Skeleton className="h-32 w-full" />
          ) : detalle ? (
            <DetalleExpandido detalle={detalle} />
          ) : (
            <p className="text-sm text-slate-500">
              No se pudo cargar el detalle.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────

function DetalleExpandido({
  detalle,
}: {
  detalle: SolicitudDetallePortalResponse
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Historial de tu solicitud
      </h4>

      <div className="space-y-2">
        {detalle.historial.map((h, idx) => (
          <EntradaHistorial key={idx} historial={h} esInicial={idx === 0} />
        ))}
      </div>

      <Separator className="my-4" />

      <p className="text-xs text-slate-500">
        Si tienes dudas sobre tu solicitud, contacta a tu centro de salud
        llamando al <span className="font-semibold">600 360 7777</span>.
      </p>
    </div>
  )
}

function EntradaHistorial({
  historial,
  esInicial,
}: {
  historial: HistorialEstadoResponse
  esInicial: boolean
}) {
  const mensajes: Record<string, string> = {
    EN_ESPERA: esInicial
      ? 'Tu solicitud fue registrada'
      : 'Volviste a la lista de espera',
    CITADO: 'Se te asignó una fecha de cita',
    ATENDIDO: 'Fuiste atendido en tu cita',
    AUSENTE: 'No asististe a la cita',
    CERRADO: 'Tu caso fue cerrado',
    ANULADO: 'Tu solicitud fue anulada',
    DERIVADO: 'Tu solicitud fue derivada a otra especialidad',
    VENCIDO: 'Tu solicitud venció',
  }

  const mensaje = mensajes[historial.estadoNuevo] ?? historial.estadoNuevo

  return (
    <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-200">
      <div className="w-2 h-2 rounded-full bg-secondary-600 mt-2 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-slate-900 font-medium">{mensaje}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {formatearFechaAmigable(historial.fechaCambio)}
        </p>
        {historial.motivo && (
          <p className="text-xs text-slate-700 mt-1 italic">
            Motivo: {historial.motivo}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Visualización de estado en lenguaje del paciente (no técnico).
 */
function EstadoVisualPaciente({ estado }: { estado: string }) {
  const configs: Record<
    string,
    { label: string; icono: React.ReactNode; clases: string }
  > = {
    EN_ESPERA: {
      label: 'En espera',
      icono: <Clock className="w-3.5 h-3.5" />,
      clases: 'bg-blue-100 text-blue-800',
    },
    CITADO: {
      label: 'Citado',
      icono: <Calendar className="w-3.5 h-3.5" />,
      clases: 'bg-indigo-100 text-indigo-800',
    },
    ATENDIDO: {
      label: 'Atendido',
      icono: <CheckCircle2 className="w-3.5 h-3.5" />,
      clases: 'bg-green-100 text-green-800',
    },
    AUSENTE: {
      label: 'No asististe',
      icono: <XCircle className="w-3.5 h-3.5" />,
      clases: 'bg-yellow-100 text-yellow-800',
    },
    CERRADO: {
      label: 'Cerrado',
      icono: <CheckCircle2 className="w-3.5 h-3.5" />,
      clases: 'bg-slate-200 text-slate-700',
    },
    ANULADO: {
      label: 'Anulado',
      icono: <XCircle className="w-3.5 h-3.5" />,
      clases: 'bg-red-100 text-red-800',
    },
    DERIVADO: {
      label: 'Derivado',
      icono: <FileText className="w-3.5 h-3.5" />,
      clases: 'bg-purple-100 text-purple-800',
    },
    VENCIDO: {
      label: 'Vencido',
      icono: <XCircle className="w-3.5 h-3.5" />,
      clases: 'bg-gray-100 text-gray-700',
    },
  }
  const config = configs[estado] ?? configs.EN_ESPERA
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.clases}`}
    >
      {config.icono}
      {config.label}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function esEnEspera(estado: string): boolean {
  return estado === 'EN_ESPERA'
}

function tiempoTranscurrido(iso: string): string {
  const fecha = new Date(iso)
  const ahora = new Date()
  const dias = Math.floor(
    (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`
  const meses = Math.floor(dias / 30)
  if (meses === 1) return 'hace un mes'
  return `hace ${meses} meses`
}

function formatearFechaAmigable(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function ListaSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-72 mb-2" />
          <Skeleton className="h-4 w-60" />
        </Card>
      ))}
    </div>
  )
}
