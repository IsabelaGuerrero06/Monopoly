document.addEventListener('DOMContentLoaded', function() {
    // Se obtiene la cantidad de jugadores guardada antieriormente en el almacenamiento local para usarla en esta página
    let cantidadJugadores = localStorage.getItem('cantidadJugadores');

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
});