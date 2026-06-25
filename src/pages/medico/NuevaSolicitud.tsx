import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { listarEspecialidades } from '@/api/especialidades'
import { crearSolicitud } from '@/api/solicitudes'
import { TIPOS_VULNERABILIDAD } from '@/api/tipos-vulnerabilidad'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type {
  CrearSolicitudRequest,
  EspecialidadResponse,
  NivelUrgencia,
  SolicitudResponse,
} from '@/types/api'

// ──────────────────────────────────────────────────────────────
// Tipos auxiliares
// ──────────────────────────────────────────────────────────────

/** Errores de validación: campo → mensaje */
type ValidationErrors = Partial<Record<keyof CrearSolicitudRequest, string>>

/** Estado del formulario (todos los campos como strings/booleans editables) */
interface FormState {
  rutPaciente: string
  especialidadId: number | null
  diagnostico: string
  nivelUrgencia: NivelUrgencia | ''
  esGES: boolean
  patologiaGES: string
  esVulnerable: boolean
  tipoVulnerabilidadId: number | null
}

const FORM_INICIAL: FormState = {
  rutPaciente: '',
  especialidadId: null,
  diagnostico: '',
  nivelUrgencia: '',
  esGES: false,
  patologiaGES: '',
  esVulnerable: false,
  tipoVulnerabilidadId: null,
}

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────

export function NuevaSolicitud() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [especialidades, setEspecialidades] = useState<EspecialidadResponse[]>([])
  const [enviando, setEnviando] = useState(false)
  const [errorBackend, setErrorBackend] = useState<string | null>(null)

  // Resultado del registro exitoso
  const [solicitudCreada, setSolicitudCreada] =
    useState<SolicitudResponse | null>(null)

  // Cargar especialidades al montar
  useEffect(() => {
    listarEspecialidades().then((res) => {
      if (res.ok) setEspecialidades(res.data)
    })
  }, [])

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    // Limpiar el error del campo cuando el usuario lo modifica
    if (errors[campo as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }))
    }
  }

  /** Validaciones en cliente antes de enviar */
  function validar(): boolean {
    const e: ValidationErrors = {}

    if (!form.rutPaciente.trim()) {
      e.rutPaciente = 'Ingrese el RUT del paciente'
    } else if (!/^\d{7,8}-[\dkK]$/.test(form.rutPaciente.trim())) {
      e.rutPaciente = 'Formato esperado: 12345678-9'
    }

    if (!form.especialidadId) {
      e.especialidadId = 'Seleccione una especialidad'
    }

    if (!form.diagnostico.trim()) {
      e.diagnostico = 'Describa brevemente el diagnóstico'
    } else if (form.diagnostico.trim().length < 10) {
      e.diagnostico = 'El diagnóstico debe tener al menos 10 caracteres'
    }

    if (!form.nivelUrgencia) {
      e.nivelUrgencia = 'Seleccione el nivel de urgencia'
    }

    if (form.esGES && !form.patologiaGES.trim()) {
      e.patologiaGES = 'Indique la patología GES'
    }

    if (form.esVulnerable && !form.tipoVulnerabilidadId) {
      e.tipoVulnerabilidadId = 'Seleccione el tipo de vulnerabilidad'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function enviar() {
    setErrorBackend(null)
    if (!validar()) return

    setEnviando(true)

    const request: CrearSolicitudRequest = {
      rutPaciente: form.rutPaciente.trim(),
      especialidadId: form.especialidadId!,
      diagnostico: form.diagnostico.trim(),
      esGES: form.esGES,
      patologiaGES: form.esGES ? form.patologiaGES.trim() : null,
      nivelUrgencia: form.nivelUrgencia as NivelUrgencia,
      esVulnerable: form.esVulnerable,
      tipoVulnerabilidadId: form.esVulnerable ? form.tipoVulnerabilidadId : null,
    }

    const res = await crearSolicitud(request)
    setEnviando(false)

    if (res.ok) {
      setSolicitudCreada(res.data)
    } else {
      setErrorBackend(res.error)
    }
  }

  function resetear() {
    setForm(FORM_INICIAL)
    setErrors({})
    setErrorBackend(null)
    setSolicitudCreada(null)
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Nueva solicitud
        </h1>
        <p className="text-slate-600">
          Registre una solicitud de atención médica. La prioridad clínica se
          calculará automáticamente.
        </p>
      </header>

      {/* Error de backend */}
      {errorBackend && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                No se pudo registrar la solicitud
              </h3>
              <p className="text-sm text-red-700">{errorBackend}</p>
            </div>
          </div>
        </Card>
      )}

      {/* FORMULARIO */}
      <div className="space-y-6 max-w-3xl">
        {/* Sección 1: Información del paciente */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Información del paciente
          </h2>
          <CampoFormulario
            label="RUT del paciente"
            required
            error={errors.rutPaciente}
            hint="Formato: 12345678-9 (sin puntos, con guion y dígito verificador)"
          >
            <Input
              value={form.rutPaciente}
              onChange={(e) => actualizar('rutPaciente', e.target.value)}
              placeholder="12345678-9"
              disabled={enviando}
              className={errors.rutPaciente ? 'border-red-500' : ''}
            />
          </CampoFormulario>
        </Card>

        {/* Sección 2: Atención requerida */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Atención requerida
          </h2>

          <CampoFormulario
            label="Especialidad"
            required
            error={errors.especialidadId}
          >
            <Select
              value={form.especialidadId?.toString() ?? ''}
              onValueChange={(v) => actualizar('especialidadId', Number(v))}
              disabled={enviando}
            >
              <SelectTrigger
                className={errors.especialidadId ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Seleccione una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {especialidades.map((esp) => (
                  <SelectItem key={esp.id} value={esp.id.toString()}>
                    {esp.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CampoFormulario>

          <CampoFormulario
            label="Diagnóstico"
            required
            error={errors.diagnostico}
            hint="Describa el motivo de la solicitud con al menos 10 caracteres"
          >
            <Textarea
              value={form.diagnostico}
              onChange={(e) => actualizar('diagnostico', e.target.value)}
              placeholder="Ej: Dolor torácico crónico con sospecha de cardiopatía"
              rows={3}
              disabled={enviando}
              className={errors.diagnostico ? 'border-red-500' : ''}
            />
          </CampoFormulario>
        </Card>

        {/* Sección 3: Clasificación clínica */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Clasificación clínica
          </h2>

          <CampoFormulario
            label="Nivel de urgencia"
            required
            error={errors.nivelUrgencia}
          >
            <div className="flex flex-wrap gap-3">
              {(['GES', 'URGENTE', 'ELECTIVA'] as NivelUrgencia[]).map((nu) => (
                <NivelUrgenciaButton
                  key={nu}
                  nivel={nu}
                  seleccionado={form.nivelUrgencia === nu}
                  onClick={() => actualizar('nivelUrgencia', nu)}
                  disabled={enviando}
                />
              ))}
            </div>
          </CampoFormulario>

          <div className="pt-2 border-t border-slate-100">
            <CheckboxConLabel
              checked={form.esGES}
              onCheckedChange={(v) => actualizar('esGES', v)}
              disabled={enviando}
              label="Es paciente GES"
              descripcion="Tiene una patología cubierta por las Garantías Explícitas en Salud"
            />

            {form.esGES && (
              <div className="mt-3 ml-7">
                <CampoFormulario
                  label="Patología GES"
                  required
                  error={errors.patologiaGES}
                >
                  <Input
                    value={form.patologiaGES}
                    onChange={(e) => actualizar('patologiaGES', e.target.value)}
                    placeholder="Ej: Infarto agudo al miocardio"
                    disabled={enviando}
                    className={errors.patologiaGES ? 'border-red-500' : ''}
                  />
                </CampoFormulario>
              </div>
            )}
          </div>
        </Card>

        {/* Sección 4: Vulnerabilidad social */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Vulnerabilidad social
          </h2>

          <CheckboxConLabel
            checked={form.esVulnerable}
            onCheckedChange={(v) => {
              actualizar('esVulnerable', v)
              if (!v) actualizar('tipoVulnerabilidadId', null)
            }}
            disabled={enviando}
            label="Paciente con vulnerabilidad social"
            descripcion="Adulto mayor, embarazada, persona con discapacidad u otra condición"
          />

          {form.esVulnerable && (
            <div className="mt-3 ml-7">
              <CampoFormulario
                label="Tipo de vulnerabilidad"
                required
                error={errors.tipoVulnerabilidadId}
              >
                <Select
                  value={form.tipoVulnerabilidadId?.toString() ?? ''}
                  onValueChange={(v) =>
                    actualizar('tipoVulnerabilidadId', Number(v))
                  }
                  disabled={enviando}
                >
                  <SelectTrigger
                    className={errors.tipoVulnerabilidadId ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VULNERABILIDAD.map((tv) => (
                      <SelectItem key={tv.id} value={tv.id.toString()}>
                        {tv.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CampoFormulario>
            </div>
          )}
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/medico')}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            onClick={enviar}
            disabled={enviando}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando…
              </>
            ) : (
              'Registrar solicitud'
            )}
          </Button>
        </div>
      </div>

      {/* Modal de éxito */}
      <Dialog
        open={solicitudCreada !== null}
        onOpenChange={(open) => !open && resetear()}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2
                className="w-8 h-8 text-green-600"
                strokeWidth={2}
              />
            </div>
            <DialogTitle className="text-center text-xl">
              Solicitud registrada
            </DialogTitle>
            <DialogDescription className="text-center">
              La solicitud quedó ingresada en la lista de espera.
            </DialogDescription>
          </DialogHeader>

          {solicitudCreada && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 my-2">
              <DatoModal label="Solicitud" valor={`#${solicitudCreada.id}`} />
              <DatoModal
                label="Especialidad"
                valor={solicitudCreada.especialidad}
              />
              <DatoModal
                label="Prioridad asignada"
                valor={
                  <span className="font-bold text-primary-700">
                    {solicitudCreada.prioridad} —{' '}
                    {labelPrioridad(solicitudCreada.prioridad)}
                  </span>
                }
              />
              <DatoModal
                label="Estado inicial"
                valor={solicitudCreada.estado}
              />
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" onClick={resetear} className="flex-1">
              Registrar otra
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/medico/lista')}
              className="flex-1"
            >
              Ver lista
            </Button>
            <Button
              onClick={() => navigate('/medico')}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              Ir al dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────

interface CampoFormularioProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

function CampoFormulario({
  label,
  required,
  error,
  hint,
  children,
}: CampoFormularioProps) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1 text-sm">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

function NivelUrgenciaButton({
  nivel,
  seleccionado,
  onClick,
  disabled,
}: {
  nivel: NivelUrgencia
  seleccionado: boolean
  onClick: () => void
  disabled?: boolean
}) {
  const colores: Record<NivelUrgencia, { activo: string; hint: string }> = {
    GES: {
      activo: 'border-red-500 bg-red-50 text-red-900',
      hint: 'Prioridad 1',
    },
    URGENTE: {
      activo: 'border-orange-500 bg-orange-50 text-orange-900',
      hint: 'Prioridad 2',
    },
    ELECTIVA: {
      activo: 'border-slate-400 bg-slate-50 text-slate-900',
      hint: 'Prioridad 3 o 4',
    },
  }

  const config = colores[nivel]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`
        px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all
        ${
          seleccionado
            ? config.activo
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div>{nivel}</div>
      <div className="text-[10px] font-normal opacity-70 mt-0.5">
        {config.hint}
      </div>
    </button>
  )
}

function CheckboxConLabel({
  checked,
  onCheckedChange,
  disabled,
  label,
  descripcion,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  label: string
  descripcion?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900">{label}</div>
        {descripcion && (
          <div className="text-xs text-slate-500 mt-0.5">{descripcion}</div>
        )}
      </div>
    </label>
  )
}

function DatoModal({
  label,
  valor,
}: {
  label: string
  valor: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{valor}</span>
    </div>
  )
}

function labelPrioridad(prioridad: number): string {
  switch (prioridad) {
    case 1:
      return 'GES'
    case 2:
      return 'Urgente'
    case 3:
      return 'Vulnerable'
    case 4:
      return 'Electiva'
    default:
      return 'Sin clasificar'
  }
}
