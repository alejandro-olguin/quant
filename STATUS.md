# Quant — Status del proyecto

**Fecha:** 06-07-2026 · **Etapa:** Prototipo navegable (Fase 1 + Fase 1.5) con data sintética

## Resumen

El prototipo cubre el 100% de la arquitectura de información del [PRD v1.4](PRD_Quant_MetLife_Chile.md): Inicio (dashboard suelto) + 24 módulos en 6 zonas por función (Cartera —consolidado + un módulo por clase de activo con gestión propia—, Análisis, Estrategia & Pricing, Riesgo & Límites, Gobierno & Normativa, Mi espacio), con context bar global (cartera / fecha de corte / CLP-UF-USD / benchmark), command palette ⌘K, toggle Ejecutiva/Analista, drill-down consistente, exportación contextual, deep-linking por URL, login con SSO simulado y **plataforma extensible** (builder de vistas, galería de módulos, propuestas de la comunidad). Ahora sobre una **arquitectura de plug-in**: cada módulo es un objeto autodescrito que el shell descubre solo, con adaptador de render (nativo / app embebida) y proveedor de datos que desacopla el módulo de su fuente. Sin build ni dependencias: HTML/CSS/JS puro servido estático.

## Hecho

| Área | Estado |
|---|---|
| Fase 1 — Monitoreo (Inicio, Cartera, Resultados, Cumplimiento) | ✅ Completo con data sintética |
| Fase 1 — ALM base (Proyecciones + los modelos como módulos independientes: **Calce / ALM**, **TSA**, **Valorización**, **Supuestos y corridas** — antes pestañas de un único "Modelos") | ✅ Completo |
| Fase 1 — Gobierno (Procedimientos, FAQ/Glosario) | ✅ Completo |
| Gobierno documental — **catálogo de 7 políticas** (Catálogo · Ficha de política · Límites parametrizados · Versiones), cada una con dueño, comité aprobador, límites propios y versionado independiente | ✅ Completo (v1.3, corrige el modelo de política única) |
| Fase 1.5 — Derivados & Colateral (posiciones, calce con derivados, estrés → colaterales, CSA) | ✅ Completo |
| Fase 1.5 — Liquidez (buckets/haircuts, estrés 12M en veces, fuentes y usos 90d) | ✅ Completo |
| Fase 1.5 — Rentas Vitalicias (pricing por producto, SCOMP, sensibilidades, histórico) | ✅ Completo |
| Fase 1.5 — Relative Value (screener z-score, pares, ideas/watchlist) | ✅ Completo |
| Fase 1.5 — Optimización (frontera, actual vs. óptimo, restricciones → Cumplimiento, corridas) | ✅ Completo |
| Transversales (context bar, ⌘K, conciliación, semáforos, export CSV contextual, deep-links) | ✅ Completo |
| Navegación por sección — sidebar con lista acotada por zona (4 módulos) + "Ver más / Ver sección" que abre el **sub-portal de la sección** (ruta `zona:<id>`, galería de todos sus módulos con dueño/madurez/adopción/origen) | ✅ Completo (06-07-2026) |
| Cartera por clase de activo — **Inicio** pasa a ítem suelto arriba del sidebar; la sección **Cartera** agrupa el **Consolidado** + un módulo por clase con gestión propia (**Renta Fija**, **Derivados**, **Inmobiliario**, **Alternativos**) + **Resultados**. **Derivados y Colateral se separaron en dos módulos**: **Derivados** (Posiciones, Calce con derivados) en Cartera, y **Colateral & CSA** (Estrés y colaterales, Contrapartes y CSA) en **Riesgo & Límites** | ✅ Completo (06-07-2026) |
| Inmobiliario — gestión real: pestaña **Edificios en renta** con **mapa esquemático clickeable** del Gran Santiago (marcador = valor, color = morosidad) → detalle por edificio (arriendo, ocupación, cap rate, arrendatarios con estado de mora); pestañas **Mutuos comerciales + leasing** y **Mutuos residenciales** (por tramo LTV, con morosidad y prepago). Data en `EDIFICIOS/MUTUOS_COM/MUTUOS_RES` | ✅ Completo (06-07-2026) |
| Pactos (Repos) — módulo en Cartera: pactos de retrocompra/retroventa (inversión de caja vs. financiamiento), escalera de vencimientos por plazo, exposición por contraparte y cobertura de colateral. Data en `PACTOS`, proveedor `dataSource('pactos')` | ✅ Completo (06-07-2026) |
| Alternativos — programa de fondos (PE, REIT, infra, deuda privada): **Resumen** (compromiso/llamado/distribuido/NAV, DPI/TVPI, exposición por tipo), **Distribuciones y contribuciones** (J-curve agregada + por fondo), **Rentabilidad y riesgo** (TIR/TVPI/DPI/RVPI, vol) y **Proyecciones** (llamados y dry powder). Data en `ALT_FONDOS/ALT_CASHFLOW/ALT_PROYECCION` | ✅ Completo (06-07-2026) |
| Login con SSO simulado (roles Analista/Ejecutivo → vista por defecto, sesión por pestaña, logout) | ✅ Completo (demo; SSO real pendiente de IdP) |
| Plataforma extensible — builder de vistas (16 widgets), zona "Mi espacio" en sidebar, galería de módulos (dueño/madurez/adopción), propuestas de la comunidad con votos y ciclo de vida, zonas colapsables | ✅ Completo (v1.4; persistencia demo en localStorage) |
| **Arquitectura de plug-in** — contrato único de módulo (`MODULES` + `registerModule`), capacidades declaradas (`export`/`badge`) que eliminan whitelists/casos especiales del shell, adaptador de render (`nativo` / `app` embebida en iframe con contexto por parámetros), proveedor de datos `dataSource` que desacopla el módulo de su fuente (API Synapse / base / app), y galería que muestra origen + ciclo de vida (Propuesta → En integración → Beta → Oficial) desde el propio objeto del módulo | ✅ Completo (v1.5; Cartera y Cumplimiento migrados al proveedor; **Laboratorio ESG** como módulo `app` de ejemplo en `apps/esg-lab.html`) |
| PRD actualizado a v1.4 (plataforma extensible, §6.3 y §7.16–7.18) | ✅ En el repo |

Verificación: los 16 módulos y sus sub-tabs (incl. 7 fichas de política) renderizan sin errores en CLP, UF y USD (harness de render sobre cada módulo/tab/moneda, por indisponibilidad de Node en el entorno se validó con `deno`); conversión validada (MM$ 6.920.850 ≈ 176.358 M UF ≈ 7.404 MM US$); los 12 límites de Cumplimiento quedan enlazados a exactamente su política de origen.

## Decisiones de diseño relevantes

- **Zonificación por función** (Cartera · Análisis · Estrategia & Pricing · Riesgo & Límites · Gobierno & Normativa · Mi espacio) — buckets generales de misma altura donde cada módulo tiene un hogar obvio y los nuevos generalizan. Se separó Análisis de Estrategia & Pricing (06-07-2026) al dividir "Modelos" en 4 módulos, que dejaba una zona con 9; ahora ninguna zona pasa de 5. Reemplaza (06-07-2026) la zonificación anterior "por ritmo de trabajo" (diario → comité → consulta): el ritmo es subjetivo y por rol, la función es objetiva y escala mejor para un catálogo extensible. La zona es **obligatoria y validada** (sin bucket comodín): un módulo que no encaja detiene su integración con un error claro, forzando una decisión de taxonomía explícita en vez de un limbo.
- **Patrón "ejercicio"** común a los módulos de mesa: resultado titular con semáforo → detalle → supuestos (fecha + responsable) → historial de corridas.
- Los estreses viven **junto a lo que estresan** (colaterales en Derivados, liquidez en Liquidez).
- Quant **no calcula**: muestra resultados versionados de motores existentes (actuarial, ALM, optimizador).
- **La gobernanza documental es un catálogo, no una página**: cada política tiene dueño, comité aprobador y versionado propio (patrón catálogo → ficha, igual que Cartera → Ficha instrumento y Cumplimiento → Detalle por norma).
- **Plataforma, no portal cerrado**: los usuarios construyen vistas con widgets curados (misma fuente y corte que los módulos oficiales), proponen secciones que la comunidad vota, y la galería hace visible dueño/madurez/adopción de cada módulo — la flexibilidad tiene contrapeso de curaduría (Beta → Oficial vía comité de producto).
- **Módulo como plug-in, no como código incrustado en el shell**: agregar un módulo es un acto local (un objeto autodescrito), no una cirugía transversal. Los usuarios *proponen* módulos construidos fuera de la plataforma (data por API de Synapse, base documental, o apps dinámicas Python/Shiny); el **equipo responsable los integra**, no el usuario. Desde la UX todos se ven y navegan idéntico gracias al adaptador de render y al proveedor de datos — el origen (nativo vs. app, API vs. base) es un detalle de integración invisible para quien usa el portal.

## Pendiente / próximos pasos

1. **Validar la IA de Fase 1.5 con la mesa** (¿faltan ejercicios? ¿nombres correctos?) y las preguntas abiertas #10–14 del PRD (fuente de derivados/CSA, feed SCOMP, formato del optimizador, umbrales internos, gobernanza del pricing).
2. Definir stack real (el prototipo es desechable por diseño) y biblioteca de componentes MetLife.
3. Integraciones de datos reales (custodio, market data, contable, ALM) + capa de conciliación.
4. SSO corporativo y matriz de roles.
5. Plataforma extensible: mover vistas personales de localStorage a backend por usuario, matriz de permisos a nivel de widget (pregunta abierta #16), drag & drop y compartir vistas, notificaciones de cambio de estado de propuestas.
6. **Arquitectura de plug-in**: migrar los 12 módulos restantes al proveedor `dataSource` (hoy Cartera y Cumplimiento; el resto aún lee globals) e implementar los proveedores reales contra la API de Synapse / base / apps; formalizar el flujo de integración de un módulo `app` propuesto (sandbox, auth y paso de contexto vía postMessage); versionado del contrato de módulo.
7. Fase 2: órdenes, rebalanceo (conectado a Optimización e Ideas), workflows de aprobación.

## Cómo correr

```bash
node .claude/serve.js   # → http://localhost:4173
```

> Nota (06-07-2026): en este entorno el binario de Node está roto por un desajuste de `llhttp` de Homebrew (`dyld: libllhttp.9.3.dylib not found`) — no es del código. Arreglar con `brew reinstall node`, o servir con `python3 -m http.server 4173` mientras tanto. La verificación de esta iteración se hizo con `deno` (parse + harness de render).
