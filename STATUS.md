# Quant — Status del proyecto

**Fecha:** 03-07-2026 · **Etapa:** Prototipo navegable (Fase 1 + Fase 1.5) con data sintética

## Resumen

El prototipo cubre el 100% de la arquitectura de información del [PRD v1.4](PRD_Quant_MetLife_Chile.md): 15 módulos en 5 zonas (Monitoreo, ALM & Derivados, Estrategia & Pricing, Gobierno, Mi espacio), con context bar global (cartera / fecha de corte / CLP-UF-USD / benchmark), command palette ⌘K, toggle Ejecutiva/Analista, drill-down consistente, exportación contextual, deep-linking por URL, login con SSO simulado y **plataforma extensible** (builder de vistas, galería de módulos, propuestas de la comunidad). Sin build ni dependencias: HTML/CSS/JS puro servido estático.

## Hecho

| Área | Estado |
|---|---|
| Fase 1 — Monitoreo (Inicio, Cartera, Resultados, Cumplimiento) | ✅ Completo con data sintética |
| Fase 1 — ALM base (Proyecciones, Modelos: Calce/TSA/Valorización) | ✅ Completo |
| Fase 1 — Gobierno (Procedimientos, FAQ/Glosario) | ✅ Completo |
| Gobierno documental — **catálogo de 7 políticas** (Catálogo · Ficha de política · Límites parametrizados · Versiones), cada una con dueño, comité aprobador, límites propios y versionado independiente | ✅ Completo (v1.3, corrige el modelo de política única) |
| Fase 1.5 — Derivados & Colateral (posiciones, calce con derivados, estrés → colaterales, CSA) | ✅ Completo |
| Fase 1.5 — Liquidez (buckets/haircuts, estrés 12M en veces, fuentes y usos 90d) | ✅ Completo |
| Fase 1.5 — Rentas Vitalicias (pricing por producto, SCOMP, sensibilidades, histórico) | ✅ Completo |
| Fase 1.5 — Relative Value (screener z-score, pares, ideas/watchlist) | ✅ Completo |
| Fase 1.5 — Optimización (frontera, actual vs. óptimo, restricciones → Cumplimiento, corridas) | ✅ Completo |
| Transversales (context bar, ⌘K, conciliación, semáforos, export CSV contextual, deep-links) | ✅ Completo |
| Login con SSO simulado (roles Analista/Ejecutivo → vista por defecto, sesión por pestaña, logout) | ✅ Completo (demo; SSO real pendiente de IdP) |
| Plataforma extensible — builder de vistas (16 widgets), zona "Mi espacio" en sidebar, galería de módulos (dueño/madurez/adopción), propuestas de la comunidad con votos y ciclo de vida, zonas colapsables | ✅ Completo (v1.4; persistencia demo en localStorage) |
| PRD actualizado a v1.4 (plataforma extensible, §6.3 y §7.16–7.18) | ✅ En el repo |

Verificación: los 14 módulos y sus ~48 sub-tabs (incl. 7 fichas de política) renderizan sin errores de consola en CLP, UF y USD; conversión validada (MM$ 6.920.850 ≈ 176.358 M UF ≈ 7.404 MM US$); los 12 límites de Cumplimiento quedan enlazados a exactamente su política de origen.

## Decisiones de diseño relevantes

- **Zonificación por ritmo de trabajo** (diario → comité → consulta), no por taxonomía de activos.
- **Patrón "ejercicio"** común a los módulos de mesa: resultado titular con semáforo → detalle → supuestos (fecha + responsable) → historial de corridas.
- Los estreses viven **junto a lo que estresan** (colaterales en Derivados, liquidez en Liquidez).
- Quant **no calcula**: muestra resultados versionados de motores existentes (actuarial, ALM, optimizador).
- **La gobernanza documental es un catálogo, no una página**: cada política tiene dueño, comité aprobador y versionado propio (patrón catálogo → ficha, igual que Cartera → Ficha instrumento y Cumplimiento → Detalle por norma).
- **Plataforma, no portal cerrado**: los usuarios construyen vistas con widgets curados (misma fuente y corte que los módulos oficiales), proponen secciones que la comunidad vota, y la galería hace visible dueño/madurez/adopción de cada módulo — la flexibilidad tiene contrapeso de curaduría (Beta → Oficial vía comité de producto).

## Pendiente / próximos pasos

1. **Validar la IA de Fase 1.5 con la mesa** (¿faltan ejercicios? ¿nombres correctos?) y las preguntas abiertas #10–14 del PRD (fuente de derivados/CSA, feed SCOMP, formato del optimizador, umbrales internos, gobernanza del pricing).
2. Definir stack real (el prototipo es desechable por diseño) y biblioteca de componentes MetLife.
3. Integraciones de datos reales (custodio, market data, contable, ALM) + capa de conciliación.
4. SSO corporativo y matriz de roles.
5. Plataforma extensible: mover vistas personales de localStorage a backend por usuario, matriz de permisos a nivel de widget (pregunta abierta #16), drag & drop y compartir vistas, notificaciones de cambio de estado de propuestas.
6. Fase 2: órdenes, rebalanceo (conectado a Optimización e Ideas), workflows de aprobación.

## Cómo correr

```bash
node .claude/serve.js   # → http://localhost:4173
```
