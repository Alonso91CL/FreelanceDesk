# Lineamientos de Desarrollo — FreelanceDesk

> Reglas para código limpio, mantenible y profesional.

---

## 1. Estructura de Archivos

```
src/
├── components/
│   ├── ui/           # Componentes reutilizables (Button, Card, Input...)
│   ├── layout/       # Sidebar, Topbar, AppLayout
│   ├── clients/      # Módulo clientes
│   ├── pipeline/     # Kanban, DealCard
│   ├── documents/    # PDF generation, preview
│   ├── tracking/     # Follow-ups, templates
│   ├── times/        # Timer, reports
│   ├── dashboard/    # KPI cards, charts
│   └── settings/     # Forms de configuración
├── layouts/
│   └── AppLayout.astro
├── lib/
│   ├── db/           # Data layer (types, adapters, repositories)
│   ├── pdf/          # pdfmake document definitions
│   ├── calculations.ts
│   └── formatters.ts
├── hooks/            # Custom React hooks
├── pages/
│   ├── index.astro
│   ├── pipeline/
│   ├── clients/
│   ├── tracking/
│   ├── times/
│   ├── settings/
│   └── new/
├── styles/
│   └── globals.css
└── env.d.ts
```

---

## 2. Nomenclatura

### Archivos y Carpetas

- Componentes: `PascalCase.tsx` → `ClientForm.tsx`, `KanbanBoard.tsx`
- Hooks: `use camelCase.ts` → `useSettings.ts`, `useTimer.ts`
- Utilidades: `camelCase.ts` → `formatters.ts`, `calculations.ts`
- Páginas: `kebab-case/index.astro` → `clients/index.astro`
- Tipos: `types.ts` dentro de cada módulo

### Variables y Funciones

- `camelCase` para variables y funciones
- `PascalCase` para tipos e interfaces
- `SCREAMING_SNAKE_CASE` para constantes
- **Nombres descriptivos**, no abreviados

```typescript
// ❌ Mal
const d = new Date();
function calc(a: number, b: number) {}

// ✅ Bien
const currentDate = new Date();
function calculateTotalWithFees(netAmount: number, feePercent: number) {}
```

### Interfaces y Tipos

```typescript
// Prefijo T para tipos opcionales, sin I prefix
interface Deal {
  id: string;
  status: DealStatus;
}

type DealStatus = 'draft' | 'quoted' | ...;
```

---

## 3. Componentes React

### Estructura

```typescript
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onAction: (id: string) => void;
}

export function ComponentName({ prop1, prop2, onAction }: ComponentNameProps) {
  // hooks primero
  const [state, setState] = useState(initial);

  // efectos
  useEffect(() => { ... }, []);

  // handlers
  const handleClick = useCallback(() => { ... }, []);

  // render
  return ( ... );
}

export default ComponentName;
```

### Reglas

- Un componente = un archivo
- Props interfaz obligatoria si >1 prop
- `client:only="react"` en islands que usan datos
- Componentes puros cuando sea posible
- Extraer lógica a hooks custom

### Condicionales en JSX

```typescript
// ❌ Evitar ternarios anidados
{condition1 ? <A /> : condition2 ? <B /> : <C />}

// ✅ Preferir early returns o extracción
if (!data) return <EmptyState />;
if (loading) return <Spinner />;
return <Data data={data} />;
```

---

## 4. Módulos Astro

```astro
---
import AppLayout from '../layouts/AppLayout.astro';
import ClientList from '../components/clients/ClientList';
---

<AppLayout title="Clientes">
  <ClientList client:only="react" />
</AppLayout>
```

- Lógica de servidor en el frontmatter (---)
- Pasar datos como props a islands
- Mantener páginas como cáscaras

---

## 5. Capa de Datos (Repository Pattern)

### Uso

```typescript
import { repos } from '../lib/db';

// Clientes
const clients = await repos.clients.list();
const client = await repos.clients.getById(id);
await repos.clients.create({ name: 'Acme', ... });

// Deals
const deals = await repos.deals.listByStatus('quoted');
await repos.deals.update(id, { status: 'sent' });
```

### Reglas

- Toda operación de datos pasa por repositorios
- Nunca acceder a localStorage directamente fuera de adapters
- Interfaz async-first (incluso para localStorage)
- Workspace ID inyectado por el adapter, no por el caller
- Validación de schema al leer datos

---

## 6. TypeScript

### Configuración estricta

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Reglas

- No `any` — usar `unknown` si es necesario
- Tipos explícitos en exports públicos
- Guards de tipo para narrowing
- Template literals para strings compuestos

```typescript
// Type guard
function isDeal(value: unknown): value is Deal {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

---

## 7. CSS / Tailwind

### Reglas

- Preferir Tailwind utility classes
- Extraer a `@apply` solo en componentes base reutilizables
- Sin estilos inline (excepto dinámicos calculados)
- Clases condicionales con `clsx` o template literals

```typescript
// ✅ Bien
<div className={clsx(
  'base-classes',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50'
)} />

// ❌ Evitar
<div className={`base ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`} />
```

### Custom CSS

Solo en `globals.css`:
- `@theme` para design tokens
- `@layer components` para componentes base
- Animaciones
- Overrides de Tailwind necesarios

---

## 8. Accesibilidad

### Checklist por componente

- [ ] `lang` en html
- [ ] Texto alternativo en iconos (`aria-label`)
- [ ] Focus visible (`ring-2`)
- [ ] Contraste 4.5:1
- [ ] Labels asociados a inputs
- [ ] Keyboard navigation
- [ ] `prefers-reduced-motion`

```typescript
// Icon button accesible
<button aria-label="Eliminar cliente" onClick={handleDelete}>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
```

---

## 9. Performance

### Reglas

- Lazy load de pdfmake (dinámico import)
- `useCallback` en handlers que se pasan a hijos
- `useMemo` para cálculos costosos
- Imágenes con dimensiones explícitas
- Sin re-renders innecesarios (React.memo si aplica)

```typescript
const generatePdf = useCallback(async (doc: DocumentDefinition) => {
  const pdfmake = await import('pdfmake/build/pdfmake');
  // ...
}, []);
```

---

## 10. Commits

### Conventional Commits

```
feat: add client CRUD
fix: correct SII calculation for CLP currency
docs: update roadmap phase 2
refactor: extract useSettings hook
style: update button hover states
chore: add pdfmake dependency
```

Tipos: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`, `perf`.

---

## 11. Comentarios

- NO comentarios obvios
- JSDoc en funciones públicas de librería
- TODO con formato: `// TODO(#issue): descripción`
- Explicar el "por qué", no el "qué"

```typescript
// ❌ Mal — obvio
// Set loading to true
setLoading(true);

// ✅ Bien — explica por qué
// Show loading before fetch to prevent double-submission race
setLoading(true);
```

---

## 12. Testing (futuro)

- Tests unitarios para `calculations.ts`, `formatters.ts`
- Tests de integración para repositorios
- Tests e2e para flujos críticos (crear deal, generar PDF)

---

## 13. Skills Aplicados

| Skill | Uso |
|-------|-----|
| `coding-standards` | Este documento |
| `clean-code` | Nombres, funciones pequeñas, no duplicación |
| `ui-ux-pro-max` | Design system, pre-delivery checklist |
| `design-system` | Paleta, tipografía, componentes |
| `ui-styling` | Implementación visual consistente |
| `astro` | Mejoras específicas de Astro |
| `react-dev` | Patrones React |
| `tailwind-styling` | Utility classes |

---

## 14. Pre-Delivery Checklist

Antes de cada sesión:

- [ ] `pnpm build` exitoso
- [ ] `pnpm exec tsc --noEmit` sin errores
- [ ] Probado en mobile (375px)
- [ ] Sin console.logs en producción
- [ ] Datos persisten correctamente
- [ ] Accesibilidad verificada
