document.addEventListener('DOMContentLoaded', function() {
    let tresJugadoresBtn = document.getElementById('tresJugadoresBtn');
    let cuatroJugadoresBtn = document.getElementById('cuatroJugadoresBtn');

    // Se almacena localmente en el navegador una variable con la cantidad de jugadores seleccionada para usarla en otras páginas
    // Se guarda en key/value como string
    tresJugadoresBtn.addEventListener('click', function() {
        localStorage.setItem('cantidadJugadores', 3);
    });

    cuatroJugadoresBtn.addEventListener('click', function() {
        localStorage.setItem('cantidadJugadores', 4);
    });
});