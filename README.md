# Derby del DOM

Misión M1, El Despertar del DOM — Web Development I.

## Cómo probarlo
Abre index.html en el navegador (o con Live Server). Elige un caballo y
una cantidad para apostar y pulsa ¡A correr!: se juegan 5 rondas y al
final puedes guardar tu puntuación en la clasificación. Tecla secreta:
pulsa "B" para alternar entre modo claro y modo oscuro.

## Uso de IA
Use Claude Code como asistente, sobre todo para el aspecto
visual: el tema claro/oscuro con variables CSS, el fondo de hierba de la
pista y ajustes finos de alineación que solo se detectan mirando el
resultado ya que son operaciones mecánicas que son tediosas más que difíciles.
Para la lógica le pedí primero que revisara mi código y me
propusiera mejoras, y las apliqué yo o le pedí que las aplicara
después de entender cada propuesta.

Ejemplos de prompts reales:
- "aplica el fondo de hierba en el repositorio al fondo de los caballos"
   La IA lo interpretó como un color sólido y tuve que aclarar que me
  refería a la imagen grass.png que ya estaba en el repositorio.

- "En la imagen adjunta están los posibles defectos que tiene mi proyecto, 
dime las partes que pueden contener estos problemas 
y proponme soluciones para aplicarlas yo"
  Tras las sugerencias del asistente, decidí cuales me parecían correctas aplicaciones para la web y cuales me parecían demasiada complejidad o que enrevesavan el código.

Verifiqué cada cambio de CSS con capturas de pantalla del juego
renderizado (así detecté el desajuste de la línea de meta del segundo
ejemplo) y cada cambio de JS jugando una partida completa, probando
además los botones de apuesta con pocas y con muchas monedas.

Escribí a mano la lógica original del juego. La IA no tocó esa lógica salvo
en los dos puntos que le pedí explícitamente tras revisar su propuesta:
pasar los botones de caballo/apuesta a delegación de eventos y cambiar
las apuestas fijas por porcentajes del dinero actual.

## Autopsia
1. carriles y corredores son arrays separados de CABALLOS, unidos
   solo porque comparten el mismo índice (y correrCarrera añade un
   tercer array, posiciones, con esa misma regla implícita). Descarté
   guardar la referencia al DOM y la posición dentro de cada objeto de
   CABALLOS (p. ej. caballo.el) porque, al ser una lista fija que no
   se reordena ni se filtra en ningún punto del juego, el acoplamiento
   por índice no llega a causar ningún bug real y me pareció más
   simple de seguir mientras programaba.
2. La carrera se anima con setInterval sumando un incremento aleatorio
   fijo cada 100 ms, en vez de requestAnimationFrame. Descarté
   requestAnimationFrame porque ata el avance a los frames del
   navegador en vez de a un tiempo fijo, y necesitaba que la
   probabilidad de victoria de cada caballo (controlada por su
   ventaja por tick) fuera predecible y fácil de ajustar a mano.
