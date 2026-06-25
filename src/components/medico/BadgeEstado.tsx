import { Badge } from '@/components/ui/badge'
import type { EstadoSolicitud } from '@/types/api'

interface BadgeEstadoProps {
  estado: EstadoSolicitud
}

const ESTADOS_CONFIG: Record<EstadoSolicitud, { label: string; clases: string }> = {
  EN_ESPERA: {
    label: 'En espera',
    clases: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  },
  CITADO: {
    label: 'Citado',
    clases: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200',
  },
  ATENDIDO: {
    label: 'Atendido',
    clases: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  },
  AUSENTE: {
    label: 'Ausente',
    clases: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
  },
  CERRADO: {
    label: 'Cerrado',
    clases: 'bg-slate-200 text-slate-700 hover:bg-slate-200 border-slate-300',
  },
  ANULADO: {
    label: 'Anulado',
    clases: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
  },
  DERIVADO: {
    label: 'Derivado',
    clases: 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200',
  },
  VENCIDO: {
    label: 'Vencido',
    clases: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200',
  },
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const config = ESTADOS_CONFIG[estado]
  return (
    <Badge variant="outline" className={config.clases}>
      {config.label}
    </Badge>
  )
}

interface BadgePrioridadProps {
  prioridad: number
}

export function BadgePrioridad({ prioridad }: BadgePrioridadProps) {
  const configs: Record<number, { label: string; clases: string }> = {
    1: { label: 'GES', clases: 'bg-red-100 text-red-800 border-red-200' },
    2: { label: 'Urgente', clases: 'bg-orange-100 text-orange-800 border-orange-200' },
    3: { label: 'Vulnerable', clases: 'bg-amber-100 text-amber-800 border-amber-200' },
    4: { label: 'Electiva', clases: 'bg-slate-100 text-slate-700 border-slate-300' },
  }
  const config = configs[prioridad] ?? configs[4]
  return (
    <Badge variant="outline" className={config.clases}>
      P{prioridad} {config.label}
    </Badge>
  )
}
