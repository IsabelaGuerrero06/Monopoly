// ficha.js

// Orden lineal del tablero (ids de casillas en sentido horario)
const ordenTablero = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,     // BOTTOM
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, // LEFT
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, // TOP
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39  // RIGHT
];

// Variables globales
let posiciones = [];
let jugadoresActivos = [];
let turno = 0; // Jugador actual (0 = primer jugador activo, 1 = segundo, etc.)

/**
 * Inicializa los datos de los jugadores desde localStorage
 */
function inicializarJugadores() {
  const cantidadJugadores = parseInt(localStorage.getItem("cantidadJugadores")) || 2;
  
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
      index: i
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
  if (color && color.startsWith('#')) {
    return color;
  }
  
  // Mapeo de nombres de colores comunes a hexadecimal
  const colorMap = {
    'rojo': '#FF0000',
    'azul': '#0000FF',
    'verde': '#00FF00',
    'amarillo': '#FFFF00',
    'rosa': '#FF69B4',
    'violeta': '#8B00FF',
    'naranja': '#FFA500',
    'celeste': '#87CEEB',
    'morado': '#8B00FF',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    // Colores en inglés también
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'pink': '#FF69B4',
    'purple': '#8B00FF',
    'orange': '#FFA500',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'black': '#000000',
    'white': '#FFFFFF'
  };
  
  // Buscar el color en el mapeo (insensible a mayúsculas/minúsculas)
  const colorLower = color ? color.toLowerCase() : '';
  const hexColor = colorMap[colorLower];
  
  if (hexColor) {
    console.log(`Convertido color "${color}" a ${hexColor}`);
    return hexColor;
  }
  
  // Si no se encuentra, intentar crear un div temporal para que el navegador convierta el color
  try {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    // Convertir rgb(r, g, b) a hex
    if (computedColor.startsWith('rgb')) {
      const matches = computedColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const hex = "#" + matches.slice(0, 3)
          .map(x => parseInt(x).toString(16).padStart(2, '0'))
          .join('');
        console.log(`Convertido color "${color}" (via CSS) a ${hex}`);
        return hex;
      }
    }
  } catch (e) {
    console.warn(`No se pudo convertir el color "${color}"`);
  }
  
  // Color por defecto si no se puede convertir
  console.warn(`Usando color por defecto para "${color}"`);
  return '#FF0000'; // Rojo por defecto
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
  const fichasExistentes = salida.querySelectorAll('.ficha');
  fichasExistentes.forEach(ficha => ficha.remove());
  
  // Limpiar contenedores de fichas existentes
  const contenedoresExistentes = salida.querySelectorAll('.fichas-container');
  contenedoresExistentes.forEach(contenedor => contenedor.remove());

  // Crear contenedor para fichas si no existe
  let fichasContainer = salida.querySelector('.fichas-container');
  if (!fichasContainer) {
    fichasContainer = document.createElement('div');
    fichasContainer.className = 'fichas-container';
    salida.appendChild(fichasContainer);
  }

  // Crear fichas solo para los jugadores activos
  jugadoresActivos.forEach((jugador, index) => {
    console.log(`Creando ficha ${index} para ${jugador.nombre} con color original: ${jugador.color}`);
    
    const ficha = document.createElement("div");
    ficha.classList.add("ficha");
    ficha.classList.add(`color-jugador-${index}`); // Clase de fallback
    
    // Asegurarnos de que el color se aplique correctamente
    ficha.style.backgroundColor = jugador.color;
    ficha.style.setProperty('background-color', jugador.color, 'important'); // Forzar el color
    
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
        elemento: ficha
      });
      
      // Si el color no se aplicó correctamente, forzarlo de nuevo
      if (colorAplicado === 'rgba(0, 0, 0, 0)' || colorAplicado === 'transparent') {
        console.warn(`Forzando color para ficha ${index}`);
        ficha.style.cssText += `background-color: ${jugador.color} !important; background: ${jugador.color} !important;`;
      }
    }, 100);
  });
}

/**
 * Mueve la ficha de un jugador según los pasos
 * @param {number} jugadorIndex - índice del jugador en el array de jugadores activos (0 a jugadoresActivos.length-1)
 * @param {number} pasos - cantidad de pasos que avanza
 */
export function moverFicha(jugadorIndex, pasos) {
  // Verificar que el índice sea válido
  if (jugadorIndex >= jugadoresActivos.length || jugadorIndex < 0) {
    console.error(`Índice de jugador inválido: ${jugadorIndex}`);
    return;
  }
  
  // Índice actual en el recorrido lineal
  let indiceActual = posiciones[jugadorIndex];
  let nuevoIndice = (indiceActual + pasos) % ordenTablero.length;

  // Actualizar posición
  posiciones[jugadorIndex] = nuevoIndice;

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
  const ficha = document.getElementById(`ficha-${jugadorIndex}`);
  if (ficha) {
    fichasContainer.appendChild(ficha);
    
    // Log para debugging
    const jugador = jugadoresActivos[jugadorIndex];
    console.log(`${jugador.nombre} se movió a la casilla ${nuevaId} (posición ${nuevoIndice})`);
  } else {
    console.error(`No se encontró la ficha del jugador ${jugadorIndex}`);
  }
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
  console.log("Turno actual:", turno);
  
  // Inspeccionar fichas en el DOM
  jugadoresActivos.forEach((jugador, index) => {
    const ficha = document.getElementById(`ficha-${index}`);
    if (ficha) {
      const colorAplicado = window.getComputedStyle(ficha).backgroundColor;
      console.log(`Ficha ${index} (${jugador.nombre}):`, {
        colorEsperado: jugador.color,
        colorAplicado: colorAplicado,
        elemento: ficha
      });
    } else {
      console.log(`Ficha ${index} NO ENCONTRADA en el DOM`);
    }
  });
  
  console.log("==================");
}

// Hacer la función disponible globalmente para debugging
window.debugFichas = debugFichas;