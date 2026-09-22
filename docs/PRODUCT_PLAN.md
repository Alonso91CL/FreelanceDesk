# Plan de Producto — FreelanceDesk

> Visión, estrategia y alcance del producto.

---

## Visión

**FreelanceDesk** es la suite todo-en-uno para freelancers que gestionan clientes internacionales. Centraliza todo el proceso de negociación — desde el primer contacto hasta el cobro final — en una herramienta simple, local-first, que funciona sin configuración.

---

## Problema

Los freelancers que trabajan con clientes internacionales enfrentan:

1. **Falta de visión global** — usan hojas de cálculo, notas, emails separados
2. **Cálculos manuales de comisiones** — PayPal, SII, conversiones de moneda
3. **Pérdida de oportunidades** — no siguen cotizaciones enviadas a tiempo
4. **Cobros tardíos** — sin recordatorios sistemáticos
5. **Desconocimiento de tarifa real** — no saben cuánto ganan por hora post-deducciones
6. **Herramientas fragmentadas** — calculadora aquí, CRM allá, timer en otro lado

---

## Solución

Una sola herramienta con:

| Capacidad | Beneficio |
|-----------|-----------|
| Calculadora de cobro | Saber exacto cuánto facturar |
| CRM pipeline | Ver el estado de cada negocio |
| Generador PDF profesional | Documentos listos para enviar |
| Seguimiento | Nunca olvidar un follow-up |
| Control de tiempos | Tarifa hora real post-deducciones |
| Dashboard | Visión financiera del negocio |
| Local-first | Funciona sin login, sin configuración |

---

## Usuario Objetivo

**Freelancer técnico** (desarrollo, diseño, consultoría):
- Trabaja con clientes de USA/Europa
- Cobra en USD vía PayPal
- Necesita declarar impuestos en Chile (SII)
- Usa herramientas modernas
- Valora la privacidad (local-first)
- Quiere simplicidad, no enterprise

---

## Modelo de Negocio

### Open Source (AGPL-3.0)

- Código abierto, self-hostable
- Deploy gratis en Vercel/Netlify
- Comunidad puede contribuir
- Documentación completa

### SaaS Hosted

| Plan | Precio | Límites |
|------|--------|---------|
| Free | $0 | 5 deals/mes, 10 documentos/mes |
| Pro | $9/mes | Ilimimitado, soporte prioritario |
| Team | $29/mes | Multi-usuario, workspaces compartidos |

---

## Diferenciadores

1. **Local-first real** — no requiere registro para empezar
2. **Multi-tenant desde el diseño** — escala a SaaS sin refactor
3. **Ecosystem Chile/USA** — SII + PayPal + USD/CLP built-in
4. **PDF con texto real** — no imágenes, profesional
5. **Open source AGPL** — confianza, auditoría, contribución

---

## Métricas de Éxito

| Métrica | Objetivo (6 meses) |
|---------|-------------------|
| GitHub Stars | 500+ |
| Usuarios activos (hosted) | 100+ |
| Contribuidores | 10+ |
| NPS | > 50 |
| Uptime SaaS | 99.9% |

---

## Roadmap de Alto Nivel

| Fase | Entrega | Timeline |
|------|---------|----------|
| 0 — Fundamentos | Datos, PDF cliente, navegación | Semana 1-2 |
| 1 — CRM | Clientes, pipeline, historial | Semana 3-4 |
| 2 — Multi-docs | Cotización, solicitud, recordatorio | Semana 5 |
| 3 — Seguimiento | Follow-ups, templates correo | Semana 6 |
| 4 — Tiempos | Timer, reportes, tarifa real | Semana 7 |
| 5 — Dashboard | KPIs, gráficos | Semana 8 |
| 6 — Pulido | Onboarding, responsive, a11y | Semana 9 |
| 7 — SaaS | Supabase, auth, billing | Semana 10-12 |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| pdfmake limitado para documentos complejos | Permitir custom CSS futuro |
| LocalStorage limitado (5-10MB) | Compresión, export, migración a cloud |
| Competencia (Bonsai, Hello Bonsay) | Nicho Chile/USA + local-first |
| Adopción de paid plan | Freemium generoso, valor visible |
| Mantenimiento dual (local + cloud) | Adapter pattern sólido |

---

## Stack y Arquitectura

Ver `ROADMAP.md` para detalle técnico completo.

---

## Apéndice: Flujo de Usuario

```
1. Landing/Onboarding
   └── Configurar perfil freelancer
   └── Configurar tasas (SII, PayPal, fallback USD)

2. Crear Oportunidad (/new)
   └── Ingresar cliente, servicio, monto líquido
   └── Calculadora muestra desglose en tiempo real
   └── Generar documento (Cotización / Solicitud)
   └── Guardar como Deal → aparece en Pipeline

3. Pipeline (/pipeline)
   └── Ver deals por estado (Kanban)
   └── Mover deal entre estados
   └── Alertas de follow-up

4. Seguimiento (/tracking)
   └── Ver acciones de hoy
   └── Crear follow-ups
   └── Enviar templates de correo

5. Tiempos (/times)
   └── Iniciar timer en deal activo
   └── Registrar horas
   └── Ver tarifa real post-deducciones

6. Dashboard (/)
   └── KPIs del negocio
   └── Tendencias mensuales
   └── Top clientes

7. Configuración (/settings)
   └── Editar perfil
   └── Editar defaults
   └── Backup/restore
```
