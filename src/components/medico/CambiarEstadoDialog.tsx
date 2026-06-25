import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cambiarEstadoSolicitud } from '@/api/solicitudes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  requiereFechaCita,
  requiereMotivo,
  transicionesPosibles,
} from '@/utils/transiciones'
import type {
  CambiarEstadoRequest,
  EstadoSolicitud,
  SolicitudDetalleResponse,
} from '@/types/api'
import { BadgeEstado } from './BadgeEstado'

interface CambiarEstadoDialogProps {
  solicitud: SolicitudDetalleResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Callback cuando el cambio fue exitoso */
  onExito: () => void
}

const LABELS_ESTADO: Record<EstadoSolicitud, string> = {
  EN_ESPERA: 'Volver a espera',
  CITADO: 'Citar al paciente',
  ATENDIDO: 'Marcar como atendido',
  AUSENTE: 'Marcar como ausente',
  CERRADO: 'Cerrar caso',
  ANULADO: 'Anular solicitud',
  DERIVADO: 'Derivar a otra especialidad',
  VENCIDO: 'Marcar como vencido',
}

export function CambiarEstadoDialog({
  solicitud,
  open,
  onOpenChange,
  onExito,
}: CambiarEstadoDialogProps) {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud | ''>('')
  const [motivo, setMotivo] = useState('')
  const [fechaCita, setFechaCita] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Resetear el form cuando se abre/cierra
  useEffect(() => {
    if (!open) {
      setNuevoEstado('')
      setMotivo('')
      setFechaCita('')
      setError(null)
    }
  }, [open])

  if (!solicitud) return null

  const transicionesDisponibles = transicionesPosibles(solicitud.estado)
  const esTerminal = transicionesDisponibles.length === 0

  function validar(): string | null {
    if (!nuevoEstado) return 'Seleccione el nuevo estado'
    if (requiereFechaCita(nuevoEstado) && !fechaCita) {
      return 'La fecha de cita es obligatoria para CITAR'
    }
    if (requiereFechaCita(nuevoEstado) && fechaCita) {
      const fecha = new Date(fechaCita)
      if (fecha.getTime() <= Date.now()) {
        return 'La fecha de cita debe ser futura'
      }
    }
    if (requiereMotivo(nuevoEstado) && !motivo.trim()) {
      return 'El motivo es obligatorio para este cambio'
    }
    return null
  }

  async function enviar() {
    const errorValidacion = validar()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }
    if (!solicitud) return

    setEnviando(true)
    setError(null)

    const request: CambiarEstadoRequest = {
      nuevoEstado: nuevoEstado as EstadoSolicitud,
      motivo: motivo.trim() || null,
      fechaCita: fechaCita || null,
    }

    const res = await cambiarEstadoSolicitud(solicitud.id, request)
    setEnviando(false)

    if (res.ok) {
      toast.success('Estado actualizado', {
        description: `La solicitud #${solicitud.id} ahora está en estado ${nuevoEstado}.`,
      })
      onExito()
      onOpenChange(false)
    } else {
      setError(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado de #{solicitud.id}</DialogTitle>
          <DialogDescription>
            Paciente: <span className="font-mono">{solicitud.rutPaciente}</span>
            {' — '}
            {solicitud.especialidad}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Estado actual */}
          <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Estado actual</span>
            <BadgeEstado estado={solicitud.estado} />
          </div>

          {esTerminal ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>Estado terminal.</strong> La solicitud en estado{' '}
              <strong>{solicitud.estado}</strong> no admite más cambios.
            </div>
          ) : (
            <>
              {/* Selector de nuevo estado */}
              <div>
                <Label className="mb-1.5 block">Nuevo estado</Label>
                <Select
                  value={nuevoEstado}
                  onValueChange={(v) =>
                    setNuevoEstado(v as EstadoSolicitud)
                  }
                  disabled={enviando}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el cambio" />
                  </SelectTrigger>
                  <SelectContent>
                    {transicionesDisponibles.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {LABELS_ESTADO[estado]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Solo se muestran las transiciones válidas desde el estado actual.
                </p>
              </div>

              {/* Campo fechaCita (si es CITADO) */}
              {nuevoEstado && requiereFechaCita(nuevoEstado) && (
                <div>
                  <Label className="mb-1.5 block">
                    Fecha y hora de la cita{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={fechaCita}
                    onChange={(e) => setFechaCita(e.target.value)}
                    disabled={enviando}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Debe ser una fecha futura.
                  </p>
                </div>
              )}

              {/* Campo motivo (si es ANULADO o DERIVADO) */}
              {nuevoEstado && requiereMotivo(nuevoEstado) && (
                <div>
                  <Label className="mb-1.5 block">
                    Motivo <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Indique la razón del cambio"
                    rows={2}
                    disabled={enviando}
                  />
                </div>
              )}
            </>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enviando}
            className="flex-1"
          >
            Cancelar
          </Button>
          {!esTerminal && (
            <Button
              onClick={enviar}
              disabled={enviando || !nuevoEstado}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando…
                </>
              ) : (
                'Confirmar cambio'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
