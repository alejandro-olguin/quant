/* ============================================================
   Quant · Configuración de entorno (runtime, no build-time)
   ------------------------------------------------------------
   Este archivo se despliega DISTINTO por ambiente (prototipo / QA /
   producción); el bundle estático (js/*, css/*) es idéntico en todos.
   Así el mismo static webapp apunta a la fuente de datos correcta sin
   recompilar: basta reemplazar config.js en el hosting.

   - apiBase:   raíz de la API de datos.
       · Prototipo (este repo): 'data' → JSON estáticos servidos junto a la app.
       · Producción: URL del backend, p.ej. 'https://api-quant.metlife.cl/v1'
         (Azure Function/DuckDB sobre Synapse-parquet; ver docs/).
   - apiSuffix: sufijo de cada recurso.
       · Prototipo: '.json' (archivos estáticos).
       · REST real: '' (rutas /reference, /posiciones, …).
   - entorno:   etiqueta informativa (se muestra en consola al bootear).

   Se sirve con Cache-Control: no-store (ver staticwebapp.config.json) para
   que un cambio de ambiente tome efecto sin caché intermedia.
   ============================================================ */
window.QUANT_CONFIG = {
  apiBase: 'data',
  apiSuffix: '.json',
  entorno: 'prototipo',
};
