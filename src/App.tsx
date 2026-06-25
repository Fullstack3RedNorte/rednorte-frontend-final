import { Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'
import { MedicoLayout } from '@/components/medico/MedicoLayout'
import { Dashboard } from '@/pages/medico/Dashboard'
import { NuevaSolicitud } from '@/pages/medico/NuevaSolicitud'
import { ListaEspera } from '@/pages/medico/ListaEspera'
import { PacienteLogin } from '@/pages/paciente/PacienteLogin'
import { MisSolicitudes } from '@/pages/paciente/MisSolicitudes'

/**
 * Definición de rutas de la aplicación (versión final).
 *
 *   /                              → Landing
 *   /medico                        → MedicoLayout
 *     ├─ /                         → Dashboard
 *     ├─ /registrar                → NuevaSolicitud
 *     └─ /lista                    → ListaEspera
 *   /paciente                      → PacienteLogin
 *   /paciente/mis-solicitudes      → MisSolicitudes
 *   *                              → NotFound (404)
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

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
