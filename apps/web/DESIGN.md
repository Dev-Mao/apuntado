# Apuntado: dirección visual

## Idea

Una mesa de juego vintage y editorial, pero limpia: fondo crema plano, una mesa negra de borde curvo, círculos coral que se salen por los bordes y tipografía de revista. Tres colores planos, sin texturas ni adornos, mucho aire y alineación estricta. La referencia es la imagen favorita del equipo; la usamos como lenguaje, no como plano, y no copiamos textos ni ilustraciones.

## Paleta

| Nombre       | Hex       | Uso                                                        |
| ------------ | --------- | ---------------------------------------------------------- |
| Papel        | `#F5EEE6` | Fondo plano de toda la app                                 |
| Papel claro  | `#FBF6F1` | Paneles, barra lateral, arco de la mano, diálogos          |
| Tinta        | `#1F1B19` | La mesa, el texto, los pips negros                         |
| Coral        | `#EC7A60` | Acción principal, turno, selección, dorso liso de las cartas |
| Salmón       | `#F29C84` | Círculos de fondo y matices del coral                      |
| Coral tinta  | `#A8452C` | Texto coral sobre papel (contraste AA) y palos rojos       |

Las líneas finas son tinta al 15 %.

## Tipografía

- **Playfair Display** (600): el título, los números grandes del marcador y los títulos de cada pantalla.
- **Source Serif 4**: nombres, filas, texto corrido y la cursiva de lemas y estados.
- **Jost**: etiquetas pequeñas en mayúsculas muy espaciadas y botones, con moderación.
- Las tres se cargan con `next/font` en `src/app/layout.tsx` y se exponen como `--font-display`, `--font-serif` y `--font-sans` en `globals.css`; cambiar una familia es tocar una línea.
- Escala 1.25: 12.8 · 16 · 20 · 25 · 31 · 39 · 49 px; el título de inicio llega a 122 px.

## Pantallas

- **Inicio:** a la izquierda el título «Apuntado» enorme, el lema en cursiva y una línea fina; detrás, un círculo coral que se sale por la esquina. A la derecha el panel negro con el apodo, la modalidad, el botón de crear mesa y la opción de unirse con código.
- **Sala:** la mesa negra ovalada con los puestos alrededor (tú abajo) y el código en el centro.
- **Mesa:** en escritorio, la mesa negra al centro con rivales arriba y a los lados (abanicos de dorsos coral y una píldora con nombre y número de cartas), mazo y pozo en el centro dentro de un círculo fino, y tu mano en abanico sobre un arco claro abajo. A la derecha, la barra lateral: ronda, marcador con el umbral, banda coral «Tu turno» con el reloj, modalidad y cierres habilitados, y los botones de acción. En el teléfono, una franja de puntajes arriba, la mesa en el medio, el turno y las acciones encima de la mano.
- **Resultados:** panel claro sobre el papel; los puntos se cuentan solos y las barras avanzan hacia el umbral. Al final, el nombre del ganador en el título gigante con un abanico de cartas.
- **Perfil:** el apodo grande, cuatro cifras y las últimas 10 partidas en filas con líneas finas.

```
Mesa, escritorio
┌──────────────────────────────────────┬─────────────┐
│ ♠ APUNTADO ───────────     MESA K7Q2  │ RONDA 3     │
│  ●  ╭──── mesa negra ─────╮       ●   │ marcador    │
│ Ana │  [Luis]             │   Tomás   │ ▇ Tu turno ▢│
│     │   ▢ mazo  ▢ pozo    │           │ cierres     │
│     ╰─────────────────────╯           │ (ROBAR)     │
│        ╭── arco claro: tu mano ──╮    │ (POZO)      │
└──────────────────────────────────────┴─────────────┘
```

## Una sola pantalla

Ninguna vista hace scroll de página: cada pantalla ocupa `100dvh` y las regiones que pueden crecer (marcador lateral, tabla de resultados, historial del perfil, diálogos) tienen scroll interno con un leve desvanecido abajo. Las variantes `short` (alto < 704 px) y `tiny` (alto < 480 px) compactan la mesa: cartas más pequeñas, menos aire, abanicos de rivales ocultos en horizontal. En inicio, el umbral, el turno y la apuesta se editan en un diálogo para que el panel quepa entero.

## La mano en el teléfono

Las 10 u 11 cartas se solapan en un abanico que siempre cabe en el ancho: el paso entre cartas se calcula con unidades de contenedor (`cqw`) y siempre deja ver el índice. Al tocar una carta sube con un rebote corto, se marca con borde coral y aparecen tres trazos coral a su lado.

## Movimiento

- Responde a lo que pasa en la mesa, nunca decora. No hay entradas genéricas con fundido.
- **Repartir:** al empezar la ronda las cartas salen del mazo, una por puesto, y se voltean al llegar.
- **Robar:** la carta viaja del mazo (volteándose) o del pozo hasta su lugar en tu mano.
- **Descartar:** la carta vuela de la mano (tuya o del rival) al pozo.
- **Turno:** la píldora del jugador activo se vuelve coral y la banda «Tu turno» entra deslizando; el reloj se pone coral en los últimos 10 s.
- Curvas: `glide` `cubic-bezier(.2,.8,.2,1)` para deslizar sobre la mesa, `spring` `cubic-bezier(.34,1.56,.64,1)` para levantar cartas. 180 ms para gestos, 460 ms para vuelos.
- Con `prefers-reduced-motion` no hay vuelos ni conteos: los cambios aparecen directamente.

## Cartas

Caras crema con pips de tinta (rojos en coral tinta), índices serif y figuras enmarcadas con trazos finos. El dorso es coral liso con un filo crema. Para usar las imágenes del equipo basta cambiar `CARD_ART` en `src/components/ui/playing-card.tsx` a `CARD_ART.IMAGES`; se leerán de `/cards/{rango}{palo}.png` y `/cards/back.png`.
