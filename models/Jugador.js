export default class Jugador {
  constructor(nickname, pais, color) {
    this.nickname = nickname;
    this.pais = pais;
    this.color = color;
    this.dinero = 1500;
    this.propiedades = [];
    this.posicion = 3; // posición inicial en el tablero
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
    const coloresValidos = ["amarillo", "azul", "rojo", "verde"];
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

  // Pagar renta a otro jugador
  pagarRenta(duenio, renta) {
    if (this.dinero >= renta) {
      this.dinero -= renta;
      duenio.dinero += renta;
      console.log(`${this.nickname} pagó ${renta} a ${duenio.nickname}`);
    } else {
      console.log(
        `${this.nickname} no tiene suficiente dinero para pagar la renta.`
      );
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
      console.log(
        `${this.nickname} no tiene suficiente dinero para pagar impuestos.`
      );
      // Aquí también podrías aplicar las reglas de bancarrota
    }
  }

  calcularPatrimonio() {
    let patrimonio = this.dinero;
    this.propiedades.forEach((prop) => {
      let valorProp = prop.price;
      if (prop.casas) valorProp += prop.casas * 100;
      if (prop.hotel) valorProp += 200; // hotel vale 200 según doc
      patrimonio += valorProp;
    });
    return patrimonio;
  }

  comprarCasa(propiedad, tableroCompleto) {
    if (!this.tieneMonopolio(propiedad.color, tableroCompleto)) {
      throw new Error(
        "Necesitas tener todas las propiedades de este color para construir."
      );
    }
    // Validaciones de dinero y número de casas
    if (this.dinero < 100) {
      throw new Error("Necesitas $100 para construir una casa.");
    }
    if (propiedad.casas >= 4) {
      throw new Error("Máximo 4 casas por propiedad.");
    }

    // Construir casa
    this.dinero -= 100;
    propiedad.casas = (propiedad.casas || 0) + 1;

    console.log(
      `Casa construida en ${propiedad.name}. Casas: ${propiedad.casas}`
    );
  }

  // Verificar si tiene monopolio de un color
  tieneMonopolio(color, tableroCompleto) {
    let propiedadesColor = [];

    // recorrer todas las casillas del tablero
    Object.values(tableroCompleto).forEach((lado) => {
      if (Array.isArray(lado)) {
        lado.forEach((casilla) => {
          if (casilla.type === "property" && casilla.color === color) {
            propiedadesColor.push(casilla.id);
          }
        });
      }
    });

    // verificar si el jugador tiene todas esas propiedades
    let tieneTodas = true;
    propiedadesColor.forEach((id) => {
      if (!this.propiedades.some((p) => p.id === id)) {
        tieneTodas = false;
      }
    });

    return tieneTodas;
  }

  // Comprar hotel (requiere 4 casas)
  comprarHotel(propiedad) {
    if (!propiedad.casas || propiedad.casas < 4) {
      throw new Error("Se necesitan 4 casas antes de construir un hotel.");
    }
    if (this.dinero < 250) {
      throw new Error("Necesitas $250 para construir un hotel.");
    }
    if (propiedad.hotel) {
      throw new Error("Ya hay un hotel en esta propiedad.");
    }

    this.dinero -= 250;
    propiedad.casas = 0;
    propiedad.hotel = true;

    console.log(`Hotel construido en ${propiedad.name} por $250`);
  }

  /**
   * Muestra modal para construir casas/hoteles en propiedades del mismo color
   * Solo se muestra si el jugador tiene monopolio del color
   */
  mostrarModalCasaHotel(casillas, tableroCompleto) {
    const casillaActual = casillas[this.posicion];

    // Verificar que la casilla actual es una propiedad
    if (!casillaActual || casillaActual.type !== "property") {
      console.warn("La casilla actual no es una propiedad.");
      return;
    }

    // 1. VERIFICAR MONOPOLIO
    if (!this.tieneMonopolio(casillaActual.color, tableroCompleto)) {
      //alert("Necesitas tener todas las propiedades de este color para construir.");
      return;
    }

    const modalBody = document.getElementById("modalCasaHotelBody");
    const modalHeader = document.getElementById("modalCasaHotelHeader");
    const self = this; // Guardar referencia para usar en los event listeners

    // Pintar el header con el color del grupo
    modalHeader.style.backgroundColor = casillaActual.color;
    modalHeader.style.color = "white";
    modalHeader.style.borderRadius = "5px 5px 0 0";

    // Buscar todas las propiedades del mismo grupo (mismo color)
    const grupoPropiedades = casillas.filter(
      (c) => c.type === "property" && c.color === casillaActual.color
    );

    // Construir tabla con todas las propiedades del grupo
    let html = `
    <h6 class="text-center">Grupo: ${casillaActual.color.toUpperCase()}</h6>
    <h6 class="text-center">Cada casa vale $100</h6>
    <h6 class="text-center">El hotel vale $250</h6>
    <table class="table table-casahotel mt-3">
        <thead>
            <tr>
                <th>Propiedad</th>
                <th>Casas Actuales</th>
                <th>Renta con Mejora</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
    `;

    grupoPropiedades.forEach((propiedad) => {
      const rentaActual = this.calcularRenta(propiedad);
      let rentaFutura, textoBoton, accion;

      if (propiedad.hotel) {
        rentaFutura = "Máximo";
        textoBoton = "Máximo";
        accion = "hotel";
      } else if (propiedad.casas === 4) {
        rentaFutura = propiedad.rent.withHotel || rentaActual * 2;
        textoBoton = "Comprar Hotel";
        accion = "hotel";
      } else {
        const casasFuturas = (propiedad.casas || 0) + 1;
        rentaFutura =
          propiedad.rent.base + propiedad.rent.withHouse[casasFuturas - 1];
        textoBoton = `Comprar Casa (${casasFuturas})`;
        accion = "casa";
      }

      html += `
      <tr>
        <td>${propiedad.name}</td>
        <td>${
          propiedad.hotel ? "HOTEL" : (propiedad.casas || 0) + " casas"
        }</td>
        <td>$${rentaFutura}</td>
        <td>
          <button class="btn btn-success btn-sm btn-construir" 
                  data-prop-id="${propiedad.id}" 
                  data-accion="${accion}"
                  ${accion === "hotel" && propiedad.hotel ? "disabled" : ""}>
            ${textoBoton}
          </button>
        </td>
      </tr>
    `;
    });

    html += `</tbody></table>`;
    modalBody.innerHTML = html;

    // Añadir eventos a los botones de construcción
    modalBody.querySelectorAll(".btn-construir").forEach((btn) => {
      btn.addEventListener("click", function () {
        const propId = this.getAttribute("data-prop-id");
        const accion = this.getAttribute("data-accion");
        const propiedad = grupoPropiedades.find((p) => p.id == propId);

        if (!propiedad) return;

        try {
          if (accion === "hotel") {
            self.comprarHotel(propiedad);
          } else {
            self.comprarCasa(propiedad, tableroCompleto);
          }

          // Actualizar la tabla después de la compra
          self.mostrarModalCasaHotel(casillas, tableroCompleto);
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    });

    // Mostrar el modal
    const modal = new bootstrap.Modal(
      document.getElementById("modalCasaHotel")
    );
    modal.show();
  }

  mostrarJugador(index) {
    const contenedor = document.querySelector(
      `.perfil-jugador[data-index="${index}"]`
    );
    if (!contenedor) return;

    const colorFichaMap = {
      amarillo: "#FFD700",
      azul: "#1E90FF",
      rojo: "#FF4500",
      verde: "#32CD32",
    };

    // Traducir color lógico → color real
    const colorCSS = colorFichaMap[this.color];

    // Icono de perfil con borde del color de la ficha
    const icono = contenedor.querySelector(".iconoPerfil");
    icono.style.border = `4px solid ${colorCSS}`;

    // Bandera (usando flagsapi.com)
    const bandera = contenedor.querySelector(".bandera");
    const paisCodigo = this.pais.split("-")[0].toUpperCase();
    bandera.src = `https://flagsapi.com/${paisCodigo}/shiny/32.png`;

    // Nickname
    const nombreLabel = contenedor.querySelector(".nombre");
    nombreLabel.textContent = this.nickname;

    // Dinero
    const dineroLabel = contenedor.querySelector(".dinero");
    dineroLabel.textContent = `$${this.dinero}`;
  }
}
