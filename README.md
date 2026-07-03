# Quant — Portal de Inversiones · MetLife Chile (MVP)

Prototipo funcional (Fase 1 + Fase 1.5, solo lectura) del portal descrito en el [PRD v1.2](PRD_Quant_MetLife_Chile.md), con **data 100% sintética**. Estado actual en [STATUS.md](STATUS.md).

## Cómo correrlo

Sin build ni dependencias — es HTML/CSS/JS puro:

```bash
python3 -m http.server 4173
# → http://localhost:4173
```

(o cualquier servidor estático; abrir `index.html` directo también funciona)

## Qué incluye

- **14 módulos en 4 zonas por ritmo de trabajo** (todos con sus sub-tabs):
  - **Monitoreo** (diario): Inicio · Cartera · Resultados · Cumplimiento.
  - **ALM & Derivados**: Proyecciones · Modelos (Calce/TSA) · **Derivados & Colateral** (posiciones, calce con derivados, estrés MTM → llamados de margen vs. colateral, CSA) · **Liquidez** (buckets con haircut, estrés 12M, fuentes y usos).
  - **Estrategia & Pricing** (comités): **Rentas Vitalicias** (pricing del día, SCOMP, sensibilidades, histórico) · **Relative Value** (screener de spreads con z-scores, pares, ideas) · **Optimización** (frontera eficiente, actual vs. óptimo, restricciones enlazadas a Cumplimiento, corridas).
  - **Gobierno**: Políticas · Procedimientos · FAQ + Glosario.
- **Patrón "ejercicio"** en los módulos de mesa: resultado con semáforo → detalle → supuestos → historial de corridas; fila de estado de ejercicios en Inicio.
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
