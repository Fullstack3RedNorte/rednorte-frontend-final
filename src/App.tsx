import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { MedicoLayout } from '@/components/medico/MedicoLayout'
import { Dashboard } from '@/pages/medico/Dashboard'
import { NuevaSolicitud } from '@/pages/medico/NuevaSolicitud'
import { ListaEspera } from '@/pages/medico/ListaEspera'
import { PacienteLogin } from '@/pages/paciente/PacienteLogin'
import { MisSolicitudes } from '@/pages/paciente/MisSolicitudes'

/**
 * Definición de rutas de la aplicación.
 *
 * Estado actual (Iteración 6):
 *   /                              → Landing
 *   /medico                        → MedicoLayout
 *     ├─ /                         → Dashboard
 *     ├─ /registrar                → NuevaSolicitud
 *     └─ /lista                    → ListaEspera
 *   /paciente                      → PacienteLogin
 *   /paciente/mis-solicitudes      → MisSolicitudes
 *
 * Las 5 HUs implementadas en el front de pruebas ahora tienen
 * vistas finales orientadas al usuario.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Médico */}
      <Route path="/medico" element={<MedicoLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registrar" element={<NuevaSolicitud />} />
        <Route path="lista" element={<ListaEspera />} />
      </Route>

      {/* Paciente */}
      <Route path="/paciente" element={<PacienteLogin />} />
      <Route path="/paciente/mis-solicitudes" element={<MisSolicitudes />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
