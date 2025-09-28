import {manejarCasillaEspecial} from "./cartas.js";
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
// function inicializarJugadores() {
//   const cantidadJugadores =
//     parseInt(localStorage.getItem("cantidadJugadores")) || 2;

//   jugadoresActivos = [];
//   posiciones = [];

//   // Usamos las instancias reales
//   for (let i = 0; i < cantidadJugadores; i++) {
//     const jugador = window.jugadores?.[i];
//     if (jugador) {
//       // Guardamos el jugador y además le añadimos un colorHex solo para el tablero
//       jugador.colorHex = convertirColor(jugador.color);
//       jugadoresActivos.push(jugador);
//       posiciones.push(0);
//     }
//   }

//   console.log("Jugadores activos (instancias reales):", jugadoresActivos);
// }

// --- reemplaza la función inicializarJugadores por esto ---
function inicializarJugadores(retries = 0) {
  const cantidadJugadores = parseInt(localStorage.getItem("cantidadJugadores")) || 2;

  // Si no existen instancias en window.jugadores, vamos a intentar esperar/reintentar
  if (!window.jugadores || !Array.isArray(window.jugadores) || window.jugadores.length === 0) {
    if (retries < 5) {
      console.warn("window.jugadores no disponible aún. Reintentando inicializar jugadores...", { retries });
      setTimeout(() => inicializarJugadores(retries + 1), 100);
      return;
    }
    console.warn("No se encontraron instancias en window.jugadores tras reintentos. Se usarán datos desde localStorage (fallback).");
  }

  jugadoresActivos = [];
  posiciones = [];

  // Si hay instancias reales en window.jugadores las usamos (manteniendo referencias)
  if (window.jugadores && Array.isArray(window.jugadores) && window.jugadores.length > 0) {
    for (let i = 0; i < cantidadJugadores && i < window.jugadores.length; i++) {
      const jugador = window.jugadores[i];
      // Guardar color hex en la instancia para uso por crearFichas
      jugador.colorHex = jugador.colorHex || convertirColor(jugador.color);
      jugadoresActivos.push(jugador);
      posiciones.push(0);
    }
  } else {
    // Fallback: leer del localStorage y crear objetos planos
    let infoJugadores = [];
    try {
      const jugadoresData = localStorage.getItem("jugadores");
      if (jugadoresData) infoJugadores = JSON.parse(jugadoresData);
    } catch (e) {
      console.warn("Error parseando jugadores desde localStorage", e);
    }

    for (let i = 0; i < cantidadJugadores && i < infoJugadores.length; i++) {
      const data = infoJugadores[i];
      const jugadorPlano = {
        nombre: data.nombre || `Jugador ${i + 1}`,
        nickname: data.nombre || `Jugador ${i + 1}`,
        color: data.color,
        colorHex: convertirColor(data.color),
        pais: data.pais || "Sin país",
        dinero: data.dinero ?? 1500,
        propiedades: data.propiedades || [],
        index: i,
        enCarcel: data.enCarcel ?? false,
        turnosEnCarcel: data.turnosEnCarcel ?? 0
      };
      jugadoresActivos.push(jugadorPlano);
      posiciones.push(0);
    }
  }

  console.log("=== JUGADORES ACTIVOS INICIALIZADOS ===", jugadoresActivos);
}

// Exponer función para que tablero.js llame si quiere forzar sincronización
export function syncJugadoresActivos() {
  inicializarJugadores();
  // Re-crear fichas en DOM si ya hay tablero
  try {
    crearFichas();
  } catch (e) {
    // crearFichas puede estar definido más abajo; si no, lo ignoramos
  }
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

  let jugadorObj = window.jugadores?.[jugadorIndex] ?? jugadoresActivos[jugadorIndex];

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
  console.log("Datos de la casilla al mover ficha:", casillaData);

  // --- MANEJO DE CASILLAS ESPECIALES DE ESQUINA ---
  if (nuevaId === 10) {
    console.log(`${jugadorObj.nombre || jugadorObj.nickname} está en la Cárcel (solo de visita). No pasa nada.`);
    return;
  }

  if (nuevaId === 20) {
    console.log(`${jugadorObj.nombre || jugadorObj.nickname} está en el Parqueadero Gratis. No pasa nada.`);
    return;
  }

  if (nuevaId === 30) {
    console.log(`${jugadorObj.nombre || jugadorObj.nickname} fue enviado a la Cárcel`);

    // Enviar a casilla de la cárcel (id=10)
    posiciones[jugadorIndex] = ordenTablero.indexOf(10);
    const casillaCarcel = document.querySelector('[data-id="10"]');
    if (casillaCarcel) casillaCarcel.appendChild(ficha);

    // Marcar estado de cárcel
    jugadorObj.enCarcel = true;
    jugadorObj.turnosEnCarcel = 3;

    // Actualizar perfiles inmediatamente
    window.actualizarJugadores?.();

    // Aviso al jugador
    alert(`${jugadorObj.nombre || jugadorObj.nickname} fue enviado a la cárcel. Debe pagar $50 o esperar 3 turnos.`);

    return; // Salir, no continuar con compra/renta
  }

  // --- NUEVA SECCIÓN: Verificar si la casilla es de tipo especial (chance, community_chest, tax) ---
  if (
    casillaData.type === "chance" ||
    casillaData.type === "community_chest" ||
    casillaData.type === "tax"
  ) {
    console.log(`Casilla especial detectada: ${casillaData.type}`);

    // Llamar a la función para manejar cartas especiales
    try {
      if (typeof window.manejarCasillaEspecial === "function") {
        window.manejarCasillaEspecial(casillaData, jugadorIndex);
      } else {
        // Fallback si no está disponible la función de cartas
        console.warn("Función manejarCasillaEspecial no disponible");
        const tipoTexto =
          casillaData.type === "chance"
            ? "Sorpresa"
            : casillaData.type === "community_chest"
            ? "Caja de Comunidad"
            : "Impuesto";
        alert(`¡Cayiste en ${tipoTexto}! (Sistema de cartas no disponible)`);
      }
    } catch (error) {
      console.error("Error manejando casilla especial:", error);
      alert("Error procesando la casilla especial");
    }

    return; // Salir aquí para casillas especiales
  }

  // Solo actuar si es propiedad o ferrocarril
  if (
    !(
      casillaData.name &&
      (casillaData.type === "property" || casillaData.type === "railroad")
    )
  ) {
    return;
  }

  // ---------------- obtener casillaObj con datos reales (o fallback) ----------------
  const casillaObj = buscarCasillaPorId(
    Number(nuevaId),
    window.datosTablero
  ) || {
    id: Number(nuevaId),
    name: casillaData.name,
    type: casillaData.type,
    price: parseInt(casillaData.price) || 0,
    color: casillaData.color || null,
    rent: { base: parseInt(casillaData.rentBase) || 0 },
  };

  // ---------------- elegir la lista de jugadores correcta ----------------
  const listaJugadores =
    window.jugadores && window.jugadores.length
      ? window.jugadores
      : jugadoresActivos;

  // DEBUG: ver rápidamente la estructura de jugadores antes de buscar dueño
  console.log(
    "Lista usada para buscar dueño:",
    listaJugadores.map((p) => ({
      id: p.index ?? p._index ?? null,
      nombre: p.nombre ?? p.nickname,
      dinero: p.dinero,
      propiedades: (p.propiedades || []).map((x) => x.id ?? x),
    }))
  );

  // helper para comparar ids (permite string/number)
  const idsEqual = (a, b) => String(a) === String(b);

  let duenio = null;
  for (const p of listaJugadores) {
    const todasProps = [
      ...(p.propiedades || []),
      ...(p.hipotecas || []), // 👈 incluimos también las hipotecadas
    ];

    if (todasProps.some((prop) => idsEqual(prop.id ?? prop, casillaObj.id))) {
      duenio = p;
      break;
    }
  }

  // referencia al jugador que se movió (instancia o plano)
  jugadorObj = window.jugadores && window.jugadores[jugadorIndex] ? window.jugadores[jugadorIndex] : jugadoresActivos[jugadorIndex];

  // --------- CASILLA LIBRE: mostrar modal de compra (y asignar compra correctamente) ---------
  if (!duenio) {
    const modalElement = document.getElementById("modalComprarPropiedad");
    const modalBody = document.getElementById("modalComprarPropiedadBody");
    const modalHeader = document.getElementById("modalPropiedadHeader");

    if (!modalElement || !modalBody || !modalHeader) {
      console.error(
        "Elementos del modal no encontrados (modalComprarPropiedad / body / header)."
      );
      return;
    }

    // Inyectar contenido
    modalHeader.style.backgroundColor =
      casillaObj.color || casillaData.color || "#f8f9fa";
    modalBody.innerHTML = `
      <div>
        <h6>${casillaObj.type === "railroad" ? "Ferrocarril" : "Propiedad"}: ${
      casillaObj.name
    }</h6>
        <p>Precio: $${casillaObj.price || "N/A"}</p>
        ${
          casillaObj.type === "property"
            ? `<p>Renta base: $${
                casillaObj.rent?.base ?? casillaData.rentBase ?? 0
              }</p>`
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

          if (!jugadorObj)
            throw new Error("No se encontró el jugador que intenta comprar.");

          // Si existe el método de clase, llámalo (instancia Jugador)
          if (typeof jugadorObj.comprarPropiedadConIndicador === "function") {
            // Usar la versión que actualiza la casilla visualmente
            jugadorObj.comprarPropiedadConIndicador(casillaObj, price);
          } else if (typeof jugadorObj.comprarPropiedad === "function") {
            // Fallback al método original
            jugadorObj.comprarPropiedad(casillaObj, price);
            // Actualizar manualmente si no existe el método con indicador
            if (typeof jugadorObj.actualizarCasillaPropiedad === "function") {
              jugadorObj.actualizarCasillaPropiedad(casillaObj);
            }
          } else {
            jugadorObj.dinero -= price;
            jugadorObj.propiedades = jugadorObj.propiedades || [];
            jugadorObj.propiedades.push({ ...casillaObj });

            // Actualizar casilla manualmente para objetos planos
            actualizarCasillaManual(casillaObj, jugadorObj);
          }

          console.log(
            `${jugadorObj.nickname || jugadorObj.nombre} compró ${
              casillaObj.name
            }`
          );

          // Guardar y refrescar UI: intenta la función global que definiste en tablero.js
          if (typeof window.actualizarJugadores === "function") {
            window.actualizarJugadores();
          } else {
            // fallback: sincronizar jugadoresActivos en localStorage si no hay función
            localStorage.setItem(
              "jugadores",
              JSON.stringify(window.jugadores || jugadoresActivos)
            );
          }

          bootstrap.Modal.getInstance(modalElement).hide();
        } catch (err) {
          alert(err.message);
        }
      };
    }
    return;
  }

  // --------- CASILLA CON DUEÑO → pagar renta (si el dueño no es el mismo jugador) ---------
  const samePlayer = (a, b) => {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.index !== undefined && b.index !== undefined)
      return a.index === b.index;
    if (a.nickname && b.nickname) return a.nickname === b.nickname;
    if (a.nombre && b.nombre) return a.nombre === b.nombre;
    return false;
  };

  if (jugadorObj && duenio && !samePlayer(duenio, jugadorObj)) {
    // VERIFICAR SI LA PROPIEDAD ESTÁ HIPOTECADA
    if (
      duenio.hipotecas &&
      duenio.hipotecas.some((p) => String(p.id) === String(casillaObj.id))
    ) {
      console.log(
        `${casillaObj.name} está hipotecada, no se cobra renta a ${jugadorObj.nombre}`
      );
      return;
    }

    let renta = 0;

    if (casillaObj.type === "property") {
      renta = (casillaObj.rent?.base ?? parseInt(casillaData.rentBase)) || 0;

      if (
        casillaObj.casas &&
        casillaObj.casas > 0 &&
        Array.isArray(casillaObj.rent?.withHouse)
      ) {
        const idx = Math.max(
          0,
          Math.min(casillaObj.casas - 1, casillaObj.rent.withHouse.length - 1)
        );
        renta = casillaObj.rent.withHouse[idx] ?? renta;
      }
      if (casillaObj.hotel) {
        renta = casillaObj.rent?.withHotel ?? renta * 2;
      }
    }

    // Ferrocarriles
    else if (casillaObj.type === "railroad") {
      const railroadsOwned = duenio.propiedades.filter(
        (p) => p.type === "railroad"
      ).length;
      renta = casillaObj.rent?.[railroadsOwned] ?? 25; // fallback a 25 si falta
    }

    // aplicar pago (usar método pagarRenta si existe)
    if (typeof jugadorObj.pagarRenta === "function") {
      jugadorObj.pagarRenta(duenio, renta);
    } else {
      jugadorObj.dinero -= renta;
      duenio.dinero += renta;
    }

    // refrescar UI / persistir
    if (typeof window.actualizarJugadores === "function") {
      window.actualizarJugadores();
    } else {
      localStorage.setItem(
        "jugadores",
        JSON.stringify(window.jugadores || jugadoresActivos)
      );
    }

    console.log(
      `${jugadorObj.nickname || jugadorObj.nombre} pagó $${renta} a ${
        duenio.nickname || duenio.nombre
      } por caer en ${casillaObj.name}`
    );
    // Opcional: mostrar notificación/alert
    alert(
      `${jugadorObj.nickname || jugadorObj.nombre} pagó $${renta} a ${
        duenio.nickname || duenio.nombre
      }`
    );
    return; // Salir después del pago de renta
  }

  // ============= NUEVA SECCIÓN: MODAL CASA/HOTEL =============
  // Verificar si el jugador puede construir casas/hoteles
  // (Solo si es el dueño de la propiedad y es una property, no railroad)
  if (
    casillaData.type === "property" &&
    jugadorObj && 
    duenio && 
    samePlayer(duenio, jugadorObj) &&
    typeof jugadorObj.verificarYMostrarModalConstruccion === "function"
  ) {
    console.log(`${jugadorObj.nickname || jugadorObj.nombre} cayó en su propia propiedad: ${casillaObj.name}`);
    
    // Verificar si el jugador es dueño de esta propiedad
    const esPropio = jugadorObj.propiedades.some(prop => 
      String(prop.id) === String(nuevaId)
    );
    
    if (esPropio) {
      // Llamar al nuevo método que verificará monopolio y mostrará el modal
      console.log("Verificando posibilidad de construcción...");
      jugadorObj.verificarYMostrarModalConstruccion(nuevaId);
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

/**
 * Función auxiliar para actualizar casillas cuando se usan objetos planos
 */
function actualizarCasillaManual(propiedad, jugador) {
  const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
  if (!casilla) return;

  const colorFichaMap = {
    amarillo: "#FFD700",
    azul: "#1E90FF",
    rojo: "#FF4500",
    verde: "#32CD32",
  };

  const colorJugador = colorFichaMap[jugador.color] || "#999999";

  const statusAnterior = casilla.querySelector(".status-owner");
  if (statusAnterior) statusAnterior.remove();

  const statusOwner = document.createElement("div");
  statusOwner.className = "status-owner";
  statusOwner.style.cssText = `
    position: absolute; top: 2px; right: 2px;
    width: 12px; height: 12px; border-radius: 50%;
    background-color: ${colorJugador};
    border: 2px solid #fff;
    box-shadow: 0 0 3px rgba(0,0,0,0.5);
    z-index: 10;
  `;
  statusOwner.title = `Propiedad de ${jugador.nombre || jugador.nickname}`;

  casilla.style.position = "relative";
  casilla.appendChild(statusOwner);
}

/**
 * Actualiza el indicador visual de una propiedad hipotecada (punto gris)
 * @param {Object} propiedad - Objeto de la propiedad hipotecada
 * @param {Object} jugador - Objeto del jugador propietario
 */
export function marcarPropiedadHipotecada(propiedad, jugador) {
  const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
  if (!casilla) {
    console.warn(`No se encontró la casilla con ID ${propiedad.id}`);
    return;
  }

  const statusOwner = casilla.querySelector(".status-owner");
  if (statusOwner) {
    // Cambiar a gris para indicar hipoteca
    statusOwner.style.backgroundColor = "#808080";
    statusOwner.style.border = "2px solid #666";
    statusOwner.title = `Propiedad de ${jugador.nombre || jugador.nickname} (HIPOTECADA)`;
    
    // Añadir clase para identificación
    statusOwner.classList.add("hipotecada");
    
    console.log(`Propiedad ${propiedad.name} marcada como hipotecada`);
  } else {
    console.warn(`No se encontró el indicador de propiedad para ${propiedad.name}`);
  }
}

/**
 * Restaura el indicador visual de una propiedad cuando se deshipoteca
 * @param {Object} propiedad - Objeto de la propiedad deshipotecada
 * @param {Object} jugador - Objeto del jugador propietario
 */
export function desmarcarPropiedadHipotecada(propiedad, jugador) {
  const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
  if (!casilla) {
    console.warn(`No se encontró la casilla con ID ${propiedad.id}`);
    return;
  }

  const statusOwner = casilla.querySelector(".status-owner");
  if (statusOwner) {
    // Restaurar color original del jugador
    const colorFichaMap = {
      amarillo: "#FFD700",
      azul: "#1E90FF",
      rojo: "#FF4500",
      verde: "#32CD32",
      rosa: "#FF69B4",
      violeta: "#8B00FF",
      naranja: "#FFA500",
      celeste: "#87CEEB",
      morado: "#8B00FF",
      cyan: "#00FFFF",
      magenta: "#FF00FF",
    };

    const colorJugador = jugador.colorHex || colorFichaMap[jugador.color] || "#999999";
    
    statusOwner.style.backgroundColor = colorJugador;
    statusOwner.style.border = "2px solid #fff";
    statusOwner.title = `Propiedad de ${jugador.nombre || jugador.nickname}`;
    
    // Remover clase de hipotecada
    statusOwner.classList.remove("hipotecada");
    
    console.log(`Propiedad ${propiedad.name} desmarcada como hipotecada`);
  } else {
    console.warn(`No se encontró el indicador de propiedad para ${propiedad.name}`);
  }
}

/**
 * Actualiza el estado visual de todas las propiedades de un jugador
 * Útil para sincronizar el estado visual tras cambios en lotes
 * @param {Object} jugador - Objeto del jugador
 */
export function actualizarEstadoVisualPropiedades(jugador) {
  if (!jugador.propiedades || !Array.isArray(jugador.propiedades)) {
    console.warn("El jugador no tiene propiedades válidas");
    return;
  }

  // Actualizar propiedades normales
  jugador.propiedades.forEach(propiedad => {
    actualizarCasillaManual(propiedad, jugador);
  });

  // Marcar propiedades hipotecadas si existen
  if (jugador.hipotecas && Array.isArray(jugador.hipotecas)) {
    jugador.hipotecas.forEach(propiedadHipotecada => {
      marcarPropiedadHipotecada(propiedadHipotecada, jugador);
    });
  }
}

/**
 * Función auxiliar mejorada que incluye manejo de hipotecas
 * Extiende la funcionalidad de actualizarCasillaManual original
 * @param {Object} propiedad - Objeto de la propiedad
 * @param {Object} jugador - Objeto del jugador propietario
 * @param {boolean} esHipotecada - Si la propiedad está hipotecada
 */
export function actualizarCasillaConHipoteca(propiedad, jugador, esHipotecada = false) {
  const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
  if (!casilla) return;

  const colorFichaMap = {
    amarillo: "#FFD700",
    azul: "#1E90FF", 
    rojo: "#FF4500",
    verde: "#32CD32",
    rosa: "#FF69B4",
    violeta: "#8B00FF",
    naranja: "#FFA500",
    celeste: "#87CEEB",
    morado: "#8B00FF",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
  };

  // Determinar color según estado de hipoteca
  const colorJugador = esHipotecada 
    ? "#808080"  // Gris para hipotecada
    : (jugador.colorHex || colorFichaMap[jugador.color] || "#999999");

  // Remover indicador anterior
  const statusAnterior = casilla.querySelector(".status-owner");
  if (statusAnterior) statusAnterior.remove();

  // Crear nuevo indicador
  const statusOwner = document.createElement("div");
  statusOwner.className = "status-owner";
  
  if (esHipotecada) {
    statusOwner.classList.add("hipotecada");
  }

  statusOwner.style.cssText = `
    position: absolute; top: 2px; right: 2px;
    width: 12px; height: 12px; border-radius: 50%;
    background-color: ${colorJugador};
    border: 2px solid ${esHipotecada ? '#666' : '#fff'};
    box-shadow: 0 0 3px rgba(0,0,0,0.5);
    z-index: 10;
  `;

  const estadoTexto = esHipotecada ? " (HIPOTECADA)" : "";
  statusOwner.title = `Propiedad de ${jugador.nombre || jugador.nickname}${estadoTexto}`;

  casilla.style.position = "relative";
  casilla.appendChild(statusOwner);
}

/**
 * Función de utilidad para verificar si una propiedad está hipotecada
 * @param {Object} propiedad - Objeto de la propiedad a verificar
 * @param {Object} jugador - Objeto del jugador propietario
 * @returns {boolean} - true si está hipotecada, false si no
 */
export function esPropiedadHipotecada(propiedad, jugador) {
  if (!jugador.hipotecas || !Array.isArray(jugador.hipotecas)) {
    return false;
  }
  
  return jugador.hipotecas.some(hipoteca => {
    const idHipoteca = hipoteca.id || hipoteca;
    const idPropiedad = propiedad.id || propiedad;
    return String(idHipoteca) === String(idPropiedad);
  });
}

// ========== EXPONER FUNCIONES GLOBALMENTE ==========
// Para que puedan ser llamadas desde otros archivos

window.marcarPropiedadHipotecada = marcarPropiedadHipotecada;
window.desmarcarPropiedadHipotecada = desmarcarPropiedadHipotecada;
window.actualizarEstadoVisualPropiedades = actualizarEstadoVisualPropiedades;
window.actualizarCasillaConHipoteca = actualizarCasillaConHipoteca;
window.esPropiedadHipotecada = esPropiedadHipotecada;
