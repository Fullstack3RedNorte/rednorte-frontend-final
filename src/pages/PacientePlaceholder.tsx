import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User } from 'lucide-react'

/**
 * Placeholder temporal del portal del paciente.
 * Se reemplaza por el login y vista real en la Iteración 6.
 */
export function PacientePlaceholder() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-secondary-600 items-center justify-center mb-6 text-white">
          <User className="w-9 h-9" strokeWidth={1.8} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Portal del paciente
        </h1>
        <p className="text-slate-600 mb-8">
          Esta sección se construye en una iteración posterior. Aquí el paciente
          ingresará su RUT y podrá consultar el estado de sus solicitudes.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
