# Quant — Status del proyecto

**Fecha:** 03-07-2026 · **Etapa:** Prototipo navegable (Fase 1 + Fase 1.5) con data sintética

## Resumen

El prototipo cubre el 100% de la arquitectura de información del [PRD v1.2](PRD_Quant_MetLife_Chile.md): 14 módulos en 4 zonas (Monitoreo, ALM & Derivados, Estrategia & Pricing, Gobierno), con context bar global (cartera / fecha de corte / CLP-UF-USD / benchmark), command palette ⌘K, toggle Ejecutiva/Analista, drill-down consistente, exportación contextual y deep-linking por URL. Sin build ni dependencias: HTML/CSS/JS puro servido estático.

## Hecho

| Área | Estado |
|---|---|
| Fase 1 — Monitoreo (Inicio, Cartera, Resultados, Cumplimiento) | ✅ Completo con data sintética |
| Fase 1 — ALM base (Proyecciones, Modelos: Calce/TSA/Valorización) | ✅ Completo |
| Fase 1 — Gobierno (Políticas, Procedimientos, FAQ/Glosario) | ✅ Completo |
| Fase 1.5 — Derivados & Colateral (posiciones, calce con derivados, estrés → colaterales, CSA) | ✅ Completo |
| Fase 1.5 — Liquidez (buckets/haircuts, estrés 12M en veces, fuentes y usos 90d) | ✅ Completo |
| Fase 1.5 — Rentas Vitalicias (pricing por producto, SCOMP, sensibilidades, histórico) | ✅ Completo |
| Fase 1.5 — Relative Value (screener z-score, pares, ideas/watchlist) | ✅ Completo |
| Fase 1.5 — Optimización (frontera, actual vs. óptimo, restricciones → Cumplimiento, corridas) | ✅ Completo |
| Transversales (context bar, ⌘K, conciliación, semáforos, export CSV contextual, deep-links) | ✅ Completo |
| Login con SSO simulado (roles Analista/Ejecutivo → vista por defecto, sesión por pestaña, logout) | ✅ Completo (demo; SSO real pendiente de IdP) |
| PRD actualizado a v1.2 (zonas, módulos nuevos, integraciones, preguntas abiertas #10–14) | ✅ En el repo |

Verificación: los 14 módulos y sus ~45 sub-tabs renderizan sin errores de consola en CLP, UF y USD; conversión validada (MM$ 6.920.850 ≈ 176.358 M UF ≈ 7.404 MM US$).

## Decisiones de diseño relevantes

- **Zonificación por ritmo de trabajo** (diario → comité → consulta), no por taxonomía de activos.
- **Patrón "ejercicio"** común a los módulos de mesa: resultado titular con semáforo → detalle → supuestos (fecha + responsable) → historial de corridas.
- Los estreses viven **junto a lo que estresan** (colaterales en Derivados, liquidez en Liquidez).
- Quant **no calcula**: muestra resultados versionados de motores existentes (actuarial, ALM, optimizador).

## Pendiente / próximos pasos

1. **Validar la IA de Fase 1.5 con la mesa** (¿faltan ejercicios? ¿nombres correctos?) y las preguntas abiertas #10–14 del PRD (fuente de derivados/CSA, feed SCOMP, formato del optimizador, umbrales internos, gobernanza del pricing).
2. Definir stack real (el prototipo es desechable por diseño) y biblioteca de componentes MetLife.
3. Integraciones de datos reales (custodio, market data, contable, ALM) + capa de conciliación.
4. SSO corporativo y matriz de roles.
5. Fase 2: órdenes, rebalanceo (conectado a Optimización e Ideas), workflows de aprobación.

## Cómo correr

```bash
python3 -m http.server 4173   # → http://localhost:4173
```
