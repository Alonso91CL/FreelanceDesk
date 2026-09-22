# FreelanceDesk - Roadmap de Desarrollo

> Suite todo-en-uno para freelancers: negociación, CRM, herramientas, cobros.
> Modelo dual: **open source AGPL-3.0** (self-hosted) + **SaaS hosted** (servicio comercial).

---

## Principios de Desarrollo

1. **Producto funcional al final de cada sesión** — cada incremento debe ser probable
2. **Local-first** — funciona sin configuración, compatible con Vercel
3. **Multi-tenant desde el día 1** — `workspace_id` en cada entidad
4. **Async-first data layer** — repositorio con interfaz unificada (LocalStorage ↔ Supabase)
5. **UI/UX Pro Max** — design system documentado antes de codificar
6. **Clean code** — skill `coding-standards` y `clean-code` aplicados
7. **No emojis como iconos** — usar SVG (Heroicons/Lucide)
8. **Accesibilidad** — contraste 4.5:1 mínimo, focus states, `prefers-reduced-motion`

---

## Fase 0 — Fundamentos (Prerequisito)

**Objetivo:** Base de datos local, numeración secuencial, PDF cliente, navegación.
**Entrega:** App navegable con persistencia funcional y 3 tipos de PDF.

### 0.1 Proyecto y Design System

| Tarea | Descripción | Skill |
|-------|-------------|-------|
| 0.1.1 | Crear `docs/DESIGN_SYSTEM.md` completo (colores, tipografía, componentes, spacing, iconos) | design-system, ui-ux-pro-max |
| 0.1.2 | Definir paleta dark mode: `bg-gray-900`, `text-gray-100`, acento azul, éxito verde | ui-styling |
| 0.1.3 | Tipografía: Inter / System sans-serif para UI, serif para documentos PDF | design |
| 0.1.4 | Componentes base: Button, Card, Input, Select, Toast, Badge, Modal, Table | ui-styling |

### 0.2 Capa de Datos (Repository Pattern)

| Tarea | Descripción | Detalles |
|-------|-------------|----------|
| 0.2.1 | `src/lib/db/types.ts` — interfaces de entidades | Client, Deal, Document, TimeEntry, FollowUp, Settings, Counters |
| 0.2.2 | `src/lib/db/storage.ts` — interfaz `StorageAdapter` | `get<T>`, `set<T>`, `delete`, `list<T>`, `query<T>` |
| 0.2.3 | `src/lib/db/LocalStorageAdapter.ts` — implementación local | JSON serialize, namespace por workspace |
| 0.2.4 | `src/lib/db/repository.ts` — repositorios de alto nivel | `clients`, `deals`, `documents`, `times`, `followups`, `settings`, `counters` |
| 0.2.5 | `src/lib/db/index.ts` — barrel export + factory | `createStorage()`, `createRepos()` |
| 0.2.6 | `src/lib/db/id.ts` — generación de IDs | CUID/ NanoID, numeración secuencial |
| 0.2.7 | `src/lib/db/migrations.ts` — versionado de esquema | Para futuras migraciones de datos |

**Esquema de entidades:**

```typescript
interface Client {
  id: string;
  workspaceId: string;
  name: string;
  company?: string;
  email?: string;
  country?: string;
  source?: 'referral' | 'linkedin' | 'upwork' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  id: string;
  workspaceId: string;
  clientId: string;
  title: string;
  description?: string;
  netAmount: number;
  currency: 'USD' | 'CLP';
  status: DealStatus;
  paypalPercent: number;
  paypalFixedUSD: number;
  siiPercent: number;
  usdRate: number;
  result?: CalculationResult;
  createdAt: string;
  updatedAt: string;
}

type DealStatus =
  | 'draft'
  | 'quoted'
  | 'sent'
  | 'negotiating'
  | 'accepted'
  | 'delivered'
  | 'paid'
  | 'lost';

interface Document {
  id: string;
  workspaceId: string;
  dealId: string;
  type: 'quote' | 'payment_request' | 'reminder';
  number: string; // SOL-2026-001, COT-2026-001
  data: Deal & CalculationResult & { profile: FreelancerProfile };
  createdAt: string;
}

interface TimeEntry {
  id: string;
  workspaceId: string;
  dealId: string;
  startTime: string;
  endTime?: string;
  note?: string;
  createdAt: string;
}

interface FollowUp {
  id: string;
  workspaceId: string;
  dealId: string;
  dueDate: string;
  note?: string;
  done: boolean;
  createdAt: string;
}

interface Settings {
  workspaceId: string;
  profile: FreelancerProfile;
  defaults: {
    paypalPercent: number;
    paypalFixedUSD: number;
    siiPercent: number;
    fallbackUsdRate: number;
    currency: 'USD' | 'CLP';
  };
  counters: {
    quote: number;
    paymentRequest: number;
    reminder: number;
  };
  year: number;
}

interface FreelancerProfile {
  name: string;
  company?: string;
  website?: string;
  email?: string;
  phone?: string;
  taxId?: string;
}
```

### 0.3 Numeración Secuencial

| Tarea | Descripción |
|-------|-------------|
| 0.3.1 | Contador por tipo+year en `settings.counters` |
| 0.3.2 | Formato: `COT-2026-001`, `SOL-2026-001`, `REM-2026-001` |
| 0.3.3 | Reset automático al cambiar año |
| 0.3.4 | Función `nextNumber(type, year)` atomica |

### 0.4 PDF Cliente con pdfmake

| Tarea | Descripción |
|-------|-------------|
| 0.4.1 | Instalar `pdfmake` como dependencia |
| 0.4.2 | Crear `src/lib/pdf/documentDefinitions.ts` — definiciones pdfmake para cada tipo |
| 0.4.3 | **Cotización (Quote)**: header con perfil, datos cliente, tabla desglose, condiciones, validez |
| 0.4.4 | **Solicitud de Pago**: replicar formato actual con texto real (no HTML render) |
| 0.4.5 | **Recordatorio (Reminder)**: template follow-up amigable con monto pendiente |
| 0.4.6 | `src/lib/pdf/generatePdf.ts` — función `generatePdf(doc: DocumentDefinition): Promise<Blob>` |
| 0.4.7 | Fuentes: Roboto (regular, bold) embebidas o CDN |
| 0.4.8 | Eliminar Puppeteer, `/api/pdf`, `@astrojs/node` |
| 0.4.9 | Switch Astro a `output: 'static'` |

### 0.5 Layout y Navegación

| Targa | Descripción |
|-------|-------------|
| 0.5.1 | `src/components/layout/Sidebar.tsx` — navegación lateral con iconos |
| 0.5.2 | `src/components/layout/Topbar.tsx` — breadcrumb + acciones |
| 0.5.3 | `src/layouts/AppLayout.astro` — layout con sidebar + contenido |
| 0.5.4 | Rutas: `/dashboard`, `/new`, `/pipeline`, `/clients`, `/tracking`, `/times`, `/settings` |
| 0.5.5 | Estado activo en sidebar, responsive (drawer mobile) |
| 0.5.6 | Páginas placeholder para cada ruta |

### 0.6 Settings Store y Perfil

| Tarea | Descripción |
|-------|-------------|
| 0.6.1 | `src/hooks/useSettings.ts` — hook React para settings con persistencia |
| 0.6.2 | `src/components/settings/ProfileForm.tsx` — formulario perfil freelancer |
| 0.6.3 | `src/components/settings/DefaultsForm.tsx` — valores por defecto (tasas, fallback USD) |
| 0.6.4 | `src/components/settings/BackupPanel.tsx` — export/import JSON |
| 0.6.5 | `src/components/settings/ResetPanel.tsx` — reset completo |

### 0.7 Dashboard Mínimo

| Tarea | Descripción |
|-------|-------------|
| 0.7.4 | KPI cards: total deals abiertos, total pagado este mes, deals perdidos |
| 0.7.5 | Últimos 5 deals con estado |

---

## Fase 1 — CRM y Pipeline

**Objetivo:** Gestión de clientes y visualización del pipeline de negocios.
**Entrega:** CRUD completo de clientes + Kanban funcional.

### 1.1 Módulo de Clientes

| Tarea | Descripción |
|-------|-------------|
| 1.1.1 | `src/pages/clients/index.astro` — lista de clientes |
| 1.1.2 | `src/components/clients/ClientList.tsx` — tabla con búsqueda y filtro |
| 1.1.3 | `src/components/clients/ClientCard.tsx` — card resumen |
| 1.1.4 | `src/components/clients/ClientForm.tsx` — formulario crear/editar |
| 1.1.5 | `src/components/clients/ClientDetail.tsx` — vista detalle con deals asociados |
| 1.1.6 | Validación: nombre requerido, email formato, fuente enum |

### 1.2 Pipeline Kanban

| Tarea | Descripción |
|-------|-------------|
| 1.2.1 | `src/pages/pipeline/index.astro` — vista Kanban |
| 1.2.2 | `src/components/pipeline/KanbanBoard.tsx` — tablero con columnas |
| 1.2.3 | `src/components/pipeline/KanbanColumn.tsx` — columna por estado |
| 1.2.4 | `src/components/pipeline/DealCard.tsx` — card de deal (cliente, monto, días, alertas) |
| 1.2.5 | Drag & drop para mover entre columnas (o botones ← →) |
| 1.2.6 | Indicadores: días sin respuesta, alerta follow-up vencido |
| 1.2.7 | Filtros: por cliente, por moneda, por rango de montos |

### 1.3 Crear Deal desde Calculadora

| Tarea | Descripción |
|-------|-------------|
| 1.3.1 | Extender Calculadora: botón "Guardar como Oportunidad" |
| 1.3.2 | Auto-crear cliente si no existe (por nombre) |
| 1.3.3 | Crear deal con status `draft` |
| 1.3.4 | Crear documento asociado con número secuencial |
| 1.3.5 | Redirigir al pipeline tras guardar |

### 1.4 Historial de Documentos

| Tarea | Descripción |
|-------|-------------|
| 1.4.1 | `src/components/documents/DocumentList.tsx` — lista de documentos por deal |
| 1.4.2 | `src/components/documents/DocumentPreview.tsx` — preview del documento |
| 1.4.3 | Acciones: regenerar PDF, cambiar tipo, eliminar |
| 1.4.4 | Búsqueda por número, cliente, tipo |

---

## Fase 2 — Multi-Documentos PDF

**Objetivo:** Tres tipos de documento profesional con pdfmake.
**Entrega:** Generar Cotización, Solicitud de Pago, y Recordatorio.

### 2.1 Plantilla Cotización

| Tarea | Descripción |
|-------|-------------|
| 2.1.1 | Header con logo placeholder, nombre, contacto, fecha |
| 2.1.2 | Datos del cliente (emitido por / cobrar a) |
| 2.1.3 | Tabla de servicios (concepto × monto) — línea de servicio principal |
| 2.1.4 | Condiciones de pago, validez de la oferta (días) |
| 2.1.5 | Footer con nota de confidencialidad |
| 2.1.6 | Número: `COT-YYYY-NNN` |

### 2.2 Plantilla Solicitud de Pago

| Tarea | Descripción |
|-------|-------------|
| 2.2.1 | Replicar formato actual mejorado |
| 2.2.2 | Desglose: neto, SII, PayPal (porcentaje + fijo), total |
| 2.2.3 | Instrucciones de pago con datos configurables |
| 2.2.4 | Aviso legal configurable |
| 2.2.5 | Número: `SOL-YYYY-NNN` |

### 2.3 Plantilla Recordatorio

| Tarea | Descripción |
|-------|-------------|
| 2.3.1 | Tono amigable, no agresivo |
| 2.3.2 | Referencia al documento original (número, fecha, monto) |
| 2.3.3 | Fecha de vencimiento sugerida |
| 2.3.4 | Número: `REM-YYYY-NNN` |
| 2.3.5 | Disponible solo para deals con status `accepted` o `delivered` |

---

## Fase 3 — Seguimiento y Follow-ups

**Objetivo:** Seguimiento de cotizaciones enviadas y alertas.
**Entrega:** Sistema de recordatorios con templates de correo.

### 3.1 Módulo de Seguimiento

| Tarea | Descripción |
|-------|-------------|
| 3.1.1 | `src/pages/tracking/index.astro` — vista principal |
| 3.1.2 | `src/components/tracking/TodayActions.tsx` — acciones de hoy |
| 3.1.3 | Lógica: follow-ups vencidos, deals sin respuesta > N días |
| 3.1.4 | Configurable: días de alerta desde settings |
| 3.1.5 | Indicadores visuales (rojo = vencido, amarillo = próximo, verde = OK) |

### 3.2 Gestión de Follow-ups

| Tarea | Descripción |
|-------|-------------|
| 3.2.1 | `src/components/tracking/FollowUpList.tsx` — lista de follow-ups |
| 3.2.2 | Crear follow-up desde deal |
| 3.2.3 | Marcar como completado |
| 3.2.4 | Historial de follow-ups por deal |
| 3.2.5 | Editar fecha y nota |

### 3.3 Templates de Correo

| Tarea | Descripción |
|-------|-------------|
| 3.3.1 | Template: Propuesta enviada (primer contacto) |
| 3.3.2 | Template: Follow-up suave (3-5 días después) |
| 3.3.3 | Template: Recordatorio de pago |
| 3.3.4 | Template: Agradecimiento post-pago |
| 3.3.5 | Renderizado con interpolación de datos del deal |
| 3.3.6 | Botón "Copiar al portapapeles" |
| 3.3.7 | Botón "Abrir en cliente de correo" (mailto:) |

---

## Fase 4 — Control de Tiempos

**Objetivo:** Timer por proyecto y cálculo de tarifa hora real.
**Entrega:** Timer funcional + reporte de horas.

### 4.1 Timer

| Tarea | Descripción |
|-------|-------------|
| 4.1.1 | `src/pages/times/index.astro` — vista de tiempos |
| 4.1.2 | `src/components/times/Timer.tsx` — botón start/stop |
| 4.1.3 | Selección de deal activo |
| 4.1.4 | Persistencia de timer activo (sobrevive reload) |
| 4.1.5 | Indicador visual: corriendo / detenido |
| 4.1.6 | Nota opcional por entrada |

### 4.2 Reporte de Horas

| Tarea | Descripción |
|-------|-------------|
| 4.2.1 | `src/components/times/TimeList.tsx` — lista de entradas |
| 4.2.2 | Filtros: por deal, por rango de fechas |
| 4.2.3 | Totales: horas por deal, horas totales del período |
| 4.2.4 | Editar / eliminar entradas |
| 4.2.5 | Exportar a CSV |

### 4.3 Tarifa Hora Real

| Tarea | Descripción |
|-------|-------------|
| 4.3.1 | Cálculo: `(brutoTotal - comisionesPayPal - provisionSII) / horas` |
| 4.3.2 | Mostrar tarifa por deal vs tarifa objetivo |
| 4.3.3 | Indicador: por encima / por debajo del objetivo |
| 4.3.4 | Gráfico de barras por deal (CSS, sin librería pesada) |

---

## Fase 5 — Dashboard Financiero

**Objetivo:** Visión completa del negocio freelance.
**Entrega:** Dashboard con KPIs y gráficos.

### 5.1 KPIs Principales

| Tarea | Descripción |
|-------|-------------|
| 5.1.1 | Total cotizado (pipeline abierto) |
| 5.1.2 | Total cobrado este mes / acumulado |
| 5.1.3 | Valor del pipeline (suma de deals no cerrados) |
| 5.1.4 | Tasa de conversión (pagadas / enviadas+negociando) |
| 5.1.5 | Ticket promedio (monto promedio de deals pagados) |
| 5.1.6 | Horas facturadas este mes |

### 5.2 Visualizaciones

| Tarea | Descripción |
|-------|-------------|
| 5.2.1 | Gráfico de barras: cobrado por mes (últimos 6 meses) |
| 5.2.2 | Gráfico de dona: distribución por estado |
| 5.2.3 | Top 5 clientes por monto |
| 5.2.4 | Embudos de conversión (de enviadas a pagadas) |
| 5.2.5 | Todo en CSS puro o SVG — sin librerías de charts pesadas |

### 5.3 Resumen por Moneda

| Tarea | Descripción |
|-------|-------------|
| 5.3.1 | Totales separados USD / CLP |
| 5.3.2 | Conversión a moneda local usando tasa actual |
| 5.3.3 | Indicador de tasa USD/CLP actual con fuente |

---

## Fase 6 — Pulido y Onboarding

**Objetivo:** Experiencia de usuario completa y profesional.
**Entrega:** App pulida lista para release open source.

### 6.1 Onboarding

| Tarea | Descripción |
|-------|-------------|
| 6.1.1 | Primera visita: configurar perfil freelancer |
| 6.1.2 | Tour guiado de funciones principales |
| 6.1.3 | Datos de ejemplo opcionales (demo data) |
| 6.1.4 | Empty states con CTAs claros |

### 6.2 Responsive y Mobile

| Tarea | Descripción |
|-------|-------------|
| 6.2.1 | Sidebar → drawer en móvil |
| 6.2.2 | Kanban → scroll horizontal en móvil |
| 6.2.3 | Tablas → cards en móvil |
| 6.2.4 | Breakpoints: 375px, 768px, 1024px, 1440px |

### 6.3 Accesibilidad

| Tarea | Descripción |
|-------|-------------|
| 6.3.1 | Contraste 4.5:1 mínimo en modo claro |
| 6.3.2 | Focus states visibles en todos los interactivos |
| 6.3.3 | `prefers-reduced-motion` respetado |
| 6.3.4 | Labels en todos los inputs |
| 6.3.5 | Aria labels en iconos botón |
| 6.3.6 | Navegación por teclado |

### 6.4 Backup y Export

| Tarea | Descripción |
|-------|-------------|
| 6.4.1 | Exportar todos los datos como JSON |
| 6.4.2 | Importar JSON (merge o replace) |
| 6.4.3 | Exportar documentos como PDF batch |
| 6.4.4 | Validación de schema al importar |

---

## Fase 7 — Preparación SaaS (Post-Open Source)

**Objetivo:** Base para el servicio hosted.
**Entrega:** Código preparado para multi-tenant cloud.

### 7.1 Supabase Adapter

| Tarea | Descripción |
|-------|-------------|
| 7.1.1 | `src/lib/db/SupabaseAdapter.ts` — misma interfaz que LocalStorage |
| 7.1.2 | `src/lib/db/factory.ts` — elige adapter por env var |
| 7.1.3 | Schema SQL completo en `docs/SUPABASE_MIGRATION.md` |
| 7.1.4 | RLS policies por workspace |
| 7.1.5 | Migración de datos local → cloud (one-click) |

### 7.2 Auth

| Tarea | Descripción |
|-------|-------------|
| 7.2.1 | Supabase Auth (email/password + magic link) |
| 7.2.2 | Registro de nuevos workspaces |
| 7.2.3 | Sesión y refresh token |
| 7.2.4 | Rutas protegidas |

### 7.3 Billing Hook

| Tarea | Descripción |
|-------|-------------|
| 7.3.1 | Estructura de planes (free / pro) |
| 7.3.2 | Limites: deals/mes, documentos/mes |
| 7.3.3 | Hook de billing (preparación para Stripe) |

---

## Definición de Listo (Definition of Done)

Cada tarea debe cumplir:

- [ ] Código compila sin errores (`pnpm build`)
- [ ] TypeScript sin errores (`pnpm exec tsc --noEmit`)
- [ ] Probado en 375px, 768px, 1024px
- [ ] Accesible (focus visible, contraste, aria)
- [ ] Sin console.logs en producción
- [ ] Datos persisten tras reload
- [ ] Toast de feedback en acciones destructivas
- [ ] Sin emojis como iconos

---

## Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Tiempo de carga inicial | < 2s en 3G |
| Tamaño del bundle | < 200KB gzipped |
| Sin dependencias de runtime pesadas | pdfmake lazy-loaded |

---

## Stack Final Confirmado

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 (output: static) |
| UI Islands | React 19 |
| Estilos | Tailwind CSS v4 |
| Tipos | TypeScript 5.9 |
| PDF | pdfmake (cliente) |
| Datos (local) | LocalStorage via repository |
| Datos (cloud) | Supabase (fase 7) |
| Iconos | Lucide React |
| Fuente UI | Inter / system |
| Hosting local | Vercel / Netlify / Cloudflare Pages |
| Hosted SaaS | Supabase + Vercel |
| Licencia | AGPL-3.0 |

---

## Notas

- Las fases 3, 4, 5 pueden desarrollarse en paralelo tras Fase 2
- Cada fase entrega un incremento funcional completo
- El roadmap se revisa al final de cada fase
- Skills activos: coding-standards, clean-code, astro, react-dev, ui-ux-pro-max, design-system, ui-styling
