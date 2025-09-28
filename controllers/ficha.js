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

  jugadoresActivos = [];
  posiciones = [];

  // Usamos las instancias reales
  for (let i = 0; i < cantidadJugadores; i++) {
    const jugador = window.jugadores?.[i];
    if (jugador) {
      // Guardamos el jugador y además le añadimos un colorHex solo para el tablero
      jugador.colorHex = convertirColor(jugador.color);
      jugadoresActivos.push(jugador);
      posiciones.push(0);
    }
  }

  console.log("Jugadores activos (instancias reales):", jugadoresActivos);
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
  // Inicializar jugadores primero (ahora usando instancias reales de Jugador)
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

  // Crear fichas para los jugadores activos
  jugadoresActivos.forEach((jugador, index) => {
    // Convertir color lógico (ej: "rojo") a hex para pintar la ficha
    const colorHex = jugador.colorHex || convertirColor(jugador.color);
    jugador.colorHex = colorHex; // Guardamos en la instancia para reutilizar

    console.log(
      `Creando ficha ${index} para ${jugador.nickname || jugador.nombre} con color lógico: ${jugador.color}, hex: ${colorHex}`
    );

    const ficha = document.createElement("div");
    ficha.classList.add("ficha");
    ficha.classList.add(`color-jugador-${index}`); // Clase fallback

    // Aplicar color
    ficha.style.backgroundColor = colorHex;
    ficha.style.setProperty("background-color", colorHex, "important");

    // Atributos útiles
    ficha.setAttribute("id", `ficha-${index}`);
    ficha.setAttribute("data-jugador", jugador.nickname || jugador.nombre);
    ficha.setAttribute("data-color", colorHex);
    ficha.setAttribute("data-color-original", jugador.color);
    ficha.title = `${jugador.nickname || jugador.nombre} (${jugador.pais}) - Color: ${jugador.color}`;

    fichasContainer.appendChild(ficha);

    // Debug para confirmar color aplicado
    setTimeout(() => {
      const colorAplicado = window.getComputedStyle(ficha).backgroundColor;
      console.log(`Color aplicado a ficha ${index}:`, {
        esperado: colorHex,
        aplicado: colorAplicado,
        elemento: ficha,
      });
    }, 100);
  });
}


// ----------------- moverFicha -----------------

export function moverFicha(jugadorIndex, pasos) {
  let indiceActual = posiciones[jugadorIndex] ?? 0;
  let nuevoIndice = (indiceActual + pasos) % ordenTablero.length;

  const jugadorObj =
    window.jugadores?.[jugadorIndex] ?? jugadoresActivos[jugadorIndex];

  // Revisar si pasó por salida (id=0)
  if (indiceActual + pasos >= ordenTablero.length) {
    jugadorObj.dinero += 200;
    console.log(`${jugadorObj.nickname || jugadorObj.nombre} pasó por Salida y ganó $200`);
    // Actualizar perfiles
    window.actualizarJugadores?.();
  }

  // Actualizar posición
  posiciones[jugadorIndex] = nuevoIndice;

  // Casilla nueva
  const nuevaId = ordenTablero[nuevoIndice];
  const nuevaCasilla = document.querySelector(`[data-id="${nuevaId}"]`);
  if (!nuevaCasilla) {
    console.error(`No se encontró la casilla DOM con data-id="${nuevaId}"`);
    return;
  }

  // Mover ficha al DOM
  const ficha = document.getElementById(`ficha-${jugadorIndex}`);
  if (ficha) nuevaCasilla.appendChild(ficha);

  const casillaData = nuevaCasilla.dataset;
  console.log("Datos de la casilla:", casillaData);

  // Obtener casillaObj real
  const casillaObj =
    buscarCasillaPorId(Number(nuevaId), window.datosTablero) || {
      id: Number(nuevaId),
      name: casillaData.name,
      type: casillaData.type,
      price: parseInt(casillaData.price) || 0,
      color: casillaData.color || null,
      rent: { base: parseInt(casillaData.rentBase) || 0 },
    };

  const listaJugadores =
    window.jugadores?.length > 0 ? window.jugadores : jugadoresActivos;

  // --------- CASILLAS ESPECIALES ---------
  if (casillaObj.type === "special") {
    switch (casillaObj.id) {
      case 0: // Salida
        jugadorObj.dinero += 200;
        console.log(`${jugadorObj.nickname || jugadorObj.nombre} cayó en Salida y ganó $200`);
        window.actualizarJugadores?.();
        break;

      case 10: // Cárcel visita
        console.log(`${jugadorObj.nickname || jugadorObj.nombre} está de visita en la cárcel`);
        break;

      case 20: // Parqueo gratis
        console.log(`${jugadorObj.nickname || jugadorObj.nombre} está en Parqueo Gratis`);
        break;

      case 30: // Ve a la Cárcel
        console.log(`${jugadorObj.nickname || jugadorObj.nombre} va a la cárcel`);

        const carcelIndex = ordenTablero.indexOf(10);
        posiciones[jugadorIndex] = carcelIndex;

        const casillaCarcel = document.querySelector('[data-id="10"]');
        if (casillaCarcel) casillaCarcel.appendChild(ficha);

        jugadorObj.enCarcel = true;
        jugadorObj.turnosEnCarcel = 3;

        window.actualizarJugadores?.();
        break;
    }

    window.actualizarJugadores?.();
    return; // no procesar compra/renta
  }

  // --------- PROPIEDADES / FERROCARRILES ---------
  if (!(casillaObj.type === "property" || casillaObj.type === "railroad")) {
    return;
  }

  // Buscar dueño
  const idsEqual = (a, b) => String(a) === String(b);
  let duenio = null;
  for (const p of listaJugadores) {
    if (
      Array.isArray(p.propiedades) &&
      p.propiedades.some((prop) => idsEqual(prop.id ?? prop, casillaObj.id))
    ) {
      duenio = p;
      break;
    }
  }

  // CASILLA LIBRE → mostrar modal compra
  if (!duenio) {
    const modalElement = document.getElementById("modalComprarPropiedad");
    const modalBody = document.getElementById("modalComprarPropiedadBody");
    const modalHeader = document.getElementById("modalPropiedadHeader");

    if (!modalElement || !modalBody || !modalHeader) return;

    modalHeader.style.backgroundColor =
      casillaObj.color || casillaData.color || "#f8f9fa";
    modalBody.innerHTML = `
      <div>
        <h6>${
          casillaObj.type === "railroad" ? "Ferrocarril" : "Propiedad"
        }: ${casillaObj.name}</h6>
        <p>Precio: $${casillaObj.price || "N/A"}</p>
        ${
          casillaObj.type === "property"
            ? `<p>Renta base: $${casillaObj.rent?.base ?? 0}</p>`
            : ""
        }
      </div>
    `;

    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    const btnComprar = document.getElementById("btnComprarPropiedad");
    if (btnComprar) {
      btnComprar.onclick = () => {
        try {
          const price = parseInt(casillaObj.price) || 0;
          if (typeof jugadorObj.comprarPropiedad === "function") {
            jugadorObj.comprarPropiedad(casillaObj, price);
          } else {
            jugadorObj.dinero -= price;
            jugadorObj.propiedades = jugadorObj.propiedades || [];
            jugadorObj.propiedades.push({ ...casillaObj });
          }

          console.log(`${jugadorObj.nickname || jugadorObj.nombre} compró ${casillaObj.name}`);
          window.actualizarJugadores?.();
          bootstrap.Modal.getInstance(modalElement).hide();
        } catch (err) {
          alert(err.message);
        }
      };
    }
    return;
  }

  // CASILLA CON DUEÑO → pagar renta
  const samePlayer = (a, b) =>
    a === b ||
    (a.nickname && b.nickname && a.nickname === b.nickname) ||
    (a.nombre && b.nombre && a.nombre === b.nombre);

  if (jugadorObj && duenio && !samePlayer(duenio, jugadorObj)) {
    let renta = 0;

    if (casillaObj.type === "property") {
      renta = casillaObj.rent?.base ?? 0;
      if (casillaObj.casas > 0 && Array.isArray(casillaObj.rent?.withHouse)) {
        const idx = Math.min(casillaObj.casas - 1, casillaObj.rent.withHouse.length - 1);
        renta = casillaObj.rent.withHouse[idx];
      }
      if (casillaObj.hotel) {
        renta = casillaObj.rent?.withHotel ?? renta * 2;
      }
    } else if (casillaObj.type === "railroad") {
      const railroadsOwned = duenio.propiedades.filter(
        (p) => p.type === "railroad"
      ).length;
      renta = casillaObj.rent?.[railroadsOwned] ?? 25;
    }

    if (typeof jugadorObj.pagarRenta === "function") {
      jugadorObj.pagarRenta(duenio, renta);
    } else {
      jugadorObj.dinero -= renta;
      duenio.dinero += renta;
    }

    window.actualizarJugadores?.();
    alert(
      `${jugadorObj.nickname || jugadorObj.nombre} pagó $${renta} a ${
        duenio.nickname || duenio.nombre
      } por caer en ${casillaObj.name}`
    );
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
