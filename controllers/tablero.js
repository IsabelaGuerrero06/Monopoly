// scripts/tablero.js

async function construirCasillas() {
  try {
    const res = await fetch('http://localhost:5000/board');
    const data = await res.json();
    const tablero = document.querySelector('.tablero');

    const lados = ['bottom', 'left', 'top', 'right'];
    const esquinasPorId = [0, 10, 20, 30];

    const colorMap = {
      brown: 'color-brown',
      purple: 'color-pink',
      pink: 'color-pink',
      orange: 'color-yellow',
      red: 'color-red',
      yellow: 'color-yellow',
      green: 'color-green',
      blue: 'color-blue',
      light: 'color-light',
      dark: 'color-dark'
    };

    lados.forEach(lado => {
      const casillas = data[lado].filter(c => !esquinasPorId.includes(c.id));

      casillas.forEach(casilla => {
        const div = document.createElement('div');
        div.classList.add('casilla', `c${casilla.id}-${lado}`);

        if (casilla.color && colorMap[casilla.color]) {
          div.classList.add(colorMap[casilla.color]);
        }

        div.classList.add(casilla.type); // propiedad, servicio, ferrocarril, etc.

        div.innerHTML = `
          <div class="sub-casilla sub-top">
         ${casilla.price ? `<span class="precio-casilla">$${casilla.price}</span>` : ''}
         </div>
         <div class="texto-casilla">${casilla.name}</div>
        `;

        tablero.appendChild(div);
      });
    });
  } catch (error) {
    console.error('Error al cargar el tablero:', error);
  }
}

construirCasillas();
