# ADR-03 · Adoptar monolito modular con Strategy para la variabilidad de reglas

| Campo | Valor |
|---|---|
| **Estado** | Accepted |
| **Fecha** | 25 de octubre de 2026 |
| **Decisores** | Mariana Agudelo Ospina · Juan José Chaves Alvear · Joaquín Andrés Escalante |
| **Relacionado con** | ADR-01, ADR-02 (profundiza y formaliza su decisión a nivel de estilo) |

---

## Contexto

El Entregable 1 decidió aislar las reglas de victoria mediante Strategy (ADR-02). Corresponde ahora
elegir formalmente el **estilo arquitectónico** del sistema y demostrar cómo se incorpora una
variante nueva, por ejemplo Continental o Póker, sin alterar el orquestador de turnos.

**Fuerzas en juego**

1. Las tres características motoras del Entregable 1: **Extensibility**, **Testability** y
   **Responsiveness**.
2. Las variantes previsibles son **conocidas y acotadas**: comodín, as alto, reingreso de
   eliminados y penalización por apuntado.
3. Las reglas las escribe el mismo equipo y se despliegan con el núcleo. No hay terceros que
   aporten reglas ni necesidad de incorporarlas sin volver a desplegar.
4. **Feasibility**: tres integrantes y un semestre, con un MVP que debe quedar jugable.
5. La retroalimentación del Entregable 1 advirtió expresamente que construir un intérprete de
   reglas declarativas podría consumir el tiempo necesario para estabilizar el ciclo de turnos.

**Alternativas evaluadas**

| | Estilo | Descripción |
|---|---|---|
| A | **Monolito modular + Strategy** | Módulos por dominio en un solo desplegable; las reglas son implementaciones de una interfaz, resueltas por un registro |
| B | Microkernel / Plug-in | Núcleo mínimo más plug-ins de reglas descubiertos y cargados en tiempo de ejecución, con registro y ciclo de vida propios |
| C | Service-Based | Cada dominio como servicio desplegado por separado, comunicados por red |

**Evaluación frente a las características motoras** (escala de 1 a 5; el peso refleja que las tres
primeras son las motoras del Entregable 1):

| Criterio | Peso | A · Modular + Strategy | B · Microkernel | C · Service-Based |
|---|---|---|---|---|
| Extensibilidad de reglas | 3 | 4 | 5 | 3 |
| Testabilidad aislada | 3 | 5 | 4 | 3 |
| Responsiveness | 3 | 5 | 4 | 2 |
| Viabilidad en un semestre | 2 | 5 | 2 | 1 |
| Gobernabilidad automatizada | 1 | 5 | 3 | 3 |
| Despliegue independiente de reglas | 1 | 1 | 5 | 4 |
| **Total ponderado (máx. 65)** | | **58** | 51 | 33 |

---

## Decisión

**Se adopta el estilo Monolito Modular (alternativa A)**, con particionamiento por dominio
(ADR-01) y el patrón **Strategy** como mecanismo de extensibilidad de reglas. El sistema es un
**quantum arquitectónico único**.

**Mecanismo de extensión.** Tres elementos, equivalentes a los de un microkernel pero resueltos en
tiempo de compilación:

| Elemento del microkernel | Equivalente en esta arquitectura |
|---|---|
| Core System | `MaquinaDeEstados` + `OrquestadorDeTurnos`: el ciclo de robar, descartar y evaluar, que no cambia |
| Contract | La interfaz `ReglaJuego`: `validate(declaracion) → ResultadoValidacion` |
| Plug-in Components | `ReglaClasica`, `ReglaApuntado`, y las futuras `ReglaConComodin`, `ReglaContinental` |
| Registry | `ResolutorDeReglas`, que asocia cada modalidad con su implementación |

**Cómo se agrega la variante Continental.** Se escribe una clase que implementa `ReglaJuego`, se
registra en el `ResolutorDeReglas` y se habilita en la `config_reglas` de la partida. **No se
modifica ninguna clase existente**: ni el orquestador, ni la máquina de estados, ni el modelo de
datos, ni la interfaz de usuario. Lo verifica la fitness function FF-06.

**Justificación.** La alternativa B obtiene mejor nota solo en extensibilidad y despliegue
independiente, y paga por ello en viabilidad y gobernabilidad. Su ventaja real, incorporar una
regla **sin volver a desplegar**, exige descubrimiento, carga dinámica y gestión del ciclo de vida
de plug-ins, maquinaria que se justifica cuando los plug-ins los escriben terceros o se publican
por separado. Ninguna de esas dos condiciones se cumple aquí.

> **Se adopta la forma del microkernel, un núcleo estable con puntos de extensión y contrato
> explícito, pero sin su infraestructura de despliegue dinámico.**

La alternativa C queda descartada por un motivo estructural, no de costo: distribuir los módulos
rompería la decisión de mantener la partida en curso dentro de un solo proceso, que es lo que
sostiene la característica de *responsiveness*.

---

## Consecuencias

**Positivas**
- Una variante nueva es una clase nueva; ninguna existente se modifica (principio abierto/cerrado).
- Cada regla se prueba de forma aislada: las implementaciones tienen acoplamiento eferente mínimo.
- Las reglas se configuran **por partida**: dos mesas pueden jugar con reglas distintas a la vez.
- Un solo quantum: sin latencia de red entre módulos ni despliegues coordinados.
- La estructura es verificable automáticamente (FF-01 a FF-07).

**Negativas (trade-offs aceptados)**
- **Incorporar una regla exige volver a desplegar.** Es el precio explícito de no construir carga
  dinámica, y se acepta porque el sistema se despliega como una sola unidad.
- **Los puntos de extensión son una apuesta sobre dónde llegará el cambio.** Una variante que no
  encaje en `ReglaJuego`, `PoliticaDeEliminacion` ni `SistemaDeApuestas`, por ejemplo permitir
  bajar combinaciones durante la ronda, **sí** obligará a modificar el núcleo.
- **Riesgo de erosión del orquestador.** Al coordinar varios componentes, es tentador resolver
  problemas de integración agregándole validaciones. Mitigado con FF-06 (ver §4 del documento).
- **Escala solo verticalmente.** Un único desplegable con estado en memoria no admite varias
  instancias sin externalizar el estado.

---

## Cumplimiento

| # | Verificación | Tipo |
|---|---|---|
| FF-03 | `ReglaClasica` y `ReglaApuntado` no dependen una de la otra | Automatizada · TSArch + dependency-cruiser |
| FF-06 | Los casos de uso no dependen de implementaciones concretas de reglas, solo del contrato | Automatizada · TSArch |
| FF-08 | Ningún evaluador de combinaciones supera complejidad ciclomática 10 | Automatizada · ESLint |
| C-01 | Toda implementación de `ReglaJuego` supera la misma batería de pruebas de contrato | Automatizada · Vitest |
| C-02 | Al incorporar una regla se registra el tiempo y las clases modificadas; meta: ≤ 4 h, 1 clase nueva, 0 modificadas | Manual · métrica de seguimiento |

El código de FF-03, FF-06 y FF-08 está en `tests/architecture/` y `eslint.config.js`, y el de C-01 en
`src/modules/game/domain/rules/rules.contract.test.ts`.

---

## Notas

- **Autor:** Joaquín Andrés Escalante (Arquitecto de Aplicaciones y Datos)
- **Revisores:** Mariana Agudelo Ospina, Juan José Chaves Alvear
- **Referencias:** Richards y Ford (2025), cap. 11 *Modular Monolith* y cap. 13 *Microkernel*;
  Gamma et al. (1994), patrón *Strategy*.
