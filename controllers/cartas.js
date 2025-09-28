/**
 * Maneja la lógica cuando una ficha cae en una casilla de cartas
 * @param {DOMStringMap} datosCasilla - Datos de la casilla obtenidos al mover la ficha
 * @param {number} jugadorIndex - Índice del jugador que cayó en la casilla
 */
export function manejarCasilla(datosCasilla, jugadorIndex = null) {
  console.log("Datos de la casilla al mover ficha:", datosCasilla);

  const tipoCasilla = datosCasilla.type;

  if (tipoCasilla === "chance") {
    procesarCartaChance(jugadorIndex);
  } else if (tipoCasilla === "community_chest") {
    procesarCartaCommunityChest(jugadorIndex);
  } else if (tipoCasilla === "tax") {
    procesarCasillaTax(jugadorIndex, datosCasilla);
  } else {
    console.log(`La casilla no es de tipo 'chance', 'community_chest' o 'tax'. Tipo actual: ${tipoCasilla}`);
  }
}

/**
 * Procesa una carta de tipo "Chance" (Sorpresa)
 * @param {number} jugadorIndex - Índice del jugador
 */
function procesarCartaChance(jugadorIndex) {
  // Verificar si tenemos los datos del tablero con las cartas
  if (!window.datosTablero || !window.datosTablero.chance) {
    console.error("No se encontraron las cartas de chance en los datos del tablero");
    mostrarAlertaFallback("chance");
    return;
  }

  const cartasChance = window.datosTablero.chance;
  
  // Sortear una carta aleatoria del 0 al length-1
  const indiceAleatorio = Math.floor(Math.random() * cartasChance.length);
  const cartaSorteada = cartasChance[indiceAleatorio];

  console.log(`Carta de Chance sorteada (índice ${indiceAleatorio}):`, cartaSorteada);

  // Mostrar la carta al jugador
  mostrarCartaModal(cartaSorteada, "chance");

  // Aplicar el efecto de la carta
  aplicarEfectoCarta(cartaSorteada, jugadorIndex);
}

/**
 * Procesa una carta de tipo "Community Chest" (Caja de Comunidad)
 * @param {number} jugadorIndex - Índice del jugador
 */
function procesarCartaCommunityChest(jugadorIndex) {
  // Verificar si tenemos los datos del tablero con las cartas
  if (!window.datosTablero || !window.datosTablero.community_chest) {
    console.error("No se encontraron las cartas de community chest en los datos del tablero");
    mostrarAlertaFallback("community_chest");
    return;
  }

  const cartasCommunity = window.datosTablero.community_chest;
  
  // Sortear una carta aleatoria
  const indiceAleatorio = Math.floor(Math.random() * cartasCommunity.length);
  const cartaSorteada = cartasCommunity[indiceAleatorio];

  console.log(`Carta de Community Chest sorteada (índice ${indiceAleatorio}):`, cartaSorteada);

  // Mostrar la carta al jugador
  mostrarCartaModal(cartaSorteada, "community_chest");

  // Aplicar el efecto de la carta
  aplicarEfectoCarta(cartaSorteada, jugadorIndex);
}

/**
 * Procesa una casilla de tipo "Tax" (Impuesto)
 * @param {number} jugadorIndex - Índice del jugador
 * @param {DOMStringMap} datosCasilla - Datos de la casilla
 */
function procesarCasillaTax(jugadorIndex, datosCasilla) {
  const jugador = window.jugadores[jugadorIndex];
  if (!jugador) {
    console.error("Jugador no encontrado para procesar el impuesto.");
    return;
  }

  const montoImpuesto = parseInt(datosCasilla.amount, 10);
  if (isNaN(montoImpuesto)) {
    console.error("El monto del impuesto no es válido.");
    return;
  }

  jugador.dinero -= montoImpuesto;
  console.log(`${jugador.nickname} ha pagado un impuesto de ${montoImpuesto}. Dinero restante: ${jugador.dinero}`);

  // Mostrar un mensaje al jugador
  alert(`${jugador.nickname}, has pagado un impuesto de ${montoImpuesto}.`);
}

/**
 * Muestra la carta sorteada en un modal de Bootstrap
 * @param {Object} carta - Datos de la carta sorteada
 * @param {string} tipo - Tipo de carta ("chance" o "community_chest")
 */
function mostrarCartaModal(carta, tipo) {
  // Crear o obtener el modal
  let modal = document.getElementById('modalCarta');
  
  if (!modal) {
    // Crear el modal si no existe
    modal = crearModalCarta();
  }

  // Configurar el contenido del modal
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  
  // Configurar título según el tipo
  const titulo = tipo === "chance" ? "¡Sorpresa!" : "Caja de Comunidad";
  modalTitle.textContent = titulo;
  
  // Configurar color del header
  const modalHeader = modal.querySelector('.modal-header');
  modalHeader.style.backgroundColor = tipo === "chance" ? "#ffc107" : "#0dcaf0";
  modalHeader.style.color = "white";
  
  // Mostrar descripción de la carta
  modalBody.innerHTML = `
    <div class="text-center">
      <div class="carta-icono mb-3">
        ${tipo === "chance" ? "🎲" : "📦"}
      </div>
      <h5 class="carta-descripcion">${carta.description}</h5>
      ${carta.action && carta.action.money ? `
        <div class="carta-dinero mt-3">
          <span class="${carta.action.money > 0 ? 'text-success' : 'text-danger'}">
            ${carta.action.money > 0 ? '+' : ''}$${carta.action.money}
          </span>
        </div>
      ` : ''}
    </div>
  `;

  // Mostrar el modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Cerrar automáticamente después de 4 segundos
  setTimeout(() => {
    bootstrapModal.hide();
  }, 4000);
}

/**
 * Crea el modal para mostrar las cartas si no existe
 * @returns {HTMLElement} - Elemento del modal creado
 */
function crearModalCarta() {
  const modalHTML = `
    <div class="modal fade" id="modalCarta" tabindex="-1" aria-labelledby="modalCartaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalCartaLabel">Carta</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <!-- Contenido de la carta -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Continuar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insertar el modal en el DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  return document.getElementById('modalCarta');
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

  // Obtener el jugador (preferir window.jugadores si existe, sino usar jugadoresActivos)
  let jugador = null;
  
  if (window.jugadores && window.jugadores[jugadorIndex]) {
    jugador = window.jugadores[jugadorIndex];
  } else if (window.jugadoresActivos && window.jugadoresActivos[jugadorIndex]) {
    jugador = window.jugadoresActivos[jugadorIndex];
  }

  if (!jugador) {
    console.error(`No se pudo encontrar el jugador con índice ${jugadorIndex}`);
    return;
  }

  // Aplicar efecto de dinero
  if (typeof carta.action.money === 'number') {
    const cantidadAnterior = jugador.dinero;
    
    try {
      // Modificar el dinero del jugador
      jugador.dinero += carta.action.money;
      
      // Asegurar que el dinero no sea negativo
      if (jugador.dinero < 0) {
        jugador.dinero = 0;
      }

      console.log(`${jugador.nickname || jugador.nombre}: ${cantidadAnterior} → ${jugador.dinero} (${carta.action.money > 0 ? '+' : ''}${carta.action.money})`);
      
      // Actualizar la visualización del dinero si existe el elemento
      actualizarVisualizacionDinero(jugadorIndex, jugador.dinero);
      
    } catch (error) {
      console.error("Error aplicando el efecto de dinero:", error);
    }
  }

  // Aquí puedes agregar más tipos de acciones en el futuro
  // Por ejemplo: carta.action.goTo, carta.action.moveSpaces, etc.
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
 * Fallback para cuando no hay sistema de cartas disponible
 * @param {string} tipo - Tipo de carta
 */
function mostrarAlertaFallback(tipo) {
  const mensaje = tipo === "chance" 
    ? "¡Cayiste en una casilla de Sorpresa! (Cartas no disponibles)" 
    : "¡Cayiste en Caja de Comunidad! (Cartas no disponibles)";
  
  alert(mensaje);
}