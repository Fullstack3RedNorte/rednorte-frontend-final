import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { PacientePlaceholder } from '@/pages/PacientePlaceholder'
import { MedicoLayout } from '@/components/medico/MedicoLayout'
import { Dashboard } from '@/pages/medico/Dashboard'
import { NuevaSolicitud } from '@/pages/medico/NuevaSolicitud'
import { ListaEspera } from '@/pages/medico/ListaEspera'

/**
 * Definición de rutas de la aplicación.
 *
 * Estado actual (Iteración 5):
 *   /                       → Landing
 *   /medico                 → MedicoLayout
 *     ├─ /                  → Dashboard
 *     ├─ /registrar         → NuevaSolicitud (HU-01)
 *     └─ /lista             → ListaEspera (HU-02 + HU-03 combinadas)
 *   /paciente               → Placeholder (Iteración 6)
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/medico" element={<MedicoLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registrar" element={<NuevaSolicitud />} />
        <Route path="lista" element={<ListaEspera />} />
      </Route>

      <Route path="/paciente/*" element={<PacientePlaceholder />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
