class Jugador {
  constructor(nickname, pais, color) {
    this.nickname = nickname;
    this.pais = pais;
    this.color = color;
    this.dinero = 1500;
    this.propiedades = [];
    this.posicion = 3; // posición inicial en el tablero
    this.tieneHipoteca = false;
  }

  // Getter para nickname
  get nickname() {
    return this._nickname;
  }

  // Setter para nickname con validación
  set nickname(valor) {
    const regex = /^[a-zA-Z0-9]{5,15}$/;
    if (!regex.test(valor)) {
      throw new Error(
        "El nickname debe tener entre 5 y 15 caracteres alfanuméricos."
      );
    }
    this._nickname = valor;
  }

  // Getter y Setter para pais
  get pais() {
    return this._pais;
  }
  set pais(valor) {
    if (typeof valor !== "string" || valor.length < 2) {
      throw new Error("El país debe ser un texto de al menos 2 caracteres.");
    }
    this._pais = valor;
  }

  // Getter y Setter para color
  get color() {
    return this._color;
  }
  set color(valor) {
    const coloresValidos = [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
    ];
    if (!coloresValidos.includes(valor)) {
      throw new Error("Color no válido para el jugador.");
    }
    this._color = valor;
  }

  get dinero() {
    return this._dinero;
  }

  set dinero(valor) {
    if (valor < 0) {
      throw new Error("El dinero no puede ser negativo.");
    }
    this._dinero = valor;
  }

  //METODOS 
  // Método para mover al jugador (ejemplo chat)
  mover(casillas) {
    this.posicion = ((this.posicion - 1 + casillas) % 40) + 1;
  }

  // Método para comprar propiedad
  comprarPropiedad(propiedad, precio) {
    if (this.dinero >= precio) {
      this.dinero -= precio;
      this.propiedades.push(propiedad);
    } else {
      throw new Error(
        "No tienes suficiente dinero para comprar esta propiedad."
      );
    }
  }

  // Método para hipotecar propiedad
  hipotecar() {
    this.tieneHipoteca = true;
  }

  // Método para cancelar hipoteca
  cancelarHipoteca() {
    this.tieneHipoteca = false;
  }

  //Pagar renta a otro jugador
  pagarRenta(duenio, renta) {
    if (this.dinero >= renta) {
      this.dinero -= renta;
      duenio.dinero += renta;
      console.log(`${this.nickname} pagó ${renta} a ${duenio.nickname}`);
    } else {
      console.log(`${this.nickname} no tiene suficiente dinero para pagar la renta.`);
      // Aquí podrías implementar reglas: vender propiedades, hipotecar, o declararse en bancarrota
    }
  }

  // Pagar impuestos 
  pagarImpuestos(monto) {
    if (monto !== 100 && monto !== 200) {
      throw new Error("El impuesto debe ser 100 o 200.");
    }
    if (this.dinero >= monto) {
      this.dinero -= monto;
      console.log(`${this.nickname} pagó ${monto} en impuestos.`);
    } else {
      console.log(`${this.nickname} no tiene suficiente dinero para pagar impuestos.`);
      // Aquí también podrías aplicar las reglas de bancarrota
    }
  }
  // Método para mostrar la tarjeta de casa/hotel (grupo de propiedades del mismo color)
  mostrarTarjetaCasaHotel(casillas) {
    const tabla = document.getElementById("tablaPropiedades");
    const cardHeader = document.querySelector(".card-header");
    tabla.innerHTML = "";

    const casilla = casillas[this.posicion];
    if (casilla && casilla.type === "property") {
      const colorGrupo = casilla.color;

      cardHeader.textContent = "Propiedades disponibles";
      cardHeader.style.background = colorGrupo;
      cardHeader.style.color = "white";

      const grupoPropiedades = casillas.filter(
        (c) => c.type === "property" && c.color === colorGrupo
      );

      grupoPropiedades.forEach((prop, index) => {
        const precioPrimeraCasa = prop.rent?.withHouse?.[0] || prop.price;

        tabla.innerHTML += `
        <tr id="prop-${index}">
          <td>${prop.name}</td>
          <td>$${precioPrimeraCasa}</td>
          <td>
            <button class="btn btn-primary btn-sm"
                    onclick="comprarPropiedad(${index}, '${prop.name}', ${precioPrimeraCasa})">
              Comprar
            </button>
          </td>
        </tr>
      `;
      });
    } else {
      cardHeader.textContent = "Sin propiedad";
      cardHeader.style.background = "gray";
      tabla.innerHTML = `
      <tr>
        <td colspan="3">No hay propiedad en esta casilla</td>
      </tr>
    `;
    }
  }
  
}