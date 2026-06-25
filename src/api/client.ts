import axios, { AxiosError } from 'axios'

/**
 * Cliente HTTP centralizado para llamar al BFF Gateway.
 *
 * - baseURL viene de la variable de entorno VITE_BFF_URL.
 * - timeout de 10 segundos para evitar que la UI se cuelgue.
 * - Content-Type JSON por default.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Resultado de una llamada a la API en formato "discriminated union":
 * o salió bien (ok), o salió mal (error).
 */
export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number | null }

/**
 * Categoriza el error de axios y devuelve un mensaje en español
 * orientado al usuario final (no técnico).
 */
function traducirError(err: AxiosError): { mensaje: string; status: number | null } {
  // 1. Sin respuesta del servidor → problema de red o backend caído
  if (!err.response) {
    if (err.code === 'ECONNABORTED') {
      return {
        mensaje:
          'El servidor está tardando demasiado en responder. Por favor intenta de nuevo en unos segundos.',
        status: null,
      }
    }
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
      return {
        mensaje:
          'No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.',
        status: null,
      }
    }
    return {
      mensaje: 'No se pudo establecer comunicación con el servidor.',
      status: null,
    }
  }

  // 2. Respuesta con código HTTP de error
  const status = err.response.status
  const backendMessage = (err.response.data as { message?: string } | undefined)
    ?.message

  // Si el backend mandó mensaje específico, lo usamos
  if (backendMessage) {
    return { mensaje: backendMessage, status }
  }

  // Mensajes genéricos según código HTTP
  switch (status) {
    case 400:
      return { mensaje: 'Los datos enviados no son válidos.', status }
    case 401:
      return { mensaje: 'No tienes autorización para esta acción.', status }
    case 403:
      return { mensaje: 'No tienes permisos para acceder a este recurso.', status }
    case 404:
      return { mensaje: 'El recurso solicitado no existe.', status }
    case 422:
      return {
        mensaje:
          'La solicitud no cumple con las reglas de validación del sistema.',
        status,
      }
    case 500:
      return {
        mensaje: 'Ocurrió un error interno del servidor. Intenta de nuevo más tarde.',
        status,
      }
    case 502:
    case 503:
    case 504:
      return {
        mensaje:
          'El servicio no está disponible temporalmente. Por favor intenta más tarde.',
        status,
      }
    default:
      return {
        mensaje: `Error inesperado (código ${status}). Si el problema persiste, contacta a soporte.`,
        status,
      }
  }
}

/**
 * Ejecuta una llamada axios y la envuelve en un ApiResult<T>.
 */
export async function safeRequest<T>(
  request: () => Promise<{ data: T; status: number }>
): Promise<ApiResult<T>> {
  try {
    const response = await request()
    return { ok: true, data: response.data, status: response.status }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const { mensaje, status } = traducirError(err)
      return { ok: false, error: mensaje, status }
    }
    return {
      ok: false,
      error: 'Ocurrió un error inesperado. Intenta de nuevo.',
      status: null,
    }
  }
}
