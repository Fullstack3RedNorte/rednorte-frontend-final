import { Link } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página 404 mostrada cuando el usuario navega a una ruta inexistente.
 * Reemplaza el Navigate to="/" silencioso que estaba antes.
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="inline-flex w-20 h-20 rounded-2xl bg-white shadow-lg items-center justify-center mb-6 text-primary-600">
          <FileQuestion className="w-10 h-10" strokeWidth={1.6} />
        </div>

        <div className="text-7xl font-bold text-primary-700 mb-2 tracking-tight">
          404
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Página no encontrada
        </h1>

        <p className="text-slate-600 mb-8">
          La página que intentas visitar no existe o fue movida.
          Verifica la dirección o vuelve al inicio.
        </p>

        <Button asChild className="bg-primary-600 hover:bg-primary-700">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
