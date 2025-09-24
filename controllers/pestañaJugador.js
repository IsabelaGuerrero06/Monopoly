document.getElementById('nombreJugador').textContent = localStorage.getItem('jugador1');
const codigoPais = localStorage.getItem('pais1').split('-')[0].toUpperCase();
document.getElementById('banderaPais').src = "https://flagsapi.com/"+codigoPais+"/shiny/64.png"