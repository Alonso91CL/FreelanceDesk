# AGENTS.md — FreelanceDesk

> Lineamientos del proyecto para agentes de IA.

---

## Gestor de Paquetes

- Usar siempre `pnpm` antes que `npm`.
- Preferir `pnpm dlx <paquete>` sobre `npx <paquete>`.
- Solo usar `npm` si `pnpm` falla.

## Instalación de Skills

- Todos los skills de proyecto se instalan a nivel proyecto, nunca global.
- Skills de proyecto van en `.opencode/skills/`.
- Nunca usar instalación global (`~/.config/opencode/skills/` o `~/.agents/skills/`) para tools específicos de proyecto.
- Tras instalación a nivel proyecto, commitear `.opencode/skills/` y este AGENTS.md.

## Ubicación de Archivos

| Contenido | Ubicación | Nunca |
|-----------|-----------|-------|
| Skills de proyecto | `.opencode/skills/` | `.agents/skills/` |
| Configuración opencode | `.opencode/opencode.json` | raíz del proyecto |
| Documentación | `docs/` | `.agents/` |
| Código fuente | `src/` | fuera de `src/` |

**Regla:** Todo lo que el agente cree o modifique debe quedar en `.opencode/` (skills/config) o `docs/` (documentación) o `src/` (código). No crear carpetas nuevas fuera de estas sin permiso explícito del usuario.

## Git Flow

> Usar flujo Git Flow (https://www.atlassian.com/es/git/tutorials/comparing-workflows/gitflow-workflow).

### Ramas principales

- `main` — producción, estable
- `develop` — integración de features

### Ramas de soporte

- `feature/*` — nuevas funcionalidades
- `release/*` — preparación de releases
- `hotfix/*` — fixes urgentes en producción

### Comandos Git Flow

```powershell
# Inicializar (solo una vez)
git flow init

# Feature
git flow feature start <nombre>
git flow feature finish <nombre>
git flow feature publish <nombre>
git flow feature pull origin <nombre>

# Release
git flow release start <version>
git flow release finish <version>
git flow release publish <version>

# Hotfix
git flow hotfix start <version>
git flow hotfix finish <version>
git flow hotfix publish <version>
```

### Flujo de trabajo

1. **Nueva feature:** `git flow feature start feat/descripcion`
2. Commits en la rama feature con Conventional Commits
3. **Finalizar feature:** `git flow feature finish feat/descripcion` (merge a develop)
4. **Release:** `git flow release start 1.0.0` → `git flow release finish 1.0.0`
5. **Hotfix:** `git flow hotfix start 1.0.1` → `git flow hotfix finish 1.0.1`

### Commit

- **Solo commitear cuando el usuario lo pide explícitamente.**
- Antes de commitear: inspeccionar `git status`, `git diff`, `git log --oneline -10`.
- Staging solo de archivos intencionados. No committear secrets ni keys.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `chore:`, `perf:`.
- Commits en ingles.

### Seguridad Git

- Nunca force-push (`git push --force`).
- No actualizar git config, ni usar flags interactivos (`-i`).
- No commits vacíos sin solicitud.
- No commitear directamente en `main`/`master`.
- No merge sin revisión del usuario.

## Reglas de Seguridad para el Agente IA

### Acciones que requieren confirmación explícita del usuario

- Cualquier comando que modifique el sistema de archivos fuera de `src/`, `docs/`, `.opencode/`.
- Instalación de dependencias (`pnpm add`, `pnpm remove`).
- Ejecución de scripts o comandos que afecten servicios externos.
- Creación de PRs o push a repositorios remotos.
- Cualquier acción destructiva (eliminar archivos, reset, clean).

### Acciones permitidas sin confirmación

- Leer archivos del proyecto.
- Buscar contenido (`grep`, `glob`).
- Ejecutar `pnpm build`, `pnpm dev`, `pnpm exec tsc --noEmit` para verificación.
- Crear o editar archivos dentro de `src/`, `docs/`, `.opencode/skills/`.

### Nunca

- No exponer ni loguear secrets ni keys.
- No enviar datos a URLs externas sin permiso.
- No ejecutar código desconocido descargado de internet.
- No cambiar configuración del sistema operativo.
- No instalar software global sin permiso.

## Stack del Proyecto

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 (output: static) |
| UI Islands | React 19 |
| Estilos | Tailwind CSS v4 |
| Tipos | TypeScript 5.9 |
| PDF | pdfmake (cliente) |
| Datos (local) | LocalStorage via repository pattern |
| Datos (cloud) | Supabase (fase 7) |
| Iconos | Lucide React |

## Estructura de Archivos

```
src/
├── components/
│   ├── ui/           # Componentes reutilizables
│   ├── layout/       # Sidebar, Topbar
│   ├── clients/      # Módulo clientes
│   ├── pipeline/     # Kanban
│   ├── documents/    # PDF generation
│   ├── tracking/     # Follow-ups
│   ├── times/        # Timer
│   ├── dashboard/    # KPIs
│   └── settings/     # Configuración
├── layouts/
├── lib/
│   ├── db/           # Data layer
│   ├── pdf/          # pdfmake
│   ├── calculations.ts
│   └── formatters.ts
├── hooks/
├── pages/
├── styles/
│   └── globals.css
└── env.d.ts
```

## Reglas de Código

### TypeScript
- `strict: true` — no `any`, no unused vars
- Interfaces sin prefijo `I`
- Tipos con prefijo `T` opcional
- Type guards para narrowing

### React
- Componentes funcionales con hooks
- Props interfaz obligatoria si >1 prop
- `client:only="react"` en islands con datos
- Un componente = un archivo
- `useCallback` en handlers, `useMemo` en cálculos

### CSS
- Preferir Tailwind utility classes
- Custom CSS solo en `globals.css`
- Clases condicionales con `clsx`
- Sin estilos inline (excepto dinámicos)

### Datos
- Toda operación pasa por repositorios
- Nunca acceder localStorage fuera de adapters
- Interfaz async-first
- Workspace ID inyectado por adapter

### Accesibilidad
- `lang="es"` en html
- `aria-label` en icon buttons
- Focus visible (`ring-2`)
- Contraste 4.5:1 mínimo
- `prefers-reduced-motion` respetado

## Commits

Usar Conventional Commits:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `refactor:` reestructuración de código
- `style:` cambios visuales
- `chore:` tareas de mantenimiento

## Design System

Ver `docs/DESIGN_SYSTEM.md` para:
- Paleta de colores (dark mode)
- Tipografía (Inter UI, Roboto PDF)
- Componentes base (Button, Card, Input, Toast, Modal)
- Espaciado y bordes
- Iconografía (Lucide)

## Roadmap

Ver `ROADMAP.md` para fases detalladas:
- Fase 0: Fundamentos (datos, PDF, navegación)
- Fase 1: CRM (clientes, pipeline)
- Fase 2: Multi-documentos
- Fase 3: Seguimiento
- Fase 4: Tiempos
- Fase 5: Dashboard
- Fase 6: Pulido
- Fase 7: SaaS

## Pre-Delivery Checklist

Antes de cada sesión:
- [ ] `pnpm build` exitoso
- [ ] `pnpm exec tsc --noEmit` sin errores
- [ ] Probado en mobile (375px)
- [ ] Sin console.logs en producción
- [ ] Datos persisten correctamente
- [ ] Accesibilidad verificada

## Modelo de Negocio

- Open source: AGPL-3.0 (self-hosted)
- SaaS hosted: planes Free/Pro/Team
- Multi-tenant desde el día 1 (`workspace_id`)
- Local-first compatible con Vercel

## Anti-Patterns

- Emojis como iconos (usar Lucide SVG)
- `any` en TypeScript
- Estilos inline (excepto dinámicos)
- Acceso directo a localStorage fuera de adapters
- Componentes sin props interface
- Console.logs en producción
- Animaciones >300ms
- Focus states invisibles

## Skills Instalados

| Skill | Ubicación | Uso |
|-------|-----------|-----|
| coding-standards | `.opencode/skills/` | Estándares de código |
| clean-code | `.opencode/skills/` | Código limpio |
| astro | `.opencode/skills/` | Mejoras Astro |
| react-dev | `.opencode/skills/` | Patrones React |
| ui-ux-pro-max | `~/.agents/skills/` | Design system |
| design | `~/.agents/skills/` | Diseño visual |
| design-system | `~/.agents/skills/` | Sistema de diseño |
| ui-styling | `~/.agents/skills/` | Estilos UI |
| banner-design | `~/.agents/skills/` | Banners |
| brand | `~/.agents/skills/` | Branding |
| slides | `~/.agents/skills/` | Presentaciones |
| find-skills | `~/.agents/skills/` | Buscar skills |
| caveman | `~/.agents/skills/` | Modo compacto |

## Contacto

- Autor: AlonsoDev
- Email: alonsodev@proton.me
- Licencia: AGPL-3.0
