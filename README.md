# Quant — Portal de Inversiones · MetLife Chile (MVP)

Prototipo funcional (Fase 1 + Fase 1.5, solo lectura) del portal descrito en el [PRD v1.4](PRD_Quant_MetLife_Chile.md), con **data 100% sintética**. Estado actual en [STATUS.md](STATUS.md).

## Cómo correrlo

Sin build ni dependencias — es HTML/CSS/JS puro:

```bash
node .claude/serve.js
# → http://localhost:4173
```

(o cualquier servidor estático — `python3 -m http.server 4173` también sirve; abrir `index.html` directo funciona igual)

## Qué incluye

- **14 módulos en 4 zonas por ritmo de trabajo** (todos con sus sub-tabs):
  - **Monitoreo** (diario): Inicio · Cartera · Resultados · Cumplimiento.
  - **ALM & Derivados**: Proyecciones · Modelos (Calce/TSA) · **Derivados & Colateral** (posiciones, calce con derivados, estrés MTM → llamados de margen vs. colateral, CSA) · **Liquidez** (buckets con haircut, estrés 12M, fuentes y usos).
  - **Estrategia & Pricing** (comités): **Rentas Vitalicias** (pricing del día, SCOMP, sensibilidades, histórico) · **Relative Value** (screener de spreads con z-scores, pares, ideas) · **Optimización** (frontera eficiente, actual vs. óptimo, restricciones enlazadas a Cumplimiento, corridas).
  - **Gobierno**: **Políticas** (catálogo de 7 documentos por área — general, riesgo de crédito, derivados, liquidez, ALM, pricing RRVV, relative value — cada uno con ficha, límites asociados y versionado propio) · Procedimientos · FAQ + Glosario.
  - **Mi espacio** (plataforma extensible): **Explorar y proponer** — galería de módulos con dueño/madurez/adopción, propuestas de la comunidad con votos y ciclo de vida, y **builder de vistas personalizadas** (16 widgets del catálogo, sin código); las vistas del usuario viven en el sidebar, respetan la context bar y pueden proponerse al catálogo común.
- **Patrón "ejercicio"** en los módulos de mesa: resultado con semáforo → detalle → supuestos → historial de corridas; fila de estado de ejercicios en Inicio.
- **Login con SSO simulado**: pantalla de inicio de sesión con branding MetLife, ingreso rápido demo como Analista o Ejecutivo (define la vista por defecto), sesión persistente en la pestaña y cierre de sesión desde el sidebar.
- **UI que escala a muchas secciones**: zonas del sidebar colapsables con contador, pestañas con overflow horizontal, y la galería como punto de descubrimiento cuando el sidebar no alcanza.
- **Context bar global** (patrón Bloomberg PORT): cartera, fecha de corte, moneda CLP/UF/USD y benchmark; recalcula todas las vistas. Incluye indicador de conciliación (patrón Clearwater).
- **Command palette ⌘K**: módulos, instrumentos, emisores, límites y documentos.
- **Toggle Ejecutiva / Analista** con dos densidades de información.
- **Drill-down consistente** (patrón Aladdin): KPI → módulo → instrumento → ficha → límites a los que contribuye → detalle en Cumplimiento.
- **Exportación contextual**: el CSV de posiciones respeta filtros, moneda y fecha de corte.
- **Deep-linking**: `#modulo/tab` en la URL.
- Branding MetLife: paleta azul/verde oficial, un gradiente por pantalla, contraste ADA.

## Estructura

```
index.html      shell
css/styles.css  design system
js/data.js      data sintética (posiciones, límites CMF, modelos, docs)
js/charts.js    gráficos SVG sin dependencias
js/app.js       navegación, render, conversión de moneda, palette
```
