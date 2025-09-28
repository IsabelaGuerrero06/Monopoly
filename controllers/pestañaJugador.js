document.addEventListener("DOMContentLoaded", () => {
  const jugadorData = JSON.parse(localStorage.getItem("jugadorActivo"));
  if (!jugadorData) return;

  document.getElementById("nombreJugador").textContent = jugadorData._nickname || jugadorData.nickname || jugadorData.nombre;
  const pais = (jugadorData._pais || jugadorData.pais || "").split('-')[0] || '';
  if (pais) {
    document.getElementById("paisJugador").src = `https://flagsapi.com/${pais.toUpperCase()}/shiny/32.png`;
  }
  document.getElementById("dineroJugador").textContent = `$${jugadorData._dinero ?? jugadorData.dinero ?? 0}`;

  // Pintar propiedades
  const tablaProps = document.getElementById("propiedadesJugador");
  tablaProps.innerHTML = ""; // limpiar

  (jugadorData.propiedades || []).forEach((prop) => {
    const row = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = prop.name;

    const tdBtn = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn btn-warning btn-sm";
    btn.textContent = "Hipotecar";

    // Listener que llama a la función expuesta en la ventana principal
    btn.addEventListener("click", () => {
      if (window.parent && typeof window.parent.hipotecarProp === "function") {
        window.parent.hipotecarProp(prop.id);

        // Pequeño delay y recargar datos del iframe para reflejar cambios
        setTimeout(() => {
          const nuevo = JSON.parse(localStorage.getItem("jugadorActivo"));
          if (nuevo) {
            // actualizar dinero visual
            document.getElementById("dineroJugador").textContent = `$${nuevo._dinero ?? nuevo.dinero ?? 0}`;
            // recargar la pestaña para simplificar la UI (o re-render mínimos)
            window.location.reload();
          }
        }, 80);
      } else {
        alert("No se pudo hipotecar: la función en la ventana principal no está disponible.");
      }
    });

    tdBtn.appendChild(btn);
    row.appendChild(tdName);
    row.appendChild(tdBtn);
    tablaProps.appendChild(row);
  });

  // Pintar hipotecas
  const tablaHipotecas = document.getElementById("hipotecasJugador");
  tablaHipotecas.innerHTML = "";
  (jugadorData.hipotecas || []).forEach((prop) => {
    const row = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = prop.name;

    const tdBtn = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn btn-success btn-sm";
    btn.textContent = "Deshipotecar";

    btn.addEventListener("click", () => {
      if (window.parent && typeof window.parent.deshipotecarProp === "function") {
        window.parent.deshipotecarProp(prop.id);

        // Refrescar después de deshipotecar
        setTimeout(() => {
          const nuevo = JSON.parse(localStorage.getItem("jugadorActivo"));
          if (nuevo) {
            document.getElementById("dineroJugador").textContent = `$${nuevo._dinero ?? nuevo.dinero ?? 0}`;
            window.location.reload();
          }
        }, 80);
      } else {
        alert("No se pudo deshipotecar: la función en la ventana principal no está disponible.");
      }
    });

    tdBtn.appendChild(btn);
    row.appendChild(tdName);
    row.appendChild(tdBtn);
    tablaHipotecas.appendChild(row);
  });
});
