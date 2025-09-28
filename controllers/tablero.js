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

  // Añadir atributo data-type
  if (c.type) {
    cell.classList.add(c.type);
    cell.dataset.type = c.type; // Configurar data-type
  }

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

  // Añadir atributos data-price y data-color si es propiedad o ferrocarril
  if (c.type === "property" || c.type === "railroad") {
    cell.dataset.price = c.price || "N/A"; // Precio de la propiedad o ferrocarril
    cell.dataset.color = c.color || "Sin color"; // Color del grupo (si aplica)
  }

  cell.dataset.rentBase = c.rent?.base || "N/A"; // Renta base de la propiedad

  addEventListenerCell(cell, c);
  return cell;
}

function addEventListenerCell(cell, c) {
  cell.addEventListener("click", () => {
    console.log(`Casilla: ${c.name} (id ${c.id}) — tipo: ${c.type}`);
  });
}

async function renderBoard() {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const board = await res.json();

    // 👇 ARI guardamos los datos del tablero en window
    window.datosTablero = board;

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
  if (!infoJugadores) {
    console.warn("No hay información de jugadores en localStorage");
    return;
  }

  // Limpiar array de jugadores
  jugadores.length = 0;

  // Obtener cantidad de jugadores activos
  const cantidadJugadores = parseInt(localStorage.getItem("cantidadJugadores")) || 2;

  // Crear solo la cantidad de jugadores seleccionada
  for (let i = 0; i < cantidadJugadores && i < infoJugadores.length; i++) {
    const info = infoJugadores[i];
    const jugador = new Jugador(info.nombre, info.pais, info.color);

    jugadores.push(jugador);
  }

  console.log(`Se crearon ${jugadores.length} jugadores:`, jugadores);
}

function pintarJugadores() {
  jugadores.forEach((jugador, index) => {
    jugador.mostrarJugador(index);

    // Obtener el contenedor del perfil
    const contenedor = document.querySelector(
      `.perfil-jugador[data-index="${index}"]`
    );
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
        const modal = new bootstrap.Modal(
          document.getElementById("modalJugador")
        );
        modal.show();
      });
    }
  });
}

function mostrarPerfilesActivos() {
  // Leer cantidad de jugadores desde localStorage
  const cantidadJugadores =
    parseInt(localStorage.getItem("cantidadJugadores")) || 0;

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

function actualizarJugadores() {
  // 1. Guardar el estado actual de los jugadores en localStorage
  localStorage.setItem("jugadores", JSON.stringify(jugadores.map(j => ({
    ...j,
    enCarcel: j.enCarcel || false,
    turnosEnCarcel: j.turnosEnCarcel || 0
  }))));

  // 2. Volver a pintar los jugadores en el DOM (perfil, dinero, propiedades, etc.)
  jugadores.forEach((jugador, index) => {
    jugador.mostrarJugador(index);
  });

  console.log("Jugadores actualizados:", jugadores);
}

window.actualizarJugadores = actualizarJugadores;

function hipotecarProp(propiedadId) {
  const jugador = JSON.parse(localStorage.getItem("jugadorActivo"));
  if (!jugador) return;

  // Buscar en window.jugadores para obtener la instancia real
  const jugadorReal = window.jugadores.find(j => j.nickname === jugador._nickname);
  if (!jugadorReal) return;

  jugadorReal.hipotecarPropiedad(propiedadId);
}

// Inicializar todo
crearJugadores();
mostrarPerfilesActivos();
pintarJugadores();

// Hacer el array de jugadores accesible globalmente
window.jugadores = jugadores;

import { syncJugadoresActivos } from "./ficha.js"; // al inicio del archivo junto con los imports
// ...
window.jugadores = jugadores;
// forzar sincronización con ficha.js
syncJugadoresActivos();

window.addEventListener("DOMContentLoaded", renderBoard);

import {
  crearFichas,
  moverFicha,
  getTurnoActual,
  siguienteTurno,
  getJugadorActual,
} from "./ficha.js";

window.addEventListener("DOMContentLoaded", () => {
  // Crear fichas después de que el tablero esté renderizado
  setTimeout(() => {
    crearFichas();
  }, 100);

  document.addEventListener("diceRolled", (e) => {
    const { total, dice1, dice2 } = e.detail;
    const jugadorIndex = getTurnoActual();
    const jugadorActual = getJugadorActual();

    console.log("Jugador actual estado cárcel:", {
      nombre: jugadorActual.nombre || jugadorActual.nickname,
      enCarcel: jugadorActual.enCarcel,
      turnos: jugadorActual.turnosEnCarcel
    });


    // Verificar si está en la cárcel
    if (jugadorActual.enCarcel) {
      console.log(`${jugadorActual.nombre || jugadorActual.nickname} está en la cárcel (${jugadorActual.turnosEnCarcel} turnos restantes)`);

      const modal = new bootstrap.Modal(document.getElementById("modalCarcel"));
      modal.show();

      // Botón pagar
      document.getElementById("btnPagarCarcel").onclick = () => {
        if (jugadorActual.dinero >= 50) {
          jugadorActual.dinero -= 50;
          jugadorActual.enCarcel = false;
          jugadorActual.turnosEnCarcel = 0;
          window.actualizarJugadores?.();
          modal.hide();
          // ahora sí puede moverse normalmente
          moverFicha(jugadorIndex, total);
        } else {
          alert("No tienes suficiente dinero para pagar la fianza.");
        }
      };

      // Botón esperar
      document.getElementById("btnEsperarCarcel").onclick = () => {
        jugadorActual.turnosEnCarcel--;

        if (jugadorActual.turnosEnCarcel <= 0) {
          jugadorActual.enCarcel = false;
          jugadorActual.turnosEnCarcel = 0;
          console.log(`${jugadorActual.nickname || jugadorActual.nombre} salió de la cárcel gratis`);
        } else {
          console.log(`${jugadorActual.nickname || jugadorActual.nombre} decidió esperar, le quedan ${jugadorActual.turnosEnCarcel} turnos en la cárcel`);
        }

        window.actualizarJugadores?.();
        modal.hide();

        // Aquí está la clave: saltamos al siguiente jugador
        const nuevoTurno = siguienteTurno();
        console.log(`Turno de ${getJugadorActual().nombre || getJugadorActual().nickname}`);
      };


      return; // Salir, no mover ficha todavía
    }

    // Si no está en cárcel → mover normal
    console.log(`${jugadorActual.nombre || jugadorActual.nickname} avanza ${total} pasos`);
    moverFicha(jugadorIndex, total);

    // Si no sacó dobles → pasar turno
    if (dice1 !== dice2) {
      const nuevoTurno = siguienteTurno();
      console.log(`Turno de ${getJugadorActual().nickname || getJugadorActual().nombre}`);
    } else {
      console.log(`${jugadorActual.nombre || jugadorActual.nickname} repite turno (dobles) 🎲🎲`);
    }
    console.log("DEBUG jugadorActual:", jugadorActual);
  });
});
