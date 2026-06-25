import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Stethoscope } from 'lucide-react'

/**
 * Placeholder temporal del panel médico.
 * Se reemplaza por el Layout y Dashboard reales en la Iteración 3.
 */
export function MedicoPlaceholder() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary-600 items-center justify-center mb-6 text-white">
          <Stethoscope className="w-9 h-9" strokeWidth={1.8} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Panel del médico
        </h1>
        <p className="text-slate-600 mb-8">
          Esta sección se construye en la próxima iteración. Aquí estará el dashboard
          con KPIs, lista de espera y registro de solicitudes.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
