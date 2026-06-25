import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { PacientePlaceholder } from '@/pages/PacientePlaceholder'
import { MedicoLayout } from '@/components/medico/MedicoLayout'
import { Dashboard } from '@/pages/medico/Dashboard'
import {
  NuevaSolicitudPlaceholder,
  ListaEsperaPlaceholder,
} from '@/pages/medico/PaginasPlaceholder'

/**
 * Definición de rutas de la aplicación.
 *
 * Estado actual (Iteración 3):
 *   /                       → Landing (selector de rol)
 *   /medico                 → MedicoLayout
 *     ├─ /                  → Dashboard
 *     ├─ /registrar         → Placeholder (Iteración 4)
 *     └─ /lista             → Placeholder (Iteración 5)
 *   /paciente               → Placeholder (Iteración 6)
 *
 * Cualquier ruta desconocida redirige al inicio.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Rutas anidadas del médico */}
      <Route path="/medico" element={<MedicoLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registrar" element={<NuevaSolicitudPlaceholder />} />
        <Route path="lista" element={<ListaEsperaPlaceholder />} />
      </Route>

      <Route path="/paciente/*" element={<PacientePlaceholder />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
