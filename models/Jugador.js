export default class Jugador {
  constructor(nickname, pais, color) {
    this.nickname = nickname;
    this.pais = pais;
    this.color = color;
    this.dinero = 1500;
    this.propiedades = [];
    this.hipotecas = [];
    this.posicion = 0;
    this.enCarcel = false;
    this.turnosEnCarcel = 0;
  }

  // Getters y Setters
  get nickname() { return this._nickname; }
  set nickname(valor) {
    const regex = /^[a-zA-Z0-9]{5,15}$/;
    if (!regex.test(valor)) {
      throw new Error("El nickname debe tener entre 5 y 15 caracteres alfanuméricos.");
    }
    this._nickname = valor;
  }

  get pais() { return this._pais; }
  set pais(valor) {
    if (typeof valor !== "string" || valor.length < 2) {
      throw new Error("El país debe ser un texto de al menos 2 caracteres.");
    }
    this._pais = valor;
  }

  get color() { return this._color; }
  set color(valor) {
    const coloresValidos = ["amarillo", "azul", "rojo", "verde"];
    if (!coloresValidos.includes(valor)) {
      throw new Error("Color no válido para el jugador.");
    }
    this._color = valor;
  }

  get dinero() { return this._dinero; }
  set dinero(valor) {
    if (valor < 0) {
      throw new Error("El dinero no puede ser negativo.");
    }
    this._dinero = valor;
  }

  // MÉTODOS BÁSICOS
  mover(casillas) {
    this.posicion = ((this.posicion - 1 + casillas) % 40) + 1;
  }

  comprarPropiedad(propiedad, precio) {
    if (this.dinero >= precio) {
      this.dinero -= precio;
      this.propiedades.push(propiedad);
    } else {
      throw new Error("No tienes suficiente dinero para comprar esta propiedad.");
    }
  }

  pagarRenta(dueño, renta) {
    if (this.dinero >= renta) {
      this.dinero -= renta;
      dueño.dinero += renta;
      console.log(`${this.nickname} pagó ${renta} a ${dueño.nickname}`);
    } else {
      console.log(`${this.nickname} no tiene suficiente dinero para pagar la renta.`);
    }
  }

  pagarImpuestos(monto) {
    if (this.dinero >= monto) {
      this.dinero -= monto;
      console.log(`${this.nickname} pagó ${monto} en impuestos.`);
    } else {
      console.log(`${this.nickname} no tiene suficiente dinero para pagar impuestos.`);
    }
  }

  // MÉTODOS DE HIPOTECA
  hipotecarPropiedad(propiedadId) {
    const index = this.propiedades.findIndex(p => p.id === propiedadId);
    if (index === -1) {
      console.warn(`${this.nickname} no tiene la propiedad con id ${propiedadId}`);
      return false;
    }

    const propiedad = this.propiedades[index];
    const mortgageValue = propiedad.mortgage || Math.floor((propiedad.price || 0) / 2);

    this.dinero += mortgageValue;
    this.hipotecas.push(propiedad);
    this.propiedades.splice(index, 1);

    console.log(`${this.nickname} hipotecó ${propiedad.name} y recibió $${mortgageValue}`);
    window.actualizarJugadores?.();
    return true;
  }

  deshipotecarPropiedad(propiedadId) {
    const index = this.hipotecas.findIndex(p => p.id === propiedadId);
    if (index === -1) {
      console.warn(`${this.nickname} no tiene la hipoteca con id ${propiedadId}`);
      return false;
    }

    const propiedad = this.hipotecas[index];
    const mortgageValue = propiedad.mortgage || Math.floor((propiedad.price || 0) / 2);
    const costoDeshipotecar = Math.ceil(mortgageValue * 1.1);

    if (this.dinero < costoDeshipotecar) {
      alert("No tienes suficiente dinero para deshipotecar esta propiedad.");
      return false;
    }

    this.dinero -= costoDeshipotecar;
    this.propiedades.push(propiedad);
    this.hipotecas.splice(index, 1);

    console.log(`${this.nickname} deshipotecó ${propiedad.name} pagando $${costoDeshipotecar}`);
    window.actualizarJugadores?.();
    return true;
  }

 calcularPatrimonio() {
  let patrimonio = this.dinero;

  this.propiedades.forEach((prop) => {
    let valorProp = prop.price || 0;
    
    if (prop.hotel) {
      valorProp += 600; // Hotel ($200) + 4 casas que se necesitaron ($400)
    } else if (prop.casas) {
      valorProp += prop.casas * 100; // Solo casas si no hay hotel
    }
    
    patrimonio += valorProp;
  });

  // El resto permanece igual
  this.hipotecas.forEach((prop) => {
    const precioBase = prop.price || 0;
    const mitadPrecio = Math.floor(precioBase / 2);
    const interes = Math.floor(mitadPrecio * 0.10);
    const deudaTotal = mitadPrecio + interes;
    
    patrimonio -= deudaTotal;
  });

  return patrimonio;
}
  // MÉTODOS DE CONSTRUCCIÓN VISUAL
  actualizarConstruccionesEnCasilla(propiedad) {
    const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
    if (!casilla) {
      console.warn(`No se encontró la casilla con ID ${propiedad.id}`);
      return;
    }

    this.limpiarConstruccionesEnCasilla(casilla);

    const casasActuales = propiedad.casas || 0;
    const tieneHotel = propiedad.hotel || false;

    if (tieneHotel) {
      this.mostrarHotelEnCasilla(casilla, propiedad);
    } else if (casasActuales > 0) {
      this.mostrarCasasEnCasilla(casilla, propiedad, casasActuales);
    }
  }

  limpiarConstruccionesEnCasilla(casilla) {
    const indicadoresAnteriores = casilla.querySelectorAll(
      '.construccion-casas, .construccion-hotel, .overlay-construccion'
    );
    indicadoresAnteriores.forEach(indicador => indicador.remove());
  }

  mostrarCasasEnCasilla(casilla, propiedad, numeroCasas) {
    const contenedorConstruccion = document.createElement("div");
    contenedorConstruccion.className = "construccion-casas";
    contenedorConstruccion.style.cssText = `
      position: absolute;
      bottom: 2px;
      left: 2px;
      background-color: rgba(76, 175, 80, 0.95);
      color: white;
      border-radius: 8px;
      padding: 1px 4px;
      font-size: 12px;
      font-weight: bold;
      min-width: 18px;
      text-align: center;
      z-index: 15;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      border: 1px solid #4CAF50;
      font-family: Arial, sans-serif;
    `;

    // MOSTRAR SOLO EL NÚMERO DE CASAS
    contenedorConstruccion.textContent = numeroCasas;
    contenedorConstruccion.title = `${numeroCasas} casa${numeroCasas > 1 ? 's' : ''} en ${propiedad.name}`;

    casilla.style.position = "relative";
    casilla.appendChild(contenedorConstruccion);
  }

  mostrarHotelEnCasilla(casilla, propiedad) {
    const contenedorHotel = document.createElement("div");
    contenedorHotel.className = "construccion-hotel";
    contenedorHotel.style.cssText = `
      position: absolute;
      bottom: 2px;
      left: 2px;
      background-color: rgba(255, 152, 0, 0.95);
      color: white;
      border-radius: 8px;
      padding: 1px 4px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      z-index: 15;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
      border: 1px solid #FF9800;
      min-width: 20px;
      font-family: Arial, sans-serif;
    `;

    contenedorHotel.textContent = "H";
    contenedorHotel.title = `Hotel en ${propiedad.name}`;

    casilla.style.position = "relative";
    casilla.appendChild(contenedorHotel);
  }

  // VERIFICAR MONOPOLIO
  tieneMonopolio(color, tableroCompleto) {
    let propiedadesColor = [];

    Object.values(tableroCompleto).forEach((lado) => {
      if (Array.isArray(lado)) {
        lado.forEach((casilla) => {
          if (casilla.type === "property" && casilla.color === color) {
            propiedadesColor.push(casilla.id);
          }
        });
      }
    });

    let tieneTodas = true;
    propiedadesColor.forEach((id) => {
      if (!this.propiedades.some((p) => p.id === id)) {
        tieneTodas = false;
      }
    });

    return tieneTodas;
  }

  // MÉTODOS DE CONSTRUCCIÓN
  comprarCasa(propiedad, tableroCompleto) {
    if (!this.tieneMonopolio(propiedad.color, tableroCompleto)) {
      throw new Error("Necesitas tener todas las propiedades de este color para construir.");
    }
    
    if (this.dinero < 100) {
      throw new Error("Necesitas $100 para construir una casa.");
    }
    
    if (propiedad.casas >= 4) {
      throw new Error("Máximo 4 casas por propiedad.");
    }

    this.dinero -= 100;
    propiedad.casas = (propiedad.casas || 0) + 1;
    this.actualizarConstruccionesEnCasilla(propiedad);

    console.log(`Casa construida en ${propiedad.name}. Casas: ${propiedad.casas}`);
  }

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
    this.actualizarConstruccionesEnCasilla(propiedad);

    console.log(`Hotel construido en ${propiedad.name} por $250`);
  }

  // CÁLCULO DE RENTA
  calcularRenta(propiedad) {
    if (propiedad.hotel) {
      return propiedad.rent?.withHotel || propiedad.rent?.base * 5 || 0;
    } else if (propiedad.casas && propiedad.casas > 0) {
      const rentWithHouse = propiedad.rent?.withHouse;
      if (Array.isArray(rentWithHouse) && propiedad.casas <= rentWithHouse.length) {
        return rentWithHouse[propiedad.casas - 1];
      }
    }
    return propiedad.rent?.base || 0;
  }

  // MODAL DE CONSTRUCCIÓN (VERSIÓN ÚNICA Y CORREGIDA)
  verificarYMostrarModalConstruccion(propiedadId) {
    const propiedadActual = this.propiedades.find(p => String(p.id) === String(propiedadId));
    
    if (!propiedadActual || propiedadActual.type !== "property") {
      console.log("La propiedad no es válida para construcción");
      return;
    }

    if (!window.datosTablero) {
      console.warn("No hay datos del tablero disponibles");
      return;
    }

    if (!this.tieneMonopolio(propiedadActual.color, window.datosTablero)) {
      console.log(`No tienes monopolio del color ${propiedadActual.color}`);
      return;
    }

    this.mostrarModalConstruccion(propiedadActual);
  }

  mostrarModalConstruccion(propiedadActual) {
    const modalElement = document.getElementById("modalCasaHotel");
    const modalBody = document.getElementById("modalCasaHotelBody");
    const modalHeader = document.getElementById("modalCasaHotelHeader");

    if (!modalElement || !modalBody || !modalHeader) {
      console.error("Elementos del modal Casa/Hotel no encontrados");
      return;
    }

    // CERRAR CUALQUIER MODAL EXISTENTE ANTES DE ABRIR UNO NUEVO
    const modalExistente = bootstrap.Modal.getInstance(modalElement);
    if (modalExistente) {
      modalExistente.hide();
    }

    // Limpiar event listeners previos
    modalBody.innerHTML = '';

    modalHeader.style.backgroundColor = propiedadActual.color || "#f8f9fa";
    modalHeader.style.color = "white";
    modalHeader.textContent = `Construcción - Grupo ${propiedadActual.color?.toUpperCase() || "N/A"}`;

    const propiedadesDelGrupo = this.propiedades.filter(
      p => p.color === propiedadActual.color && p.type === "property"
    );

    let html = `
      <div class="text-center mb-3">
        <p class="mb-1"><strong>Reglas de construcción:</strong></p>
        <p class="mb-1">• Cada casa cuesta: <strong>$100</strong></p>
        <p class="mb-1">• Máximo <strong>4 casas</strong> por propiedad</p>
        <p class="mb-1">• Hotel cuesta: <strong>$250</strong> (reemplaza las 4 casas)</p>
        <p class="mb-3 text-info">Tu dinero actual: <strong>$${this.dinero}</strong></p>
      </div>
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th>Propiedad</th>
            <th>Construcciones</th>
            <th>Renta Actual</th>
            <th>Próxima Renta</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;

    propiedadesDelGrupo.forEach((propiedad) => {
      const rentaActual = this.calcularRenta(propiedad);
      const casasActuales = propiedad.casas || 0;
      const tieneHotel = propiedad.hotel || false;
      
      let proximaRenta, textoBoton, accionDisponible, costoAccion, tipoAccion;
      
      if (tieneHotel) {
        proximaRenta = "Máximo";
        textoBoton = "Máximo alcanzado";
        accionDisponible = false;
        costoAccion = 0;
        tipoAccion = "ninguna";
      } else if (casasActuales === 4) {
        proximaRenta = propiedad.rent?.withHotel || rentaActual * 2;
        textoBoton = "Construir Hotel";
        accionDisponible = this.dinero >= 250;
        costoAccion = 250;
        tipoAccion = "hotel";
      } else if (casasActuales < 4) {
        const siguienteCasas = casasActuales + 1;
        if (propiedad.rent?.withHouse && siguienteCasas <= propiedad.rent.withHouse.length) {
          proximaRenta = propiedad.rent.withHouse[siguienteCasas - 1];
        } else {
          proximaRenta = rentaActual * 1.5;
        }
        textoBoton = `Construir Casa ${siguienteCasas}`;
        accionDisponible = this.dinero >= 100;
        costoAccion = 100;
        tipoAccion = "casa";
      }

      let construccionesTexto;
      if (tieneHotel) {
        construccionesTexto = `<span class="badge bg-warning text-dark">🏨 HOTEL</span>`;
      } else if (casasActuales > 0) {
        construccionesTexto = `<span class="badge bg-info">${casasActuales} 🏠 casa${casasActuales > 1 ? 's' : ''}</span>`;
      } else {
        construccionesTexto = `<span class="badge bg-secondary">Sin construcciones</span>`;
      }

      let botonHtml;
      if (accionDisponible) {
        let colorBoton = tipoAccion === "hotel" ? "btn-warning" : "btn-success";
        botonHtml = `<button class="btn ${colorBoton} btn-sm btn-construir" 
                           data-prop-id="${propiedad.id}" 
                           data-accion="${tipoAccion}"
                           data-costo="${costoAccion}">
                       ${textoBoton} ($${costoAccion})
                     </button>`;
      } else if (tipoAccion === "ninguna") {
        botonHtml = `<span class="badge bg-success">Completado</span>`;
      } else {
        botonHtml = `<button class="btn btn-outline-secondary btn-sm" disabled>
                       ${textoBoton} ($${costoAccion}) - Sin dinero
                     </button>`;
      }

      html += `
        <tr>
          <td><strong>${propiedad.name}</strong></td>
          <td>${construccionesTexto}</td>
          <td class="text-success"><strong>$${rentaActual}</strong></td>
          <td class="text-primary"><strong>$${proximaRenta}</strong></td>
          <td>${botonHtml}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    
    html += `
      <div class="mt-3 p-2 bg-light rounded">
        <small class="text-muted">
          <strong>💡 Consejos:</strong><br>
          • Construye de forma equilibrada en todas las propiedades del grupo<br>
          • El hotel genera la máxima renta posible<br>
          • Las construcciones aumentan significativamente tus ingresos
        </small>
      </div>
    `;

    modalBody.innerHTML = html;

    // Event listeners
    const self = this;
    modalBody.querySelectorAll(".btn-construir").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const propId = this.getAttribute("data-prop-id");
        const accion = this.getAttribute("data-accion");
        
        const propiedad = self.propiedades.find(p => String(p.id) === String(propId));
        if (!propiedad) {
          alert("Error: Propiedad no encontrada");
          return;
        }

        try {
          if (accion === "hotel") {
            self.comprarHotel(propiedad);
          } else if (accion === "casa") {
            self.comprarCasa(propiedad, window.datosTablero);
          }

          if (typeof window.actualizarJugadores === "function") {
            window.actualizarJugadores();
          }
          
          // Cerrar modal actual y reabrir con datos actualizados
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          
          setTimeout(() => {
            self.mostrarModalConstruccion(propiedadActual);
          }, 300);
          
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    });

    // CREAR NUEVA INSTANCIA DEL MODAL CADA VEZ
    const modal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });
    modal.show();
  }

  // RESTAURAR CONSTRUCCIONES VISUALES
  restaurarConstruccionesVisuales() {
    this.propiedades.forEach(propiedad => {
      if (propiedad.type === "property" && (propiedad.casas > 0 || propiedad.hotel)) {
        this.actualizarConstruccionesEnCasilla(propiedad);
      }
    });
  }

  // MÉTODOS DE VISUALIZACIÓN DE PERFIL
  mostrarJugador(index) {
    const contenedor = document.querySelector(`.perfil-jugador[data-index="${index}"]`);
    if (!contenedor) return;

    const colorFichaMap = {
      amarillo: "#FFD700",
      azul: "#1E90FF",
      rojo: "#FF4500",
      verde: "#32CD32",
    };

    const colorCSS = colorFichaMap[this.color];

    const icono = contenedor.querySelector(".iconoPerfil");
    if (icono) icono.style.border = `4px solid ${colorCSS}`;

    const bandera = contenedor.querySelector(".bandera");
    if (bandera) {
      const paisCodigo = this.pais.trim().split("-")[0].toUpperCase();
      bandera.src = `https://flagsapi.com/${paisCodigo}/shiny/32.png`;
    }

    const nombreLabel = contenedor.querySelector(".nombre");
    if (nombreLabel) nombreLabel.textContent = this.nickname;

    const dineroLabel = contenedor.querySelector(".dinero");
    if (dineroLabel) dineroLabel.textContent = `$${this.dinero}`;
  }

  // MÉTODOS DE ACTUALIZACIÓN DE CASILLAS
  actualizarCasillaPropiedad(propiedad) {
    const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
    if (!casilla) {
      console.warn(`No se encontró la casilla con ID ${propiedad.id}`);
      return;
    }

    const colorFichaMap = {
      amarillo: "#FFD700",
      azul: "#1E90FF",
      rojo: "#FF4500",
      verde: "#32CD32",
    };

    const colorJugador = colorFichaMap[this.color] || "#999999";

    const statusAnterior = casilla.querySelector(".status-owner");
    if (statusAnterior) {
      statusAnterior.remove();
    }

    const statusOwner = document.createElement("div");
    statusOwner.className = "status-owner";
    statusOwner.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${colorJugador};
      border: 2px solid #fff;
      box-shadow: 0 0 3px rgba(0,0,0,0.5);
      z-index: 10;
    `;

    statusOwner.title = `Propiedad de ${this.nickname}`;

    casilla.style.position = "relative";
    casilla.appendChild(statusOwner);

    console.log(`Casilla ${propiedad.name} marcada como propiedad de ${this.nickname}`);
  }

  liberarCasillaPropiedad(propiedad) {
    const casilla = document.querySelector(`[data-id="${propiedad.id}"]`);
    if (!casilla) return;

    const statusOwner = casilla.querySelector(".status-owner");
    if (statusOwner) {
      statusOwner.remove();
      console.log(`Indicador de propiedad removido de ${propiedad.name}`);
    }
  }

  comprarPropiedadConIndicador(propiedad, precio) {
    if (this.dinero >= precio) {
      this.dinero -= precio;
      this.propiedades.push(propiedad);
      this.actualizarCasillaPropiedad(propiedad);
      console.log(`${this.nickname} compró ${propiedad.name} por $${precio}`);
    } else {
      throw new Error("No tienes suficiente dinero para comprar esta propiedad.");
    }
  }
}