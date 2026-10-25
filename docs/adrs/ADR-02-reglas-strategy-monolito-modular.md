# ADR-02 · Aislar las reglas de victoria mediante Strategy dentro del monolito modular

| Campo | Valor |
|---|---|
| **Estado** | Proposed |
| **Fecha** | 21 de septiembre de 2026 |
| **Decisores** | [Integrantes del equipo] |
| **Relacionado con** | ADR-01 |

---

## Contexto

El sistema debe soportar dos modalidades de cierre con condiciones de victoria distintas —la
**clásica** (una cuarta, dos ternas y un descarte) y el **apuntado** (tres ternas y sobrante menor
a cinco puntos)— y el caso de estudio pide analizar la variabilidad que debe soportar el motor de
reglas. El análisis de dominio identificó además cuatro variaciones previsibles: **comodín**,
**as alto**, **reingreso de eliminados** y **penalización aumentada por apuntado**.

**Fuerzas en juego:**

1. **Extensibility** es el driver principal (§3.2): una regla nueva no debe modificar el flujo del
   juego, la interfaz ni el modelo de datos.
2. **Testability** es el segundo driver: cada regla debe poder verificarse en aislamiento.
3. **Feasibility** limita la inversión en infraestructura (§3.3, T2).
4. **Las reglas las escribe el mismo equipo** y se despliegan junto con el resto del sistema. No
   hay terceros que aporten reglas ni necesidad de incorporarlas sin volver a desplegar.
5. **Las variaciones no son todas del mismo tipo.** Unas cambian *cómo se gana una mano*; otras,
   *quién queda eliminado*; otras, *cómo se reparten las fichas*. Ocurren en momentos distintos
   del flujo.

**Alternativas evaluadas:**

| | Alternativa | Descripción |
|---|---|---|
| A | Condicionales en el motor | El flujo del juego pregunta por la modalidad activa y ejecuta la rama correspondiente |
| B | **Strategy dentro del monolito modular** | Cada regla es una implementación de una interfaz; el núcleo solo conoce la interfaz y la estrategia se elige según la configuración de la partida |
| C | Arquitectura Microkernel / Plug-in | Núcleo mínimo más módulos de reglas descubiertos y cargados en tiempo de ejecución, con registro y ciclo de vida propios |
| D | Motor de reglas declarativo | Reglas expresadas como datos (un lenguaje propio o un archivo de configuración) interpretadas por un motor genérico |

**Evaluación frente a los drivers:**

| Criterio | A · Condicionales | B · Strategy | C · Microkernel | D · Declarativo |
|---|---|---|---|---|
| Extensibility | Baja: cada regla modifica el núcleo | **Alta** | Muy alta | Alta, dentro de lo que el lenguaje permita expresar |
| Testability | Baja: los caminos se multiplican | **Alta**: cada regla se prueba sola | Alta | Media: hay que probar el intérprete y cada regla |
| Feasibility | Muy alta | **Alta** | Baja | Baja |
| Simplicidad | Máxima con dos reglas | **Media** | Baja | Baja |

---

## Decisión

**Se adopta el patrón Strategy dentro del monolito modular (alternativa B)**, con **tres puntos de
extensión** definidos por interfaces:

| Punto de extensión | Responde a | Se consulta en | Implementaciones en el MVP | Variaciones previstas |
|---|---|---|---|---|
| `ReglaJuego` | ¿esta mano gana? | La declaración de un cierre | `ReglaClasicaCuartaTerna`, `ReglaApuntado101` | Comodín, as alto |
| `PoliticaDeEliminacion` | ¿quién queda fuera? | El cierre de una ronda | `PoliticaUmbralFijo` | Reingreso de eliminados |
| `SistemaDeApuestas` | ¿cómo se reparten las fichas? | El inicio y el fin de la partida | Apuesta fija con bote al ganador | Apuestas variables |

El `ResolutorDeReglas` selecciona las implementaciones según la `ConfiguracionDeReglas` de cada
partida. El núcleo —la máquina de estados que coordina el `OrquestadorDeTurnos`— **conoce
únicamente las interfaces**.

**Justificación.** La alternativa A es la más simple con dos reglas, pero el caso de estudio no
tiene dos reglas sino una familia abierta: cada variante añadiría ramas al núcleo del juego y
multiplicaría los caminos que hay que probar, deteriorando a la vez los dos primeros drivers.

La alternativa C es la que la guía propone evaluar explícitamente, y el argumento para descartarla
es preciso:

> **Se adopta la forma del microkernel —un núcleo estable más puntos de extensión— sin su
> infraestructura de despliegue dinámico.** Un microkernel completo se justifica cuando los
> plug-ins los desarrollan terceros, se despliegan por separado o deben incorporarse sin detener
> el sistema. Ninguna de esas condiciones se cumple: las reglas las escribe el mismo equipo y se
> despliegan con el núcleo. Construir descubrimiento, registro y carga de plug-ins en tiempo de
> ejecución sería costo sin beneficio.

La alternativa D ofrece la mayor flexibilidad teórica, pero exige diseñar un lenguaje capaz de
expresar secuencias, grupos y conteos, más un intérprete que habría que probar tanto como las
propias reglas. Para un conjunto de variaciones conocido y acotado, es sobreingeniería.

---

## Consecuencias

**Positivas**
- **Una regla nueva es una clase nueva.** Ninguna clase existente se modifica (Open/Closed).
- **Cada regla se prueba de forma aislada**, sin montar la partida completa.
- **Las reglas son configurables por partida**, no globales: dos mesas pueden jugar con reglas
  distintas al mismo tiempo.
- Las reglas reciben solo lo que necesitan —la declaración y la mano—, no la partida entera, lo que
  refuerza la Ley de Deméter (§4.5).
- Si en el futuro aparecieran reglas de terceros, la migración a un microkernel completo parte de
  interfaces ya definidas.

**Negativas (trade-offs aceptados)**
- **Más indirección que un condicional.** Con solo dos modalidades, el diseño resulta más elaborado
  de lo estrictamente necesario.
- **Los puntos de extensión son una apuesta sobre dónde llegará el cambio.** Una regla que no
  encaje en ninguno de los tres —por ejemplo, permitir bajar combinaciones durante la ronda— **sí**
  obligará a modificar el núcleo. El diseño no promete extensibilidad universal.
- **Incorporar una regla exige volver a desplegar.** No hay incorporación en caliente; se acepta
  porque el sistema no la necesita.
- **Las variaciones pueden combinarse.** Jugar con comodín *y* con apuntado exige que ambas
  estrategias convivan; si la combinación resulta compleja, podría requerir composición entre
  estrategias. Es un riesgo identificado que se abordará cuando se implemente el comodín.

---

## Cumplimiento (Compliance)

| # | Verificación | Tipo |
|---|---|---|
| FF-05 | **Pruebas de contrato compartidas:** toda implementación de `ReglaJuego` debe superar una misma batería de pruebas —una declaración inválida nunca altera el estado y siempre informa su motivo— | Automatizada |
| FF-06 | **Aislamiento del núcleo:** un cambio que agregue una regla en la subárea *Reglas* no puede modificar archivos de la máquina de estados. Se verifica sobre el conjunto de archivos modificados en cada solicitud de integración | Automatizada |
| FF-07 | **Mínimo conocimiento:** ninguna implementación de regla importa `Partida` ni el `OrquestadorDeTurnos` | Automatizada |
| FF-08 | **Costo de extensión:** al incorporar cada regla nueva se registra el tiempo empleado y el número de clases modificadas, con la meta de ≤ 4 horas, 1 clase nueva y 0 modificadas (§3.1) | Manual, métrica de seguimiento |

FF-08 convierte el escenario de modificabilidad del driver número uno en una medición real: la
primera variación que se implemente —probablemente el comodín— servirá como prueba de que la
decisión cumple lo que promete.

---

## Notas

- **Autor:** [Arquitecto de Aplicaciones y Datos]
- **Revisores:** [Resto de integrantes]
- **Fecha de aprobación:** pendiente de aprobación por el equipo
- **Referencias:** Richards y Ford (2025), cap. 13 *Microkernel Architecture Style*; Gamma et al.,
  patrón *Strategy*.
