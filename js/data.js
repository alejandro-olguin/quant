/* ============================================================
   Quant · Cliente de datos (capa API)
   ------------------------------------------------------------
   La data ya NO vive embebida en el bundle: se consulta desde la API.
   En el prototipo, la "API" son archivos JSON estáticos en /data
   (uno por recurso/endpoint), servidos por el mismo servidor estático.
   En producción, QUANT_API_BASE apunta al backend (Synapse sobre
   parquet · base documental · apps dinámicas) y cada recurso es un
   endpoint REST; el resto del portal no cambia.

   Flujo: al iniciar sesión, loadAllData() hidrata el cache de cliente
   (los globales que consumen las vistas vía DataSource). Los montos
   base siguen en MM CLP.
   ============================================================ */

/* Config de entorno inyectada por config.js (runtime). Fallback al prototipo
   si no está presente, para que la app no se rompa si config.js falta. */
const __CFG = (typeof window !== 'undefined' && window.QUANT_CONFIG) || {};
const QUANT_API_BASE = __CFG.apiBase || 'data';
const QUANT_API_SUFFIX = __CFG.apiSuffix != null ? __CFG.apiSuffix : '.json';
if (__CFG.entorno) console.info(`Quant · entorno "${__CFG.entorno}" · API: ${QUANT_API_BASE}`);

/* Recursos expuestos por la API. Cada uno resuelve a GET {base}/{recurso}.json
   y trae un bundle de una o más colecciones. El orden no importa (se cargan
   en paralelo). Mapea a las fuentes del PRD §10:
     custodio → posiciones · contable → resultados · ALM/actuarial → modelos/rrvv
     tesorería → derivados/liquidez/pactos · market data → reference · etc. */
const API_RESOURCES = [
  'reference', 'posiciones', 'resultados', 'proyecciones', 'modelos',
  'cumplimiento', 'politicas', 'procedimientos', 'faq', 'derivados',
  'liquidez', 'rrvv', 'relval', 'optimizacion', 'inmobiliario',
  'alternativos', 'pactos', 'plataforma',
];

/* Cliente HTTP mínimo. get() acepta params (cartera, corte…) que en producción
   viajan como querystring; hoy la data sintética es única por recurso y los
   ignora, pero deja explícito el contrato para cuando el backend filtre por
   contexto. */
const QuantAPI = {
  async get(resource, params = {}) {
    const qs = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${QUANT_API_BASE}/${resource}${QUANT_API_SUFFIX}${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${resource}: HTTP ${res.status}`);
    return res.json();
  },
};

/* Hidrata el cache de cliente: trae todos los recursos y publica sus colecciones
   como globales (POSICIONES, LIMITES, …) que las vistas leen vía DataSource.
   Idempotente: sólo consulta la primera vez. */
let __quantDataLoaded = false;
async function loadAllData() {
  const bundles = await Promise.all(API_RESOURCES.map(r => QuantAPI.get(r)));
  bundles.forEach(bundle => Object.assign(window, bundle));
  __quantDataLoaded = true;
}
async function ensureData() {
  if (__quantDataLoaded) return;
  await loadAllData();
}

/* Paleta por clase de activo — tema visual del portal, no data de negocio:
   se queda en el cliente (no se consulta a la API). */
const CLASE_COLORS = {
  'Renta Fija Local': '#007ABC',
  'Renta Fija Internacional': '#0090DA',
  'Renta Variable': '#379B94',
  'Inmobiliario': '#1E4C76',
  'Mutuos Hipotecarios': '#A4CE4E',
  'Alternativos': '#5B7F95',
  'Caja y Equivalentes': '#C7D2DD',
};
