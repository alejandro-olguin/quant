# Quant — Portal de Inversiones · MetLife Chile (MVP)

Prototipo funcional (Fase 1 + Fase 1.5, solo lectura) del portal descrito en el [PRD v1.4](PRD_Quant_MetLife_Chile.md), con **data 100% sintética**. Estado actual en [STATUS.md](STATUS.md).

## Cómo correrlo

Sin build ni dependencias — es HTML/CSS/JS puro:

```bash
node .claude/serve.js
# → http://localhost:4173
```

(o cualquier servidor estático — `python3 -m http.server 4173` también sirve). Ahora **requiere servidor**: como la data se consulta con `fetch` a `data/*.json`, abrir `index.html` por `file://` no carga la data (CORS).

## Qué incluye

- **Inicio** — dashboard general, ítem suelto anclado arriba del sidebar (fuera de toda zona).
- **24 módulos en 6 zonas por función** (buckets generales de misma altura, para que cada módulo tenga un hogar obvio y los nuevos generalicen; varios con sus sub-tabs):
  - **Cartera** (consolidado + un módulo por clase de activo con gestión propia): **Consolidado** (todas las posiciones, composición, movimientos, ficha) · **Renta Fija** (duración, TIR, rating y composición) · **Derivados** (posiciones del libro de derivados y su efecto en el calce) · **Inmobiliario** (edificios en renta con **mapa clickeable** → arriendos, morosidad, ocupación y arrendatarios por edificio; **mutuos comerciales + leasing**; **mutuos residenciales** por tramo LTV) · **Alternativos** (fondos PE/REIT/infra/deuda privada: **distribuciones y contribuciones** agregadas y por fondo, **rentabilidad y riesgo** TIR/TVPI/DPI/RVPI, y **proyecciones** de llamados y dry powder) · **Pactos (Repos)** (pactos de retrocompra/retroventa: inversión de caja vs. financiamiento, escalera de vencimientos, contrapartes y cobertura de colateral) · **Resultados** (retornos, atribución, P&L). Renta Fija se alimenta filtrando posiciones por clase; Inmobiliario y Alternativos tienen su propio dominio de gestión — todos vía proveedores `dataSource`.
  - **Análisis**: Proyecciones · **Calce / ALM** (calce por tramo NCG 461) · **TSA** (Test de Suficiencia de Activos) · **Valorización** (metodología por clase) · **Supuestos y corridas** (insumos e historial versionado de los modelos).
  - **Estrategia & Pricing**: **Rentas Vitalicias** (pricing del día, SCOMP, sensibilidades, histórico) · **Relative Value** (screener de spreads con z-scores, pares, ideas) · **Optimización** (frontera eficiente, actual vs. óptimo, restricciones enlazadas a Cumplimiento, corridas) · **Laboratorio ESG** (módulo tipo `app` — backend Python/Shiny embebido, ejemplo del contrato de plug-in).
  - **Riesgo & Límites**: **Cumplimiento** (límites CMF y de política interna) · **Liquidez** (buckets con haircut, estrés 12M, fuentes y usos) · **Colateral & CSA** (estrés de MTM → llamados de margen vs. colateral, contrapartes y acuerdos CSA).
  - **Gobierno & Normativa**: **Políticas** (catálogo de 7 documentos por área — general, riesgo de crédito, derivados, liquidez, ALM, pricing RRVV, relative value — cada uno con ficha, límites asociados y versionado propio) · Procedimientos · FAQ + Glosario.
  - **Mi espacio** (plataforma extensible): **Explorar y proponer** — galería de módulos con dueño/madurez/adopción/origen de datos, propuestas de la comunidad con votos y ciclo de vida, y **builder de vistas personalizadas** (16 widgets del catálogo, sin código); las vistas del usuario viven en el sidebar, respetan la context bar y pueden proponerse al catálogo común.
- **Arquitectura de plug-in — agregar un módulo es un acto local, no una cirugía del shell**: cada módulo es un objeto autodescrito (`MODULES` en `js/app.js`) con su propio `render`, capacidades declaradas (`export`, `badge`), origen de datos y ciclo de vida (Propuesta → En integración → Beta → Oficial). El shell (sidebar, ⌘K, galería, navegación, deep-link, export) lo descubre solo. Un **adaptador de render** enmarca por igual módulos nativos (vista JS) y módulos tipo `app` (app externa —p.ej. Python/Shiny— embebida en iframe e integrada por el equipo responsable, que recibe el contexto global por parámetros). Un **proveedor de datos** (`dataSource`) desacopla cada módulo de su fuente: hoy devuelve data sintética, en producción resuelve contra la API de Synapse / la base documental / la app, sin tocar el módulo ni el shell (ya aplicado en Cartera, Cumplimiento y los módulos por clase — Renta Fija, Inmobiliario, Alternativos, Pactos).
- **Patrón "ejercicio"** en los módulos de mesa: resultado con semáforo → detalle → supuestos → historial de corridas; fila de estado de ejercicios en Inicio.
- **Login con SSO simulado**: pantalla de inicio de sesión con branding MetLife, ingreso rápido demo como Analista o Ejecutivo (define la vista por defecto), sesión persistente en la pestaña y cierre de sesión desde el sidebar.
- **UI que escala a muchas secciones**: cada zona del sidebar muestra un número acotado de módulos y un **"Ver más / Ver sección"** que abre el **sub-portal de esa sección** (ruta `zona:<id>`) — una galería con todos sus módulos (dueño, madurez, adopción, origen de datos), al estilo de "Explorar y proponer". Además, zonas colapsables con contador, pestañas con overflow horizontal, y la galería global como descubrimiento transversal.
- **Context bar global** (patrón Bloomberg PORT): cartera, fecha de corte, moneda CLP/UF/USD y benchmark; recalcula todas las vistas. Incluye indicador de conciliación (patrón Clearwater).
- **Command palette ⌘K**: módulos, instrumentos, emisores, límites y documentos.
- **Toggle Ejecutiva / Analista** con dos densidades de información.
- **Drill-down consistente** (patrón Aladdin): KPI → módulo → instrumento → ficha → límites a los que contribuye → detalle en Cumplimiento.
- **Exportación contextual**: el CSV de posiciones respeta filtros, moneda y fecha de corte.
- **Deep-linking**: `#modulo/tab` en la URL.
- Branding MetLife: paleta azul/verde oficial, un gradiente por pantalla, contraste ADA.

## Estructura

```
index.html              shell
config.js               config de entorno (runtime): apiBase/apiSuffix por ambiente
css/styles.css          design system
data/*.json             "API": un JSON por recurso/endpoint (reference, posiciones,
                        cumplimiento, politicas, inmobiliario, alternativos, pactos, …)
js/data.js              cliente de datos: QuantAPI.get() (fetch) + loadAllData() que
                        hidrata el cache de cliente al iniciar sesión (antes: data embebida)
js/charts.js            gráficos SVG sin dependencias
js/app.js               contrato de módulos (MODULES + registerModule), adaptador de render,
                        proveedor de datos (DataSource), navegación, conversión de moneda, palette
apps/esg-lab.html       ejemplo de módulo tipo `app` (backend Python/Shiny simulado)
staticwebapp.config.json  config de hosting (Azure Static Web Apps): MIME, no-store, fallback SPA
```

La data ya **no viaja embebida en el bundle**: se consulta desde la API. En el prototipo la API son los `data/*.json` (servidos por el mismo servidor estático); en producción apunta al backend y cada archivo es un endpoint REST. Consecuencia: el portal necesita el servidor (`node .claude/serve.js`) — abrir `index.html` por `file://` ya no carga la data (CORS).

### Despliegue como static webapp (mismo bundle, config por ambiente)

Quant es un SPA estático (sin build) con routing por **hash** (`#modulo/tab`) — no necesita reescritura de rutas en el servidor. Para hospedarlo (Azure Static Web Apps / Storage static website / App Service) apuntando al backend real, **no se recompila nada**: se despliega un `config.js` distinto por ambiente.

```js
// config.js en producción
window.QUANT_CONFIG = {
  apiBase: 'https://api-quant.metlife.cl/v1',  // API sobre Synapse/parquet (ver docs/)
  apiSuffix: '',                                // REST: /posiciones en vez de /posiciones.json
  entorno: 'produccion',
};
```

`js/data.js` lee esa config en runtime (con fallback al prototipo). `config.js` y `data/*` se sirven `no-store` (ver `staticwebapp.config.json`) para que un cambio de ambiente o un refresco de datos tome efecto sin caché. Nota: la API en otro origen necesita CORS habilitado; Synapse en sí no hospeda el SPA — hospeda/expone los datos, y el static host sirve el bundle que los consume.

## Backend / arquitectura de datos (referencia)

El prototipo sirve data sintética estática, pero el backend real vive en Synapse sobre parquet (zonas rdz/cdz/mdz). Para exponer **datos de detalle pesados** (p. ej. cashflows por instrumento o por grupos dinámicos de instrumentos) sin romper la premisa de bajo costo:

- [docs/detail-data-serving-architecture.md](docs/detail-data-serving-architecture.md) — recomendación de arquitectura: compute-on-read con Azure Function + DuckDB sobre parquet, y caché de resultados por `hash(set + AsAt)` como mdz materializada de forma perezosa (vs. pre-generar JSON en mdz o mover a Azure SQL).
- [docs/reference/cashflows-api/](docs/reference/cashflows-api/) — esqueleto de implementación de esa Function (lookup en caché → DuckDB → escritura en caché).

### Cómo se agrega un módulo nuevo

Un objeto en `MODULES` (o una llamada a `registerModule({...})`) — nada más. El shell lo publica en sidebar, galería, ⌘K, deep-linking y export automáticamente. La `zona` es obligatoria y debe ser una de las definidas (`portafolio`, `analisis`, `estrategia`, `riesgo`, `gobierno`, `plataforma`); si no existe, el módulo no se registra y se avisa por consola (sin bucket comodín):

```js
registerModule({
  id: 'esg-lab', nombre: 'Laboratorio ESG', icon: 'grid', zona: 'analisis',
  desc: 'App dinámica de scoring ESG…', tabs: [],
  kind: 'app', render: { url: 'apps/esg-lab.html' },   // o kind:'nativo', render: vMiVista
  fuente: 'app', owner: 'Riesgo · Sostenibilidad', estado: 'Beta', adopcion: 14,
});
```
