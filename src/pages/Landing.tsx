import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, User, ArrowRight, Hospital } from 'lucide-react'

/**
 * Landing principal de RedNorte.
 *
 * Punto de entrada de la aplicación. Le permite al usuario
 * identificarse según su rol (médico o paciente) para acceder
 * a la sección correspondiente.
 */
export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Logo y encabezado */}
        <header className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-6 shadow-lg shadow-primary-600/30">
            <Hospital className="w-9 h-9 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-3 tracking-tight">
            RedNorte
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto">
            Plataforma de gestión de listas de espera hospitalarias.
            <span className="block mt-1 text-slate-500 text-sm md:text-base">
              Ingrese según su rol para continuar.
            </span>
          </p>
        </header>

        {/* Selector de rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          <RoleCard
            icon={<Stethoscope className="w-8 h-8" strokeWidth={1.8} />}
            iconBg="bg-primary-600"
            title="Soy médico"
            description="Gestionar solicitudes de atención, lista de espera y citas de pacientes."
            actionLabel="Ingresar al panel médico"
            onClick={() => navigate('/medico')}
          />

          <RoleCard
            icon={<User className="w-8 h-8" strokeWidth={1.8} />}
            iconBg="bg-secondary-600"
            title="Soy paciente"
            description="Consultar el estado de mis solicitudes de atención usando mi RUT."
            actionLabel="Ingresar al portal del paciente"
            onClick={() => navigate('/paciente')}
          />
        </div>

        {/* Stack tecnológico */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
            Construido con
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            <TechBadge>React 19</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Tailwind v4</TechBadge>
            <TechBadge>shadcn/ui</TechBadge>
            <TechBadge>Spring Boot</TechBadge>
            <TechBadge>MySQL</TechBadge>
            <TechBadge>RabbitMQ</TechBadge>
            <TechBadge>Docker</TechBadge>
          </div>
        </div>

        {/* Footer institucional */}
        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>Hospital del Norte · DuocUC · Fullstack III · 2026</p>
          <p className="mt-1 text-xs text-slate-400">
            Proyecto académico de gestión hospitalaria
          </p>
        </footer>
      </div>
    </div>
  )
}

interface RoleCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  actionLabel: string
  onClick: () => void
}

function RoleCard({
  icon,
  iconBg,
  title,
  description,
  actionLabel,
  onClick,
}: RoleCardProps) {
  return (
    <Card
      onClick={onClick}
      className="
        group cursor-pointer
        p-6 md:p-8
        border-2 border-slate-200
        hover:border-primary-500 hover:shadow-xl hover:shadow-primary-200/40
        transition-all duration-200
        bg-white
      "
    >
      <div className={`inline-flex w-14 h-14 rounded-xl ${iconBg} items-center justify-center mb-5 text-white shadow-md`}>
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>

      <p className="text-slate-600 text-sm leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex items-center text-sm font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">
        <span>{actionLabel}</span>
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </div>
    </Card>
  )
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
    >
      {children}
    </Badge>
  )
}
