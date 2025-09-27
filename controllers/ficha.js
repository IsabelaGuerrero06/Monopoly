// ficha.js

// Colores de las fichas
const coloresFichas = ["red", "blue", "green", "yellow"];

// Orden lineal del tablero (ids de casillas en sentido horario)
const ordenTablero = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,     // BOTTOM
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, // LEFT
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, // TOP
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39  // RIGHT
];

// Cada jugador arranca en la posición 0 del array (Salida → id 0)
let posiciones = [0, 0, 0, 0];
let turno = 0; // Jugador actual (0 = jugador 1, 1 = jugador 2, etc.)

/**
 * Crea las fichas en la casilla de salida
 */
export function crearFichas() {
  const salida = document.querySelector('[data-id="0"]');
  if (!salida) {
    console.error("No se encontró la casilla de salida");
    return;
  }

  // Crear contenedor para fichas si no existe
  let fichasContainer = salida.querySelector('.fichas-container');
  if (!fichasContainer) {
    fichasContainer = document.createElement('div');
    fichasContainer.className = 'fichas-container';
    salida.appendChild(fichasContainer);
  }

  coloresFichas.forEach((color, index) => {
    const ficha = document.createElement("div");
    ficha.classList.add("ficha");
    ficha.style.backgroundColor = color;
    ficha.setAttribute("id", `ficha-${index}`);
    fichasContainer.appendChild(ficha);
  });
}

/**
 * Mueve la ficha de un jugador según los pasos
 * @param {number} jugador - índice del jugador (0 a 3)
 * @param {number} pasos - cantidad de pasos que avanza
 */
export function moverFicha(jugador, pasos) {
  // Índice actual en el recorrido lineal
  let indiceActual = posiciones[jugador];
  let nuevoIndice = (indiceActual + pasos) % ordenTablero.length;

  // Actualizar posición
  posiciones[jugador] = nuevoIndice;

  // Buscar la casilla real en el DOM usando el id de ordenTablero
  const nuevaId = ordenTablero[nuevoIndice];
  const nuevaCasilla = document.querySelector(`[data-id="${nuevaId}"]`);

  if (!nuevaCasilla) {
    console.error(`No se encontró la casilla con id ${nuevaId}`);
    return;
  }

  // Buscar o crear contenedor de fichas en la nueva casilla
  let fichasContainer = nuevaCasilla.querySelector('.fichas-container');
  if (!fichasContainer) {
    fichasContainer = document.createElement('div');
    fichasContainer.className = 'fichas-container';
    nuevaCasilla.appendChild(fichasContainer);
  }

  // Mover la ficha al nuevo contenedor
  const ficha = document.getElementById(`ficha-${jugador}`);
  if (ficha) {
    fichasContainer.appendChild(ficha);
  } else {
    console.error(`No se encontró la ficha del jugador ${jugador}`);
  }
}

/**
 * Cambia al siguiente turno
 */
export function siguienteTurno() {
  turno = (turno + 1) % coloresFichas.length;
  return turno;
}

/**
 * Devuelve el turno actual
 */
export function getTurnoActual() {
  return turno;
}