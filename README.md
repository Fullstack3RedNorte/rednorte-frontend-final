# RedNorte Frontend Final

Aplicación web orientada al usuario para la plataforma **RedNorte** de gestión
de listas de espera hospitalarias. Es la cara visible del sistema: permite que
**médicos** gestionen solicitudes de atención y que **pacientes** consulten el
estado de las suyas.

![Estado](https://img.shields.io/badge/estado-funcional-success)
![Versión](https://img.shields.io/badge/versión-1.0-blue)
![Licencia](https://img.shields.io/badge/licencia-académica-orange)

---

## Stack tecnológico

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Nova-000000)](https://ui.shadcn.com)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Axios](https://img.shields.io/badge/Axios-1.18-5A29E4?logo=axios&logoColor=white)](https://axios-http.com)

---

## Contexto académico

> **Curso:** Fullstack III · Sección 001D
> **Institución:** DuocUC · 2026
> **Docente:** Alejandro Sepúlveda
> **Equipo:** Hernán Briceño · Vicente Carrasco · Franco Reyes · José Valdés

Este repo es **uno de dos frontends** del proyecto:

| Frontend | Propósito |
|----------|-----------|
| [`rednorte-frontend`](https://github.com/Fullstack3RedNorte/rednorte-frontend) | Front orientado a pruebas técnicas — validar cada endpoint |
| **`rednorte-frontend-final`** (este) | Front orientado al usuario — diseño profesional |

Cada uno cumple un rol distinto y son complementarios.

---

## Características principales

### Para el médico

- **Dashboard** con KPIs en tiempo real (solicitudes por estado y prioridad)
- **Registrar nueva solicitud** con formulario validado por secciones
- **Lista de espera** con filtros, paginación y detalle expandible
- **Cambio de estado** con validación dinámica del State Pattern
  (solo muestra transiciones válidas según el estado actual)
- **Notificaciones toast** al confirmar acciones

### Para el paciente

- **Login simple por RUT** sin contraseña
- **Vista "Mis solicitudes"** con cards amigables y lenguaje natural
- **Detalle expandible** con historial en lenguaje no técnico
- **Persistencia de sesión** mediante `sessionStorage`

### Generales

- **Diseño responsive** (en desarrollo para mobile)
- **Identidad visual propia** con paleta personalizada
- **Manejo de errores empático** (mensajes en español al usuario)
- **Estados de carga** con skeletons en lugar de spinners genéricos
- **Página 404 personalizada**

---

## Arquitectura

```
┌──────────────────────────┐
│  Frontend (este repo)    │
│  http://localhost:5173   │
└────────────┬─────────────┘
             │ HTTP + CORS
             ▼
┌──────────────────────────┐
│  BFF Gateway             │
│  http://localhost:8090   │
└────────────┬─────────────┘
             │
   ┌─────────┼─────────┐
   ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────────┐
│ MS   │ │ MS   │ │ MS       │
│Lista │ │Portal│ │Notificac.│
└──┬───┘ └──┬───┘ └──────────┘
   │        │
   ▼        ▼ (consume Lista)
┌──────┐
│MySQL │
└──────┘
```

El frontend nunca habla directamente con los microservicios — todo pasa por
el **BFF Gateway** que orquesta las llamadas.

---

## Estructura del proyecto

```
src/
├── api/                        Clientes HTTP por dominio
│   ├── client.ts               axios + ApiResult<T> + manejo de errores
│   ├── especialidades.ts       Catálogo de especialidades
│   ├── solicitudes.ts          CRUD de solicitudes
│   ├── portal.ts               Endpoints del MS Portal Pacientes
│   └── tipos-vulnerabilidad.ts Catálogo hardcodeado
│
├── components/
│   ├── ui/                     Componentes shadcn (button, card, input, etc.)
│   └── medico/                 Componentes específicos del médico
│       ├── BadgeEstado.tsx
│       ├── CambiarEstadoDialog.tsx
│       ├── DetalleSheet.tsx
│       ├── KpiCard.tsx
│       └── MedicoLayout.tsx
│
├── pages/                      Páginas (rutas)
│   ├── Landing.tsx             Selector de rol (/)
│   ├── NotFound.tsx            Página 404
│   ├── medico/
│   │   ├── Dashboard.tsx       /medico
│   │   ├── NuevaSolicitud.tsx  /medico/registrar
│   │   └── ListaEspera.tsx     /medico/lista
│   └── paciente/
│       ├── PacienteLogin.tsx   /paciente
│       └── MisSolicitudes.tsx  /paciente/mis-solicitudes
│
├── lib/
│   ├── utils.ts                Helpers de shadcn (cn, etc.)
│   └── paciente-storage.ts     Helper sessionStorage
│
├── types/
│   └── api.ts                  Tipos espejo de los DTOs del backend
│
├── utils/
│   └── transiciones.ts         Lógica del State Pattern
│
├── App.tsx                     Configuración de rutas
├── main.tsx                    Entry point (BrowserRouter + Toaster)
└── index.css                   Tailwind + paleta RedNorte
```

---

## Cómo levantar el proyecto

### Pre-requisitos

- **Node.js 20+** y npm
- **Stack backend Docker** corriendo en `localhost:8090`
  (ver [`rednorte-docker-test`](https://github.com/Fullstack3RedNorte/rednorte-docker-test))

### Pasos

```bash
# 1. Clonar
git clone https://github.com/Fullstack3RedNorte/rednorte-frontend-final.git
cd rednorte-frontend-final

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar el servidor de desarrollo
npm run dev
```

El front abre en `http://localhost:5173/`.

### Verificación rápida

```bash
# Confirmar que el stack Docker está arriba
docker compose ps

# Probar que el BFF responde
curl http://localhost:8090/bff/lista-espera/especialidades
```

Si devuelve 4 especialidades en JSON, todo está conectado.

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_BFF_URL` | URL base del BFF Gateway | `http://localhost:8090` |

> Vite expone al frontend **solo** las variables que empiezan con `VITE_`.
> El archivo `.env` está en `.gitignore`. Usa `.env.example` como plantilla.

---

## Decisiones de diseño

### Identidad visual

Paleta personalizada con dos colores principales:

- **Primario (cyan-teal)** — médico, profesional, salud
- **Secundario (azul profundo)** — paciente, confianza institucional

Sin gradientes excesivos, espaciado generoso, esquinas redondeadas suaves,
sombras sutiles. Tipografía **Geist** (diseñada por Vercel).

### Discriminated unions para errores

Todas las llamadas al BFF devuelven un `ApiResult<T>`:

```ts
type ApiResult<T> =
  | { ok: true;  data: T;     status: number }
  | { ok: false; error: string; status: number | null }
```

Esto evita usar `try/catch` en los componentes y permite manejar éxito y
error de forma declarativa con `if (result.ok)`.

### Mensajes de error empáticos

El cliente `axios` traduce los errores técnicos a mensajes en español
para el usuario final:

| Situación | Mensaje al usuario |
|-----------|-------------------|
| Backend caído | "No se pudo conectar con el servidor..." |
| Timeout | "El servidor está tardando demasiado..." |
| 503 | "El servicio no está disponible temporalmente..." |
| 404 | "El recurso solicitado no existe." |
| Otros | Usa el mensaje del backend si lo provee |

### State Pattern en el cliente

El archivo `utils/transiciones.ts` replica las reglas de transición del
backend. Esto permite que el `<Select>` de cambio de estado **solo muestre
opciones válidas** según el estado actual. UX consistente con la lógica
del servidor.

### Vistas diferenciadas por rol

**Médico:** layout con sidebar, tablas densas, badges técnicos, lenguaje
profesional ("Estado: CITADO", "Prioridad 1").

**Paciente:** cards amigables con lenguaje natural ("Tu cita: 15 de julio"),
sin números técnicos, sin información del personal médico. Es la diferencia
clave entre un sistema interno y uno orientado al ciudadano.

### Persistencia del paciente

Se usa `sessionStorage` (no `localStorage`) para:
- Sobrevivir a un refresh accidental
- Borrarse al cerrar la pestaña (no compartir entre usuarios del mismo PC)
- Evitar tener que envolver toda la app en un Context Provider

> **NOTA:** esto **NO es autenticación real**. Es solo persistencia del RUT
> consultado. El backend tampoco valida ownership por ahora — está documentado
> como deuda técnica.

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Build de producción → dist/
npm run preview   # Previsualiza el build localmente
npm run lint      # ESLint
```

---

## Deudas técnicas

Las mismas documentadas en el documento "Historias de Usuario v2.1" del
proyecto general. Resumen de lo relevante para el front:

- **MS Reasignación no implementado** — las HU-04/05/06/07 (gestión de
  agenda, cancelaciones, reasignaciones) están fuera del alcance académico.
- **Sin autenticación real** — el médico no se loguea; el paciente se
  identifica solo con RUT. La autenticación con JWT está documentada como
  futura.
- **Tipos de vulnerabilidad hardcodeados** — el backend no expone endpoint
  GET para listarlos.
- **Responsive mobile parcial** — el landing y el dashboard tienen mejoras
  pendientes para pantallas pequeñas.
- **Sin tests del frontend** — no hay tests automatizados de los componentes.

---

## Capturas

> Las capturas se agregarán en una próxima iteración.

---

## Repositorios del proyecto

| Repo | Función |
|------|---------|
| [`MS-ListaEspera`](https://github.com/Fullstack3RedNorte/MS-ListaEspera) | Microservicio principal |
| [`MS-PortalPacientes`](https://github.com/Fullstack3RedNorte/MS-PortalPacientes) | Endpoints públicos para pacientes |
| [`MS-Notificaciones`](https://github.com/Fullstack3RedNorte/MS-Notificaciones) | Consumer RabbitMQ |
| [`BFF-Gateway`](https://github.com/Fullstack3RedNorte/BFF-Gateway) | Punto de entrada único |
| [`rednorte-docker-test`](https://github.com/Fullstack3RedNorte/rednorte-docker-test) | Orquestador Docker |
| [`rednorte-frontend`](https://github.com/Fullstack3RedNorte/rednorte-frontend) | Frontend de pruebas técnicas |
| **`rednorte-frontend-final`** | Frontend orientado al usuario (este) |

---

## Licencia

Proyecto académico — DuocUC 2026.
