class Juego {
  constructor(jugadores, tablero) {
    this.jugadores = jugadores; // lista de objetos Jugador
    this.tablero = tablero;     // objeto Tablero
    this.turnoActual = 0;       // índice del jugador en turno
  }

  // Manejar turno completo
  manejarTurno(jugador) {
    console.log(`Turno de: ${jugador.nickname}`);

    // Lanzar dados (2 dados de 1 a 6)
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const avance = dado1 + dado2;

    console.log(`${jugador.nickname} lanzó ${dado1} y ${dado2} (total ${avance})`);

    // Mover jugador
    jugador.mover(avance);

    // Obtener casilla actual
    const casilla = this.tablero.obtenerCasilla(jugador.posicion);
    console.log(`${jugador.nickname} cayó en casilla:`, casilla);

    // Procesar acción según tipo de casilla
    if (casilla && casilla.tipo === "propiedad" && casilla.duenio && casilla.duenio !== jugador) {
      jugador.pagarRenta(casilla.duenio, casilla.renta);
    } else if (casilla && casilla.tipo === "impuesto") {
      jugador.pagarImpuestos(casilla.monto);
    } else if (casilla && casilla.tipo === "sorpresa") {
      this.aplicarCartaSorpresa(jugador);
    } else if (casilla && casilla.tipo === "carcel") {
      this.procesarCarcel(jugador);
    }
  }

  // Verificar si el jugador puede construir en la propiedad
  verificarConstruccion(jugador, propiedad) {
    // Reglas simples: debe ser dueño y tener dinero suficiente
    if (propiedad.duenio !== jugador) {
      console.log("No puedes construir, no eres dueño.");
      return false;
    }
    if (jugador.dinero < propiedad.costoConstruccion) {
      console.log("No tienes suficiente dinero para construir.");
      return false;
    }
    // Aquí podrías validar monopolio del color
    console.log("Construcción permitida.");
    return true;
  }

  // Aplicar carta sorpresa aleatoria
  aplicarCartaSorpresa(jugador) {
    const cartas = [
      { tipo: "dinero", valor: 200, mensaje: "¡Ganaste 200 por error bancario a tu favor!" },
      { tipo: "dinero", valor: -100, mensaje: "Pagaste 100 en reparaciones." },
      { tipo: "mover", valor: 3, mensaje: "Avanza 3 casillas." },
      { tipo: "mover", valor: -2, mensaje: "Retrocede 2 casillas." }
    ];

    const carta = cartas[Math.floor(Math.random() * cartas.length)];
    console.log(`Carta sorpresa: ${carta.mensaje}`);

    if (carta.tipo === "dinero") {
      jugador.dinero += carta.valor;
    } else if (carta.tipo === "mover") {
      jugador.mover(carta.valor);
      console.log(`${jugador.nickname} ahora está en la posición ${jugador.posicion}`);
    }
  }

  // Procesar entrada/salida de cárcel
  procesarCarcel(jugador) {
    console.log(`${jugador.nickname} está en la cárcel.`);

    // Simular que puede pagar 50 para salir
    if (jugador.dinero >= 50) {
      jugador.dinero -= 50;
      console.log(`${jugador.nickname} pagó 50 y salió de la cárcel.`);
    } else {
      console.log(`${jugador.nickname} no tiene dinero suficiente para salir de la cárcel.`);
      // Aquí podrías implementar quedarse X turnos o intentar dobles con los dados
    }
  }
}
