document.addEventListener('DOMContentLoaded', function() {
    // Se cargan las banderas en los selects de país
    cargarBanderas();
    // Se obtiene la cantidad de jugadores guardada antieriormente en el almacenamiento local para usarla en esta página
    let cantidadJugadores = localStorage.getItem('cantidadJugadores');
    let iniciarBtn = document.getElementById('iniciarBtn');

    iniciarBtn.addEventListener('click', validarFormulario);

    // Se cambia la visibilidad de los divs de los jugadores 3 y 4 según la cantidad de jugadores seleccionada
    if (cantidadJugadores === '3') {
        document.getElementById('tituloJugador3').style.display = 'block';
        document.getElementById('divJugador3').style.display = 'block';
    }
    else if (cantidadJugadores === '4') {
        document.getElementById('tituloJugador3').style.display = 'block';
        document.getElementById('divJugador3').style.display = 'block';
        document.getElementById('tituloJugador4').style.display = 'block';
        document.getElementById('divJugador4').style.display = 'block';
    }

    // Se elimina el valor almacenado localmente de cantidad de jugadores para evitar conflictos si se vuelve a esta página
    localStorage.removeItem('cantidadJugadores');

    // Lógica para evitar que se repitan los colores de las fichas ya seleccionados por los jugadores
    // Se seleccionan todos los selects de color en un NodeList (parecido a un array)
    const selectsColor = document.querySelectorAll('.color-select');

    function actualizarOpciones() {
        // Se obtienen todos los colores seleccionados actualmente
        const coloresSeleccionados = Array.from(selectsColor) // Se convierte el NodeList en un array para usar otras funciones (.map, .filter, etc)
        .map(select => select.value) // Se obtiene el valor actual de cada select, si hay un color seleccionado se obtiene su valor; si no, se obtiene ""
        .filter(value => value !== ""); // Se quitan los valores vacíos ("")

        // Se recorren todos los selects y se obtienen todas sus opciones
        selectsColor.forEach(select => {
        const opciones = select.querySelectorAll('option');

            // Se recorren todas las opciones de cada select
            opciones.forEach(option => {
                // Se ignoran las opciones vacías
                if (option.value === "") { 
                    return;
                }

                // Se vuelven a activar todas las opciones por si un jugador cambia su selección
                option.disabled = false;

                // Se desactivan las opciones que ya fueron seleccionadas en otros selects
                // Se comparan los valores de las opciones con los colores seleccionados, además se comprueba que el select actual no tenga ese valor seleccionado para no desactivar su propia selección
                if (coloresSeleccionados.includes(option.value) && select.value !== option.value) {
                    // Se desactiva la opción
                    option.disabled = true;
                }
            });
        });
    }

    // Se escuchan los cambios en todos los selects y se actualizar las opciones
    selectsColor.forEach(select => {
        // Se añade un listener para el evento 'change' (cuando se cambia una selección) y se llama a la función actualizarOpciones
        select.addEventListener('change', actualizarOpciones);
    });

    function validarFormulario() {
        let jugador1 = document.getElementById('jugador1').value.trim();
        let color1 = document.getElementById('color1').value;
        let pais1 = document.getElementById('pais1').value;
        let jugador2 = document.getElementById('jugador2').value.trim();
        let color2 = document.getElementById('color2').value;
        let pais2 = document.getElementById('pais2').value;

        if (cantidadJugadores === '3') {
            let jugador3 = document.getElementById('jugador3').value.trim();
            let color3 = document.getElementById('color3').value;
            let pais3 = document.getElementById('pais3').value;

            if (jugador3 === '' || color3 === '' || pais3 === '') {
                alert('Por favor, complete todos los campos obligatorios para los jugadores.');
                return;
            }

            if (jugador1 === jugador3 || jugador2 === jugador3) {
                alert('Los nombres de los jugadores no pueden ser iguales. Por favor, elija nombres diferentes.');
                return;
            }

            if (jugador3.length < 5 || jugador3.length > 15) {
                alert('El nombre de los jugadores debe tener entre 5 y 15 caracteres.');
                return;
            }
        }
        else if (cantidadJugadores === '4') {
            let jugador3 = document.getElementById('jugador3').value.trim();
            let color3 = document.getElementById('color3').value;
            let pais3 = document.getElementById('pais3').value;
            let jugador4 = document.getElementById('jugador4').value.trim();
            let color4 = document.getElementById('color4').value;
            let pais4 = document.getElementById('pais4').value;

            if (jugador3 === '' || color3 === '' || pais3 === '' || jugador4 === '' || color4 === '' || pais4 === '') {
                alert('Por favor, complete todos los campos obligatorios para los jugadores.');
                return;
            }

            if (jugador1 === jugador3 || jugador1 === jugador4 || jugador2 === jugador3 || jugador2 === jugador4 || jugador3 === jugador4) {
                alert('Los nombres de los jugadores no pueden ser iguales. Por favor, elija nombres diferentes.');
                return;
            }

            if (jugador3.length < 5 || jugador3.length > 15 || jugador4.length < 5 || jugador4.length > 15) {
                alert('El nombre de los jugadores debe tener entre 5 y 15 caracteres.');
                return;
            }
        }

        if (jugador1 === '' || color1 === '' || pais1 === '' || jugador2 === '' || color2 === '' || pais2 === '') {
            alert('Por favor, complete todos los campos obligatorios para los jugadores.');
            return;
        }

        if (jugador1 === jugador2) {
            alert('Los nombres de los jugadores no pueden ser iguales. Por favor, elija nombres diferentes.');
            return;
        }

        if (jugador1.length < 5 || jugador1.length > 15 || jugador2.length < 5 || jugador2.length > 15) {
            alert('El nombre de los jugadores debe tener entre 5 y 15 caracteres.');
            return;
        }

        document.getElementById('iniciarBtnLink').href = 'tablero.html';
        // Si pasa todas las validaciones, se guardan los datos en el almacenamiento local y se redirige a la página del tablero
        localStorage.setItem("jugador1", document.getElementById("jugador1").value);
        localStorage.setItem("jugador2", document.getElementById("jugador2").value);
        localStorage.setItem("jugador3", document.getElementById("jugador3").value);
        localStorage.setItem("jugador4", document.getElementById("jugador4").value);
        localStorage.setItem("color1", document.getElementById("color1").value);
        localStorage.setItem("color2", document.getElementById("color2").value);
        localStorage.setItem("color3", document.getElementById("color3").value);
        localStorage.setItem("color4", document.getElementById("color4").value);
        localStorage.setItem("pais1", document.getElementById("pais1").value);
        localStorage.setItem("pais2", document.getElementById("pais2").value);
        localStorage.setItem("pais3", document.getElementById("pais3").value);
        localStorage.setItem("pais4", document.getElementById("pais4").value);
    }

    // Función para cargar las banderas en los selects de país usando la API REST local
    async function cargarBanderas() { // El async permite usar await dentro de la función para trabajar con promesas de forma secuencial y legible
        try {
            const resp = await fetch('http://127.0.0.1:5000/countries'); // Hace una petición HTTP GET a la API local que devuelve la lista de países
            const data = await resp.json(); // data = [ { "co": "Colombia" }, { "br": "Brasil" }, ... ]

            const selectsPais = document.querySelectorAll('.pais-select'); // Selecciona todos los selects de país en un NodeList
            if (!selectsPais.length) return; // Si no hay selects no hace nada

            // Para cada select de país: vaciar y llenar opciones
            selectsPais.forEach(select => {
                // Mantener la opción placeholder
                select.innerHTML = '<option value="" disabled selected>Seleccione un país</option>';

                data.forEach(paisObj => {
                    // Para cada paisObj ({ "co": "Colombia" }) se extrae código y nombre
                    const [codigoRaw, nombre] = Object.entries(paisObj)[0]; // Object.entries(paisObj)[0] devuelve un array [key, value], por eso se desestructura en [codigoRaw, nombre]
                    const codigoUpper = String(codigoRaw).toUpperCase(); // Se pone en mayúsculas para la URL de flagsapi

                    const option = document.createElement('option'); // Se crea un elemento <option> para cada país
                    option.value = codigoRaw; // Valor a guardar (código en minúscula y con guiones si aplica)
                    option.textContent = nombre; // Texto visible en el dropdown
                    // Se guarda la URL de la bandera en un data-attribute para que Select2 lo lea luego
                    option.dataset.flag = `https://flagsapi.com/${codigoUpper}/shiny/64.png`;

                    select.appendChild(option); // Se añade cada opción al select actual
                });

                // Inicializar Select2 para cada uno de los select con templates para mostrar la bandera
                $(select).select2({ // Transforma el select en un componente Select2
                    placeholder: 'Seleccione un país',
                    allowClear: true,
                    templateResult: formatFlag, // Cómo se ven las opciones en el dropdown
                    templateSelection: formatFlag, // Cómo se ve la selección actual
                    escapeMarkup: function(m) { return m; } // Permitir markup/jQuery element
                });
            });

        } catch (e) {
            console.error('Error cargando países:', e);
        }
    }

    // Función que Select2 usa para renderizar opción + selección con bandera
    function formatFlag(state) { // El state es el objeto de la opción actual, state.id = option.value, etc.
        // state.id === undefined (o '' para la opción placeholder) devuelve option.textContent
        if (!state.id) {
            return state.text || '';
        }

        // Se obtiene la URL de la bandera desde option (state.element = option original para leer data-attributes)
        const flagUrl = $(state.element).data('flag') || '';
        // Código corto (para "us-ca" se toma "US" como fallback)
        const fallbackCode = String(state.id).split('-')[0].toUpperCase();

        // Se crea el <img> y se le pone un manejo de error para fallback en 404
        const $img = $(`<img class="img-flag" alt="" />`);
        $img.attr('src', flagUrl); // Se asigna la URL de la bandera

        // Manejo de error si la imagen no carga (404 u otro error)
        $img.on('error', function () {
            // Primer fallback: intentar solo con el código base (por si viene "us-ca", probamos "US")
            const fallbackUrl = `https://flagsapi.com/${fallbackCode}/shiny/64.png`;
            if (this.src !== fallbackUrl) {
            this.src = fallbackUrl; // Se intenta con el código base
            return;
            }
            // Segundo fallback: imagen simple inline (gris) si no existe la bandera y para que no quede el ícono roto
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14"><rect width="100%" height="100%" fill="%23cccccc"/></svg>';
        });

        // Contenedor con imagen + texto
        const $container = $('<span></span>');
        $container.append($img).append(document.createTextNode(' ' + state.text));

        return $container; // Se devuelve el contenedor jQuery con la imagen y el texto para que Select2 lo inserte en los templates
    }
});