import { Construction } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface PlaceholderProps {
  titulo: string
  descripcion: string
  iteracion: string
}

export function PaginaPlaceholder({
  titulo,
  descripcion,
  iteracion,
}: PlaceholderProps) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">{titulo}</h1>
        <p className="text-slate-600">{descripcion}</p>
      </header>

      <Card className="p-12 text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-100 items-center justify-center mb-4 text-amber-700">
          <Construction className="w-7 h-7" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          En construcción
        </h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Esta página se implementa en la <strong>{iteracion}</strong>.
        </p>
      </Card>
    </div>
  )
}

export function NuevaSolicitudPlaceholder() {
  return (
    <PaginaPlaceholder
      titulo="Nueva solicitud"
      descripcion="Registrar una nueva solicitud de atención médica."
      iteracion="Iteración 4"
    />
  )
}

export function ListaEsperaPlaceholder() {
  return (
    <PaginaPlaceholder
      titulo="Lista de espera"
      descripcion="Consultar y gestionar las solicitudes en lista de espera."
      iteracion="Iteración 5"
    />
  )
}
