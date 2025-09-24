// controllers/tablero.js
const ENDPOINT = 'http://127.0.0.1:5000/board';

/* Mapa de colores del grupo a clases CSS */
const colorMap = {
  brown: 'color-brown',
  purple: 'color-light-blue', // tu JSON usa "purple" para el set celeste
  pink: 'color-pink',
  orange: 'color-orange',
  red: 'color-red',
  yellow: 'color-yellow',
  green: 'color-green',
  blue: 'color-blue'
};

const esquinas = [0, 10, 20, 30];
const lados = ['top','right','bottom','left']; // aquí solo para orden mental

function makeCell(c){
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.id = c.id;
  cell.dataset.name = c.name || '';

  // banda de color si es propiedad
  if (c.type === 'property' && c.color && colorMap[c.color]){
    cell.classList.add(colorMap[c.color]);
  }
  const band = document.createElement('div');
  band.className = 'band';
  cell.appendChild(band);

  // estado
  const status = document.createElement('div');
  status.className = 'status';
  const hasHotel = Number(c.hotel || 0) > 0;
  const houses = Number(c.houses || 0) || 0;
  const ownerColor = c.ownerColor;

  if (hasHotel){
    status.textContent = 'Hotel';
  } else if (houses > 0){
    status.textContent = `${houses} casa${houses===1?'':'s'}`;
  } else if (ownerColor){
    status.textContent = '';
    status.style.background = ownerColor;
    status.style.borderColor = '#111';
  } else {
    status.textContent = 'Disponible';
  }
  cell.appendChild(status);

  // nombre
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = c.name || '';
  cell.appendChild(label);

  // precio (si existe)
  if (typeof c.price === 'number'){
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `$${c.price}`;
    cell.appendChild(price);
  }

  // tipo para estilos futuros
  if (c.type) cell.classList.add(c.type);

  addEventListenerCell(cell, c);
  return cell;
}

function addEventListenerCell (cell, c) {
  cell.addEventListener('click', () => {
    console.log(`Casilla: ${c.name} (id ${c.id}) — tipo: ${c.type}`);
  });
  const esquinas = document.querySelectorAll('.corner');
  esquinas.forEach((esquina) => {
    esquina.addEventListener('click', () => {
         console.log(`Casilla: ${esquina.name} (id ${esquina.id}) — tipo: ${c.type}`);
      console.log(`Casilla: Esquina (id ${id})`);
    });
  });

}

async function renderBoard(){
  try{
    const res = await fetch(ENDPOINT, { headers:{ 'Accept':'application/json' } });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const board = await res.json();

    // contenedores de lados
    const topC = document.getElementById('edge-top');
    const bottomC = document.getElementById('edge-bottom');
    const leftC = document.getElementById('edge-left');
    const rightC = document.getElementById('edge-right');

    // TOP (ids 21..29 en tu JSON)
    (board.top || []).filter(c=>!esquinas.includes(c.id)).forEach(c=>{
      topC.appendChild(makeCell(c));
    });

    // RIGHT (ids 31..39)
    (board.right || []).filter(c=>!esquinas.includes(c.id)).forEach(c=>{
      rightC.appendChild(makeCell(c));
    });

    // BOTTOM (ids 1..9)
    (board.bottom || []).filter(c=>!esquinas.includes(c.id)).forEach(c=>{
      bottomC.appendChild(makeCell(c));
    });

    // LEFT (ids 11..19)
    (board.left || []).filter(c=>!esquinas.includes(c.id)).forEach(c=>{
      leftC.appendChild(makeCell(c));
    });

  }catch(err){
    console.error('Error renderizando tablero:', err);
  }
}

window.addEventListener('DOMContentLoaded', renderBoard);


