document.addEventListener('DOMContentLoaded', function() {
    let dosJugadoresBtn = document.getElementById('dosJugadoresBtn');
    let tresJugadoresBtn = document.getElementById('tresJugadoresBtn');
    let cuatroJugadoresBtn = document.getElementById('cuatroJugadoresBtn');

    // Se almacena localmente en el navegador una variable con la cantidad de jugadores seleccionada para usarla en otras páginas
    // Se guarda en key/value como string
    dosJugadoresBtn.addEventListener('click', function() {
        localStorage.setItem('cantidadJugadores', 2);
    });

    tresJugadoresBtn.addEventListener('click', function() {
        localStorage.setItem('cantidadJugadores', 3);
    });

    cuatroJugadoresBtn.addEventListener('click', function() {
        localStorage.setItem('cantidadJugadores', 4);
    });

    localStorage.removeItem('jugador1');
    localStorage.removeItem('jugador2');
    localStorage.removeItem('jugador3');
    localStorage.removeItem('jugador4');
    localStorage.removeItem('color1');
    localStorage.removeItem('color2');
    localStorage.removeItem('color3');
    localStorage.removeItem('color4');
    localStorage.removeItem('pais1');
    localStorage.removeItem('pais2');
    localStorage.removeItem('pais3');
    localStorage.removeItem('pais4');
});