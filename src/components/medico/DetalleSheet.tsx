import { useEffect, useState } from 'react'
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { obtenerDetalleSolicitud } from '@/api/solicitudes'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  HistorialEstadoResponse,
  SolicitudDetalleResponse,
} from '@/types/api'
import { BadgeEstado, BadgePrioridad } from './BadgeEstado'
import { CambiarEstadoDialog } from './CambiarEstadoDialog'

interface DetalleSheetProps {
  /** ID de la solicitud a mostrar (null = sheet cerrado) */
  idSolicitud: number | null
  onClose: () => void
  /** Callback cuando se cambia exitosamente el estado (para recargar la lista) */
  onEstadoCambiado: () => void
}

export function DetalleSheet({
  idSolicitud,
  onClose,
  onEstadoCambiado,
}: DetalleSheetProps) {
  const [detalle, setDetalle] = useState<SolicitudDetalleResponse | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  // Cargar el detalle cuando cambia idSolicitud
  useEffect(() => {
    if (idSolicitud === null) {
      setDetalle(null)
      return
    }
    cargarDetalle(idSolicitud)
  }, [idSolicitud])

  async function cargarDetalle(id: number) {
    setCargando(true)
    setError(null)
    const res = await obtenerDetalleSolicitud(id)
    if (res.ok) {
      setDetalle(res.data)
    } else {
      setError(res.error)
    }
    setCargando(false)
  }

  async function recargar() {
    if (idSolicitud !== null) await cargarDetalle(idSolicitud)
  }

  function handleEstadoCambiado() {
    // Recargar el detalle local Y avisar a la lista que recargue
    recargar()
    onEstadoCambiado()
  }

  return (
    <>
      <Sheet
        open={idSolicitud !== null}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>
              {idSolicitud !== null ? `Solicitud #${idSolicitud}` : 'Detalle'}
            </SheetTitle>
            <SheetDescription>
              Información completa e historial de la solicitud.
            </SheetDescription>
          </SheetHeader>

          {cargando && <SkeletonDetalle />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 text-sm text-red-800">
              <p className="font-semibold mb-1">Error al cargar</p>
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={recargar}
              >
                Reintentar
              </Button>
            </div>
          )}

          {detalle && (
            <div className="mt-6 space-y-6">
              {/* Estado + Prioridad destacados */}
              <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Estado actual</p>
                  <BadgeEstado estado={detalle.estado} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Prioridad</p>
                  <BadgePrioridad prioridad={detalle.prioridad} />
                </div>
              </div>

              {/* Información del paciente */}
              <Section titulo="Información del paciente">
                <Dato label="RUT" valor={detalle.rutPaciente} mono />
                <Dato
                  label="Funcionario que registró"
                  valor={detalle.rutFuncionario}
                  mono
                />
              </Section>

              <Separator />

              {/* Detalles clínicos */}
              <Section titulo="Detalles clínicos">
                <Dato label="Especialidad" valor={detalle.especialidad} />
                <Dato label="Nivel de urgencia" valor={detalle.nivelUrgencia} />
                <Dato
                  label="Es GES"
                  valor={
                    detalle.esGES
                      ? `Sí — ${detalle.patologiaGES ?? 'sin patología'}`
                      : 'No'
                  }
                />
                <Dato
                  label="Vulnerabilidad"
                  valor={
                    detalle.esVulnerable
                      ? `Sí — ${detalle.tipoVulnerabilidad ?? 'sin tipo'}`
                      : 'No'
                  }
                />
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Diagnóstico</p>
                  <p className="text-sm text-slate-900">{detalle.diagnostico}</p>
                </div>
              </Section>

              <Separator />

              {/* Fechas */}
              <Section titulo="Fechas">
                <Dato
                  label="Registro"
                  valor={formatearFecha(detalle.fechaRegistro)}
                />
                <Dato
                  label="Última actualización"
                  valor={formatearFecha(detalle.fechaActualizacion)}
                />
                <Dato
                  label="Cita programada"
                  valor={
                    detalle.fechaCita
                      ? formatearFecha(detalle.fechaCita)
                      : 'Sin cita asignada'
                  }
                />
              </Section>

              <Separator />

              {/* Historial */}
              <Section titulo={`Historial (${detalle.historial.length})`}>
                <div className="space-y-2">
                  {detalle.historial.map((h, idx) => (
                    <EntradaHistorial key={idx} historial={h} />
                  ))}
                </div>
              </Section>

              {/* Botón de acción */}
              <div className="pt-2">
                <Button
                  onClick={() => setDialogAbierto(true)}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cambiar estado
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog de cambio de estado */}
      <CambiarEstadoDialog
        solicitud={detalle}
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        onExito={handleEstadoCambiado}
      />
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────

function Section({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {titulo}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Dato({
  label,
  valor,
  mono = false,
}: {
  label: string
  valor: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-slate-900 font-medium ${mono ? 'font-mono' : ''}`}
      >
        {valor}
      </span>
    </div>
  )
}

function EntradaHistorial({
  historial,
}: {
  historial: HistorialEstadoResponse
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1.5">
        {historial.estadoAnterior ? (
          <>
            <BadgeEstado estado={historial.estadoAnterior} />
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </>
        ) : (
          <span className="text-xs text-slate-500 italic">Estado inicial:</span>
        )}
        <BadgeEstado estado={historial.estadoNuevo} />
      </div>
      <p className="text-xs text-slate-500">
        {formatearFecha(historial.fechaCambio)} · por{' '}
        <span className="font-mono">{historial.rutUsuarioResponsable}</span>
      </p>
      {historial.motivo && (
        <p className="text-xs text-slate-700 mt-1.5 italic">
          Motivo: {historial.motivo}
        </p>
      )}
    </div>
  )
}

function SkeletonDetalle() {
  return (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
