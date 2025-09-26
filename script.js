// =======================================================
// FUNCIONES DE UTILIDAD
// =======================================================
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || ('ontouchstart' in window);
}

// =======================================================
// VARIABLES Y ELEMENTOS DEL DOM
// =======================================================
const interactiveContainer = document.querySelector('.interactive-container');
const container = document.querySelector('.container');
const header = document.querySelector('header');

const modal = document.getElementById('infoModal');
const closeBtn = document.querySelector('.close-btn');
const modalFlag = document.getElementById('modalFlag');
const modalTitle = document.getElementById('modalTitle');
const modalMenu = document.getElementById('modalMenu');
const modalInfo = document.getElementById('modalInfo');

// Nuevas variables para las instrucciones
const instructionsMobile = document.getElementById('instructions-mobile');
const instructionsPC = document.getElementById('instructions-pc');

// Nuevas variables para los botones de control
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const resetViewBtn = document.getElementById('reset-view');


// =======================================================
// GESTIÓN DE TRANSFORMACIONES Y ESTADO
// =======================================================
let isPanning = false;
let startX = 0, startY = 0;
let panX = 0, panY = 0;
let zoomLevel = 1;

let initialPinchDistance = 0;
let initialZoom = 1;

let isZoomAnimating = false;
let animationFrame = null;
let minZoomLevel = 0.2;

// Variables para manejar touch eventos
let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let hasMoved = false;
let isMultiTouch = false;
let lastTapTime = 0;

// Variables para la vista inicial
let initialZoomLevel = 1;
let initialPanX = 0;
let initialPanY = 0;


// =======================================================
// DATOS DE LOS STANDS
// =======================================================
const interactiveAreasData = [
  { id: "stand-1", x: 1310.6, y: 1199.6, width: 58, height: 117, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-2", x: 543.6, y: 280.6, width: 117, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-3", x: 661.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-4", x: 720.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-5", x: 779.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-6", x: 838.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-7", x: 897.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-8", x: 850.1, y: 768.9, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-9", x: 909.1, y: 768.9, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-10", x: 968.1, y: 768.9, width: 58, height: 117, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-11", x: 956.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-12", x: 1015.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-13", x: 1074.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-14", x: 1133.6, y: 280.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-15", x: 1192.6, y: 280.6, width: 117, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-16", x: 1310.6, y: 339.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-17", x: 1310.6, y: 398.6, width: 58, height: 117, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-18", x: 1310.6, y: 516.6, width: 58, height: 117, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-19", x: 1310.6, y: 845.6, width: 58, height: 235, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-20", x: 1310.6, y: 1081.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-21", x: 1310.6, y: 1140.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-22", x: 1192.6, y: 1317.6, width: 117, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-23", x: 1133.6, y: 1317.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-24", x: 1074.6, y: 1317.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-25", x: 661.6, y: 1317.6, width: 117, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-26", x: 602.6, y: 1317.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-27", x: 356.2, y: 1494.1, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-28", x: 356.2, y: 1697.4, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-29", x: 356.2, y: 1957.1, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-30", x: 535.1, y: 2236.7, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-31", x: 1002.8, y: 2236.7, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-32", x: 1412.5, y: 2038.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-33", x: 1412.5, y: 1728, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-34", x: 1412.5, y: 1528.6, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-35", x: 1412.5, y: 1655.2, width: 58, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-36", x: 1196.6, y: 2236.7, width: 78, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-37", x: 728.8, y: 2236.7, width: 78.5, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-38", x: 814.9, y: 2236.7, width: 116.3, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-39", x: 1072.2, y: 2236.7, width: 116.3, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-40", x: 940.2, y: 2236.7, width: 55.3, height: 38.4, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-41", x: 374.7, y: 1894.8, width: 39.5, height: 55.1, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-42", x: 374.7, y: 2150.2, width: 39.5, height: 60, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-43", x: 374.4, y: 1575.8, width: 39.9, height: 117.8, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-44", x: 374.4, y: 1765.5, width: 39.9, height: 117.8, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-45", x: 374.4, y: 2022.4, width: 39.9, height: 117.8, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-46", x: 1412.5, y: 2102.4, width: 39.9, height: 137.3, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-47", x: 1412.5, y: 1919.7, width: 39.9, height: 109.9, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-48", x: 1412.5, y: 1790.2, width: 39.9, height: 117.9, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-49", x: 1412.5, y: 1593.2, width: 39.9, height: 55.2, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-50", x: 413.9, y: 2236.7, width: 117.8, height: 39.9, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-51", x: 603.4, y: 2236.7, width: 117.8, height: 39.9, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-52", x: 1278.6, y: 2236.7, width: 117.8, height: 39.9, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-53", x: 485.9, y: 1317.6, width: 115.7, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" },
  { id: "stand-54", x: 850.1, y: 827.9, width: 117, height: 58, name: "", flag: "https://flagcdn.com/w80/zz.png", info: "" }
];

// =======================================================
// FUNCIONES
// =======================================================
function applyTransform() {
  container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  updateTextVisibility();
}

function calculateMinZoom() {
  const containerRect = interactiveContainer.getBoundingClientRect();
  const mapWidth = 3916;
  const mapHeight = 2586;
  const scaleX = containerRect.width / mapWidth;
  const scaleY = containerRect.height / mapHeight;
  return Math.min(scaleX, scaleY) * 0.9;
}

// NUEVA función para establecer la vista inicial basada en coordenadas
function setInitialView() {
    const containerRect = interactiveContainer.getBoundingClientRect();

    // Coordenadas de la zona que quieres mostrar (del plano SVG)
    const viewboxX = 215.9;
    const viewboxY = 82.9;
    const viewboxWidth = 1400;
    const viewboxHeight = 2300;

    // Calcular el nivel de zoom para que el área encaje en el contenedor
    const scaleX = containerRect.width / viewboxWidth;
    const scaleY = containerRect.height / viewboxHeight;
    initialZoomLevel = Math.min(scaleX, scaleY);
    
    // Calcular la posición para centrar el área
    const centeredPanX = (containerRect.width - viewboxWidth * initialZoomLevel) / 2;
    const centeredPanY = (containerRect.height - viewboxHeight * initialZoomLevel) / 2;
    
    // Ajustar el paneo para mover el punto de origen
    initialPanX = centeredPanX - (viewboxX * initialZoomLevel);
    initialPanY = centeredPanY - (viewboxY * initialZoomLevel);
    
    // Aplicar la vista inicial
    zoomLevel = initialZoomLevel;
    panX = initialPanX;
    panY = initialPanY;
    
    applyTransform();
    console.log("INFO: Vista inicial aplicada. Zoom:", zoomLevel, "Pan:", panX, panY);
}

function animateZoom(startZoom, startPanX, startPanY, endZoom, endPanX, endPanY, duration) {
  if (isZoomAnimating) {
    cancelAnimationFrame(animationFrame);
  }
  const startTime = performance.now();
  console.log("INFO: Iniciando animación de zoom...");

  function step(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const easeProgress = Math.sin((progress * Math.PI) / 2);

    zoomLevel = startZoom + (endZoom - startZoom) * easeProgress;
    panX = startPanX + (endPanX - startPanX) * easeProgress;
    panY = startPanY + (endPanY - startPanY) * easeProgress;

    applyTransform();

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
    } else {
        isZoomAnimating = false;
        animationFrame = null;
        console.log("INFO: Animación de zoom finalizada.");
    }
  }

  isZoomAnimating = true;
  animationFrame = requestAnimationFrame(step);
}

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

function createInteractiveArea(area) {
  const areaElement = document.createElement('div');
  areaElement.id = area.id;
  areaElement.classList.add('interactive-area');
  areaElement.style.left = `${area.x}px`;
  areaElement.style.top = `${area.y}px`;
  areaElement.style.left = `${area.x}px`;
areaElement.style.top = `${area.y}px`;
areaElement.style.width = `${area.width}px`;
areaElement.style.height = `${area.height}px`;

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
  
  // AÑADIR LOS STANDS AL CONTENEDOR QUE SE MUEVE
  container.appendChild(areaElement);

  // Solo agregar click para PC (no afecta en móviles con touchstart)
  areaElement.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    showModal(area); 
  });
}

function showModal(area) {
  console.log(`INFO: Mostrando modal para el stand: ${area.name}`);
  modalTitle.textContent = area.name;
  modalFlag.src = area.flag;
  modalFlag.alt = `Bandera de ${area.name}`;
  modalInfo.textContent = area.info || 'Información no disponible';
  
  modalMenu.innerHTML = '';
  
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
  console.log("INFO: Modal ocultado.");
}

// =======================================================
// GESTIÓN DE EVENTOS
// =======================================================

// Event listeners para botones de control
zoomInBtn.addEventListener('click', () => {
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;

  const containerRect = interactiveContainer.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  const zoomFactor = 1.2;

  const targetZoom = Math.max(minZoomLevel, Math.min(zoomLevel * zoomFactor, 12));

  const mapX = (centerX - oldPanX) / oldZoomLevel;
  const mapY = (centerY - oldPanY) / oldZoomLevel;

  const targetPanX = centerX - mapX * targetZoom;
  const targetPanY = centerY - mapY * targetZoom;

  animateZoom(oldZoomLevel, oldPanX, oldPanY, targetZoom, targetPanX, targetPanY, 350);
});

zoomOutBtn.addEventListener('click', () => {
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;

  const containerRect = interactiveContainer.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  const zoomFactor = 0.8;

  const targetZoom = Math.max(minZoomLevel, Math.min(zoomLevel * zoomFactor, 12));

  const mapX = (centerX - oldPanX) / oldZoomLevel;
  const mapY = (centerY - oldPanY) / oldZoomLevel;

  const targetPanX = centerX - mapX * targetZoom;
  const targetPanY = centerY - mapY * targetZoom;

  animateZoom(oldZoomLevel, oldPanX, oldPanY, targetZoom, targetPanX, targetPanY, 350);
});

resetViewBtn.addEventListener('click', () => {
  if (isZoomAnimating && animationFrame) {
      cancelAnimationFrame(animationFrame);
      isZoomAnimating = false;
      animationFrame = null;
  }
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  animateZoom(oldZoomLevel, oldPanX, oldPanY, initialZoomLevel, initialPanX, initialPanY, 500);
});


closeBtn.onclick = hideModal;

window.onclick = e => { 
  if (e.target === modal) hideModal(); 
};

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape' && modal.style.display === 'flex') hideModal(); 
});

container.addEventListener('dblclick', (e) => {
  e.preventDefault();
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  animateZoom(oldZoomLevel, oldPanX, oldPanY, initialZoomLevel, initialPanX, initialPanY, 500);
});

// Event listeners para mouse (PC)
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
    console.log("PAN: Mousedown detectado. Iniciando paneo.");
  }
});

window.addEventListener('mouseup', () => { 
  isPanning = false; 
  container.style.cursor = 'grab'; 
  console.log("PAN: Mouseup detectado. Finalizando paneo.");
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning || isZoomAnimating) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
});

container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomSpeed = 0.3;

  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;

  let targetZoom = e.deltaY < 0 ? zoomLevel + zoomSpeed : zoomLevel - zoomSpeed;
  targetZoom = Math.max(0.2, Math.min(targetZoom, 12));

  const cursorX = e.clientX;
  const cursorY = e.clientY;

  const mapX = (cursorX - panX) / oldZoomLevel;
  const mapY = (cursorY - panY) / oldZoomLevel;

  const targetPanX = cursorX - mapX * targetZoom;
  const targetPanY = cursorY - mapY * targetZoom;

  animateZoom(oldZoomLevel, oldPanX, oldPanY, targetZoom, targetPanX, targetPanY, 350);
}, { passive: false });

// ----------------------------------------------------
// TOUCH EVENTS (PANEO Y ZOOM)
// ----------------------------------------------------

// Eventos táctiles para zoom y paneo del mapa (solo en el contenedor interactivo)
interactiveContainer.addEventListener('touchstart', (e) => {
  touchStartTime = Date.now();
  isMultiTouch = e.touches.length > 1;
  hasMoved = false;
  
  if (isZoomAnimating && animationFrame) {
      cancelAnimationFrame(animationFrame);
      isZoomAnimating = false;
      animationFrame = null;
  }
  
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    startX = touch.clientX - panX;
    startY = touch.clientY - panY;
    console.log("TOUCH: Touchstart detectado (1 dedo).");

  } else if (e.touches.length === 2) {
    isPanning = false;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    initialZoom = zoomLevel;
    console.log("TOUCH: Touchstart detectado (2 dedos). Iniciando pinch-zoom.");
  }
}, { passive: true });

interactiveContainer.addEventListener('touchmove', (e) => {
  if (isZoomAnimating) return;
  
  if (e.touches.length === 1 && !isMultiTouch) {
    const touch = e.touches[0];
    const moveX = Math.abs(touch.clientX - touchStartX);
    const moveY = Math.abs(touch.clientY - touchStartY);
    
    if (moveX > 5 || moveY > 5) {
      hasMoved = true;
      isPanning = true;
      
      panX = touch.clientX - startX;
      panY = touch.clientY - startY;
      applyTransform();
      
      e.preventDefault();
      // console.log("TOUCH: Moviendo mapa. hasMoved:", hasMoved); // Descomenta si necesitas un registro más detallado
    }
  } else if (e.touches.length === 2 && initialPinchDistance > 0) {
    hasMoved = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    
    const zoomFactor = currentPinchDistance / initialPinchDistance;
    let newZoom = initialZoom * zoomFactor;
    
    const maxZoom = 8;
    
    newZoom = Math.max(minZoomLevel, Math.min(newZoom, maxZoom));
    
    const touchCenterX = (touch1.clientX + touch2.clientX) / 2;
    const touchCenterY = (touch1.clientY + touch2.clientY) / 2;
    const mapX = (touchCenterX - panX) / zoomLevel;
    const mapY = (touchCenterY - panY) / zoomLevel;
    
    zoomLevel = newZoom;
    
    panX = touchCenterX - mapX * zoomLevel;
    panY = touchCenterY - mapY * zoomLevel;
    
    applyTransform();
    e.preventDefault();
    // console.log("TOUCH: Zooming. Zoom Level:", zoomLevel); // Descomenta si necesitas un registro más detallado
  }
}, { passive: false });

interactiveContainer.addEventListener('touchend', (e) => {
  const touchDuration = Date.now() - touchStartTime;
  const currentTime = Date.now();
  console.log(`TOUCH: Touchend detectado. Duración: ${touchDuration}ms, Movimiento: ${hasMoved}`);

  if (e.touches.length === 1 && isMultiTouch) {
    const touch = e.touches[0];
    startX = touch.clientX - panX;
    startY = touch.clientY - panY;
    
    isMultiTouch = false;
    initialPinchDistance = 0;
    initialZoom = zoomLevel;
    console.log("TOUCH: Se finalizó pinch-zoom. Preparando para un solo toque.");
    return;
  }

  // Lógica para detectar el toque simple (tap)
  if (!hasMoved && !isMultiTouch && touchDuration < 500 && e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    
    console.log(`TOUCH: Posible toque detectado en X:${touch.clientX}, Y:${touch.clientY}`);
    
    if (currentTime - lastTapTime < 300) {
      console.log("TOUCH: Doble toque detectado. Restableciendo la vista.");
      const oldZoomLevel = zoomLevel;
      const oldPanX = panX;
      const oldPanY = panY;
      animateZoom(oldZoomLevel, oldPanX, oldPanY, initialZoomLevel, initialPanX, initialPanY, 500);
      lastTapTime = 0;
    } else {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const standElement = element.closest('.interactive-area');
        if (standElement) {
          const standId = standElement.id;
          const standData = interactiveAreasData.find(area => area.id === standId);
          if (standData) {
            console.log("TOUCH: ¡Stand encontrado! ID:", standId);
            showModal(standData);
          }
        } else {
          console.log("TOUCH: No se encontró un stand en el punto de toque.");
        }
      } else {
        console.log("TOUCH: No se encontró ningún elemento en el punto de toque.");
      }
      lastTapTime = currentTime;
    }
  }

  if (zoomLevel < minZoomLevel) {
    animateZoom(zoomLevel, panX, panY, minZoomLevel, panX, panY, 200);
  } else if (zoomLevel > 8) {
    animateZoom(zoomLevel, panX, panY, 8, panX, panY, 200);
  }

  isPanning = false;
  hasMoved = false;
}, { passive: true });


// =======================================================
// INICIALIZACIÓN
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // Crear todos los stands
    interactiveAreasData.forEach(createInteractiveArea);
  
    // Pequeño retraso para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        setInitialView();
    }, 100);

    // Muestra las instrucciones correctas al cargar la página
    if (isMobileDevice()) {
        if (instructionsMobile) instructionsMobile.style.display = 'block';
        if (instructionsPC) instructionsPC.style.display = 'none';
    } else {
        if (instructionsMobile) instructionsMobile.style.display = 'none';
        if (instructionsPC) instructionsPC.style.display = 'block';
    }
});
window.addEventListener('resize', () => {
    setInitialView();
});