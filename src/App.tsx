import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { PacientePlaceholder } from '@/pages/PacientePlaceholder'
import { MedicoLayout } from '@/components/medico/MedicoLayout'
import { Dashboard } from '@/pages/medico/Dashboard'
import { NuevaSolicitud } from '@/pages/medico/NuevaSolicitud'
import { ListaEsperaPlaceholder } from '@/pages/medico/PaginasPlaceholder'

/**
 * Definición de rutas de la aplicación.
 *
 * Estado actual (Iteración 4):
 *   /                       → Landing (selector de rol)
 *   /medico                 → MedicoLayout
 *     ├─ /                  → Dashboard
 *     ├─ /registrar         → NuevaSolicitud (HU-01)
 *     └─ /lista             → Placeholder (Iteración 5)
 *   /paciente               → Placeholder (Iteración 6)
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/medico" element={<MedicoLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registrar" element={<NuevaSolicitud />} />
        <Route path="lista" element={<ListaEsperaPlaceholder />} />
      </Route>

      <Route path="/paciente/*" element={<PacientePlaceholder />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
