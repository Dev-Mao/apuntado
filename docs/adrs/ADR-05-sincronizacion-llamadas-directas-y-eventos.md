# ADR-05 · Sincronizar el turno con llamadas directas y desacoplar los efectos con eventos locales

| Campo | Valor |
|---|---|
| **Estado** | Accepted |
| **Fecha** | 25 de octubre de 2026 |
| **Decisores** | Mariana Agudelo Ospina · Juan José Chaves Alvear · Joaquín Andrés Escalante |
| **Relacionado con** | ADR-01, ADR-03, ADR-04 |

---

## Contexto

Dentro del proceso conviven dos tipos de interacción muy distintos y conviene no resolverlos igual:

- **El ciclo del turno** —validar una jugada, aplicarla, calcular el puntaje— es **síncrono por
  naturaleza**: el jugador espera una respuesta inmediata, y si la jugada es inválida no debe
  alterarse el estado.
- **Los efectos posteriores a un hecho del juego** —acreditar el bote, archivar el resultado,
  registrar la bitácora de jugadas— **no bloquean al jugador** y pertenecen a otros módulos.

**Fuerzas en juego**

1. *Responsiveness*: validar una mano en ≤ 100 ms y propagar la jugada a la mesa en ≤ 500 ms (p95).
2. El Entregable 2 exige **trazabilidad de robos, descartes y estados de ronda**, lo que choca con
   el trade-off T3 del Entregable 1 (persistir solo resultados).
3. El módulo Juego no debe depender de Economía ni de Historial (ADR-01).
4. Una jugada inválida no altera el estado ni consume el turno (RN-03).

**Alternativas evaluadas**

| | Opción | Valoración |
|---|---|---|
| A | Todo síncrono con llamadas directas | Simple y depurable; acopla Juego con Economía e Historial y mete escrituras en el camino crítico |
| B | Todo por eventos locales | Desacopla al máximo; vuelve el ciclo del turno asíncrono, difícil de razonar y de garantizar RN-03 |
| C | **Híbrido: llamadas directas en el turno, eventos para los efectos** | Cada interacción usa el mecanismo que le corresponde |

---

## Decisión

**Se adopta la alternativa C.** Dentro del proceso coexisten tres mecanismos, cada uno con una
regla clara de cuándo aplicarlo:

| Mecanismo | Cuándo se usa | Ejemplo |
|---|---|---|
| **Llamada directa a interfaz** (síncrona, en memoria) | El resultado se necesita para decidir, dentro del mismo turno | `DeclararCierre` → `ReglaJuego.validate()` |
| **Interfaz invertida** (síncrona, entre módulos) | Consulta previa que condiciona una acción | `ControlDeAdmision` → `GarantiaDeApuesta`, declarada por Juego e implementada por Economía |
| **Evento local** (asíncrono, en proceso) | Efecto posterior a un hecho consumado | `RondaCerrada` y `PartidaFinalizada`, que escuchan Economía e Historial |

**La bitácora de jugadas se escribe de forma asíncrona.** Cada robo y cada descarte encolan una
entrada en `turno_jugada` a través del puerto `BitacoraDeJugadas`, **fuera del camino crítico del
turno**. Así se cumple la trazabilidad que exige el Entregable 2 sin meter una escritura a base de
datos en la acción más frecuente del juego.

**Consistencia de la bitácora, dicho sin adornos:** la bitácora es un registro de auditoría, **no
una fuente de verdad**. Si el servidor cae puede perder las últimas entradas encoladas. El estado
de la partida nunca se reconstruye a partir de ella; para eso está el estado en memoria y, al
cerrar cada ronda, lo persistido en `puntaje_acumulado`.

**Comunicación con el cliente.** Hacia afuera del proceso, el servidor emite eventos por WebSocket
con la **vista filtrada** de cada jugador. El cliente nunca recibe el estado completo.

---

## Consecuencias

**Positivas**
- El ciclo del turno se razona y se depura como código secuencial: una llamada, un resultado.
- RN-03 se cumple por construcción: si la validación falla, no se publica ningún evento.
- Juego no conoce a Economía ni a Historial; se puede extraer un módulo sin tocar el juego.
- La trazabilidad no cuesta latencia.
- Al estar todo en un proceso, los eventos locales no necesitan broker.

**Negativas (trade-offs aceptados)**
- **Dos mecanismos conviviendo exigen disciplina.** La regla es explícita: si el resultado se
  necesita para decidir, es llamada directa; si es un efecto posterior, es evento.
- **La bitácora puede quedar incompleta** ante una caída. Aceptado: degrada la auditoría, nunca el
  juego.
- **Los eventos locales dificultan seguir el flujo completo** en una traza, porque el productor no
  sabe quién consume.
- **Los eventos no sobreviven al reinicio.** Si el proceso cae entre publicar `RondaCerrada` y que
  Economía acredite el bote, ese pago se pierde. Mitigación: los pagos se derivan del libro de
  movimientos, que es reconstruible desde el resultado persistido de la partida.

---

## Cumplimiento (Compliance)

| # | Verificación | Tipo |
|---|---|---|
| FF-01 | El módulo Juego no importa nada de Economía, Identidad ni Historial | Automatizada · TSArch + dependency-cruiser |
| FF-04 | Sin dependencias cíclicas entre módulos | Automatizada · TSArch + dependency-cruiser |
| C-06 | Una declaración de cierre inválida no publica ningún evento ni escribe en la bitácora | Automatizada · prueba del caso de uso con dobles |
| C-07 | El tiempo de respuesta de `DeclararCierre` excluye la escritura de la bitácora | Automatizada · prueba de rendimiento con bitácora instrumentada |

---

## Notas

- **Autor:** Mariana Agudelo Ospina (Arquitecta Tecnológica / Solución)
- **Revisores:** Juan José Chaves Alvear, Joaquín Andrés Escalante
- **Referencias:** Richards y Ford (2025), cap. 11 *Modular Monolith* (comunicación entre módulos)
  y cap. 3 *Modularity*.
