# Entregable 2 — Sección 3: Registro Formal de Decisiones Arquitectónicas (ADRs)
**Peso en la rúbrica: 15%**

Las notas entre corchetes `[así]` son indicaciones para el equipo y **no van en el PDF**.

Las decisiones siguen el formato de Nygard ampliado por Richards y Ford (2025, cap. 21). Los tres
ADR de esta fase se apoyan en los dos del Entregable 1 y operan en niveles distintos:

| ADR | Decisión | Estado | Nivel |
|---|---|---|---|
| ADR-01 | Particionar el sistema por dominio de negocio | Accepted | Estructura general *(Entregable 1)* |
| ADR-02 | Aislar las reglas de victoria mediante Strategy | Accepted | Variabilidad *(Entregable 1)* |
| **ADR-03** | Adoptar monolito modular con Strategy | Accepted | Estilo arquitectónico |
| **ADR-04** | Persistir en PostgreSQL con esquema relacional normalizado | Accepted | Arquitectura de información |
| **ADR-05** | Llamadas directas en el turno, eventos locales para los efectos | Accepted | Comunicación entre componentes |

Las decisiones se verifican con *fitness functions* numeradas de forma continua (FF-01 a FF-08) y
con criterios de cumplimiento adicionales (C-01 a C-07), descritos en la sección 5. Los archivos
completos están en `docs/adrs/` del repositorio y se adjuntan a la entrega.

> **El ADR-03 formaliza y profundiza lo decidido en el ADR-02.** El ADR-02 eligió el patrón; el
> ADR-03 eleva esa decisión al nivel de estilo arquitectónico, la contrasta con el microkernel y
> con Service-Based mediante una matriz ponderada, y especifica el mecanismo concreto de
> extensión. Esto responde a la retroalimentación del Entregable 1, que recomendó mantenerse firmes
> en Strategy para el MVP.

`[Insertar aquí, textualmente, el contenido de docs/adrs/ADR-03-estilo-monolito-modular-strategy.md]`

`[Insertar aquí, textualmente, el contenido de docs/adrs/ADR-04-persistencia-relacional-postgresql.md]`

`[Insertar aquí, textualmente, el contenido de docs/adrs/ADR-05-sincronizacion-llamadas-directas-y-eventos.md]`

> [Los archivos de `docs/adrs/` son la fuente única: se adjuntan y se copian tal cual al PDF. Si
> cambian algo, cámbienlo allá. **No recorten las consecuencias negativas ni el cumplimiento**: la
> rúbrica los nombra explícitamente, y un ADR que solo enumera ventajas de su propia decisión no
> es un ADR.]
