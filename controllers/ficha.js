// ficha.js - Versión depurada

// Orden lineal del tablero (ids de casillas en sentido horario)
const ordenTablero = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9, // BOTTOM
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19, // LEFT
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29, // TOP
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39, // RIGHT
];

// Variables globales
let posiciones = [];
let jugadoresActivos = [];
let turno = 0; // Jugador actual (0 = primer jugador activo, 1 = segundo, etc.)

/**
 * Inicializa los datos de los jugadores desde localStorage
 */
function inicializarJugadores() {
  const cantidadJugadores =
    parseInt(localStorage.getItem("cantidadJugadores")) || 2;

  // Debugging: mostrar todo lo que hay en localStorage
  console.log("=== DEBUGGING LOCALSTORAGE ===");
  console.log("cantidadJugadores:", cantidadJugadores);
  console.log("jugadores string:", localStorage.getItem("jugadores"));

  let infoJugadores = [];

  // Los datos se guardan en la clave "jugadores" como un array JSON
  try {
    const jugadoresData = localStorage.getItem("jugadores");
    if (jugadoresData) {
      infoJugadores = JSON.parse(jugadoresData);
      console.log("Datos desde 'jugadores':", infoJugadores);
    }
  } catch (e) {
    console.warn("Error parseando 'jugadores':", e);
  }

  // Limpiar arrays
  jugadoresActivos = [];
  posiciones = [];

  // Tomar solo la cantidad de jugadores seleccionada
  for (let i = 0; i < cantidadJugadores && i < infoJugadores.length; i++) {
    const jugadorData = infoJugadores[i];

    // Convertir el color a formato hexadecimal si es necesario
    let colorHex = convertirColor(jugadorData.color);

    const jugador = {
      nombre: jugadorData.nombre || `Jugador ${i + 1}`,
      color: colorHex,
      pais: jugadorData.pais || "Sin país",
      index: i,
    };

    console.log(`Jugador ${i} configurado:`, jugador);
    jugadoresActivos.push(jugador);

    // Todos empiezan en la posición 0 (Salida)
    posiciones.push(0);
  }

  console.log("=== JUGADORES ACTIVOS FINALES ===");
  console.log(jugadoresActivos);
  console.log("===============================");
}

/**
 * Convierte nombres de colores a formato hexadecimal
 * @param {string} color - El color en formato de texto o hex
 * @returns {string} - Color en formato hexadecimal
 */
function convertirColor(color) {
  // Si ya es hexadecimal, devolverlo tal como está
  if (color && color.startsWith("#")) {
    return color;
  }

  // Mapeo de nombres de colores comunes a hexadecimal
  const colorMap = {
    rojo: "#FF0000",
    azul: "#0000FF",
    verde: "#00FF00",
    amarillo: "#FFFF00",
    rosa: "#FF69B4",
    violeta: "#8B00FF",
    naranja: "#FFA500",
    celeste: "#87CEEB",
    morado: "#8B00FF",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    // Colores en inglés también
    red: "#FF0000",
    blue: "#0000FF",
    green: "#00FF00",
    yellow: "#FFFF00",
    pink: "#FF69B4",
    purple: "#8B00FF",
    orange: "#FFA500",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    black: "#000000",
    white: "#FFFFFF",
  };

  // Buscar el color en el mapeo (insensible a mayúsculas/minúsculas)
  const colorLower = color ? color.toLowerCase() : "";
  const hexColor = colorMap[colorLower];

  if (hexColor) {
    console.log(`Convertido color "${color}" a ${hexColor}`);
    return hexColor;
  }

  // Si no se encuentra, intentar crear un div temporal para que el navegador convierta el color
  try {
    const div = document.createElement("div");
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    // Convertir rgb(r, g, b) a hex
    if (computedColor.startsWith("rgb")) {
      const matches = computedColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const hex =
          "#" +
          matches
            .slice(0, 3)
            .map((x) => parseInt(x).toString(16).padStart(2, "0"))
            .join("");
        console.log(`Convertido color "${color}" (via CSS) a ${hex}`);
        return hex;
      }
    }
  } catch (e) {
    console.warn(`No se pudo convertir el color "${color}"`);
  }

  // Color por defecto si no se puede convertir
  console.warn(`Usando color por defecto para "${color}"`);
  return "#FF0000"; // Rojo por defecto
}

/**
 * Crea las fichas en la casilla de salida según los jugadores activos
 */
export function crearFichas() {
  // Inicializar jugadores primero
  inicializarJugadores();

  const salida = document.querySelector('[data-id="0"]');
  if (!salida) {
    console.error("No se encontró la casilla de salida");
    return;
  }

  // Limpiar fichas existentes
  const fichasExistentes = salida.querySelectorAll(".ficha");
  fichasExistentes.forEach((ficha) => ficha.remove());

  // Limpiar contenedores de fichas existentes
  const contenedoresExistentes = salida.querySelectorAll(".fichas-container");
  contenedoresExistentes.forEach((contenedor) => contenedor.remove());

  // Crear contenedor para fichas si no existe
  let fichasContainer = salida.querySelector(".fichas-container");
  if (!fichasContainer) {
    fichasContainer = document.createElement("div");
    fichasContainer.className = "fichas-container";
    salida.appendChild(fichasContainer);
  }

  // Crear fichas solo para los jugadores activos
  jugadoresActivos.forEach((jugador, index) => {
    console.log(
      `Creando ficha ${index} para ${jugador.nombre} con color original: ${jugador.color}`
    );

    const ficha = document.createElement("div");
    ficha.classList.add("ficha");
    ficha.classList.add(`color-jugador-${index}`); // Clase de fallback

    // Asegurarnos de que el color se aplique correctamente
    ficha.style.backgroundColor = jugador.color;
    ficha.style.setProperty("background-color", jugador.color, "important"); // Forzar el color

    ficha.setAttribute("id", `ficha-${index}`);
    ficha.setAttribute("data-jugador", jugador.nombre);
    ficha.setAttribute("data-color", jugador.color); // Para CSS y debugging
    ficha.setAttribute("data-color-original", jugador.color); // Backup del color original
    ficha.title = `${jugador.nombre} (${jugador.pais}) - Color: ${jugador.color}`; // Tooltip con info del jugador

    console.log("Ficha creada:", ficha);
    fichasContainer.appendChild(ficha);

    // Verificar que el color se aplicó después de un breve delay
    setTimeout(() => {
      const colorAplicado = window.getComputedStyle(ficha).backgroundColor;
      console.log(`Color aplicado a ficha ${index}:`, {
        esperado: jugador.color,
        aplicado: colorAplicado,
        elemento: ficha,
      });

      // Si el color no se aplició correctamente, forzarlo de nuevo
      if (
        colorAplicado === "rgba(0, 0, 0, 0)" ||
        colorAplicado === "transparent"
      ) {
        console.warn(`Forzando color para ficha ${index}`);
        ficha.style.cssText += `background-color: ${jugador.color} !important; background: ${jugador.color} !important;`;
      }
    }, 100);
  });
}

// ----------------- moverFicha (reemplaza tu versión existente) -----------------
/**
 * Mueve la ficha de un jugador según los pasos
 * @param {number} jugador - índice del jugador (0 a 3)
 * @param {number} pasos - cantidad de pasos que avanza
 */
export function moverFicha(jugador, pasos) {
  // índice actual en el recorrido lineal
  let indiceActual = posiciones[jugador];
  let nuevoIndice = (indiceActual + pasos) % ordenTablero.length;

  // Actualizar posición
  posiciones[jugador] = nuevoIndice;

  // Buscar la casilla real en el DOM usando el id de ordenTablero
  const nuevaId = ordenTablero[nuevoIndice];
  const nuevaCasilla = document.querySelector(`[data-id="${nuevaId}"]`);

  // Mover la ficha al nuevo contenedor
  const ficha = document.getElementById(`ficha-${jugador}`);
  nuevaCasilla.appendChild(ficha);

  // Verificar si la casilla es de tipo propiedad
  const casillaData = nuevaCasilla.dataset;
  console.log("Datos de la casilla al mover ficha:", casillaData); // Registro para depuración

  if (
    casillaData.name &&
    (casillaData.type === "property" || casillaData.type === "railroad")
  ) {
    // Inyectar información dinámica en el modal
    const modalBody = document.getElementById("modalComprarPropiedadBody");
    const modalHeader = document.getElementById("modalPropiedadHeader");

    if (modalBody && modalHeader) {
      modalHeader.style.backgroundColor = casillaData.color || "#f8f9fa"; // Estilo dinámico basado en color
      modalBody.innerHTML = `
        <div>
          <h6>${
            casillaData.type === "railroad" ? "Ferrocarril" : "Propiedad"
          }: ${casillaData.name}</h6>
          <p>Precio: $${casillaData.price || "N/A"}</p>
          <p>Color: ${casillaData.color || "Sin color"}</p>
          ${
            casillaData.type === "property"
              ? `<table class="table table-borderless mt-3">
            <tbody>
              <tr>
                <td><strong>Renta base</strong></td>
                <td>$${casillaData.rentBase || "N/A"}</td>
              </tr>
            </tbody>
          </table>`
              : ""
          }
        </div>
      `;
    } else {
      console.error("Elementos del modal no encontrados.");
    }

    // Desplegar el modal para comprar propiedad o ferrocarril
    const modalElement = document.getElementById("modalComprarPropiedad");
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      // Asignar evento al botón de compra (botón ya existe en el HTML)
      const btnComprar = document.getElementById("btnComprarPropiedad");
      if (btnComprar) {
        btnComprar.onclick = () => {
          const jugadorObj = window.jugadores[jugador];
          const casillaObj = buscarCasillaPorId(nuevaId, window.datosTablero);
          const price = parseInt(casillaData.price);

          if (jugadorObj && casillaObj) {
            try {
              jugadorObj.comprarPropiedad(casillaObj, price);
              console.log(`${jugadorObj.nickname} compró ${casillaObj.name}`);

              // refrescar perfiles
              if (typeof actualizarJugadores === "function") {
                window.actualizarJugadores();
              }

              // cerrar modal
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance.hide();
            } catch (err) {
              alert(err.message);
            }
          }
        };
      }
    } else {
      console.error("Modal para comprar propiedad no encontrado.");
    }
  }
}

// ----------------- verificarPropiedadParaCompra -----------------
/**
 * Verifica si la casilla es una propiedad y si ya tiene dueño.
 * Si está libre, muestra el modal de compra en la instancia Jugador (si existe).
 *
 * @param {number} jugadorIndex - índice del jugador que cayó
 * @param {number} casillaId - id real de la casilla (ej: 6)
 * @param {number} nuevoIndice - índice lineal en `ordenTablero` (posición en el recorrido)
 */
function verificarPropiedadParaCompra(jugadorIndex, casillaId, nuevoIndice) {
  console.log("=== DEBUG VERIFICACION PROPIEDAD ===");
  console.log("Jugador índice:", jugadorIndex);
  console.log("Nueva casilla ID:", casillaId);
  console.log("Datos tablero disponibles:", !!window.datosTablero);
  console.log(
    "Jugadores disponibles:",
    !!window.jugadores || !!jugadoresActivos
  );

  if (!window.datosTablero) {
    console.warn(
      "No hay datosTablero cargado (window.datosTablero). No puedo buscar la casilla."
    );
    return;
  }

  const casilla = buscarCasillaPorId(casillaId, window.datosTablero);
  console.log("Casilla encontrada:", casilla);
  if (!casilla) return;

  if (casilla.type !== "property") {
    console.log(
      `La casilla ${casilla.name} (id ${casilla.id}) no es de tipo property.`
    );
    return;
  }

  // Obtener lista de jugadores a chequear (preferimos window.jugadores si existen instancias Jugador)
  const listaJugadores =
    window.jugadores && window.jugadores.length
      ? window.jugadores
      : jugadoresActivos;

  // Buscar dueño
  let duenio = null;
  for (let p of listaJugadores) {
    if (
      Array.isArray(p.propiedades) &&
      p.propiedades.some((prop) => prop.id === casilla.id)
    ) {
      duenio = p;
      break;
    }
  }

  console.log(`Propiedad ${casilla.name} tiene dueño:`, !!duenio);

  if (duenio) {
    console.log(
      `➡️ La propiedad ${casilla.name} (id ${casilla.id}) ya pertenece a ${
        duenio.nickname || duenio.nombre
      }`
    );
    return;
  }

  // Si no hay dueño → mostrar modal de compra en la instancia Jugador si existe
  const instanciaJugador =
    window.jugadores && window.jugadores[jugadorIndex]
      ? window.jugadores[jugadorIndex]
      : null;

  const casillasArray = [];
  // colocamos la casilla en el índice lineal esperado (nuevoIndice)
  casillasArray[nuevoIndice] = casilla;

  if (
    instanciaJugador &&
    typeof instanciaJugador.mostrarModalComprarPropiedad === "function"
  ) {
    console.log(
      "Mostrando modal de compra para:",
      instanciaJugador.nickname || instanciaJugador.nombre || jugadorIndex
    );
    instanciaJugador.mostrarModalComprarPropiedad(casillasArray);
  } else {
    // Fallback / debugging
    console.warn(
      "No se encontró una instancia Jugador con el método mostrarModalComprarPropiedad.\n" +
        "Asegúrate de que las instancias de Jugador estén en window.jugadores.\n" +
        "CasillasArray preparado en índice",
      nuevoIndice,
      casillasArray
    );
    // Si quieres, aquí podrías llamar a alguna función global que abra el modal manualmente,
    // o transformar tu objeto jugadoresActivos en instancias Jugador antes de la partida.
  }
}

// ----------------- buscarCasillaPorId (útil si no tienes una) -----------------
function buscarCasillaPorId(id, datosTablero) {
  if (!datosTablero) return null;

  // Si datosTablero es un array plano
  if (Array.isArray(datosTablero)) {
    return datosTablero.find((c) => c.id === id) || null;
  }

  // Si es un objeto con lados (bottom, left, top, right, etc.)
  for (const lado of Object.values(datosTablero)) {
    if (Array.isArray(lado)) {
      const encontrada = lado.find((c) => c.id === id);
      if (encontrada) return encontrada;
    }
  }

  // Si no encontrado
  return null;
}

/**
 * Verifica si una propiedad ya tiene dueño
 * @param {number} casillaId - ID de la casilla
 * @returns {boolean} - true si tiene dueño, false si está disponible
 */
function verificarSiTieneDueno(casillaId) {
  // Verificar en todos los jugadores si alguien ya tiene esta propiedad
  if (window.jugadores && Array.isArray(window.jugadores)) {
    return window.jugadores.some((jugador) =>
      jugador.propiedades.some((propiedad) => propiedad.id === casillaId)
    );
  }
  return false;
}

/**
 * Obtiene la posición actual de un jugador en el tablero
 * @param {number} jugadorIndex - Índice del jugador
 * @returns {number} - ID de la casilla actual
 */
export function getPosicionJugador(jugadorIndex) {
  if (jugadorIndex < 0 || jugadorIndex >= posiciones.length) {
    console.error(`Índice de jugador inválido: ${jugadorIndex}`);
    return 0;
  }
  // Devolver el ID real de la casilla, no el índice en ordenTablero
  return ordenTablero[posiciones[jugadorIndex]];
}

/**
 * Cambia al siguiente turno
 */
export function siguienteTurno() {
  turno = (turno + 1) % jugadoresActivos.length;
  return turno;
}

/**
 * Devuelve el turno actual
 */
export function getTurnoActual() {
  return turno;
}

/**
 * Devuelve información del jugador actual
 */
export function getJugadorActual() {
  return jugadoresActivos[turno];
}

/**
 * Devuelve todos los jugadores activos
 */
export function getJugadoresActivos() {
  return jugadoresActivos;
}

/**
 * Devuelve la cantidad de jugadores activos
 */
export function getCantidadJugadores() {
  return jugadoresActivos.length;
}

/**
 * Función de debugging para inspeccionar el estado actual
 */
export function debugFichas() {
  console.log("=== DEBUG FICHAS ===");
  console.log("Jugadores activos:", jugadoresActivos);
  console.log("Posiciones:", posiciones);
  console.log("Turno current:", turno);

  // Inspeccionar fichas en el DOM
  jugadoresActivos.forEach((jugador, index) => {
    const ficha = document.getElementById(`ficha-${index}`);
    if (ficha) {
      const colorAplicado = window.getComputedStyle(ficha).backgroundColor;
      console.log(`Ficha ${index} (${jugador.nombre}):`, {
        colorEsperado: jugador.color,
        colorAplicado: colorAplicado,
        elemento: ficha,
      });
    } else {
      console.log(`Ficha ${index} NO ENCONTRADA en el DOM`);
    }
  });

  console.log("==================");
}

// Hacer la función disponible globalmente para debugging
window.debugFichas = debugFichas;
