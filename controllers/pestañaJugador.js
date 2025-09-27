document.addEventListener("DOMContentLoaded", () => {
  const jugadorData = JSON.parse(localStorage.getItem("jugadorActivo"));
  if (!jugadorData) return;

  document.getElementById("nombreJugador").textContent = jugadorData._nickname;
  document.getElementById("paisJugador").src = `https://flagsapi.com/${(jugadorData._pais).toUpperCase()}/shiny/32.png`;
  document.getElementById("dineroJugador").textContent = `$${jugadorData._dinero}`;

  // Pintar propiedades
  const tablaProps = document.getElementById("propiedadesJugador");
  jugadorData.propiedades.forEach((prop) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${prop.name}</td>
      <td><button class="btn btn-warning btn-sm">Hipotecar</button></td>
    `;
    tablaProps.appendChild(row);
  });

  // Pintar hipotecas
  const tablaHipotecas = document.getElementById("hipotecasJugador");
  jugadorData.propiedades
    .filter(p => p.hipotecada)
    .forEach((prop) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${prop.name}</td>
        <td><button class="btn btn-success btn-sm">Deshipotecar</button></td>
      `;
      tablaHipotecas.appendChild(row);
    });
});

  