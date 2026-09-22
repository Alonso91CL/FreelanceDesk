# Deployment Hosted SaaS — FreelanceDesk

> Guía para desplegar FreelanceDesk como servicio SaaS multi-tenant.

---

## Arquitectura Hosted

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare                         │
│                   (DNS + CDN + WAF)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Vercel Edge                          │
│              (Astro static + islands)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Supabase Cloud                        │
│        (Auth + PostgreSQL + Realtime + Storage)         │
└─────────────────────────────────────────────────────────┘
```

---

## Paso 1: Infraestructura

### Vercel

1. Conectar repo GitHub
2. Framework preset: Astro
3. Build command: `pnpm build`
4. Output: `dist/` (static)
5. Variables de entorno:
   - `PUBLIC_DATA_MODE=supabase`
   - `PUBLIC_SUPABASE_URL=...`
   - `PUBLIC_SUPABASE_ANON_KEY=...`
   - `PUBLIC_SITE_URL=https://freedesk.app`

### Supabase

1. Proyecto Organization (no personal)
2. Región: `us-east-1` (cerca de Vercel)
3. Ejecutar schema SQL de migración
4. Habilitar Auth providers: Email, Magic Link
5. Configurar SMTP (Resend o SendGrid)
6. Habilitar Realtime (opcional para multi-device)

### Cloudflare (opcional)

1. Dominio custom: `freedesk.app`
2. DNS → Vercel
3. Page Rules: cache assets estáticos
4. Rate limiting: 100 req/min por IP

---

## Paso 2: Auth y Onboarding

### Registro

```
/signup → email + password → crear workspace → redirect /onboarding
```

```typescript
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Create workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .insert({ name: `${email.split("@")[0]}'s workspace` })
    .select()
    .single();

  // Link user to workspace
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: data.user!.id,
    role: 'admin'
  });

  // Create default settings
  await supabase.from('settings').insert({
    workspace_id: workspace.id,
    profile: { name: '' },
    defaults: { paypalPercent: 5.4, paypalFixedUSD: 0.30, siiPercent: 15.25 },
    counters: { quote: 0, paymentRequest: 0, reminder: 0 }
  });

  return data;
}
```

### Login

```
/login → email + password o magic link → redirect /dashboard
```

### Rutas protegidas

```typescript
// src/middleware.ts
export const onRequest = async (context, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const isPublicPath = ['/login', '/signup', '/'].includes(context.url.pathname);

  if (!session && !isPublicPath) {
    return context.redirect('/login');
  }

  return next();
};
```

---

## Paso 3: Billing (Stripe)

### Planes

```typescript
const PLANS = {
  free: {
    id: 'free',
    price: 0,
    limits: { dealsPerMonth: 5, documentsPerMonth: 10, workspaces: 1 }
  },
  pro: {
    id: 'pro_price_xxx',
    price: 9,
    limits: { dealsPerMonth: Infinity, documentsPerMonth: Infinity, workspaces: 1 }
  },
  team: {
    id: 'team_price_xxx',
    price: 29,
    limits: { dealsPerMonth: Infinity, documentsPerMonth: Infinity, workspaces: 5 }
  }
};
```

### Checkout

```typescript
async function createCheckoutSession(planId: string) {
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ planId })
  });
  const { url } = await response.json();
  window.location.href = url;
}
```

### Webhook Stripe

```typescript
// src/pages/api/stripe/webhook.ts
export const POST: APIRoute = async ({ request }) => {
  const event = await stripe.webhooks.constructEvent(...);

  switch (event.type) {
    case 'checkout.session.completed':
      await updateWorkspacePlan(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await downgradeToFree(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
};
```

### Feature gating

```typescript
// src/lib/billing.ts
export function canCreateDeal(workspace: Workspace, currentDeals: number): boolean {
  const plan = PLANS[workspace.plan];
  return currentDeals < plan.limits.dealsPerMonth;
}

export function canGenerateDocument(workspace: Workspace, currentDocs: number): boolean {
  const plan = PLANS[workspace.plan];
  return currentDocs < plan.limits.documentsPerMonth;
}
```

---

## Paso 4: Multi-tenant Middleware

```typescript
// Obtener workspace del usuario actual
async function getCurrentWorkspace(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .single();

  return member;
}

// Todas las queries filtran por workspace_id automáticamente (RLS)
```

---

## Paso 5: Email Trans Proveedor

### Recomendación: Resend

```typescript
// src/lib/email.ts (server-side)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: 'FreelanceDesk <hola@freedesk.app>',
    to,
    subject: 'Bienvenido a FreelanceDesk',
    html: `<h1>¡Hola ${name}!</h1><p>Tu workspace está listo...</p>`
  });
}
```

---

## Paso 6: Monitoreo

### Vercel Analytics

```typescript
// Habilitar en Vercel dashboard
// Integrado automáticamente con Astro
```

### Sentry (errores)

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

### Logs

```typescript
// src/lib/logger.ts
export const logger = {
  info: (msg: string, data?: unknown) => console.log(`[INFO] ${msg}`, data),
  error: (msg: string, error?: unknown) => console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, data?: unknown) => console.warn(`[WARN] ${msg}`, data)
};
```

---

## Paso 7: SEO y Marketing

### Meta tags

```astro
<!-- src/layouts/AppLayout.astro -->
<meta name="description" content="FreelanceDesk — Suite todo-en-uno para freelancers. CRM, cobros, seguimiento de tiempos." />
<meta property="og:title" content="FreelanceDesk" />
<meta property="og:description" content="La herramienta que todo freelancer necesita." />
<meta property="og:image" content="/og-image.png" />
```

### Landing page (`/`)

Secciones:
1. Hero — propuesta de valor + CTA
2. Features — 6 cards con iconos
3. Demo — screenshot/gif
4. Pricing — 3 planes
5. FAQ
6. Footer

---

## Paso 8: Legal

- `/terms` — Términos de servicio
- `/privacy` — Política de privacidad
- `/license` — AGPL-3.0 + excepción comercial
- Cookie banner (GDPR compliant)

---

## Verificación Pre-Launch

- [ ] Auth: signup, login, logout, magic link funcionan
- [ ] RLS: usuarios A no ven datos de B
- [ ] Stripe: checkout, webhook, upgrade/downgrade
- [ ] Rate limiting activo
- [ ] SSL válido (Cloudflare)
- [ ] Emails transaccionales llegan
- [ ] Analytics tracking
- [ ] Error reporting (Sentry)
- [ ] Backups automáticos Supabase
- [ ] Uptime monitoring

---

## Costos Estimados (inicio)

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Cloudflare | Free | $0 |
| Resend | Free | $0 (100/día) |
| Stripe | Pay-per-use | 2.9% + $0.30/transaction |
| Dominio | freedesk.app | $12/año |

**Total fijo inicial: ~$45/mes**
