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

// Nueva variable para el tooltip
let tooltip = null;
let tooltipTimeout = null;


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
      // --- Stands (E1 - E28) ---
{ id: "stand-1", x: 543.6, y: 280.6, width: 117, height: 58, name: "Stand 1", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 1." },
    { id: "stand-2", x: 661.6, y: 280.6, width: 58, height: 58, name: "Stand 2", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 2." },
    { id: "stand-3", x: 720.6, y: 280.6, width: 58, height: 58, name: "Stand 3", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 3." },
    { id: "stand-4", x: 779.6, y: 280.6, width: 58, height: 58, name: "Stand 4", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 4." },
    { id: "stand-5", x: 838.6, y: 280.6, width: 58, height: 58, name: "Stand 5", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 5." },
    { id: "stand-6", x: 897.6, y: 280.6, width: 58, height: 58, name: "Stand 6", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 6." },
    { id: "stand-7", x: 956.6, y: 280.6, width: 58, height: 58, name: "Stand 7", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 7." },
    { id: "stand-8", x: 1015.6, y: 280.6, width: 58, height: 58, name: "Stand 8", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 8." },
    { id: "stand-9", x: 1074.6, y: 280.6, width: 58, height: 58, name: "Stand 9", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 9." },
    { id: "stand-10", x: 1133.6, y: 280.6, width: 58, height: 58, name: "Stand 10", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 10." },
    { id: "stand-11", x: 1192.6, y: 280.6, width: 117, height: 58, name: "Stand 11", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 11." },
    { id: "stand-12", x: 1310.6, y: 339.6, width: 58, height: 58, name: "Stand 12", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 12." },
    { id: "stand-13", x: 1310.6, y: 398.6, width: 58, height: 117, name: "Stand 13", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 13." },
    { id: "stand-14", x: 1310.6, y: 516.6, width: 58, height: 117, name: "Stand 14", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 14." },
    { id: "stand-15", x: 1310.6, y: 845.6, width: 58, height: 235, name: "Stand 15", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 15." },
    { id: "stand-16", x: 1310.6, y: 1081.6, width: 58, height: 58, name: "Stand 16", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 16." },
    { id: "stand-17", x: 1310.6, y: 1140.6, width: 58, height: 58, name: "Stand 17", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 17." },
    { id: "stand-18", x: 1310.6, y: 1199.6, width: 58, height: 117, name: "Stand 18", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 18." },
    { id: "stand-19", x: 1192.6, y: 1317.6, width: 117, height: 58, name: "Stand 19", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 19." },
    { id: "stand-20", x: 1133.6, y: 1317.6, width: 58, height: 58, name: "Stand 20", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 20." },
    { id: "stand-21", x: 1074.6, y: 1317.6, width: 58, height: 58, name: "Stand 21", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 21." },
    { id: "stand-22", x: 661.6, y: 1317.6, width: 117, height: 58, name: "Stand 22", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 22." },
    { id: "stand-23", x: 602.6, y: 1317.6, width: 58, height: 58, name: "Stand 23", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 23." },
    { id: "stand-24", x: 485.9, y: 1317.6, width: 115.7, height: 58, name: "Stand 24", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 24." },
    { id: "stand-25", x: 968.1, y: 827.9, width: 58, height: 58, name: "Stand 25", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 25. (Parte rotada)" },
    { id: "stand-26", x: 968.1, y: 768.9, width: 58, height: 58, name: "Stand 26", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 26. (Parte rotada)" },
    { id: "stand-27", x: 850.1, y: 827.9, width: 117, height: 58, name: "Stand 27", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 27." },
    { id: "stand-28", x: 850.1, y: 768.9, width: 117, height: 58, name: "Stand 28", flag: "https://flagcdn.com/w80/zz.png", info: "Información del Stand 28." },

    // --- Foodtrucks (E29 - E47, múltiples colores) ---
    // FT 29 (st3: Azul)
    { id: "stand-29", x: 356.2, y: 1494.1, width: 58, height: 58, name: "Foodtruck 29 (Azul)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 29 - Color Azul." },

    // FT 30 (st9: Verde Oscuro / Amarillo)
    { id: "stand-30a", x: 356.2, y: 1683.9, width: 58, height: 58, name: "Foodtruck 30 (Verde/Amarillo)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 30 - Parte A." },
    { id: "stand-30b", x: 374.4, y: 1559.1, width: 39.9, height: 117.8, name: "Foodtruck 30 (Verde/Amarillo)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 30 - Parte B." },

    // FT 31 (st11: Morado)
    { id: "stand-31a", x: 356.2, y: 1935.8, width: 58, height: 58, name: "Foodtruck 31 (Morado)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 31 - Parte A." },
    { id: "stand-31b", x: 374.7, y: 1873.7, width: 39.5, height: 55.1, name: "Foodtruck 31 (Morado)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 31 - Parte B." },

    // FT 32 (st16: Verde Menta)
    { id: "stand-32", x: 374.7, y: 2125.6, width: 39.5, height: 60, name: "Foodtruck 32 (Verde Menta)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 32 - Color Verde Menta." },

    // FT 33 (st7: Fucsia/Magenta)
    { id: "stand-33", x: 374.4, y: 1748.9, width: 39.9, height: 117.8, name: "Foodtruck 33 (Fucsia/Magenta)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 33 - Color Fucsia/Magenta." },

    // FT 34 (st2: Cian/Azul Claro)
    { id: "stand-34", x: 374.4, y: 2000.8, width: 39.9, height: 117.8, name: "Foodtruck 34 (Cian/Azul Claro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 34 - Color Cian/Azul Claro." },

    // FT 35 (st19: Gris Oscuro)
    { id: "stand-35a", x: 1412.5, y: 1993.1, width: 58, height: 58, name: "Foodtruck 35 (Gris Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 35 - Parte A." },
    { id: "stand-35b", x: 1412.5, y: 2058.1, width: 39.9, height: 137.3, name: "Foodtruck 35 (Gris Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 35 - Parte B." },

    // FT 36 (st1: Verde Oliva)
    { id: "stand-36a", x: 1412.5, y: 1686.3, width: 58, height: 58, name: "Foodtruck 36 (Verde Oliva)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 36 - Parte A." },
    { id: "stand-36b", x: 1412.5, y: 1751.3, width: 39.9, height: 117.9, name: "Foodtruck 36 (Verde Oliva)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 36 - Parte B." },

    // FT 37 (st6: Lila)
    { id: "stand-37", x: 1412.5, y: 1494.1, width: 58, height: 58, name: "Foodtruck 37 (Lila)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 37 - Color Lila." },

    // FT 38 (st17: Marrón Oscuro)
    { id: "stand-38a", x: 1412.5, y: 1621.3, width: 58, height: 58, name: "Foodtruck 38 (Marrón Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 38 - Parte A." },
    { id: "stand-38b", x: 1412.5, y: 1559.1, width: 39.9, height: 55.2, name: "Foodtruck 38 (Marrón Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 38 - Parte B." },

    // FT 39 (st0: Rojo)
    { id: "stand-39", x: 1412.5, y: 1876.2, width: 39.9, height: 109.9, name: "Foodtruck 39 (Rojo)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 39 - Color Rojo." },

    // FT 40 (st8: Verde Brillante)
    { id: "stand-40a", x: 544.4, y: 2218.3, width: 58, height: 58, name: "Foodtruck 40 (Verde Brillante)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 40 - Parte A." },
    { id: "stand-40b", x: 419.6, y: 2218.3, width: 117.8, height: 39.9, name: "Foodtruck 40 (Verde Brillante)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 40 - Parte B." },

    // FT 41 (st14: Ciruela Oscuro)
    { id: "stand-41a", x: 1005.3, y: 2218.3, width: 58, height: 58, name: "Foodtruck 41 (Ciruela Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 41 - Parte A." },
    { id: "stand-41b", x: 943, y: 2218.3, width: 55.3, height: 38.4, name: "Foodtruck 41 (Ciruela Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 41 - Parte B." },

    // FT 42 (st12: Naranja Cítrico)
    { id: "stand-42", x: 1193.6, y: 2218.3, width: 78, height: 58, name: "Foodtruck 42 (Naranja Cítrico)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 42 - Color Naranja Cítrico." },

    // FT 43 (st10: Azul Pizarra)
    { id: "stand-43", x: 734.2, y: 2218.3, width: 78.5, height: 58, name: "Foodtruck 43 (Azul Pizarra)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 43 - Color Azul Pizarra." },

    // FT 44 (st18: Verde Pálido)
    { id: "stand-44", x: 819.7, y: 2218.3, width: 116.3, height: 58, name: "Foodtruck 44 (Verde Pálido)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 44 - Color Verde Pálido." },

    // FT 45 (st5: Amarillo Limón)
    { id: "stand-45", x: 1070.3, y: 2218.3, width: 116.3, height: 58, name: "Foodtruck 45 (Amarillo Limón)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 45 - Color Amarillo Limón." },

    // FT 46 (st13: Verde Bosque)
    { id: "stand-46", x: 609.4, y: 2218.3, width: 117.8, height: 39.9, name: "Foodtruck 46 (Verde Bosque)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 46 - Color Verde Bosque." },

    // FT 47 (st4: Naranja Oscuro)
    { id: "stand-47", x: 1278.6, y: 2218.3, width: 117.8, height: 39.9, name: "Foodtruck 47 (Naranja Oscuro)", flag: "https://flagcdn.com/w80/zz.png", info: "Foodtruck 47 - Color Naranja Oscuro." },];


// =======================================================
// DATOS DE LOS SERVICIOS (separados)
// =======================================================
const serviceAreasData = [
  { id: "mercadito-productores", x: 1644.7, y: 600.3, width: 1516.2, height: 205.4, name: "Mercadito de Productores", flag: "", info: "" },
  { id: "banos", x: 1642.4, y: 78.1, width: 647.1, height: 54, name: "Baños", flag: "", info: "" },
  { id: "escenario-gastronomico", x: 401.1, y: 1022.9, width: 93.1, height: 205.2, name: "Escenario Gastronómico", flag: "", info: "" },
  { id: "patio-fuegos", x: 637, y: 1870, width: 557.4, height: 75.5, name: "Patio de Fuegos", flag: "", info: "" },
  { id: "bomberos-1", x: 83.4, y: 218.4, width: 136.5, height: 55.9, name: "Bomberos", flag: "", info: "" },
  { id: "bomberos-2", x: 1518, y: 2126.6, width: 136.5, height: 55.9, name: "Bomberos", flag: "", info: "" },
  { id: "enfermeria", x: 1529.6, y: 1096.2, width: 61.6, height: 61.6, name: "Enfermería", flag: "", info: "" },
  { id: "escenario-cultural", x: 401.1, y: 399.8, width: 121.5, height: 269, name: "Escenario Cultural", flag: "", info: "" },
  { id: "policia", x: 96.4, y: 292.6, width: 116.3, height: 44.6, name: "Policía", flag: "", info: "" },
  { id: "entrada-foodtrucks", x: 836.4, y: 1433.5, width: 158.6, height: 22.1, name: "Entrada Foodtrucks y Patio de Fuegos", flag: "", info: "" },
  { id: "entrada-1", x: 1420.9, y: 652, width: 18.8, height: 177.2, name: "Entrada", flag: "", info: "" },
  { id: "entrada-2", x: 3550.6, y: 667.6, width: 29.6, height: 134.5, name: "Entrada", flag: "", info: "" },
  { id: "ambulancia-1", x: 83.4, y: 149.9, width: 136.5, height: 55.9, name: "Ambulancia", flag: "", info: "" },
  { id: "ambulancia-2", x: 1518, y: 2058.1, width: 136.5, height: 55.9, name: "Ambulancia", flag: "", info: "" },
];


// =======================================================
// FUNCIONES
// =======================================================
function applyTransform() {
  container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  updateTextVisibility();

  // Escala el tooltip de forma inversa al zoom para que mantenga un tamaño legible
  if (tooltip) {
    tooltip.style.transform = `scale(${1 / zoomLevel})`;
  }
}

function calculateMinZoom() {
  const containerRect = interactiveContainer.getBoundingClientRect();
  const mapWidth = 3916;
  const mapHeight = 2586;
  const scaleX = containerRect.width / mapWidth;
  const scaleY = containerRect.height / mapHeight;
  return Math.min(scaleX, scaleY) * 0.9;
}

function setInitialView() {
    const containerRect = interactiveContainer.getBoundingClientRect();
    const viewboxX = 215.9;
    const viewboxY = 82.9;
    const viewboxWidth = 1400;
    const viewboxHeight = 2300;
    const scaleX = containerRect.width / viewboxWidth;
    const scaleY = containerRect.height / viewboxHeight;
    initialZoomLevel = Math.min(scaleX, scaleY);
    const centeredPanX = (containerRect.width - viewboxWidth * initialZoomLevel) / 2;
    const centeredPanY = (containerRect.height - viewboxHeight * initialZoomLevel) / 2;
    initialPanX = centeredPanX - (viewboxX * initialZoomLevel);
    initialPanY = centeredPanY - (viewboxY * initialZoomLevel);
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

function showTooltip(area, areaElement, pinned = false) {
  hideTooltip(); 

  if (!area.name) return; 

  tooltip = document.createElement('div');
  tooltip.textContent = area.name;
  tooltip.className = 'tooltip-text'; 

  if (pinned) {
    tooltip.classList.add('pinned');
  }

  container.appendChild(tooltip);

  // Espera un tick para que se calcule el ancho del tooltip
  requestAnimationFrame(() => {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // Centrar horizontalmente y colocar sobre el borde superior
    const tooltipX = area.x + area.width / 2 - tooltipWidth / 2;
    const tooltipY = area.y - tooltipHeight - 8; // 8px de separación

    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;

    // Ajusta tamaño proporcional al zoom
    tooltip.style.transform = `scale(${1 / zoomLevel})`;

    tooltip.classList.add('show');

    if (pinned) {
      tooltipTimeout = setTimeout(() => {
        hideTooltip();
      }, 3000); // 3 segundos
    }
  });
}


function hideTooltip() {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

function createInteractiveArea(area) {
  const areaElement = document.createElement('div');
  areaElement.id = area.id;
  areaElement.classList.add('interactive-area');

  const isService = serviceAreasData.some(service => service.id === area.id);
  if (isService) {
    areaElement.classList.add('invisible-service');
  }

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
  nameDiv.className = 'stand-name';
  nameDiv.textContent = area.name;

  areaElement.appendChild(flagImg);
  areaElement.appendChild(nameDiv);

  container.appendChild(areaElement);

  // Lógica de eventos para stands y servicios
  if (isService) {
    // Evento para mouseenter (PC)
    areaElement.addEventListener('mouseenter', () => {
      showTooltip(area, areaElement);
    });
    // Evento para mouseleave (PC)
    areaElement.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    // Evento para clic (PC)
    areaElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showTooltip(area, areaElement, true);
    });
    // Evento para touchstart (Móviles)
    areaElement.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      showTooltip(area, areaElement, true);
    }, {
      passive: false
    });
  } else {
    // Para stands, abrir modal
    areaElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showModal(area);
    });
  }
}


function showModal(area) {
  // Actualiza contenido
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

  // Muestra el modal
  modal.classList.add('show');
  modal.style.display = 'flex'; // asegura que esté visible
}

function hideModal() {
  modal.classList.remove('show');
  // No necesitamos listener de transitionend
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
  hideTooltip(); // Oculta el tooltip al hacer zoom

  
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
  hideTooltip(); // Oculta el tooltip al hacer zoom
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
  hideTooltip(); // Oculta el tooltip al restablecer la vista
});


if (closeBtn) {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideModal();
  });
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      e.stopPropagation();
      hideModal();
    }
  });
}



window.onclick = e => { 
  if (e.target === modal) hideModal(); 
  hideTooltip(); // Oculta el tooltip al hacer clic en cualquier parte de la ventana
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
  hideTooltip(); // Oculta el tooltip al hacer doble clic
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
    hideTooltip();
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
  hideTooltip(); 
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
  hideTooltip();
});

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
      hideTooltip(); 
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
    hideTooltip();
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
      hideTooltip();
    } else {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const standElement = element.closest('.interactive-area');
        if (standElement) {
          const standId = standElement.id;
          const standData = interactiveAreasData.concat(serviceAreasData).find(area => area.id === standId);
          if (standData) {
              const isService = serviceAreasData.some(service => service.id === standId);
              if (isService) {
                  // Si es un servicio, muestra el tooltip en el toque
                  showTooltip(standData, standElement, true);
              } else {
                  // Si es un stand, muestra el modal
                  showModal(standData);
              }
          }
        } else {
          console.log("TOUCH: No se encontró un stand en el punto de toque.");
        }
      } else {
        console.log("TOUCH: No se encontró ningún elemento en el punto de toque.");
      }
    }
    lastTapTime = currentTime;
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
    const allAreasData = interactiveAreasData.concat(serviceAreasData);
    allAreasData.forEach(createInteractiveArea);
    setTimeout(() => {
        setInitialView();
    }, 100);
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