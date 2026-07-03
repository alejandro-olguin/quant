# PRD — Proyecto Quant
### Portal de Gestión de Inversiones · MetLife Chile

| | |
|---|---|
| **Producto** | Quant — Portal web de inteligencia y gestión de cartera |
| **Cliente interno** | Gerencia de Inversiones, MetLife Chile |
| **Versión del documento** | 1.2 — incorpora la **capa de mesa y ALM avanzado** (rentas vitalicias, derivados y colaterales, liquidez, relative value, optimización) y la reorganización de la navegación en cuatro zonas |
| **Fecha** | Julio 2026 |
| **Estado** | MVP (Fase 1) construido como prototipo navegable · Fase 1.5 en definición |
| **Idioma del producto** | Español (Chile) como principal; inglés como secundario para reporting corporativo |

**Changelog**
- **v1.2 (jul 2026):** se agregan los módulos Rentas Vitalicias, Derivados & Colateral, Liquidez, Relative Value y Optimización (Fase 1.5); el sidebar pasa de 2 a 4 zonas organizadas por ritmo de trabajo; nuevas integraciones (SCOMP, sistema de derivados/tesorería, pricing actuarial) y nuevas preguntas abiertas.
- **v1.1:** arquitectura UX basada en benchmarking de vendors (Aladdin, Bloomberg PORT, Clearwater).

---

## 1. Resumen ejecutivo

**Quant** es un portal web interno que centraliza la gestión, análisis y gobierno de la cartera de inversiones de MetLife Chile — un equivalente acotado a plataformas como **BlackRock Aladdin** o una **terminal Bloomberg**, pero adaptado a la realidad de una compañía de seguros regulada por la **CMF** en Chile.

El producto se construye por fases:

- **Fase 1 (MVP) — Analítica y monitoreo:** capa de *solo lectura* que unifica dashboards de cartera, tablas de resultados, proyecciones y modelos, junto con módulos de gobierno (políticas, procedimientos y FAQ). *Construida como prototipo navegable con data sintética.*
- **Fase 1.5 — Analítica de mesa y ALM avanzado (esta versión):** incorpora los **ejercicios recurrentes del equipo** que hoy viven en planillas y presentaciones de comité: pricing de rentas vitalicias, calce con derivados, estrés de derivados para gestión de colaterales, estrés de liquidez, relative value y optimización de portafolio. Sigue siendo *solo lectura*: el portal **muestra los resultados de los ejercicios** con sus supuestos y versiones; no ejecuta transacciones.
- **Fase 2 — Gestión operativa:** capacidades transaccionales (órdenes, rebalanceo, workflows de aprobación) sobre la misma base de datos y diseño.

El portal sigue el **design system oficial de MetLife** (paleta azul/verde, uso contenido de gradientes, cumplimiento de contraste ADA).

---

## 2. Contexto y problema

### 2.1 Situación actual (hipótesis a validar)
Hoy la información de la cartera de inversiones de MetLife Chile vive distribuida en múltiples planillas, reportes PDF y sistemas fuente (custodios, market data, contabilidad de inversiones). Esto genera:

- **Fragmentación:** no existe una vista consolidada y en tiempo cuasi-real de la cartera.
- **Esfuerzo manual:** consolidar posiciones, calcular métricas y armar reportes consume tiempo del equipo de inversiones.
- **Riesgo de error y trazabilidad:** versiones distintas de la misma cifra; difícil auditar el origen de un dato.
- **Gobierno disperso:** políticas de inversión, límites y procedimientos no están junto a los datos que rigen.
- **(v1.2) Ejercicios recurrentes sin hogar:** el pricing de RRVV, los estreses de derivados/colaterales y liquidez, los estudios de relative value y las corridas de optimización se preparan ad-hoc para cada comité, sin versionado, sin supuestos trazables y sin vínculo con la cartera y los límites que gobiernan.

### 2.2 Costo de no resolverlo
Menor agilidad para decisiones de inversión, mayor exposición a errores operacionales, fricción en el cumplimiento de límites regulatorios (CMF) y dependencia de personas clave para producir información.

---

## 3. Objetivos y no-objetivos

### 3.1 Objetivos (Fase 1 + 1.5)
1. **Fuente única de verdad:** consolidar posiciones, resultados y métricas de la cartera en un solo portal, reduciendo el uso de planillas paralelas.
2. **Reducir tiempo de reporting:** disminuir el tiempo de armado de reportes de cartera para el equipo de inversiones en ≥50%.
3. **Visibilidad ejecutiva:** entregar a alta gerencia/directorio una vista sintética y confiable del estado de la cartera sin intermediación manual.
4. **Gobierno integrado:** que políticas, procedimientos y FAQ estén accesibles junto a los datos que gobiernan.
5. **(v1.2) Institucionalizar los ejercicios de mesa:** que cada ejercicio recurrente (pricing RRVV, estrés de colaterales, estrés de liquidez, relative value, optimización) tenga una vista estándar, con **supuestos documentados, fecha de corrida, responsable y versionado** — el mismo patrón ya definido para Modelos.
6. **Base extensible:** dejar una arquitectura de datos y UI que soporte la Fase 2 (operativa) sin rediseño mayor.

### 3.2 No-objetivos (explícitamente fuera de alcance)
1. **Ejecución de órdenes / trading.** Fase 2; el portal es de solo lectura.
2. **Rebalanceo automático y workflows de aprobación.** Fase 2.
3. **Motor de cálculo propio para pricing, optimización o estrés.** Quant **muestra los resultados** de los motores existentes (actuarial, ALM, optimizador, planillas certificadas) con sus supuestos; no los reemplaza ni recalcula. La interactividad "what-if" en línea se difiere a Fase 2/3.
4. **Gestión operativa de colaterales (llamados de margen, instrucciones de settlement).** El portal monitorea y estresa; la operación sigue en Tesorería/Operaciones.
5. **Módulos de riesgo/compliance como área usuaria dedicada.** Stakeholders secundarios.
6. **App móvil nativa.** Web responsivo.
7. **Reemplazo de sistemas contables o de custodia.** Quant *consume* de esos sistemas.

---

## 4. Usuarios y personas

### 4.1 Usuarios primarios

**A. Equipo de inversiones / Portfolio Managers**
- Necesitan profundidad: posiciones detalladas, métricas por instrumento, atribución, proyecciones, modelos, y ahora los ejercicios de mesa (RRVV, derivados, liquidez, RV, optimización).
- Uso frecuente (diario), sesiones largas, interacción con filtros y descargas.

**B. Alta gerencia / Directorio (vista ejecutiva)**
- Necesitan síntesis: estado global, cumplimiento de límites, resultados vs. benchmark, alertas, y las **conclusiones** de los ejercicios de mesa (no su cocina).
- Uso periódico, sesiones cortas, foco en dashboards y KPIs.

**C. (v1.2) Mesa / Comités como "momento de uso":** los módulos de la zona *Estrategia & Pricing* están pensados para prepararse y consumirse en comités recurrentes (pricing semanal de RRVV, comité de inversiones mensual). El diseño debe permitir proyectar la pantalla directamente en el comité.

### 4.2 Stakeholders secundarios
- **Riesgo y Compliance:** consumidores de reportes de límites, exposición y estreses.
- **Operaciones y Contabilidad de inversiones:** proveedores de datos y validadores de conciliación.
- **Actuarial:** provee pasivos, pricing y supuestos; consume vistas de calce y TSA.
- **Tesorería:** consume vistas de colaterales y liquidez.

### 4.3 Implicancia de diseño
Dos "velocidades" de UI (vista ejecutiva / vista analista) **y cuatro ritmos de trabajo** que ordenan la navegación: monitoreo diario, gestión ALM, ejercicios recurrentes de estrategia, y consulta documental (ver §6.1).

---

## 5. Alcance por fases

### Fase 1 — MVP: Analítica y Monitoreo *(construida como prototipo)*
Portal de solo lectura con los módulos de monitoreo y gobierno (§7.1–7.10).

### Fase 1.5 — Analítica de mesa y ALM avanzado *(esta versión del PRD)*
Cinco módulos nuevos, también de solo lectura (§7.11–7.15):
- **Rentas Vitalicias:** pricing del día, competencia SCOMP, sensibilidades, histórico de emisión.
- **Derivados & Colateral:** posiciones de derivados, efecto en el calce, estrés de MTM y gestión de colaterales, contrapartes y CSA.
- **Liquidez:** posición de liquidez, ejercicios de estrés, fuentes y usos proyectados.
- **Relative Value:** screener de spreads, pares con históricos, ideas/watchlist.
- **Optimización:** frontera eficiente y propuesta, actual vs. óptimo, restricciones (vinculadas a Cumplimiento), corridas.

### Fase 2 — Gestión Operativa
- Ingreso y ruteo de órdenes; propuestas de rebalanceo y su seguimiento (conectadas a Optimización e Ideas de Relative Value).
- Workflows de aprobación; gestión operativa de llamados de margen.
- Bitácora de auditoría de acciones.

### Fase 3+ — Consideraciones futuras
- Escenarios y *stress testing* interactivos (what-if en línea sobre tasas/UF/TC).
- Optimización de cartera asistida por modelos, ejecutable desde el portal.
- Integración con motores de riesgo de mercado/crédito más avanzados.
- Extensión a otras entidades del grupo en la región.

---

## 6. Arquitectura de información y patrones UX

La navegación se inspira en **BlackRock Aladdin**, **Bloomberg PORT**, **Clearwater Analytics**, **FactSet** y **Morningstar Direct**, adaptadas a un portal web moderno con branding MetLife.

### 6.1 Shell de navegación (estructura global) — actualizado en v1.2

**Sidebar izquierdo con cuatro zonas**, ordenadas por **ritmo de trabajo** (de lo diario a lo documental). Este criterio — y no la taxonomía de activos — es lo que hace la página fácil de usar: el usuario entra por *lo que viene a hacer*.

| Zona | Ritmo | Módulos | Pregunta que responde |
|---|---|---|---|
| **Monitoreo** | Diario | Inicio · Cartera · Resultados · Cumplimiento | "¿Cómo está la cartera hoy y hay algo fuera de límite?" |
| **ALM & Derivados** | Diario/semanal | Proyecciones · Modelos · Derivados & Colateral · Liquidez | "¿Están calzados los pasivos, cubiertas las monedas y financiadas las obligaciones?" |
| **Estrategia & Pricing** | Semanal/comité | Rentas Vitalicias · Relative Value · Optimización | "¿A qué precio vendemos, dónde hay valor y cómo debería verse la cartera?" |
| **Gobierno** | Consulta | Políticas · Procedimientos · FAQ | "¿Cuál es la regla y cómo se hace?" |

Reglas de diseño de la zonificación:
- **Máximo 4–5 módulos por zona** para que el sidebar se escanee de un vistazo.
- Los módulos de *Estrategia & Pricing* comparten un patrón común de "**ejercicio**": resultado destacado → detalle → supuestos → historial de corridas. Un usuario que aprende uno, sabe usarlos todos.
- Los ejercicios de estrés viven **junto a lo que estresan** (colaterales dentro de Derivados, estrés de liquidez dentro de Liquidez), no en un módulo genérico "Estrés" — evita la pregunta "¿dónde estaba ese ejercicio?".

**Context bar superior persistente** *(patrón Bloomberg PORT)*: selectores de **cartera**, **fecha de corte**, **moneda (CLP/UF/USD)** y **benchmark** que gobiernan todos los módulos, incluidos los nuevos. Incluye **indicador de conciliación** *(patrón Clearwater)*.

**Command palette (Ctrl/⌘+K)**: búsqueda global de módulos, instrumentos, emisores, derivados, límites, ideas y documentos.

**Toggle Ejecutiva / Analista**: en los módulos de ejercicio, la vista ejecutiva muestra la **conclusión** (semáforo, margen, propuesta); la analista, la cocina (tablas de sensibilidad, corridas, supuestos).

**Drill-down consistente** *(patrón Aladdin)*: ningún número es un callejón sin salida. Ejemplos nuevos: llamado de margen proyectado → contrapartes CSA que lo originan → derivados de esa contraparte; restricción activa del optimizador → límite en Cumplimiento → norma en Políticas.

### 6.2 Mapa de módulos y sub-tabs — actualizado en v1.2

| Módulo | Sub-tabs | Zona | Audiencia | Inspiración UX |
|---|---|---|---|---|
| **Inicio** | Vista ejecutiva · Vista analista | Monitoreo | Ambas | Dashboards Aladdin |
| **Cartera** | Posiciones · Composición · Movimientos · Ficha instrumento | Monitoreo | Analista | PORT Holdings |
| **Resultados** | Retornos · Atribución · vs. Benchmark · P&L | Monitoreo | Ambas | PORT Performance |
| **Cumplimiento** | Semáforo de límites · Detalle por norma · Histórico | Monitoreo | Ambas | Compliance Aladdin |
| **Proyecciones** | Flujos y vencimientos · Devengo proyectado · Escenarios (F2) | ALM & Derivados | Analista | PORT Scenarios |
| **Modelos** | Calce/ALM · TSA · Valorización · Supuestos y corridas | ALM & Derivados | Analista | ALM Aladdin |
| **Derivados & Colateral** *(nuevo)* | Posiciones · Calce con derivados · Estrés y colaterales · Contrapartes y CSA | ALM & Derivados | Analista / Tesorería | Aladdin collateral mgmt |
| **Liquidez** *(nuevo)* | Posición de liquidez · Estrés de liquidez · Fuentes y usos | ALM & Derivados | Ambas | LCR dashboards bancarios |
| **Rentas Vitalicias** *(nuevo)* | Pricing del día · Competencia SCOMP · Sensibilidades · Histórico de emisión | Estrategia & Pricing | Ambas | Pricing desks aseguradoras |
| **Relative Value** *(nuevo)* | Screener de spreads · Pares e históricos · Ideas y watchlist | Estrategia & Pricing | Analista | FactSet screeners |
| **Optimización** *(nuevo)* | Frontera y propuesta · Actual vs. óptimo · Restricciones · Corridas | Estrategia & Pricing | Ambas | Aladdin portfolio construction |
| **Políticas** | Vigente · Límites parametrizados · Versiones | Gobierno | Ambas | Vinculada a Cumplimiento |
| **Procedimientos** | Por área · Vigencias | Gobierno | Ambas | Knowledge base |
| **FAQ** | Categorías · Glosario | Gobierno | Ambas | — |

> **Patrón "ejercicio" (transversal a los módulos nuevos):** cada ejercicio recurrente expone (1) un **resultado titular** con semáforo, (2) el detalle navegable, (3) los **supuestos e insumos** con fecha y responsable, y (4) el **historial de corridas**. Es el mismo contrato UX del módulo Modelos, extendido.

> **Nota de diseño chileno/seguros:** se mantienen CLP/UF/USD con conversión visible, calce ALM, inversiones representativas y límites CMF. Se agregan: **SCOMP** como referencia competitiva de pricing de RRVV, **CSA/colaterales** para derivados y la normativa CMF de derivados (a validar con Compliance, §11).

---

## 7. Requerimientos funcionales

Prioridad: **P0** = imprescindible · **P1** = mejora importante · **P2** = futuro/diseñar-para. Los módulos 7.1–7.10 corresponden a Fase 1 (construidos en el prototipo); 7.11–7.15 a Fase 1.5.

### 7.1 Dashboard / Inicio
- **[P0]** Vista resumen con KPIs: valor total, distribución por clase, retorno del período, duración promedio, % de uso de límites clave.
- **[P0]** Panel de alertas de límites con drill-down a Cumplimiento.
- **[P0]** Toggle Ejecutiva / Analista.
- **[P1] (v1.2)** Fila de "estado de ejercicios": última corrida y semáforo de cada ejercicio de mesa (pricing RRVV, colaterales, liquidez, optimización), con drill-down al módulo.
- **[P2]** Personalización de widgets por usuario.

### 7.2 Cartera
*(sin cambios respecto de v1.1 — posiciones, filtros/agrupaciones, composición, exportación contextual, ficha de instrumento)*

### 7.3 Resultados
*(sin cambios — retornos por período, vs. benchmark, atribución P1, series históricas P1)*

### 7.4 Proyecciones
*(sin cambios — flujos y vencimientos P0, devengo P1, escenarios interactivos P2/F2)*

### 7.5 Modelos
*(sin cambios — calce/ALM, TSA, valorización, supuestos y corridas)*

### 7.6 Cumplimiento
*(sin cambios — semáforo, detalle por norma, histórico)* **(v1.2)** Se agregan como límites monitoreables los umbrales internos de las nuevas áreas: buffer mínimo de colateral, ratio mínimo de cobertura de liquidez y descalce máximo post-derivados.

### 7.7 Políticas · 7.8 Procedimientos · 7.9 FAQ
*(sin cambios)*

### 7.10 Transversales
*(sin cambios: context bar, indicador de conciliación, drill-down, SSO/roles, fecha de corte visible, trazabilidad de origen, exportación contextual, ⌘K, reportes programados P1, bitácora P1)* **(v1.2)** El patrón "ejercicio" (§6.2) es un requerimiento transversal para 7.11–7.15.

### 7.11 Rentas Vitalicias *(nuevo — Fase 1.5)*
- **[P0]** **Pricing del día:** tasa de venta vigente por producto (inmediata, diferida, garantizada, con crecimiento), tasa de costo/reinversión, margen en pb y semáforo vs. margen objetivo.
  - *Given* un usuario del comité de pricing, *when* abre el módulo, *then* ve la tasa de venta vigente, el margen resultante y la fecha/hora de los insumos (curva, SCOMP) sin abrir ninguna planilla.
- **[P0]** **Competencia SCOMP:** tasas ofrecidas por compañía, posición relativa de MetLife (ranking) y tasa de adjudicación (win rate) del período.
- **[P0]** **Sensibilidades:** impacto en el margen ante movimientos de la curva de reinversión, mejoras de mortalidad y gastos (tabla de la última corrida actuarial, con supuestos y responsable).
- **[P1]** **Histórico de emisión:** prima emitida mensual, tasa de venta vs. mercado, mix por producto.
- **[P2]** Simulador de cotización individual (what-if) — Fase 2/3.

### 7.12 Derivados & Colateral *(nuevo — Fase 1.5)*
- **[P0]** **Posiciones:** inventario de derivados (CCS, forwards, IRS, swaps de inflación) con contraparte, nocional, MTM, propósito (calce de moneda, duración, cobertura táctica) y vencimiento.
- **[P0]** **Calce con derivados:** efecto de los derivados en el calce por tramo y en el descalce de moneda — vista "sin derivados / con derivados", conectada al módulo Modelos.
- **[P0]** **Estrés y colaterales:** escenarios estándar (TC ±10%, tasas ±100 pb, combinado) → ΔMTM → **llamado de margen proyectado vs. colateral elegible disponible**, con semáforo de buffer.
  - *Given* el escenario combinado severo, *when* el buffer proyectado cae bajo el umbral de política, *then* el ejercicio aparece en ámbar/rojo en el módulo y en el panel de alertas de Inicio.
- **[P0]** **Contrapartes y CSA:** por contraparte: rating, MTM neto, colateral entregado/recibido, threshold y MTA del CSA.
- **[P1]** Histórico de llamados de margen y uso de colateral.

### 7.13 Liquidez *(nuevo — Fase 1.5)*
- **[P0]** **Posición de liquidez:** activos líquidos por bucket con haircuts, total disponible y ratio de cobertura de salidas proyectadas (30/90 días).
- **[P0]** **Estrés de liquidez:** escenarios (base, rescates acelerados, estrés de mercado, combinado severo) con salidas estresadas, cobertura resultante y semáforo; supuestos de cada escenario documentados.
- **[P1]** **Fuentes y usos:** proyección de entradas (cupones, vencimientos, primas) y salidas (pensiones, rescates, llamados de margen) a 90 días, conectada con Proyecciones.

### 7.14 Relative Value *(nuevo — Fase 1.5)*
- **[P0]** **Screener de spreads:** spread actual vs. promedio 12M y z-score por eje de comparación (UF vs. USD hedged, corporativo vs. soberano, sectores, ratings), con señal barato/caro.
- **[P1]** **Pares e históricos:** series de spreads de pares definidos por la mesa, con z-score y mini-gráficos.
- **[P1]** **Ideas y watchlist:** registro de ideas de inversión (tesis, estado: en análisis / propuesta / ejecutada, responsable, fecha) — antesala del flujo de órdenes de Fase 2.

### 7.15 Optimización *(nuevo — Fase 1.5)*
- **[P0]** **Frontera y propuesta:** frontera eficiente de la última corrida del optimizador, con la cartera actual y la asignación propuesta marcadas; retorno esperado, volatilidad y mejora estimada.
- **[P0]** **Actual vs. óptimo:** asignación actual vs. propuesta por clase, con deltas y racionalidad.
- **[P0]** **Restricciones:** restricciones usadas por el optimizador (límites CMF y de política, calce, duración objetivo) con su estado (activa/holgada) y **vínculo directo al límite en Cumplimiento**.
- **[P1]** **Corridas:** historial de corridas con supuestos (retornos esperados, matriz de covarianzas), responsable y comparación entre versiones.
- **[P2]** Optimización interactiva (editar restricciones y re-optimizar) — Fase 3.

---

## 8. Requerimientos no funcionales
*(sin cambios respecto de v1.1: rendimiento <3 s, SSO y cifrado, disponibilidad 99,5% hábil, WCAG/ADA, responsivo desktop-first, escalabilidad hacia Fase 2, linaje de datos.)* **(v1.2)** Los resultados de ejercicios (pricing, estreses, optimización) deben almacenarse **versionados e inmutables** por corrida, para auditoría de comités.

---

## 9. Diseño y branding (MetLife Design System)
*(sin cambios: paleta azul/verde MetLife, gradientes solo como acento — máximo uno por pantalla, texto sobre sólidos, contraste ADA, sobriedad en tablas financieras.)* **(v1.2)** Los módulos de ejercicio usan el mismo lenguaje visual de semáforos y "resultado titular" definido en Cumplimiento y Modelos, para que la lectura ejecutiva sea uniforme.

---

## 10. Datos e integraciones *(supuesto a validar)* — actualizado en v1.2

| Fuente | Provee | Modo |
|---|---|---|
| Custodio(s) | Posiciones, movimientos, custodia | Batch diario |
| Market data (Bloomberg/Refinitiv/RiskAmerica) | Precios, tasas, UF, TC, ratings, spreads | Batch/intradía |
| Contabilidad de inversiones | Valorización, devengo, resultados | Batch |
| Sistema actuarial / ALM | Pasivos, calce, TSA, **pricing RRVV y sensibilidades** | Batch periódico |
| **SCOMP** *(nuevo)* | Tasas ofrecidas por compañía, adjudicaciones | Batch (frecuencia a validar) |
| **Sistema de derivados / Tesorería** *(nuevo)* | Posiciones de derivados, MTM, CSA, colaterales entregados/recibidos | Batch diario |
| **Optimizador / planillas certificadas de la mesa** *(nuevo)* | Corridas de optimización, screeners de relative value | Por corrida (carga de resultados) |
| Directorio corporativo (IdP) | Identidad y roles (SSO) | En línea |

**Decisiones abiertas:** frecuencia de actualización, capa de datos intermedia, reglas de conciliación, y **(v1.2)** el formato de carga de resultados de ejercicios (API del motor vs. archivo estructurado validado).

---

## 11. Consideraciones regulatorias (Chile) *(supuesto a validar)*
- Marco **CMF** para inversiones de compañías de seguros: NCG 152 (límites e inversiones representativas), DFL 251, NCG 461 (calce), TSA.
- **(v1.2)** Normativa CMF sobre **operaciones con derivados** de aseguradoras (norma aplicable a validar con Compliance): límites de nocional, contrapartes elegibles y exigencias de colateral — deben reflejarse como límites monitoreables en Cumplimiento.
- **(v1.2)** Regulación de **SCOMP** y del proceso de cotización de rentas vitalicias (D.L. 3.500 y normativa conjunta CMF/SP) en lo que respecta al uso de la información de tasas de mercado.
- Manejo de **UF** como unidad de cuenta relevante además de CLP y USD.

> Recomendación: validar el detalle normativo con Compliance/Riesgo antes de parametrizar los límites de derivados y los umbrales internos de colateral/liquidez.

---

## 12. Métricas de éxito
*(se mantienen las de v1.1: adopción ≥80% del equipo en 30 días, reducción ≥50% del tiempo de reporting, reducción de discrepancias, satisfacción, uso como fuente oficial en comités.)*

**(v1.2) Métricas específicas de Fase 1.5:**
- **Comités sin planillas:** % de comités de pricing RRVV e inversiones que se conducen directamente desde el portal (objetivo: 100% en 60 días desde el lanzamiento de Fase 1.5).
- **Trazabilidad de ejercicios:** 100% de las corridas mostradas con supuestos, fecha y responsable visibles.
- **Anticipación de colateral:** llamados de margen reales cubiertos por el buffer proyectado del ejercicio de estrés (sin sorpresas fuera de escenario).

---

## 13. Roadmap y consideraciones de tiempo — actualizado en v1.2

| Hito | Contenido | Dependencias |
|---|---|---|
| **Descubrimiento y diseño** | Validar supuestos, integraciones, componentes MetLife | Diseño, Datos, Compliance |
| **MVP – Núcleo** *(prototipo construido)* | Auth/SSO, Inicio, Cartera, Resultados, Cumplimiento | Custodio + market data |
| **MVP – Gobierno** *(prototipo construido)* | Políticas, Procedimientos, FAQ, Proyecciones, Modelos | Contenido de negocio + ALM |
| **Lanzamiento MVP** | Solo lectura, usuarios primarios, datos reales | Conciliación validada |
| **Fase 1.5 – ALM & Derivados** | Derivados & Colateral, Liquidez | Sistema de derivados/Tesorería |
| **Fase 1.5 – Estrategia & Pricing** | Rentas Vitalicias, Relative Value, Optimización | SCOMP, actuarial, optimizador |
| **Fase 2** | Órdenes, rebalanceo, workflows | Proceso operativo y controles |

*Sugerencia de secuencia dentro de Fase 1.5: partir por **Derivados & Colateral + Liquidez** (riesgo operacional más alto hoy) y luego **RRVV + RV + Optimización** (valor de comité).*

---

## 14. Preguntas abiertas — actualizado en v1.2

| # | Pregunta | Responsable | ¿Bloqueante? |
|---|---|---|---|
| 1 | ¿Frecuencia de actualización: cierre diario o intradía? | Datos / Inversiones | Sí |
| 2 | ¿Sistemas fuente exactos (custodio, market data, contable, ALM)? | TI / Inversiones | Sí |
| 3 | ¿Capa de datos intermedia (DWH / capa semántica)? | Arquitectura / Datos | Sí |
| 4 | ¿Qué límites CMF se parametrizan en el MVP? | Compliance / Riesgo | Sí |
| 5 | ¿Benchmark oficial por clase de activo? | Inversiones | No |
| 6 | ¿Roles definitivos y matriz de permisos? | Inversiones / TI | No |
| 7 | ¿Contenido documental en CMS propio o repositorio existente? | Negocio / TI | No |
| 8 | ¿Inglés desde el MVP o solo español? | Negocio | No |
| 9 | ¿Stack y componentes de diseño MetLife reutilizables? | Arquitectura / Diseño | No |
| 10 | **(v1.2)** ¿De qué sistema salen hoy las posiciones de derivados y los CSA (Murex, Calypso, planillas de Tesorería)? | Tesorería / TI | Sí (F1.5) |
| 11 | **(v1.2)** ¿La data SCOMP se obtiene por feed oficial o carga manual del área comercial? | Comercial / Actuarial | Sí (F1.5) |
| 12 | **(v1.2)** ¿Qué motor genera las corridas de optimización y en qué formato exporta? | Inversiones / Estudios | Sí (F1.5) |
| 13 | **(v1.2)** ¿Umbrales internos de buffer de colateral y cobertura de liquidez — existen en política o hay que definirlos? | Riesgo / Tesorería | Sí (F1.5) |
| 14 | **(v1.2)** ¿El pricing de RRVV mostrado es el vigente oficial (fuente actuarial) o una propuesta de la mesa? Gobernanza del dato. | Actuarial / Inversiones | Sí (F1.5) |

---

## 15. Supuestos de trabajo
*(se mantienen los de v1.1)* y además:
- Los motores de cálculo (pricing actuarial, ALM, optimizador, estreses) **ya existen**; Quant consume sus resultados versionados.
- La mesa está dispuesta a estandarizar sus ejercicios al patrón "resultado → detalle → supuestos → corridas".
- Los umbrales internos (buffer de colateral, cobertura de liquidez) serán definidos por Riesgo/Tesorería antes del lanzamiento de Fase 1.5.

---

*Documento vivo. v1.2 refleja la incorporación de los ejercicios recurrentes de la mesa; revisar con Inversiones, Tesorería, Actuarial, TI/Arquitectura, Datos, Diseño y Compliance.*
