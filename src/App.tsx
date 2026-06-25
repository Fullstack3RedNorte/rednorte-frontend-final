import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary-700">RedNorte</h1>
        <p className="text-slate-600">Plataforma de gestión de listas de espera</p>
        <Button>Hola desde shadcn/ui</Button>
      </div>
    </div>
  )
}

export default App