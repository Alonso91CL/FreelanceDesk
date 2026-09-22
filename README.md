# FreelanceDesk

> Suite todo-en-uno para freelancers. Cobros, CRM, seguimiento, tiempos, dashboard.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 (static output) |
| UI | React 19 islands |
| Estilos | Tailwind CSS v4 |
| Tipos | TypeScript 5.9 |
| PDF | pdfmake (cliente) |
| Datos | LocalStorage (local-first) / Supabase (SaaS) |
| Iconos | Lucide React |
| Licencia | AGPL-3.0 |

## Requisitos

- Node.js 20+
- pnpm 10+

## Instalación

```powershell
git clone https://github.com/AlonsoDev/freedesk.git
cd freedesk
pnpm install
```

## Desarrollo

```powershell
pnpm dev
```

App corre en `http://localhost:4321`.

## Build producción

```powershell
pnpm build
pnpm preview
```

## Instalar Skills

Skills se instalan a nivel proyecto en `.opencode/skills/`:

```powershell
pnpm dlx skills add affaan-m/ecc@coding-standards -y
pnpm dlx skills add pproenca/dot-skills@clean-code -y
pnpm dlx skills add sickn33/agentic-awesome-skills@astro -y
pnpm dlx skills add softaworks/agent-toolkit@react-dev -y
```

Skills globales (opcional):

```powershell
pnpm dlx skills add nextlevelbuilder/ui-ux-pro-max-skill -g -y
```

## Estructura

```
├── .opencode/        # Config + skills
├── docs/             # Documentación
│   ├── DESIGN_SYSTEM.md
│   ├── ROADMAP.md
│   ├── DEVELOPMENT_GUIDELINES.md
│   └── PRODUCT_PLAN.md
├── src/
│   ├── components/   # UI islands
│   ├── lib/          # DB, PDF, cálculos
│   ├── layouts/
│   ├── hooks/
│   └── pages/
└── public/
```

## Modelo

- **Open source** — AGPL-3.0, self-host gratis en Vercel
- **SaaS hosted** — planes Free/Pro/Team (fase 7)

## Autor

**AlonsoDev** — alonso91cl@gmail.com

## Licencia

AGPL-3.0 — ver [LICENSE](./LICENSE).
