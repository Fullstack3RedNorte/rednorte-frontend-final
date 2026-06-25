# Guía de presentación — Proyecto RedNorte

> Documento de uso interno del equipo.
> Orden sugerido, tiempos estimados y tips para defender el proyecto.

---

## Antes de empezar (5 min de preparación)

**Levantar todo el stack en este orden:**

```bash
# 1. Backend Docker
cd rednorte-docker-test
docker compose up -d
docker compose ps  # verificar que estén "Up" + healthy

# 2. Esperar 30-40s a que arranquen los MS

# 3. Verificar BFF responde
curl http://localhost:8090/bff/lista-espera/especialidades

# 4. Frontend de pruebas
cd ../rednorte-frontend
npm run dev  # abre en :5173

# 5. (En otra terminal) Frontend final
cd ../rednorte-frontend-final
npm run dev  # también en :5173 — usar puerto distinto: npm run dev -- --port 5174
```

**Tener abierto y listo:**

- Pestaña 1: `http://localhost:5173` → front de pruebas
- Pestaña 2: `http://localhost:5174` → front final
- Pestaña 3: Postman con la colección lista
- Pestaña 4: GitHub con los repos abiertos
- Pestaña 5: documento de HU v2.1 (.docx)
- Postman test de salud: `GET http://localhost:8090/bff/lista-espera/especialidades`

---

## Orden de presentación sugerido (15-20 min)

### 1. Contexto del proyecto (2 min)

Empezar con el **problema de negocio**, no con la tecnología:

> "Las listas de espera hospitalarias son un problema crítico de salud
> pública en Chile. Nuestro sistema permite gestionarlas de forma
> centralizada, priorizando por criterios clínicos (GES, urgencia,
> vulnerabilidad social) y dándole visibilidad tanto a médicos como
> a pacientes."

Mencionar:
- 4 microservicios + BFF
- 5 historias de usuario implementadas (de 9 totales)
- 2 frontends complementarios

### 2. Arquitectura (3 min)

Mostrar el diagrama de arquitectura (del README del docker-test o de las HU v2.1).

Puntos a destacar:
- **BFF Gateway** como punto único de entrada → el front nunca habla
  directamente con los MS
- **Comunicación asíncrona** entre MS Lista de Espera y MS Notificaciones
  vía RabbitMQ (publishers pendientes, documentado como deuda técnica honesta)
- **Persistencia separada** — cada MS tiene su esquema
- **Docker Hub** para distribución — el equipo descarga imágenes, no compila

### 3. Demo del frontend FINAL (8 min) — la estrella

> Este es el flujo que más impacta visualmente. Mantenerlo fluido.

**Paso 1 — Landing (30 seg)**
- Abrir `http://localhost:5174/`
- Mostrar el diseño: paleta personalizada, identidad RedNorte
- "El sistema atiende a 2 tipos de usuarios..."

**Paso 2 — Vista del médico (4 min)**
- Click "Soy médico" → llega al dashboard
- **Dashboard:** mostrar los KPIs en tiempo real
  > "Estos números se calculan en el cliente desde los datos
  > reales del backend. No son simulados."
- **Nueva solicitud:** llenar el formulario con un caso GES
  > "El formulario tiene validaciones del lado del cliente para
  > evitar errores antes de llegar al backend"
- Mostrar el modal de éxito → click "Ver lista"
- **Lista de espera:** mostrar filtros, click en una solicitud
  > "Aquí el médico ve el detalle completo y puede cambiar
  > el estado"
- Click "Cambiar estado" → mostrar que **solo aparecen
  transiciones válidas** según el estado actual
  > "Esto refleja el State Pattern implementado en el backend.
  > El frontend conoce las reglas y previene errores antes
  > de enviar."
- Confirmar el cambio → mostrar el toast de éxito

**Paso 3 — Vista del paciente (2 min)**
- Click "Cambiar de rol" → vuelve a landing
- Click "Soy paciente"
- Ingresar RUT `12345678-9`
- Mostrar las solicitudes con lenguaje natural
  > "Notar que el paciente NO ve información técnica:
  > no hay códigos de estado, no hay RUT del funcionario,
  > no hay prioridad numérica. Solo lo que le importa."
- Expandir el historial → mostrar el lenguaje empático
  > "'Tu solicitud fue registrada', 'Se te asignó una fecha de cita'
  > en lugar de 'Estado: CITADO'"

**Paso 4 — 404 y manejo de errores (30 seg)**
- Ir a una URL inexistente: `/xyz` → mostrar la 404 personalizada
- (Opcional, si tenés tiempo) Bajar el backend con `docker compose stop bff-gateway`
  → recargar el dashboard → mostrar el mensaje empático

### 4. Demo del frontend de PRUEBAS (3 min)

> El propósito acá es demostrar **rigor técnico**, no diseño.

- Abrir el front de pruebas en `:5173`
- Ir a HU-01
- Disparar los 7 escenarios uno por uno
  > "Aquí validamos cada caso de uso del backend: los 4 happy
  > paths (GES, URGENTE, VULNERABLE, ELECTIVA) y los 3 casos
  > negativos (404 especialidad, 404 tipo vulnerabilidad, 400
  > campos faltantes)"
- Mostrar el badge verde "201" para cada éxito
- Mostrar los códigos HTTP coloreados

> "Este front es nuestro 'banco de pruebas'. Es lo que usamos
> para validar end-to-end durante el desarrollo. El otro
> frontend está pensado para usuarios reales."

### 5. Pruebas unitarias del backend (2 min)

- Abrir GitHub → `MS-ListaEspera` → carpeta de tests
- Mostrar:
  - `SolicitudServiceImplTest.java` — pruebas de lógica
  - `SolicitudControllerTest.java` — pruebas con `@WebMvcTest` + `@MockitoBean`
- Mencionar el fix del falso positivo:
  > "Detectamos que un test asignaba el valor esperado
  > en el mock, así que pasaba por casualidad y no validaba
  > la lógica real. Lo refactorizamos con `ArgumentCaptor`
  > para que valide la entidad real que llega al `save()`."

- Mostrar el reporte de JaCoCo del Portal (95% de cobertura)

### 6. Cierre — Honestidad técnica (1 min)

> "Queremos ser transparentes con lo que **no** está hecho..."

Mencionar las deudas técnicas (vienen en las HU v2.1):
1. MS Reasignación no implementado → HU-04/05/06/07 fuera del alcance
2. Autenticación JWT desactivada en MS → usuario "11111111-1" hardcodeado
3. Publishers RabbitMQ pendientes → las notificaciones aún no salen del MS Lista
4. Ownership del RUT no validado en Portal → privacidad pendiente

> "Estas deudas están documentadas en el apéndice de las
> historias de usuario v2.1. Son decisiones conscientes
> de alcance, no descuidos."

---

## Preguntas frecuentes y cómo responderlas

### "¿Por qué dos frontends?"

> "Cumplen propósitos distintos. El front de pruebas es nuestra
> herramienta de validación técnica: muestra códigos HTTP, escenarios
> negativos, todo el detalle técnico. El front final es la cara
> visible del producto, optimizada para usuarios reales sin
> conocimiento técnico. Tener ambos demuestra que entendemos
> la diferencia entre 'que funcione' y 'que sea usable'."

### "¿Por qué TypeScript en el front?"

> "Los DTOs del backend están fuertemente tipados en Java.
> Tener tipos espejo en TypeScript nos da autocompletado y
> detecta inconsistencias en tiempo de compilación. Si el
> backend cambia un campo, TypeScript marca todos los lugares
> del front que se rompen."

### "¿Por qué microservicios para un proyecto así?"

> "Es un requerimiento académico del curso. Para una aplicación
> real de este tamaño un monolito modular sería más eficiente.
> El valor de los microservicios aquí es **didáctico**: nos
> permite aprender comunicación entre servicios, BFF Pattern,
> mensajería asíncrona y orquestación con Docker."

### "¿Qué pasa si se cae un microservicio?"

> "El BFF está configurado con Resilience4j (Circuit Breaker)
> para no propagar fallas. Si MS Lista de Espera cae, el front
> recibe un 503 con mensaje empático en español ('El servicio
> no está disponible temporalmente'). El MS Portal funciona
> de forma autónoma porque solo consume Lista de Espera para
> casos específicos."

### "¿Cómo funciona el cálculo de prioridad?"

> "Es un árbol de decisión:
> - Si es GES → prioridad 1
> - Si es URGENTE (no GES) → prioridad 2
> - Si es vulnerable (no GES, no URGENTE) → prioridad 3
> - El resto → prioridad 4 (ELECTIVA)
>
> El cálculo está en `SolicitudServiceImpl.calcularPrioridad()`
> y está cubierto por tests con `ArgumentCaptor` que validan
> el valor real, no un mock."

### "¿El paciente NO se autentica?"

> "Hoy se identifica solo con su RUT. Esto es una decisión de
> alcance del semestre. En producción, la autenticación del
> paciente sería por ClaveÚnica del Estado o similar. Lo
> tenemos documentado como deuda técnica explícita."

### "¿Por qué Geist y no Inter?"

> "Geist es la tipografía diseñada por Vercel específicamente
> para interfaces. Reemplazó a Inter como default en shadcn/ui
> en su preset Nova. Es más legible en pantallas pequeñas y
> tiene mejor contraste para datos numéricos."

---

## Lo que NO conviene mostrar

- **NO** intentes explicar TODO el código fuente. La presentación
  es de **arquitectura y decisiones**, no de líneas.

- **NO** muestres errores en consola del navegador "en vivo"
  a menos que sea para demostrar algo. Si tu front tiene
  warnings, abrí F12 ANTES y limpiá.

- **NO** prometas funcionalidades que están como deuda técnica.
  Si te preguntan por reasignaciones, decí: "está fuera del alcance
  académico, documentado en las HU v2.1".

- **NO** entres en debate sobre micro-optimizaciones. Si el profe
  sugiere algo (ej: "podrían usar React Query"), agradecé y
  toma nota — no defiendas la decisión.

---

## Checklist final pre-presentación

```
[ ] Docker stack arriba y verificado con docker compose ps
[ ] BFF responde con curl al endpoint de especialidades
[ ] Front de pruebas levantado en :5173
[ ] Front final levantado en :5174
[ ] Postman con la colección abierta
[ ] Pestañas de GitHub abiertas con los 7 repos
[ ] HU v2.1 .docx listo para mostrar
[ ] Diagrama de arquitectura listo (impreso o digital)
[ ] Repaso de los 4 RUTs ficticios:
    - 12345678-9 (Cardiología EN_ESPERA)
    - 11222333-4 (Traumatología CITADA)
    - 33444555-6 (Cardiología ATENDIDA)
    - 99999999-9 (sin solicitudes — para mostrar caso vacío)
[ ] Probar todo el flujo una vez en privado antes de presentar
[ ] Llevar un cable adaptador HDMI/USB-C por si las moscas
[ ] No usar WiFi de la universidad — usar mobile hotspot si hace falta
```

---

## Plan B si algo falla en vivo

**Si el backend se cae:**
- Tener una captura de pantalla de cada vista funcionando
- Decir: "tengo el backend en este momento con un problema de
  red, te muestro las capturas que tomamos esta mañana"
- NUNCA fingir que algo funciona cuando no

**Si los datos ficticios no aparecen:**
- Ejecutar `docker compose down -v` y `docker compose up -d`
  recarga el `data.sql`

**Si te quedas sin tiempo:**
- Saltar la parte de Postman y pruebas unitarias
- Priorizar siempre la demo del front final

---

## Tiempo estimado

| Sección | Tiempo |
|---------|--------|
| Contexto del proyecto | 2 min |
| Arquitectura | 3 min |
| Demo frontend final | 8 min |
| Demo frontend de pruebas | 3 min |
| Pruebas unitarias | 2 min |
| Cierre con deudas técnicas | 1 min |
| **Total estimado** | **~19 min** |

Dejar 2-5 min para preguntas. Total con margen: **22-25 min**.
