const container = document.querySelector('.container');
const interactiveContainer = document.querySelector('.container');

const modal = document.getElementById('infoModal');
const closeBtn = document.querySelector('.close-btn');
const modalFlag = document.getElementById('modalFlag');
const modalTitle = document.getElementById('modalTitle');
const modalMenu = document.getElementById('modalMenu');
const modalInfo = document.getElementById('modalInfo');

// =======================================================
// ZOOM Y NAVEGACIÓN
// =======================================================
let isPanning = false;
let startX = 0, startY = 0;
let panX = 0, panY = 0;
let zoomLevel = 1;

let initialPinchDistance = 0;
let initialZoom = 1;
let touchStartPanX = 0;
let touchStartPanY = 0;

let isZoomAnimating = false;
let animationFrame = null;

let initialRect = null;

// Función para centrar y ajustar zoom a pantalla completa
function fitToScreen() {
  const containerRect = document.querySelector('.interactive-container').getBoundingClientRect();
  const mapWidth = 3916.9;
  const mapHeight = 2326.6;
  
  const scaleX = containerRect.width / mapWidth;
  const scaleY = containerRect.height / mapHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9; // 90% para dejar un poco de margen
  
  zoomLevel = scale;
  panX = (containerRect.width - mapWidth * scale) / 2;
  panY = (containerRect.height - mapHeight * scale) / 2;
  
  applyTransform();
}

document.addEventListener('DOMContentLoaded', () => {
  initialRect = container.getBoundingClientRect();
  
  // Pequeño delay para asegurar que todo esté cargado
  setTimeout(() => {
    fitToScreen();
  }, 100);
});

// Redimensionar ventana
window.addEventListener('resize', () => {
  initialRect = container.getBoundingClientRect();
});

function applyTransform() {
  container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  updateTextVisibility();
}

function animateZoom(startZoom, startPanX, startPanY, endZoom, endPanX, endPanY, duration) {
  const startTime = performance.now();

  function step(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const easeProgress = Math.sin((progress * Math.PI) / 2); // easeOutSine

    zoomLevel = startZoom + (endZoom - startZoom) * easeProgress;
    panX = startPanX + (endPanX - startPanX) * easeProgress;
    panY = startPanY + (endPanY - startPanY) * easeProgress;

    applyTransform();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}


container.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    if (isZoomAnimating && animationFrame) {
      cancelAnimationFrame(animationFrame);
      isZoomAnimating = false;
      animationFrame = null;
    }
    isPanning = true;
    container.style.cursor = 'grabbing';
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    e.preventDefault();
  }
});

window.addEventListener('mouseup', () => { 
  isPanning = false; 
  container.style.cursor = 'grab'; 
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning || isZoomAnimating) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
});

container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomSpeed = 0.3; // zoom más fino

  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;

  // Calculamos destino sin aplicarlo todavía
  let targetZoom = e.deltaY < 0 ? zoomLevel + zoomSpeed : zoomLevel - zoomSpeed;
  targetZoom = Math.max(0.2, Math.min(targetZoom, 12));

  const cursorX = e.clientX;
  const cursorY = e.clientY;

  const mapX = (cursorX - panX) / oldZoomLevel;
  const mapY = (cursorY - panY) / oldZoomLevel;

  const targetPanX = cursorX - mapX * targetZoom;
  const targetPanY = cursorY - mapY * targetZoom;

  // Animación interpolando desde valores actuales hasta los nuevos
  animateZoom(oldZoomLevel, oldPanX, oldPanY, targetZoom, targetPanX, targetPanY, 350);
}, { passive: false });


function updateTextVisibility() {
  const zoomThreshold = 0.8;
  const interactiveAreas = document.querySelectorAll('.interactive-area');
  interactiveAreas.forEach(area => {
    if (zoomLevel > zoomThreshold) {
      area.classList.add('zoomed-in');
    } else {
      area.classList.remove('zoomed-in');
    }
  });
}

// =======================================================
// EVENTOS TÁCTILES (MÓVIL)
// =======================================================
container.addEventListener('touchstart', (e) => {
    // Si hay una animación de zoom en curso, la cancelamos
    if (isZoomAnimating && animationFrame) {
        cancelAnimationFrame(animationFrame);
        isZoomAnimating = false;
        animationFrame = null;
    }
    
    if (e.touches.length === 1) {
        // Un dedo: Paneo
        isPanning = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
        touchStartPanX = panX;
        touchStartPanY = panY;
    } else if (e.touches.length === 2) {
        // Dos dedos: Zoom con pellizco
        initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
        initialZoom = zoomLevel;
        touchStartPanX = panX;
        touchStartPanY = panY;
    }
}, { passive: false });

container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isPanning) {
        // Un dedo: Paneo
        e.preventDefault();
        panX = e.touches[0].clientX - startX;
        panY = e.touches[0].clientY - startY;
        applyTransform();
    } else if (e.touches.length === 2) {
        // Dos dedos: Zoom con pellizco
        e.preventDefault();
        const currentPinchDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentPinchDistance / initialPinchDistance;
        const newZoom = initialZoom * scale;

        // Aseguramos que el zoom esté dentro de los límites
        const targetZoom = Math.max(0.2, Math.min(newZoom, 12));

        // Puntos de referencia para el zoom
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const mapX = (midX - touchStartPanX) / initialZoom;
        const mapY = (midY - touchStartPanY) / initialZoom;

        panX = midX - mapX * targetZoom;
        panY = midY - mapY * targetZoom;
        zoomLevel = targetZoom;

        applyTransform();
    }
}, { passive: false });

container.addEventListener('touchend', (e) => {
    isPanning = false;
    // Si no quedan dedos en la pantalla, reiniciamos las variables de pellizco
    if (e.touches.length === 0) {
        initialPinchDistance = 0;
        initialZoom = 1;
    }
});

// Función de ayuda para calcular la distancia entre dos toques
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Añade un evento para centrar el mapa al hacer doble toque
container.addEventListener('dblclick', (e) => {
    e.preventDefault();
    fitToScreen();
});

container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const now = new Date().getTime();
        const lastTouch = e.currentTarget.lastTouch || now + 1;
        const delta = now - lastTouch;
        if (delta < 500 && delta > 0) {
            e.preventDefault();
            fitToScreen();
        }
        e.currentTarget.lastTouch = now;
    }
}, { passive: false });

// =======================================================
// STANDS CON PAÍSES
// =======================================================
const interactiveAreasData = [

  { "id": "stand-1", "x": 544.0, "y": 281, "name": "Argentina", "flag": "https://flagcdn.com/w80/ar.png", "info": "Gastronomía argentina, vinos y productos tradicionales" },
  { "id": "stand-2", "x": 603.0, "y": 281, "name": "Brasil", "flag": "https://flagcdn.com/w80/br.png", "info": "Café brasileño, caipirinha y productos tropicales" },
  { "id": "stand-3", "x": 662.0, "y": 281, "name": "Chile", "flag": "https://flagcdn.com/w80/cl.png", "info": "Vinos chilenos, empanadas y productos del mar" },
  { "id": "stand-4", "x": 721.0, "y": 281, "name": "México", "flag": "https://flagcdn.com/w80/mx.png", "info": "Tacos, tequila y artesanías mexicanas" },
  { "id": "stand-5", "x": 780.0, "y": 281, "name": "Perú", "flag": "https://flagcdn.com/w80/pe.png", "info": "Ceviche, pisco y productos andinos" },
  { "id": "stand-6", "x": 839.0, "y": 281, "name": "Colombia", "flag": "https://flagcdn.com/w80/co.png", "info": "Café colombiano, arepas y productos artesanales" },
  { "id": "stand-7", "x": 898.0, "y": 281, "name": "España", "flag": "https://flagcdn.com/w80/es.png", "info": "Jamón ibérico, aceite de oliva y productos españoles" },
  { "id": "stand-8", "x": 957.0, "y": 281, "name": "Italia", "flag": "https://flagcdn.com/w80/it.png", "info": "Pasta, pizza y productos italianos auténticos" },
  { "id": "stand-9", "x": 1016.0, "y": 281, "name": "Francia", "flag": "https://flagcdn.com/w80/fr.png", "info": "Quesos franceses, vinos y productos gourmet" },
  { "id": "stand-10", "x": 1075.0, "y": 281, "name": "Alemania", "flag": "https://flagcdn.com/w80/de.png", "info": "Cerveza alemana, salchichas y productos tradicionales" },
  { "id": "stand-11", "x": 1134.0, "y": 281, "name": "Reino Unido", "flag": "https://flagcdn.com/w80/gb.png", "info": "Té inglés, fish & chips y productos británicos" },
  { "id": "stand-12", "x": 1193.0, "y": 281, "name": "Japón", "flag": "https://flagcdn.com/w80/jp.png", "info": "Sushi, sake y productos japoneses tradicionales" },
  { "id": "stand-13", "x": 1252.0, "y": 281, "name": "China", "flag": "https://flagcdn.com/w80/cn.png", "info": "Dim sum, té chino y productos orientales" },


  { "id": "stand-14", "x": 1311, "y": 340, "name": "India", "flag": "https://flagcdn.com/w80/in.png", "info": "Especias indias, curry y productos ayurvédicos" },
  { "id": "stand-15", "x": 1311, "y": 399, "name": "Tailandia", "flag": "https://flagcdn.com/w80/th.png", "info": "Pad thai, curry tailandés y productos asiáticos" },
  { "id": "stand-16", "x": 1311, "y": 458, "name": "Turquía", "flag": "https://flagcdn.com/w80/tr.png", "info": "Baklava, café turco y productos mediterráneos" },
  { "id": "stand-17", "x": 1311, "y": 517, "name": "Grecia", "flag": "https://flagcdn.com/w80/gr.png", "info": "Aceite de oliva, feta y productos mediterráneos" },
  { "id": "stand-18", "x": 1311, "y": 576, "name": "Marruecos", "flag": "https://flagcdn.com/w80/ma.png", "info": "Tagine, té de menta y artesanías marroquíes" },

  { "id": "stand-19", "x": 1311, "y": 846, "name": "Estados Unidos", "flag": "https://flagcdn.com/w80/us.png", "info": "BBQ, hamburguesas y productos americanos" },
  { "id": "stand-20", "x": 1311, "y": 905, "name": "Canadá", "flag": "https://flagcdn.com/w80/ca.png", "info": "Jarabe de maple, poutine y productos canadienses" },
  { "id": "stand-21", "x": 1311, "y": 964, "name": "Australia", "flag": "https://flagcdn.com/w80/au.png", "info": "Vinos australianos, carne y productos del Pacífico" },
  { "id": "stand-22", "x": 1311, "y": 1023, "name": "Sudáfrica", "flag": "https://flagcdn.com/w80/za.png", "info": "Biltong, rooibos y productos sudafricanos" },
  { "id": "stand-23", "x": 1311, "y": 1082, "name": "Egipto", "flag": "https://flagcdn.com/w80/eg.png", "info": "Dátiles, té de hibisco y productos árabes" },
  { "id": "stand-24", "x": 1311, "y": 1141, "name": "Rusia", "flag": "https://flagcdn.com/w80/ru.png", "info": "Caviar, vodka y productos rusos tradicionales" },
  { "id": "stand-25", "x": 1311, "y": 1200, "name": "Corea del Sur", "flag": "https://flagcdn.com/w80/kr.png", "info": "Kimchi, bulgogi y productos coreanos" },
  { "id": "stand-26", "x": 1311, "y": 1259, "name": "Vietnam", "flag": "https://flagcdn.com/w80/vn.png", "info": "Pho, café vietnamita y productos asiáticos" },

  { "id": "stand-27", "x": 1252, "y": 1318, "name": "Indonesia", "flag": "https://flagcdn.com/w80/id.png", "info": "Rendang, café de Java y especias asiáticas" },
  { "id": "stand-28", "x": 1193, "y": 1318, "name": "Filipinas", "flag": "https://flagcdn.com/w80/ph.png", "info": "Adobo, lumpia y productos filipinos" },
  { "id": "stand-29", "x": 1134, "y": 1318, "name": "Malasia", "flag": "https://flagcdn.com/w80/my.png", "info": "Nasi lemak, satay y productos malayos" },
  { "id": "stand-30", "x": 1075, "y": 1318, "name": "Singapur", "flag": "https://flagcdn.com/w80/sg.png", "info": "Chili crab, laksa y fusión asiática" },

  { "id": "stand-31", "x": 780, "y": 1318, "name": "Uruguay", "flag": "https://flagcdn.com/w80/uy.png", "info": "Asado uruguayo, dulce de leche y productos ganaderos" },
  { "id": "stand-32", "x": 721, "y": 1318, "name": "Paraguay", "flag": "https://flagcdn.com/w80/py.png", "info": "Sopa paraguaya, tereré y productos tradicionales" },
  { "id": "stand-33", "x": 662, "y": 1318, "name": "Bolivia", "flag": "https://flagcdn.com/w80/bo.png", "info": "Quinoa, llajua y productos andinos" },
  { "id": "stand-34", "x": 603, "y": 1318, "name": "Ecuador", "flag": "https://flagcdn.com/w80/ec.png", "info": "Cacao ecuatoriano, ceviche y productos amazónicos" },
  { "id": "stand-35", "x": 544, "y": 1318, "name": "Venezuela", "flag": "https://flagcdn.com/w80/ve.png", "info": "Arepas, pabellón y productos venezolanos" },
  // Nuevos stands del centro
  { "id": "stand-36", "x": 1081, "y": 767, "name": "Stand Central 1", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 1" },
  { "id": "stand-37", "x": 1081, "y": 826, "name": "Stand Central 2", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 2" },
  { "id": "stand-38", "x": 999, "y": 767, "name": "Stand Central 3", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 3" },
  { "id": "stand-39", "x": 999, "y": 826, "name": "Stand Central 4", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 4" },
  { "id": "stand-40", "x": 917, "y": 767, "name": "Stand Central 5", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 5" },
  { "id": "stand-41", "x": 917, "y": 826, "name": "Stand Central 6", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 6" },
  { "id": "stand-42", "x": 835, "y": 767, "name": "Stand Central 7", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 7" },
  { "id": "stand-43", "x": 835, "y": 826, "name": "Stand Central 8", "flag": "https://flagcdn.com/w80/xx.png", "info": "Información de Stand Central 8" }
];

function createInteractiveArea(area) {
  const areaElement = document.createElement('div');
  areaElement.id = area.id;
  areaElement.classList.add('interactive-area');
  areaElement.style.left = `${area.x}px`;
  areaElement.style.top = `${area.y}px`;

  const flagImg = document.createElement('img');
  flagImg.src = area.flag;
  flagImg.alt = `Bandera de ${area.name}`;
  flagImg.className = 'stand-flag';
  flagImg.loading = 'lazy';

  const nameDiv = document.createElement('div');
  if (parseInt(area.id.replace('stand-', '')) > 35) {
        areaElement.classList.add('interactive-area-rect');
    }
  nameDiv.className = 'stand-name';
  nameDiv.textContent = area.name;

  areaElement.appendChild(flagImg);
  areaElement.appendChild(nameDiv);

  areaElement.onclick = (e) => { 
    e.stopPropagation(); 
    showModal(area); 
  };
  
  interactiveContainer.appendChild(areaElement);
}

interactiveAreasData.forEach(createInteractiveArea);

function showModal(area) {
  modalTitle.textContent = area.name;
  modalFlag.src = area.flag;
  modalFlag.alt = `Bandera de ${area.name}`;
  modalInfo.textContent = area.info || 'Información no disponible';
  
  // Limpiar menú anterior
  modalMenu.innerHTML = '';
  
  // Si hay menú específico, agregarlo
  if (area.menu && area.menu.length > 0) {
    area.menu.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = item;
      li.appendChild(link);
      modalMenu.appendChild(li);
    });
  }
  
  modal.style.display = 'flex';
}

function hideModal() { 
  modal.style.display = 'none'; 
}

closeBtn.onclick = hideModal;

window.onclick = e => { 
  if (e.target === modal) hideModal(); 
};

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape' && modal.style.display === 'flex') hideModal(); 
});

// Doble clic para volver a la vista completa
container.addEventListener('dblclick', (e) => {
  e.preventDefault();
  fitToScreen();
});

applyTransform();