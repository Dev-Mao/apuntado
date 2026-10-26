# ADR-01 · Particionar el sistema por dominio de negocio

| Campo | Valor |
|---|---|
| **Estado** | Accepted |
| **Fecha** | 21 de septiembre de 2026 |
| **Decisores** | Mariana Agudelo Ospina · Juan José Chaves Alvear · Joaquín Andrés Escalante |
| **Relacionado con** | ADR-02 |

---

## Contexto

El sistema debe organizarse en su nivel superior —el primer corte de su estructura— antes de
detallar componentes. Richards y Ford (2025, cap. 9) plantean dos formas de hacerlo:
**particionamiento técnico**, que agrupa el código por su función técnica (presentación, lógica,
persistencia), y **particionamiento por dominio**, que lo agrupa por área de negocio.

**Fuerzas en juego:**

1. **El cambio llega por las reglas.** El driver principal es *Configurability / Extensibility*
   (§3.2): el caso de estudio exige soportar modalidades alternativas y analizar la variabilidad
   del motor. Casi todo cambio previsible —comodín, as alto, reingreso, penalización— es un cambio
   de reglas de juego.
2. **El sistema tiene cuatro áreas de negocio con ritmos de cambio muy distintos.** *Juego* cambia
   con cada variante; *Identidad* casi nunca; *Economía* e *Historial*, con poca frecuencia.
3. **El equipo tiene experiencia en particionamiento técnico.** Es la estructura que usa en su
   práctica profesional, lo que reduce la curva de aprendizaje de esa opción.
4. **Feasibility.** Equipo académico, un semestre, un único desplegable (§3.3, T6).
5. **Evolución.** La visión del producto incluye componentes que podrían separarse en el futuro,
   como el emparejamiento público o la recarga con pasarela externa.

**Alternativas evaluadas:**

| | Alternativa | Descripción |
|---|---|---|
| A | Particionamiento técnico | Capas de presentación, aplicación, dominio e infraestructura en el primer nivel |
| B | **Particionamiento por dominio** | Módulos *Juego*, *Identidad*, *Economía* e *Historial* en el primer nivel, con sus capas técnicas dentro |
| C | Dominio distribuido en servicios | Cada dominio como un servicio desplegado de forma independiente |

**Impacto de un mismo cambio en cada alternativa** — *"habilitar el comodín"*:

| Alternativa | Qué se modifica |
|---|---|
| A · Técnica | Las reglas en la capa de dominio, la configuración en la de aplicación, la baraja en la de infraestructura: **el cambio atraviesa varias capas** |
| B · Dominio | **Solo el módulo *Juego***. Identidad, Economía e Historial no se enteran |
| C · Servicios | Solo el servicio de Juego, pero con el costo de coordinar despliegues, contratos de red y estado distribuido |

---

## Decisión

**Se adopta particionamiento por dominio (alternativa B).** El primer nivel de la estructura está
compuesto por cuatro módulos —*Juego*, *Identidad*, *Economía* e *Historial*— dentro de un único
desplegable. Las capas técnicas existen, pero **dentro** de cada módulo.

La comunicación entre módulos se rige por cuatro reglas:

1. **Solo a través de la interfaz pública del módulo.** Ningún módulo accede a los elementos
   internos de otro.
2. **Efectos posteriores mediante eventos.** Cuando termina una partida, *Juego* publica un evento;
   *Economía* paga el bote e *Historial* archiva el resultado. *Juego* no sabe que existen.
3. **Consultas síncronas mediante interfaces invertidas.** Cuando *Juego* necesita saber si un
   jugador puede cubrir una apuesta, **declara** la interfaz `GarantiaDeApuesta` y *Economía* la
   implementa. La dependencia en el código apunta hacia *Juego*.
4. **El espacio compartido contiene solo utilidades técnicas**, nunca lógica de negocio.

**Justificación.** La alternativa B alinea la estructura con la dirección en que llega el cambio:
si las reglas son el vector de cambio y las reglas pertenecen a un dominio, entonces un cambio de
reglas debe quedar contenido en un solo módulo. La alternativa A obliga a que cada variante nueva
atraviese la estructura completa, que es exactamente el costo que el driver de extensibilidad
busca evitar. La alternativa C resuelve el aislamiento, pero introduce distribución —red entre
módulos, despliegues coordinados, estado repartido— sin ninguna necesidad de escala o de equipos
independientes que la justifique; además rompería la decisión de mantener la partida en curso
dentro de un solo proceso (§3.3, T3).

La alternativa B conserva **la ruta abierta hacia C**: si algún día un dominio necesita
desplegarse por separado, se extrae un módulo que ya tiene fronteras definidas, no una capa
entrelazada con todas las demás.

---

## Consecuencias

**Positivas**
- Los cambios de reglas quedan contenidos en el módulo *Juego*.
- Cada módulo es cohesivo: agrupa lo que cambia junto.
- El módulo que más cambia (*Juego*) no depende de la implementación de los que casi no cambian
  (§4.5: *Juego* no importa nada de los demás dominios).
- Deja una ruta de extracción clara si en el futuro un dominio requiere desplegarse por separado.

**Negativas (trade-offs aceptados)**
- **Duplicación estructural:** cada módulo repite sus propias capas, lo que genera más carpetas y
  más código repetitivo que una única estructura por capas.
- **Riesgo de fuga de fronteras:** nada en el lenguaje impide que un módulo importe el interior de
  otro. Sin verificación automática, la partición se degrada con el tiempo.
- **Curva de aprendizaje:** el equipo está habituado al particionamiento técnico.
- **Fronteras discutibles:** algunas responsabilidades admiten más de una ubicación. Por ejemplo,
  verificar el saldo al ingresar a una sala involucra a *Juego* y a *Economía*; se resolvió con la
  interfaz invertida, pero exige criterio en cada caso nuevo.
- **Los aspectos transversales** —autenticación de conexiones, registro de eventos del sistema—
  no pertenecen a ningún dominio y deben manejarse con cuidado para que el espacio compartido no
  se convierta en un depósito de lógica.

---

## Cumplimiento (Compliance)

**Fitness functions automatizadas**, ejecutadas en la integración continua; cualquier violación
detiene la construcción:

| # | Verificación | Tipo |
|---|---|---|
| FF-01 | Ningún módulo importa elementos internos de otro; solo su interfaz pública | Automatizada |
| FF-02 | El módulo *Juego* no importa nada de *Identidad*, *Economía* ni *Historial* | Automatizada |
| FF-03 | Dentro de cada módulo, la capa de dominio no importa las capas de infraestructura ni de interfaces | Automatizada |
| FF-04 | El espacio compartido no contiene lógica de negocio | Manual, en revisión de código |

Ejemplo de regla para FF-02, expresada en la herramienta de análisis de dependencias del proyecto:

```json
{
  "name": "juego-no-depende-de-otros-dominios",
  "severity": "error",
  "from": { "path": "^src/modules/game" },
  "to":   { "path": "^src/modules/(identity|economy|history)" }
}
```

**Indicador de seguimiento:** el acoplamiento eferente del módulo *Juego* hacia los demás
dominios debe mantenerse en **cero** (§4.5).

---

## Notas

- **Autor:** Mariana Agudelo Ospina (Arquitecta Tecnológica / Solución)
- **Revisores:** Juan José Chaves Alvear, Joaquín Andrés Escalante
- **Fecha de aprobación:** 21 de septiembre de 2026
- **Referencias:** Richards y Ford (2025), cap. 9 *Architecture Styles — Top-Level Partitioning*.
