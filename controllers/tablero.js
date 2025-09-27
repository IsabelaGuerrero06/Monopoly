import Jugador from "../models/Jugador.js";
// controllers/tablero.js
const ENDPOINT = "http://127.0.0.1:5000/board";

// Crear lista de jugadores
const jugadores = [];
/* Mapa de colores del grupo a clases CSS */
const colorMap = {
  brown: "color-brown",
  purple: "color-light-blue", // tu JSON usa "purple" para el set celeste
  pink: "color-pink",
  orange: "color-orange",
  red: "color-red",
  yellow: "color-yellow",
  green: "color-green",
  blue: "color-blue",
};

const esquinas = [0, 10, 20, 30];
const lados = ["top", "right", "bottom", "left"]; // aquí solo para orden mental

function makeCell(c) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.id = c.id;
  cell.dataset.name = c.name || "";

  // tipo para estilos futuros
  if (c.type) cell.classList.add(c.type);

  // banda de color SOLO si es propiedad
  if (c.type === "property" && c.color && colorMap[c.color]) {
    cell.classList.add(colorMap[c.color]);
    const band = document.createElement("div");
    band.className = "band";
    cell.appendChild(band);
  }

  // precio SOLO si es propiedad o ferrocarril
  if (
    typeof c.price === "number" &&
    (c.type === "property" || c.type === "railroad")
  ) {
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `$${c.price}`;
    cell.appendChild(price);
  }

  // estado visual (hotel, casas, dueño)
  const hasHotel = Number(c.hotel || 0) > 0;
  const houses = Number(c.houses || 0) || 0;
  const ownerColor = c.ownerColor;

  if (hasHotel || houses > 0 || ownerColor) {
    const status = document.createElement("div");
    status.className = "status";

    if (hasHotel) {
      status.textContent = "Hotel";
    } else if (houses > 0) {
      status.textContent = `${houses} casa${houses === 1 ? "" : "s"}`;
    } else if (ownerColor) {
      status.textContent = "";
      status.style.background = ownerColor;
      status.style.borderColor = "#111";
    }

    cell.appendChild(status);
  }

  // nombre
  const label = document.createElement("div");
  label.className = "label";
  label.textContent = c.name || "";
  cell.appendChild(label);

  addEventListenerCell(cell, c);
  return cell;
}

function addEventListenerCell(cell, c) {
  cell.addEventListener("click", () => {
    console.log(`Casilla: ${c.name} (id ${c.id}) — tipo: ${c.type}`);
  });
}

function addEventListenerCornerCell(cell, c) {
  const esquinas = document.querySelectorAll(".corner");
  esquinas.forEach((esquina) => {
    esquina.addEventListener("click", (e) => {
      console.log(
        `Casilla: ${esquina.dataset.name} id ${esquina.dataset.id}  `
      );
    });
  });
}

async function renderBoard() {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const board = await res.json();

    // contenedores de lados
    const topC = document.getElementById("edge-top");
    const bottomC = document.getElementById("edge-bottom");
    const leftC = document.getElementById("edge-left");
    const rightC = document.getElementById("edge-right");

    // TOP (ids 21..29 en tu JSON) → invertir
    (board.top || [])
      .filter((c) => !esquinas.includes(c.id))
      .forEach((c) => {
        topC.appendChild(makeCell(c));
      });

    // RIGHT (ids 31..39) → normal
    (board.right || [])
      .filter((c) => !esquinas.includes(c.id))
      .forEach((c) => {
        rightC.appendChild(makeCell(c));
      });

    // BOTTOM (ids 1..9) → invertir el orden
    (board.bottom || [])
      .filter((c) => !esquinas.includes(c.id))
      .reverse() // 👈 esta línea es la que invierte
      .forEach((c) => {
        bottomC.appendChild(makeCell(c));
      });

    // LEFT (ids 11..19) → invertir
    (board.left || [])
      .filter((c) => !esquinas.includes(c.id))
      .reverse()
      .forEach((c) => {
        leftC.appendChild(makeCell(c));
      });
  } catch (err) {
    console.error("Error renderizando tablero:", err);
  }
}

function crearJugadores() {
  const infoJugadores = JSON.parse(localStorage.getItem("jugadores"));
  infoJugadores.forEach((info) => {
    const jugador = new Jugador(info.nombre, info.pais, info.color);
    jugadores.push(jugador);
  });
}

function pintarJugadores() {
  jugadores.forEach((jugador, index) => {
    jugador.mostrarJugador(index);

    // Obtener el contenedor del perfil
    const contenedor = document.querySelector(`.perfil-jugador[data-index="${index}"]`);
    if (contenedor) {
      const icono = contenedor.querySelector(".iconoPerfil");

      // Click para abrir modal
      icono.style.cursor = "pointer";
      icono.addEventListener("click", () => {
        // Pasar datos del jugador al localStorage (para que pestañaJugador los use)
        localStorage.setItem("jugadorActivo", JSON.stringify(jugador));

        // Cargar la página pestañaJugador.html en el iframe
        document.getElementById("iframeJugador").src = "pestañaJugador.html";

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById("modalJugador"));
        modal.show();
      });
    }
  });
}

function mostrarPerfilesActivos() {
  // Leer cantidad de jugadores desde localStorage
  const cantidadJugadores = parseInt(localStorage.getItem("cantidadJugadores")) || 0;

  // Obtener todos los contenedores de perfiles
  const perfiles = document.querySelectorAll(".perfil-jugador");

  perfiles.forEach((perfil, index) => {
    if (index < cantidadJugadores) {
      perfil.style.display = "flex"; // mostrar (puede ser flex o block, según tu CSS)
    } else {
      perfil.style.display = "none"; // ocultar
    }
  });
}


crearJugadores();
mostrarPerfilesActivos();
pintarJugadores();

addEventListenerCornerCell();
window.addEventListener("DOMContentLoaded", renderBoard);

import {
  crearFichas,
  moverFicha,
  getTurnoActual,
  siguienteTurno,
} from "./ficha.js";

window.addEventListener("DOMContentLoaded", () => {
  crearFichas();

  // Cuando los dados terminan de lanzarse
  document.addEventListener("diceRolled", (e) => {
    const { total, dice1, dice2 } = e.detail;
    const jugador = getTurnoActual();

    console.log(`Jugador ${jugador + 1} avanza ${total} pasos`);

    // Mover la ficha
    moverFicha(jugador, total);

    // Si no sacó dobles → pasa turno
    if (dice1 !== dice2) {
      const nuevoTurno = siguienteTurno();
      console.log(`Turno del Jugador ${nuevoTurno + 1}`);
    } else {
      console.log(`Jugador ${jugador + 1} repite turno (dobles) 🎲🎲`);
    }
  });
});

