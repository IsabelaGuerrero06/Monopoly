// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Solicita los datos del ranking desde el backend
    const response = await fetch('http://127.0.0.1:5000/ranking');
    const players = await response.json();

    // Selecciona el cuerpo de la tabla
    const tbody = document.querySelector('#rankingTable tbody');

    // Recorre los jugadores y crea una fila para cada uno
    players.forEach((player, index) => {
      const row = document.createElement('tr');

      // Inserta los datos en la fila
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img class="flag" src="https://flagcdn.com/24x18/${player.country_code.toLowerCase()}.png" alt="${player.country_code}"></td>
        <td>${player.nick_name}</td>
        <td>${player.score}</td>
      `;

      // Añade la fila al cuerpo de la tabla
      tbody.appendChild(row);
    });
  } catch (error) {
    // En caso de error, muestra un mensaje en la tabla
    console.error('Error al cargar el ranking:', error);
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = `<tr><td colspan="4">No se pudo cargar el ranking</td></tr>`;
  }
});

// Maneja el botón "Atrás" para volver a la página de inicio
document.getElementById('irinicio').addEventListener('click', () => {
  window.location.href = '../views/inicio.html'; 
});
