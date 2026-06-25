import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  /** Etiqueta corta de la métrica (ej: "En espera") */
  label: string
  /** Valor numérico principal */
  value: number | null
  /** Subtítulo informativo (ej: "↑ 2 hoy") */
  hint?: string
  /** Icono de Lucide a mostrar arriba a la derecha */
  icon?: LucideIcon
  /** Color de acento del card (tailwind class, ej: "text-primary-600") */
  accentColor?: string
  /** Si está true, muestra skeleton mientras carga */
  loading?: boolean
}

/**
 * Card pequeña para mostrar un KPI numérico.
 * Se usa en el dashboard del médico.
 */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accentColor = 'text-primary-600',
  loading = false,
}: KpiCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`${accentColor} opacity-70`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-9 w-20" />
      ) : (
        <div className="text-3xl font-bold text-slate-900 leading-none">
          {value ?? '—'}
        </div>
      )}

      {hint && !loading && (
        <p className="text-xs text-slate-500 mt-2">{hint}</p>
      )}
    </Card>
  )
}
