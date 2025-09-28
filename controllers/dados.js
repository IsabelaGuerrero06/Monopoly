// Funcionalidad de los dados
let isRolling = false;
let lastDiceResult = null;

// Patrones de puntos para cada número del dado
const dicePatterns = {
  1: [4], // centro
  2: [0, 8], // diagonal
  3: [0, 4, 8], // diagonal + centro
  4: [0, 2, 6, 8], // esquinas
  5: [0, 2, 4, 6, 8], // esquinas + centro
  6: [0, 2, 3, 5, 6, 8] // dos columnas verticales
};

/**
 * Crea los puntos del dado en el contenedor
 * @param {string} diceId - ID del contenedor de puntos
 */
function createDots(diceId) {
  const dotsContainer = document.getElementById(diceId);
  dotsContainer.innerHTML = '';
  
  // Crear 9 posiciones para los puntos (grid 3x3)
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = `${diceId}-dot-${i}`;
    dotsContainer.appendChild(dot);
  }
}

/**
 * Muestra el valor del dado activando los puntos correspondientes
 * @param {string} diceId - ID del contenedor de puntos
 * @param {number} value - Valor del dado (1-6)
 */
function showDiceValue(diceId, value) {
  // Ocultar todos los puntos
  for (let i = 0; i < 9; i++) {
    const dot = document.getElementById(`${diceId}-dot-${i}`);
    if (dot) dot.classList.remove('active');
  }

  // Mostrar puntos según el patrón del número
  const pattern = dicePatterns[value];
  if (pattern) {
    pattern.forEach(position => {
      const dot = document.getElementById(`${diceId}-dot-${position}`);
      if (dot) dot.classList.add('active');
    });
  }
}

/**
 * Función principal para lanzar los dados
 */
function rollDice() {
  if (isRolling) return;

  isRolling = true;
  const rollButton = document.getElementById('rollButton');
  const dice1 = document.getElementById('dice1');
  const dice2 = document.getElementById('dice2');

  // Deshabilitar botón y agregar animación
  rollButton.disabled = true;
  rollButton.textContent = 'Lanzando...';
  
  dice1.classList.add('rolling');
  dice2.classList.add('rolling');

  // Animación de números aleatorios durante el lanzamiento
  const animationInterval = setInterval(() => {
    const randomValue1 = Math.floor(Math.random() * 6) + 1;
    const randomValue2 = Math.floor(Math.random() * 6) + 1;
    showDiceValue('dots1', randomValue1);
    showDiceValue('dots2', randomValue2);
  }, 100);

  // Resultado final después de la animación
  setTimeout(() => {
    clearInterval(animationInterval);
    
    // Generar valores finales
    const value1 = Math.floor(Math.random() * 6) + 1;
    const value2 = Math.floor(Math.random() * 6) + 1;
    const total = value1 + value2;

    // Mostrar resultado
    showDiceValue('dots1', value1);
    showDiceValue('dots2', value2);

    // Guardar resultado para uso en el juego
    lastDiceResult = { dice1: value1, dice2: value2, total };

    // Limpiar animación
    dice1.classList.remove('rolling');
    dice2.classList.remove('rolling');
    rollButton.disabled = false;
    rollButton.textContent = 'Lanzar';
    isRolling = false;

    // Verificar dobles
    if (value1 === value2) {
      setTimeout(() => {
        alert(`¡DOBLES! 🎉 Sacaste ${value1} y ${value2}. ¡Lanza otra vez!`);
      }, 500);
    }

    // Disparar evento personalizado para integración con el juego
    const diceEvent = new CustomEvent('diceRolled', {
      detail: { dice1: value1, dice2: value2, total }
    });
    document.dispatchEvent(diceEvent);

    console.log(`Dados lanzados: ${value1} + ${value2} = ${total}`);

  }, 600);
}

/**
 * Función para obtener el último resultado de los dados
 * @returns {Object|null} - Resultado del último lanzamiento o null
 */
function getLastDiceResult() {
  return lastDiceResult;
}

/**
 * Resetea los dados a valores iniciales
 */
function resetDice() {
  showDiceValue('dots1', 1);
  showDiceValue('dots2', 1);
  lastDiceResult = null;
}

// Inicializar dados al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  createDots('dots1');
  createDots('dots2');
  
  // Mostrar valores iniciales
  showDiceValue('dots1', 1);
  showDiceValue('dots2', 1);
});

// Evento de teclado para lanzar dados con la tecla Espacio
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isRolling) {
    e.preventDefault();
    rollDice();
  }
});

// Exportar funciones para uso global
window.rollDice = rollDice
window.getLastDiceResult = getLastDiceResult;
window.resetDice = resetDice;

// Función para usar el valor manual ingresado
function useManualDice() {
  const input = document.getElementById('manualDiceInput');
  const value = parseInt(input.value);

  // Validar que el número sea correcto (2 a 12)
  if (isNaN(value) || value < 2 || value > 12) {
    alert('Por favor ingresa un número válido entre 2 y 12');
    return;
  }

  // Calcular valores ficticios de los dados que sumen el total
  // Ejemplo simple: primer dado = valor - 1, segundo dado = 1
  let dice1 = value - 1;
  let dice2 = 1;

  // Asegurar que estén entre 1 y 6
  if (dice1 > 6) {
    dice1 = 6;
    dice2 = value - 6;
  }

  // Mostrar en los dados
  showDiceValue('dots1', dice1);
  showDiceValue('dots2', dice2);

  // Guardar resultado
  lastDiceResult = { dice1, dice2, total: value };

  // Disparar evento como en rollDice()
  const diceEvent = new CustomEvent('diceRolled', {
    detail: { dice1, dice2, total: value }
  });
  document.dispatchEvent(diceEvent);

  console.log(`Número manual: ${dice1} + ${dice2} = ${value}`);
}

// Conectar el botón al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const manualButton = document.getElementById('manualDiceButton');
  if (manualButton) {
    manualButton.addEventListener('click', useManualDice);
  }
});

// Exportar también esta función
window.useManualDice = useManualDice;
