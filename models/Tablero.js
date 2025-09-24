class Tablero {
  constructor() {
    this.casillas = new Array(40).fill(null); 
    // puedes luego reemplazar null con objetos de propiedades, impuestos, cárcel, etc.
  }

  // Método para asignar algo a una casilla
  asignarCasilla(posicion, casilla) {
    if (posicion < 1 || posicion > 40) {
      throw new Error("La posición debe estar entre 1 y 40.");
    }
    this.casillas[posicion - 1] = casilla;
  }

  // Método para obtener la información de una casilla
  obtenerCasilla(posicion) {
    if (posicion < 1 || posicion > 40) {
      throw new Error("La posición debe estar entre 1 y 40.");
    }
    return this.casillas[posicion - 1];
  }
}
