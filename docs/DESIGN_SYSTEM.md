# Design System — FreelanceDesk

> Fuente única de verdad para la identidad visual de la aplicación.

---

## Principios de Diseño

1. **Oscuro por defecto** — la app se usa en sesiones largas; dark mode reduce fatiga visual
2. **Densidad alta** — freelancers son power users; mostrar información compacta
3. **Sin fricción** — cada acción destructiva tiene confirmación; cada acción exitosa tiene feedback
4. **Tipografía funcional** — una familia sans-serif para UI, una para documentos
5. **Color con propósito** — verde = éxito/dinero, rojo = alerta/peligro, azul = acción primaria, gris = jerarquía

---

## Paleta de Colores

### Modo Oscuro (Principal)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#0f172a` (slate-900) | Fondo principal |
| `--bg-secondary` | `#1e293b` (slate-800) | Cards, sidebar |
| `--bg-tertiary` | `#334155` (slate-700) | Inputs, hover |
| `--bg-elevated` | `#475569` (slate-600) | Modales, popovers |
| `--text-primary` | `#f1f5f9` (slate-100) | Texto principal |
| `--text-secondary` | `#94a3b8` (slate-400) | Labels, placeholders |
| `--text-muted` | `#64748b` (slate-500) | Texto terciario, timestamps |
| `--border-primary` | `#334155` (slate-700) | Bordes sutiles |
| `--border-secondary` | `#475569` (slate-600) | Bordes en inputs |

### Acentos

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent-primary` | `#3b82f6` (blue-500) | Botones primarios, links |
| `--accent-hover` | `#2563eb` (blue-600) | Hover primario |
| `--success` | `#22c55e` (green-500) | Éxito, dinero recibido |
| `--success-muted` | `#166534` (green-800) | Fondo success |
| `--warning` | `#eab308` (yellow-500) | Alertas, follow-ups próximos |
| `--warning-muted` | `#713f12` (yellow-900) | Fondo warning |
| `--danger` | `#ef4444` (red-500) | Errores, acciones destructivas |
| `--danger-muted` | `#7f1d1d` (red-900) | Fondo danger |
| `--info` | `#06b6d4` (cyan-500) | Información, tips |

### Colores de Datos

| Token | Valor | Uso |
|-------|-------|-----|
| `--chart-1` | `#3b82f6` | Serie 1 |
| `--chart-2` | `#22c55e` | Serie 2 |
| `--chart-3` | `#eab308` | Serie 3 |
| `--chart-4` | `#a855f7` | Serie 4 |
| `--chart-5` | `#f97316` | Serie 5 |

### Tokens Tailwind v4 (globals.css)

```css
@theme {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-bg-elevated: #475569;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-border-primary: #334155;
  --color-border-secondary: #475569;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-danger: #ef4444;
  --color-info: #06b6d4;
}
```

---

## Tipografía

### Familia UI

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Pesos usados: 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

### Familia Documentos PDF

```css
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

Pesos: 400, 700.

### Escala Tipográfica

| Token | Tamaño | Line-height | Uso |
|-------|--------|-------------|-----|
| `text-xs` | 0.75rem (12px) | 1rem | Timestamps, badges |
| `text-sm` | 0.875rem (14px) | 1.25rem | Labels, secondary text |
| `text-base` | 1rem (16px) | 1.5rem | Body text |
| `text-lg` | 1.125rem (18px) | 1.75rem | Subheadings |
| `text-xl` | 1.25rem (20px) | 1.75rem | Card titles |
| `text-2xl` | 1.5rem (24px) | 2rem | Section headers |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page titles |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero/KPI numbers |

---

## Espaciado

Escala basada en 4px:

| Token | Valor | Uso |
|-------|-------|-----|
| `1` | 4px | Espaciado interno badges |
| `2` | 8px | Espaciado interno compacto |
| `3` | 12px | Entre elementos relacionados |
| `4` | 16px | Padding estándar |
| `6` | 24px | Entre secciones |
| `8` | 32px | Padding cards |
| `12` | 48px | Entre bloques grandes |
| `16` | 64px | Secciones de página |

---

## Bordes y Radios

| Clase | Uso |
|-------|-----|
| `rounded` (4px) | Badges, small elements |
| `rounded-md` (6px) | Buttons, inputs |
| `rounded-lg` (8px) | Cards, modals |
| `rounded-xl` (12px) | Cards grandes, preview panel |
| `rounded-2xl` (16px) | Botones grandes, KPI cards |
| `rounded-full` | Avatar, status dots |

---

## Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
```

---

## Componentes

### Button

| Variante | Fondo | Texto | Uso |
|----------|-------|-------|-----|
| `primary` | `bg-blue-500` | `text-white` | Acción principal |
| `secondary` | `bg-slate-700` | `text-slate-100` | Acción secundaria |
| `danger` | `bg-red-500` | `text-white` | Destructiva |
| `ghost` | `bg-transparent` | `text-slate-300` | Terciaria |
| `outline` | `bg-transparent` | `text-slate-300` | Alternativa con borde |

Tamaños: `sm` (py-1.5 px-3), `md` (py-2 px-4), `lg` (py-3 px-6).

### Card

```css
background: var(--bg-secondary);
border: 1px solid var(--border-primary);
border-radius: 12px;
padding: 24px;
```

### Input

```css
background: var(--bg-tertiary);
border: 1px solid var(--border-primary);
border-radius: 6px;
color: var(--text-primary);
padding: 8px 12px;
focus: border-color var(--accent);
```

### Badge

| Variante | Fondo | Texto |
|----------|-------|-------|
| `success` | `bg-green-900` | `text-green-400` |
| `warning` | `bg-yellow-900` | `text-yellow-400` |
| `danger` | `bg-red-900` | `text-red-400` |
| `info` | `bg-blue-900` | `text-blue-400` |
| `neutral` | `bg-slate-700` | `text-slate-300` |

### Toast

- Posición: bottom-right
- Auto-dismiss: 4 segundos
- Variantes: success (verde), error (rojo), info (azul)
- Animación: slide-in desde derecha
- Icono contextual (checkmark, alert, info)

### Modal

- Overlay: `bg-black/60` con backdrop blur
- Contenedor: `bg-slate-800` con borde y sombra
- Close button: top-right, ghost
- Focus trap activo
- Escape para cerrar

### Table

- Header: `bg-slate-800`, texto `text-slate-400` uppercase text-xs
- Row: `border-b border-slate-700`, hover `bg-slate-800/50`
- Cell: padding `py-3 px-4`

### Kanban Card

- `bg-slate-800`, border `border-slate-700`, hover `border-slate-600`
- Client name: bold
- Amount: green bold
- Days indicator: badge top-right
- Drag handle: left edge

---

## Iconografía

**Librería:** Lucide React.

Reglas:
- Tamaño por defecto: 20px
- En botones: 18px
- En headers: 24px
- Siempre acompañar con texto o aria-label
- Color: hereda de contexto o `text-slate-400`

Iconos principales:

| Sección | Icono |
|---------|-------|
| Dashboard | `LayoutDashboard` |
| Nueva oportunidad | `Plus` / `FilePlus` |
| Pipeline | `Columns3` |
| Clientes | `Users` |
| Seguimiento | `Bell` / `Clock` |
| Tiempos | `Timer` |
| Settings | `Settings` |
| Cotización | `FileText` |
| Solicitud | `Receipt` |
| Recordatorio | `Mail` |
| Pago | `DollarSign` |
| Alerta | `AlertTriangle` |

---

## Layout

### Breakpoints

| Nombre | Ancho mínimo |
|--------|-------------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### Grid Dashboard

```
grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
```

### Grid Forms

```
grid-cols-1 md:grid-cols-2 gap-4
```

### Sidebar

- Width: 256px (desktop)
- Drawer: 280px (mobile, slide-in)
- Fondo: `bg-slate-800` más oscuro que contenido
- Nav items: `py-2 px-3 rounded-md`, active con `bg-slate-700`

---

## Estados Interactivos

| Estado | Estilo |
|--------|--------|
| `hover` | `brightness(1.1)` o bg más claro |
| `active` | `brightness(0.95)` |
| `focus` | `ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900` |
| `disabled` | `opacity-50 cursor-not-allowed` |
| `loading` | spinner + `opacity-70` |

---

## Animaciones

```css
/* Toast slide-in */
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Modal fade */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Pulse suave para indicadores */
@keyframes subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**Regla:** `prefers-reduced-motion: reduce` desactiva todas las animaciones.

---

## Anti-Patterns (NO hacer)

- ❌ Emojis como iconos
- ❌ Colores neón o saturados excesivos
- ❌ Dark mode puro (#000) — usar slate-900
- ❌ Bordes redondeados excesivos en tablas
- ❌ Animaciones largas (>300ms)
- ❌ Texto sobre fondo de similar luminosidad
- ❌ Botones sin estado hover/focus visible
- ❌ Modals sin close visible
- ❌ Toast sin auto-dismiss

---

## Referencias

- Design tokens en `src/styles/globals.css`
- Componentes en `src/components/ui/`
- Implementación siguiendo skill `ui-ux-pro-max` guidelines
