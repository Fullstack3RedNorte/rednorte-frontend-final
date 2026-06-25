import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { MedicoPlaceholder } from '@/pages/MedicoPlaceholder'
import { PacientePlaceholder } from '@/pages/PacientePlaceholder'

/**
 * Definición de rutas de la aplicación.
 *
 * Estado actual (Iteración 2):
 *   /            → Landing (selector de rol)
 *   /medico      → Placeholder (se reemplaza en Iteración 3)
 *   /paciente    → Placeholder (se reemplaza en Iteración 6)
 *
 * Cualquier ruta desconocida redirige al inicio.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/medico/*" element={<MedicoPlaceholder />} />
      <Route path="/paciente/*" element={<PacientePlaceholder />} />
      {/* Catch-all: cualquier ruta no definida vuelve al landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
