/**
 * Diccionario global de cartas cargadas desde el backend
 */
let CARTAS_DICCIONARIO = {
  chance: [],
  community_chest: [],
  loaded: false
};

/**
 * Endpoint del backend
 */
const ENDPOINT = "http://127.0.0.1:5000/board";

/**
 * Inicializa el diccionario de cartas desde el backend
 */
export async function inicializarCartasDiccionario() {
  if (CARTAS_DICCIONARIO.loaded) {
    console.log("Cartas ya cargadas previamente");
    return CARTAS_DICCIONARIO;
  }

  try {
    console.log("Cargando cartas desde el backend...");
    const response = await fetch(ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extraer cartas del response
    if (data.chance && Array.isArray(data.chance)) {
      CARTAS_DICCIONARIO.chance = data.chance;
      console.log(`Cargadas ${data.chance.length} cartas de Chance`);
    }
    
    if (data.community_chest && Array.isArray(data.community_chest)) {
      CARTAS_DICCIONARIO.community_chest = data.community_chest;
      console.log(`Cargadas ${data.community_chest.length} cartas de Community Chest`);
    }
    
    CARTAS_DICCIONARIO.loaded = true;
    console.log("Diccionario de cartas cargado exitosamente:", CARTAS_DICCIONARIO);
    
    return CARTAS_DICCIONARIO;
    
  } catch (error) {
    console.error("Error cargando cartas desde el backend:", error);
    
    // Fallback: cartas por defecto en caso de error
    CARTAS_DICCIONARIO = {
      chance: [
        {
          id: 1,
          description: "Avanza hasta la Salida. Cobra $200",
          action: { money: 200, goTo: 0 }
        },
        {
          id: 2,
          description: "Error del banco a tu favor. Cobra $200",
          action: { money: 200 }
        },
        {
          id: 3,
          description: "Paga multa de $50 o toma una carta de Caja de Comunidad",
          action: { money: -50 }
        }
      ],
      community_chest: [
        {
          id: 1,
          description: "Error del banco a tu favor. Cobra $200",
          action: { money: 200 }
        },
        {
          id: 2,
          description: "Honorarios médicos. Paga $100",
          action: { money: -100 }
        },
        {
          id: 3,
          description: "Venta de acciones. Cobra $50",
          action: { money: 50 }
        }
      ],
      loaded: true
    };
    
    console.log("Usando cartas por defecto debido al error");
    return CARTAS_DICCIONARIO;
  }
}

/**
 * Obtiene una carta aleatoria del diccionario según el tipo
 * @param {string} tipo - "chance" o "community_chest"
 * @returns {Object|null} - Carta sorteada o null si no hay cartas
 */
function obtenerCartaAleatoria(tipo) {
  if (!CARTAS_DICCIONARIO.loaded) {
    console.error("Diccionario de cartas no está cargado. Llama a inicializarCartasDiccionario() primero.");
    return null;
  }
  
  const cartas = CARTAS_DICCIONARIO[tipo];
  if (!cartas || cartas.length === 0) {
    console.error(`No hay cartas disponibles para el tipo: ${tipo}`);
    return null;
  }
  
  const indiceAleatorio = Math.floor(Math.random() * cartas.length);
  const cartaSorteada = cartas[indiceAleatorio];
  
  console.log(`Carta sorteada (${tipo}, índice ${indiceAleatorio}):`, cartaSorteada);
  return cartaSorteada;
}

/**
 * Maneja la lógica cuando una ficha cae en una casilla especial
 * @param {DOMStringMap} datosCasilla - Datos de la casilla obtenidos al mover la ficha
 * @param {number} jugadorIndex - Índice del jugador que cayó en la casilla
 */
export function manejarCasillaEspecial(datosCasilla, jugadorIndex = null) {
  console.log("Datos de la casilla al mover ficha:", datosCasilla);

  const tipoCasilla = datosCasilla.type;

  switch (tipoCasilla) {
    case "chance":
      procesarCartaChance(jugadorIndex);
      break;
    
    case "community_chest":
      procesarCartaCommunityChest(jugadorIndex);
      break;
    
    case "tax":
      procesarCasillaImpuesto(jugadorIndex, datosCasilla);
      break;
    
    default:
      console.log(`La casilla no es especial. Tipo: ${tipoCasilla}`);
  }
}

/**
 * Procesa una carta de tipo "Chance" (Sorpresa)
 * @param {number} jugadorIndex - Índice del jugador
 */
function procesarCartaChance(jugadorIndex) {
  const carta = obtenerCartaAleatoria("chance");
  
  if (!carta) {
    mostrarAlertaFallback("chance");
    return;
  }

  // Mostrar la carta al jugador
  mostrarCartaModal(carta, "chance");

  // Aplicar el efecto de la carta
  aplicarEfectoCarta(carta, jugadorIndex);
}

/**
 * Procesa una carta de tipo "Community Chest" (Caja de Comunidad)
 * @param {number} jugadorIndex - Índice del jugador
 */
function procesarCartaCommunityChest(jugadorIndex) {
  const carta = obtenerCartaAleatoria("community_chest");
  
  if (!carta) {
    mostrarAlertaFallback("community_chest");
    return;
  }

  // Mostrar la carta al jugador
  mostrarCartaModal(carta, "community_chest");

  // Aplicar el efecto de la carta
  aplicarEfectoCarta(carta, jugadorIndex);
}

/**
 * Procesa una casilla de tipo "Tax" (Impuesto)
 * @param {number} jugadorIndex - Índice del jugador
 * @param {DOMStringMap} datosCasilla - Datos de la casilla
 */
function procesarCasillaImpuesto(jugadorIndex, datosCasilla) {
  // Obtener el jugador de cualquier lista disponible
  let jugador = obtenerJugador(jugadorIndex);
  
  if (!jugador) {
    console.error("Jugador no encontrado para procesar el impuesto.");
    mostrarAlertaError("No se pudo encontrar el jugador para procesar el impuesto.");
    return;
  }

  const montoImpuesto = parseInt(datosCasilla.amount, 10) || 100; // Default $100 si no hay monto
  
  // Aplicar el impuesto
  const dineroAnterior = jugador.dinero;
  jugador.dinero = Math.max(0, jugador.dinero - montoImpuesto); // No permitir dinero negativo
  
  console.log(`${jugador.nickname || jugador.nombre} pagó impuesto: $${dineroAnterior} → $${jugador.dinero} (-$${montoImpuesto})`);

  // Mostrar modal de impuesto
  mostrarModalImpuesto(jugador, montoImpuesto, datosCasilla.name || "Impuesto");
  
  // Actualizar visualización si existe la función
  if (typeof actualizarVisualizacionDinero === 'function') {
    actualizarVisualizacionDinero(jugadorIndex, jugador.dinero);
  }
}

/**
 * Muestra la carta sorteada en un modal de Bootstrap
 * @param {Object} carta - Datos de la carta sorteada
 * @param {string} tipo - Tipo de carta ("chance" o "community_chest")
 */
function mostrarCartaModal(carta, tipo) {
  const titulo = tipo === "chance" ? "¡Sorpresa!" : "Caja de Comunidad";
  const icono = tipo === "chance" ? "🎲" : "📦";
  const colorHeader = tipo === "chance" ? "#ffc107" : "#0dcaf0";
  
  const dineroTexto = carta.action?.money ? 
    `<div class="carta-dinero mt-3 fs-4">
      <span class="${carta.action.money > 0 ? 'text-success' : 'text-danger'}">
        ${carta.action.money > 0 ? '+' : ''}$${Math.abs(carta.action.money)}
      </span>
    </div>` : '';

  const modalHTML = `
    <div class="modal fade" id="modalCartaTemporal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header text-white" style="background-color: ${colorHeader}; border-radius: 0.375rem 0.375rem 0 0;">
            <h5 class="modal-title fw-bold">${titulo}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <div class="carta-icono mb-3" style="font-size: 3rem;">${icono}</div>
            <h5 class="carta-descripcion mb-3">${carta.description}</h5>
            ${dineroTexto}
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">Continuar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal anterior si existe
  const modalAnterior = document.getElementById('modalCartaTemporal');
  if (modalAnterior) {
    modalAnterior.remove();
  }
  
  // Insertar el nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('modalCartaTemporal');
  
  // Mostrar el modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Limpiar modal del DOM cuando se cierre
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
  
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    if (document.body.contains(modal)) {
      bootstrapModal.hide();
    }
  }, 5000);
}

/**
 * Muestra modal para casillas de impuesto
 * @param {Object} jugador - Datos del jugador
 * @param {number} monto - Monto del impuesto
 * @param {string} nombreCasilla - Nombre de la casilla de impuesto
 */
function mostrarModalImpuesto(jugador, monto, nombreCasilla) {
  const modalHTML = `
    <div class="modal fade" id="modalImpuestoTemporal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header text-white bg-danger">
            <h5 class="modal-title fw-bold">💰 ${nombreCasilla}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <div class="mb-3" style="font-size: 3rem;">🏛️</div>
            <h5 class="mb-3">${jugador.nickname || jugador.nombre}, debes pagar un impuesto</h5>
            <div class="fs-4 text-danger fw-bold">-$${monto}</div>
            <div class="mt-3 text-muted">Dinero restante: $${jugador.dinero}</div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-danger px-4" data-bs-dismiss="modal">Pagar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal anterior si existe
  const modalAnterior = document.getElementById('modalImpuestoTemporal');
  if (modalAnterior) {
    modalAnterior.remove();
  }
  
  // Insertar el nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('modalImpuestoTemporal');
  
  // Mostrar el modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Limpiar modal del DOM cuando se cierre
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

/**
 * Aplica el efecto de la carta sorteada
 * @param {Object} carta - Datos de la carta
 * @param {number} jugadorIndex - Índice del jugador
 */
function aplicarEfectoCarta(carta, jugadorIndex) {
  if (!carta.action) {
    console.log("La carta no tiene acción definida");
    return;
  }

  const jugador = obtenerJugador(jugadorIndex);
  if (!jugador) {
    console.error(`No se pudo encontrar el jugador con índice ${jugadorIndex}`);
    return;
  }

  // Aplicar efecto de dinero
  if (typeof carta.action.money === 'number') {
    const cantidadAnterior = jugador.dinero;
    jugador.dinero = Math.max(0, jugador.dinero + carta.action.money); // No permitir dinero negativo
    
    console.log(`${jugador.nickname || jugador.nombre}: $${cantidadAnterior} → $${jugador.dinero} (${carta.action.money > 0 ? '+' : ''}${carta.action.money})`);
    
    // Actualizar visualización si existe la función
    if (typeof actualizarVisualizacionDinero === 'function') {
      actualizarVisualizacionDinero(jugadorIndex, jugador.dinero);
    }
  }

  // Aquí se pueden agregar más tipos de acciones en el futuro
  if (carta.action.goTo !== undefined) {
    console.log(`Carta requiere mover al jugador a la casilla ${carta.action.goTo}`);
    // Implementar lógica de movimiento si es necesario
  }
}

/**
 * Obtiene un jugador desde cualquier lista disponible
 * @param {number} jugadorIndex - Índice del jugador
 * @returns {Object|null} - Objeto jugador o null si no se encuentra
 */
function obtenerJugador(jugadorIndex) {
  // Prioridad: window.jugadores -> jugadoresActivos -> fallback
  if (window.jugadores && window.jugadores[jugadorIndex]) {
    return window.jugadores[jugadorIndex];
  }
  
  if (window.jugadoresActivos && window.jugadoresActivos[jugadorIndex]) {
    return window.jugadoresActivos[jugadorIndex];
  }
  
  console.error(`No se encontró jugador con índice ${jugadorIndex}`);
  return null;
}

/**
 * Actualiza la visualización del dinero del jugador en la interfaz
 * @param {number} jugadorIndex - Índice del jugador
 * @param {number} nuevaCantidad - Nueva cantidad de dinero
 */
function actualizarVisualizacionDinero(jugadorIndex, nuevaCantidad) {
  const perfilJugador = document.querySelector(`.perfil-jugador[data-index="${jugadorIndex}"]`);
  
  if (perfilJugador) {
    const elementoDinero = perfilJugador.querySelector('.dinero');
    if (elementoDinero) {
      elementoDinero.textContent = `$${nuevaCantidad}`;
      
      // Efecto visual temporal
      elementoDinero.style.transition = 'all 0.3s ease';
      elementoDinero.style.transform = 'scale(1.1)';
      elementoDinero.style.color = '#28a745';
      
      setTimeout(() => {
        elementoDinero.style.transform = 'scale(1)';
        elementoDinero.style.color = '';
      }, 500);
    }
  }
}

/**
 * Muestra una alerta de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarAlertaError(mensaje) {
  console.error(mensaje);
  alert(`Error: ${mensaje}`);
}

/**
 * Fallback para cuando no hay cartas disponibles
 * @param {string} tipo - Tipo de carta
 */
function mostrarAlertaFallback(tipo) {
  const mensaje = tipo === "chance" 
    ? "¡Cayiste en una casilla de Sorpresa! (Cartas no disponibles)" 
    : "¡Cayiste en Caja de Comunidad! (Cartas no disponibles)";
  
  alert(mensaje);
}

/**
 * Función de utilidad para debugging
 */
export function debugCartas() {
  console.log("=== DEBUG CARTAS ===");
  console.log("Cartas cargadas:", CARTAS_DICCIONARIO.loaded);
  console.log("Chance cards:", CARTAS_DICCIONARIO.chance.length);
  console.log("Community cards:", CARTAS_DICCIONARIO.community_chest.length);
  console.log("Diccionario completo:", CARTAS_DICCIONARIO);
  console.log("==================");
}

// Hacer funciones disponibles globalmente
window.inicializarCartasDiccionario = inicializarCartasDiccionario;
window.manejarCasillaEspecial = manejarCasillaEspecial;
window.debugCartas = debugCartas;

// Auto-inicializar las cartas al cargar el script
inicializarCartasDiccionario().catch(console.error);