import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Hospital,
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  LogOut,
  Bell,
  Settings,
} from 'lucide-react'

/**
 * Layout principal de la sección médico.
 *
 * Estructura:
 *   ┌────────────────────────────────────┐
 *   │ Header (logo + usuario)            │
 *   ├──────────┬─────────────────────────┤
 *   │ Sidebar  │  <Outlet />             │
 *   │ navegac. │  (Dashboard, lista...)  │
 *   └──────────┴─────────────────────────┘
 *
 * Las páginas hijas se renderizan dentro de <Outlet />.
 */
export function MedicoLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <Hospital className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">RedNorte</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight">
              Panel médico
            </div>
          </div>
        </div>

        {/* Espaciador */}
        <div className="flex-1" />

        {/* Iconos del header */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <Bell className="w-5 h-5" strokeWidth={1.8} />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <Settings className="w-5 h-5" strokeWidth={1.8} />
          </button>

          <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center">
              DR
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-semibold text-slate-900 leading-tight">
                Dr. Funcionario
              </div>
              <div className="text-xs text-slate-500 leading-tight">
                RUT 11111111-1
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO: sidebar + main */}
      <div className="flex-1 flex">
        {/* SIDEBAR */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <nav className="flex-1 py-5 px-3 space-y-1">
            <SidebarItem
              to="/medico"
              end
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <SidebarItem
              to="/medico/registrar"
              icon={PlusCircle}
              label="Nueva solicitud"
            />
            <SidebarItem
              to="/medico/lista"
              icon={ListChecks}
              label="Lista de espera"
            />
          </nav>

          {/* Footer del sidebar */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.8} />
              <span>Cambiar de rol</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Item del sidebar (NavLink con estilo activo)
// ──────────────────────────────────────────────────────────────

interface SidebarItemProps {
  to: string
  end?: boolean
  icon: typeof Hospital
  label: string
}

function SidebarItem({ to, end, icon: Icon, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-600 hover:bg-slate-100'
        }`
      }
    >
      <Icon className="w-4 h-4" strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  )
}
