// import Jugador from '../models/Jugador.js';
// const j1 = new Jugador(localStorage.getItem('jugador1'), localStorage.getItem('pais1'), localStorage.getItem('color1'));
// console.log(j1); // Verifica que el objeto se haya creado correctamente
document.getElementById('nombreJugador').textContent = localStorage.getItem('jugador1');
document.getElementById('dineroJugador').textContent = "$1500";
const codigoPais = localStorage.getItem('pais1').split('-')[0].toUpperCase();
document.getElementById('paisJugador').src = "https://flagsapi.com/"+codigoPais+"/shiny/64.png"
