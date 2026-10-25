# Entregable 2. Sección 1: Selección y justificación del estilo arquitectónico
**Peso en la rúbrica: 20%**

Las notas entre corchetes `[así]` son indicaciones para el equipo y **no van en el PDF**.

## 1.1 Evaluación comparativa de estilos candidatos

Se contrastan tres estilos frente a las **características motoras** identificadas en el Entregable 1
(Extensibility, Testability y Responsiveness), más dos criterios de contexto. La escala va de 1 a 5
y el peso refleja la prioridad de cada característica: **3 para las tres motoras**, 2 para la
viabilidad y 1 para los criterios secundarios.

| Criterio | Peso | Monolito Modular + Strategy | Microkernel (Plug-in) | Service-Based |
|---|---|---|---|---|
| Extensibilidad de reglas | 3 | 4 | 5 | 3 |
| Testabilidad aislada | 3 | 5 | 4 | 3 |
| Responsiveness | 3 | 5 | 4 | 2 |
| Viabilidad en un semestre | 2 | 5 | 2 | 1 |
| Gobernabilidad automatizada | 1 | 5 | 3 | 3 |
| Despliegue independiente de reglas | 1 | 1 | 5 | 4 |
| **Total ponderado (máximo 65)** | | **58** | 51 | 33 |
| **Particionamiento** | | Por dominio | Por dominio y técnico | Por dominio |
| **Quanta arquitectónicos** | | 1 | 1 | N (uno por servicio) |

### Justificación de cada calificación

En **extensibilidad de reglas** el microkernel obtiene 5 porque permite incorporar un plug-in sin
volver a desplegar. El monolito modular se queda en 4: con Strategy una regla nueva es una clase
nueva que no modifica el núcleo, pero sí exige un nuevo despliegue. Service-Based baja a 3 porque,
además del despliegue, obliga a versionar el contrato de red.

En **testabilidad aislada** el monolito modular obtiene 5, porque los componentes del núcleo de
reglas tienen acoplamiento eferente cero y se ejecutan sin red, sin interfaz y sin base de datos.
Al microkernel le resta un punto el registro de plug-ins, que es infraestructura adicional y
también hay que probarla. Service-Based obtiene 3 porque probar un flujo completo exige levantar
varios servicios.

En **responsiveness** el monolito modular vuelve a obtener 5: todas las llamadas son en memoria y
la partida vive en el mismo proceso. El microkernel pierde un punto por la indirección del
registro, que es pequeña pero existe. Service-Based obtiene 2 porque cada validación cruzaría la
red, algo incompatible con el presupuesto de 100 ms para evaluar una mano.

La **viabilidad en un semestre** es donde más se separan. El monolito modular obtiene 5 por ser el
de menor costo de montaje. El microkernel cae a 2, porque el descubrimiento, el registro y la
carga dinámica de plug-ins son código de infraestructura que compite con el tiempo de estabilizar
el ciclo de turnos. Service-Based obtiene 1 por sumar despliegue, observabilidad y contratos entre
servicios.

En **gobernabilidad automatizada** el monolito modular obtiene 5 porque sus fronteras son rutas
del sistema de archivos y se verifican con análisis estático. El microkernel obtiene 3: si los
plug-ins se cargan en tiempo de ejecución, el análisis estático deja de ver parte del grafo.

El **despliegue independiente de reglas** es el único criterio donde el monolito modular obtiene 1.
Se incluyó a propósito: sin él la comparación quedaría inflada a favor del estilo que ya
veníamos usando.

La diferencia final es de 58 contra 51. El microkernel es una alternativa legítima y gana en
extensibilidad pura; lo que inclina la balanza son la viabilidad y la gobernabilidad, que dependen
del contexto del equipo y no de una superioridad técnica abstracta.

## 1.2 Descripción del estilo seleccionado y topología

Se adopta **Monolito Modular** (Richards y Ford, 2025, cap. 11) con **particionamiento por
dominio** y el patrón **Strategy** como mecanismo de variabilidad. Formalizado en el **ADR-03**.

### Módulos funcionales

| Módulo | Responsabilidad | Ritmo de cambio |
|---|---|---|
| `game` | Reglas, turnos, mesa, liquidación y oponente virtual | Alto |
| `identity` | Registro, sesión e invitados | Muy bajo |
| `economy` | Fichas, apuestas y movimientos | Bajo |
| `history` | Resultados y estadísticas | Bajo |

Cada módulo contiene sus propias capas (`interfaces`, `application`, `domain`, `infrastructure`),
de modo que un cambio de reglas queda contenido en `game`. El espacio `shared` solo aloja
utilidades técnicas (reloj y fuente de aleatoriedad), nunca lógica de negocio.

```
src/modules/game/domain/rules/     ← punto de extensión (Strategy)
src/modules/game/domain/services/  ← EvaluadorDeMano y CalculadorDePuntaje (Ce = 0)
src/modules/game/application/ports/← interfaces que Juego declara y otros implementan
```

### Mecanismo de comunicación

La comunicación **dentro** del módulo Juego es de tipo **mediador**: el `OrquestadorDeTurnos`
coordina a los demás componentes, que no se llaman entre sí. **Entre** módulos se usan dos
mecanismos, según la naturaleza de la interacción (ADR-05):

| Interacción | Mecanismo | Ejemplo |
|---|---|---|
| Consulta previa que condiciona una acción | Interfaz invertida, síncrona | `GarantiaDeApuesta`: la declara Juego, la implementa Economía |
| Efecto posterior a un hecho consumado | Evento local, asíncrono | `RondaCerrada`: lo escuchan Economía e Historial |

En los dos casos la dependencia de código apunta hacia Juego, que no importa nada de los otros
módulos. Esa inversión de dependencias la verifica la fitness function FF-01.

### Núcleo y puntos de extensión

| Elemento | Implementación |
|---|---|
| Núcleo estable | `MaquinaDeEstados` y `OrquestadorDeTurnos`: el ciclo de robar, descartar y evaluar |
| Contrato | Interfaz `ReglaJuego`: `validate(declaracion) → ResultadoValidacion` |
| Extensiones | `ReglaClasica`, `ReglaApuntado` y, previstas, `ReglaConComodin` y `ReglaContinental` |
| Registro | `ResolutorDeReglas`, que asocia cada modalidad con su implementación |

Para agregar la variante Continental basta con escribir una clase que implemente `ReglaJuego`,
registrarla y habilitarla en la configuración de la partida. No se modifica el orquestador, ni la
máquina de estados, ni el modelo de datos, ni la interfaz. Lo verifica FF-06.

**Quantum arquitectónico: 1.** Un solo desplegable con una base de datos, lo que mantiene la
partida en curso dentro de un proceso y sostiene el presupuesto de latencia.

## 1.3 Diagrama UML de componentes detallado

{{IMG:componentes-detallado}}

El diagrama muestra interfaces provistas (*lollipop*) y requeridas (*socket*). Cuatro lecturas:

1. **La interfaz de usuario no conoce los motores de reglas.** El cliente y los controladores solo
   requieren `AccionesDeJuego` y `EventosDePartida`. No existe ninguna línea entre la capa de
   presentación y `ResolutorDeReglas`, `EvaluadorDeMano` o `CalculadorDePuntaje`.
2. **El contrato `ReglaJuego` es el punto de extensión.** Las tres reglas lo realizan; el núcleo
   depende de la interfaz, nunca de una implementación concreta.
3. **Los puertos de `application` los declara Juego.** `GarantiaDeApuesta` la implementa Economía:
   en ejecución Juego consulta a Economía, pero en el código la flecha va al revés.
4. **La bitácora está fuera del camino crítico.** `BitacoraAsincrona` encola y escribe por su
   cuenta; el turno no espera a la base de datos.

> [Archivos editables: `models/uml/componentes-detallado.puml` y `.drawio`.]
