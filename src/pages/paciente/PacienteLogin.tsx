import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { guardarRutPaciente } from '@/lib/paciente-storage'

/**
 * Pantalla de "ingreso" del paciente.
 *
 * NO es un login real (el backend no autentica pacientes), solo es la
 * forma de capturar el RUT que se va a usar para consultar las solicitudes.
 */
export function PacienteLogin() {
  const navigate = useNavigate()
  const [rut, setRut] = useState('')
  const [error, setError] = useState<string | null>(null)

  function entrar() {
    const rutLimpio = rut.trim()

    if (!rutLimpio) {
      setError('Por favor ingresa tu RUT para continuar')
      return
    }

    if (!/^\d{7,8}-[\dkK]$/.test(rutLimpio)) {
      setError('El RUT debe tener el formato 12345678-9')
      return
    }

    guardarRutPaciente(rutLimpio)
    navigate('/paciente/mis-solicitudes')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-600 via-blue-700 to-secondary-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        {/* Tarjeta principal */}
        <Card className="p-8 bg-white shadow-2xl">
          {/* Header con icono */}
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-secondary-600 items-center justify-center mb-4 shadow-lg shadow-secondary-600/30">
              <User className="w-9 h-9 text-white" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Portal del paciente
            </h1>
            <p className="text-sm text-slate-600">
              Consulta el estado de tus solicitudes de atención
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="rut-paciente" className="mb-1.5 block">
                Tu RUT
              </Label>
              <Input
                id="rut-paciente"
                value={rut}
                onChange={(e) => {
                  setRut(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && entrar()}
                placeholder="12345678-9"
                className={error ? 'border-red-500' : ''}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Sin puntos, con guion y dígito verificador
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={entrar}
              className="w-full bg-secondary-600 hover:bg-secondary-700 text-white"
              size="lg"
            >
              Consultar mis solicitudes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Ayuda */}
        <div className="mt-6 text-center text-sm text-white/80">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Phone className="w-4 h-4" />
            <span>¿Necesitas ayuda?</span>
          </div>
          <p className="text-white/60">
            Llama al <span className="font-semibold">600 360 7777</span>
          </p>
        </div>
      </div>
    </div>
  )
}
