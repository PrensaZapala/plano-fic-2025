// =======================================================
// FUNCIONES DE UTILIDAD
// =======================================================
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    ) || "ontouchstart" in window
  );
}

// -------------------------------------------------------
// FUNCIONES DE MAPEO DE BANDERAS
// -------------------------------------------------------

/**
 * Mapeo de CLAVES PERSONALIZADAS (no-ISO) a sus nombres de archivo locales.
 */
const CUSTOM_FLAG_MAP = {
  custom_basque: "icon_basque.svg", // País Vasco
  custom_africa: "icon_africa.svg", // Colectividad Afro
  custom_syrialeb: "icon_syrialeb.svg", // Sirio Libanés
  custom_beer: "icon_beer.svg", // Cervecería
  custom_cocktail: "icon_cocktail.svg", // Barra de Tragos
  custom_drink: "icon_drink.svg", // Bebidas
  custom_wine: "icon_wine.svg", // Bodega
  custom_neuquen: "icon_neuquen.svg", // Sabores Neuquinos
  custom_museum: "icon_museum.svg", // Museo
  custom_commercial: "icon_commercial.svg", // Instalaciones Comerciales
};

/**
 * Convierte el código de país/categoría (del TSV columna 'code')
 * en una URL de bandera. Usa flagcdn.com para códigos ISO.
 * * @param {string} flagCode - El valor de la columna 'code' del TSV (ej. 'it' o 'custom_beer').
 * @returns {string} La URL completa de la imagen de la bandera o una cadena vacía.
 */
function getFlagUrl(flagCode) {
  if (!flagCode) return "";

  const cleanCode = flagCode.toLowerCase().trim();

  // 1. Manejo de claves ISO (o códigos regionales como 'gb-eng')
  if (!cleanCode.startsWith("custom_")) {
    // Asumimos que es un código ISO válido de 2 letras o 5 letras (ej. gb-eng).
    // Formato: https://flagcdn.com/w320/{code}.png
    return `https://flagcdn.com/w320/${cleanCode}.png`;
  }

  // 2. Manejo de claves PERSONALIZADAS (íconos locales)
  const fileName = CUSTOM_FLAG_MAP[cleanCode];
  if (fileName) {
    // La URL debe apuntar a tu carpeta local de íconos.
    return `img/flags/${fileName}`;
  }

  return "";
}

// =======================================================
// VARIABLES Y ELEMENTOS DEL DOM
// =======================================================
const interactiveContainer = document.querySelector(".interactive-container");
const container = document.querySelector(".container");
const header = document.querySelector("header");

const modal = document.getElementById("infoModal");
const closeBtn = document.querySelector(".close-btn");
const modalFlag = document.getElementById("modalFlag");
const modalTitle = document.getElementById("modalTitle");
const modalMenu = document.getElementById("modalMenu");
const modalInfo = document.getElementById("modalInfo");

const instructionsMobile = document.getElementById("instructions-mobile");
const instructionsPC = document.getElementById("instructions-pc");

const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const resetViewBtn = document.getElementById("reset-view");

let tooltip = null;
let tooltipTimeout = null;

// =======================================================
// GESTIÓN DE TRANSFORMACIONES Y ESTADO
// =======================================================
let isPanning = false;
let startX = 0,
  startY = 0;
let panX = 0,
  panY = 0;
let zoomLevel = 1;

let initialPinchDistance = 0;
let initialZoom = 1;

let isZoomAnimating = false;
let animationFrame = null;
let minZoomLevel = 0.2;

let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let hasMoved = false;
let isMultiTouch = false;
let lastTapTime = 0;

let initialZoomLevel = 1;
let initialPanX = 0;
let initialPanY = 0;

// =======================================================
// DATOS DE LOS STANDS (Disposición Final, Ordenados y Secuenciales)
// =======================================================
// =======================================================
// DATOS DE LOS STANDS (FINAL - Coordenadas del 29 al 47 Actualizadas)
// =======================================================
const standsBaseData = [
    // Primera Fila (Horizontal - ID 1 a 11)
    { id: "stand-1", x: 602.7, y: 280.6, width: 117, height: 58 },
    { id: "stand-2", x: 720.6, y: 280.6, width: 58, height: 58 },
    // stand-3 es un servicio (Enfermería)
    { id: "stand-4", x: 779.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-5", x: 838.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-6", x: 897.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-7", x: 956.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-8", x: 1015.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-9", x: 1074.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-10", x: 1133.6, y: 280.6, width: 58, height: 58 },
    { id: "stand-11", x: 1192.6, y: 280.6, width: 117, height: 58 },

    // Stands del Lado Derecho Superior (Vertical - ID 12 a 14)
    { id: "stand-12", x: 1310.6, y: 339.6, width: 58, height: 58 },
    { id: "stand-13", x: 1310.6, y: 398.6, width: 58, height: 117 },
    { id: "stand-14", x: 1310.6, y: 516.6, width: 58, height: 117 },

    // Stands del Lado Derecho Medio (Vertical - ID 15 a 18)
    { id: "stand-15", x: 1310.6, y: 846.8, width: 58, height: 233.8 },
    { id: "stand-16", x: 1310.6, y: 1081.6, width: 58, height: 58 },
    { id: "stand-17", x: 1310.6, y: 1140.6, width: 58, height: 58 },
    { id: "stand-18", x: 1310.6, y: 1199.6, width: 58, height: 117 },

    // Fila Inferior Media/Izquierda (Horizontal - ID 19 a 25)
    { id: "stand-19", x: 1192.6, y: 1317.6, width: 117, height: 58 },
    { id: "stand-20", x: 1133.6, y: 1317.6, width: 58, height: 58 },
    { id: "stand-21", x: 1074.6, y: 1317.6, width: 58, height: 58 },
    { id: "stand-22", x: 661.6, y: 1317.6, width: 117, height: 58 },
    { id: "stand-23", x: 602.6, y: 1317.6, width: 58, height: 58 },
    { id: "stand-24", x: 543.6, y: 1317.6, width: 58, height: 58 },
    { id: "stand-25", x: 484.6, y: 1317.6, width: 58, height: 58 },

    // Stands Centrales y de Pasillo Superior (ID 26 a 29)
    { id: "stand-26", x: 980.7, y: 768.6, width: 58, height: 58 },
    { id: "stand-27", x: 921.7, y: 768.6, width: 58, height: 58 },
    { id: "stand-28", x: 921.7, y: 827.9, width: 117, height: 58 },
    { id: "stand-29", x: 960.5, y: 506.8, width: 117, height: 58 },

    // 🔄 Stands del Lado Izquierdo (Vertical - ID 30 a 35) - ¡Nuevas Coordenadas aplicadas!
    { id: "stand-30", x: 401.1, y: 1524.7, width: 58, height: 58 }, // Anteriormente 29
    { id: "stand-31", x: 401.1, y: 1590.8, width: 58, height: 165.7 }, // Anteriormente 30
    { id: "stand-32", x: 401.1, y: 1764.7, width: 58.1, height: 117.8 }, // Anteriormente 31 (Rect class st6)
    { id: "stand-33", x: 401.1, y: 1890.6, width: 58, height: 110.7 }, // Anteriormente 32 (Rect class st9)
    { id: "stand-34", x: 401.1, y: 2009.4, width: 58.1, height: 117.8 }, // Anteriormente 33 (Rect class st2)
    { id: "stand-35", x: 401.5, y: 2135.4, width: 57.5, height: 60 }, // Anteriormente 34

    // 🔄 Stands de la Fila Inferior (Horizontal - ID 36 a 41) - ¡Nuevas Coordenadas aplicadas!
    { id: "stand-36", x: 474.7, y: 2221.4, width: 181.7, height: 58 }, // Anteriormente 35 (Rect class st7)
    { id: "stand-37", x: 672.2, y: 2221.4, width: 121.6, height: 58 }, // Anteriormente 36 (Rect class st12)
    { id: "stand-38", x: 809.7, y: 2221.4, width: 141, height: 58 }, // Anteriormente 37 (Rect class st16)
    { id: "stand-39", x: 966.6, y: 2221.4, width: 78.5, height: 58 }, // Anteriormente 38 (Rect class st11)
    { id: "stand-40", x: 1060.9, y: 2221.4, width: 78.5, height: 58 }, // Anteriormente 39 (Rect class st4)
    { id: "stand-41", x: 1155.2, y: 2221.4, width: 201.4, height: 58 }, // Anteriormente 40 (Rect class st10)

    // 🔄 Stands del Lado Derecho Inferior (Vertical - ID 42 a 46) - ¡Nuevas Coordenadas aplicadas!
    { id: "stand-42", x: 1372.3, y: 2058.1, width: 58, height: 137.3 }, // Anteriormente 41 (Rect class st17)
    { id: "stand-43", x: 1372.3, y: 1931.7, width: 58, height: 109.9 }, // Anteriormente 42 (Rect class st0)
    { id: "stand-44", x: 1372.3, y: 1735.8, width: 58, height: 179.4 }, // Anteriormente 43 (Rect class st1)
    { id: "stand-45", x: 1372.3, y: 1599.1, width: 58, height: 120.2 }, // Anteriormente 44 (Rect class st15)
    { id: "stand-46", x: 1372.3, y: 1524.7, width: 58, height: 58 }, // Anteriormente 45 (Rect class st5)

    // Stand de Pasillo (ID 47)
    { id: "stand-47", x: 510.6, y: 899.3, width: 29.7, height: 73.2 },
];

// Variable global para datos combinados
let interactiveAreasData = [];

// =======================================================
// DATOS DE LOS SERVICIOS (Solo coordenadas y nombres por defecto)
// =======================================================
// Nota: Dejé estos con nombres por defecto ya que no parecen venir del TSV.
const serviceAreasData = [
  {
    id: "mercadito-productores",
    x: 1644.7,
    y: 600.3,
    width: 1516.2,
    height: 205.4,
    name: "Mercadito de Productores",
    flag: "",
    info: "",
  },
  {
    id: "banos",
    x: 1642.4,
    y: 78.1,
    width: 647.1,
    height: 54,
    name: "Baños",
    flag: "",
    info: "",
  },
  {
    id: "escenario-gastronomico",
    x: 401.1,
    y: 1022.9,
    width: 93.1,
    height: 205.2,
    name: "Escenario Gastronómico",
    flag: "",
    info: "",
  },
  {
    id: "patio-fuegos",
    x: 637,
    y: 1870,
    width: 557.4,
    height: 75.5,
    name: "Patio de Fuegos",
    flag: "",
    info: "",
  },
  {
    id: "bomberos-1",
    x: 83.4,
    y: 218.4,
    width: 136.5,
    height: 55.9,
    name: "Bomberos",
    flag: "",
    info: "",
  },
  {
    id: "bomberos-2",
    x: 1518,
    y: 2126.6,
    width: 136.5,
    height: 55.9,
    name: "Bomberos",
    flag: "",
    info: "",
  },
  // ENFERMERÍA: Reemplaza las coordenadas del stand-3
  {
    id: "enfermeria",
    x: 491.5,
    y: 238.7,
    width: 58,
    height: 58,
    name: "Enfermería",
    flag: "",
    info: "Puesto de primeros auxilios y enfermería.",
  },
  {
    id: "escenario-cultural",
    x: 401.1,
    y: 399.8,
    width: 121.5,
    height: 269,
    name: "Escenario Cultural",
    flag: "",
    info: "",
  },
  // POLICÍA: Reemplaza las coordenadas de la antigua enfermería
  {
    id: "policia",
    x: 1529.6,
    y: 1096.2,
    width: 61.6,
    height: 61.6,
    name: "Policía",
    flag: "",
    info: "Puesto de Policía / Seguridad",
  },
  {
    id: "entrada-foodtrucks",
    x: 836.4,
    y: 1433.5,
    width: 158.6,
    height: 22.1,
    name: "Entrada Foodtrucks y Patio de Fuegos",
    flag: "",
    info: "",
  },
  {
    id: "entrada-1",
    x: 1420.9,
    y: 652,
    width: 18.8,
    height: 177.2,
    name: "Entrada",
    flag: "",
    info: "",
  },
  {
    id: "entrada-2",
    x: 3550.6,
    y: 667.6,
    width: 29.6,
    height: 134.5,
    name: "Entrada",
    flag: "",
    info: "",
  },
  {
    id: "ambulancia-1",
    x: 83.4,
    y: 149.9,
    width: 136.5,
    height: 55.9,
    name: "Ambulancia",
    flag: "",
    info: "",
  },
  {
    id: "ambulancia-2",
    x: 1518,
    y: 2058.1,
    width: 136.5,
    height: 55.9,
    name: "Ambulancia",
    flag: "",
    info: "",
  },
];

// =======================================================
// CARGA DE DATOS DESDE GOOGLE SHEETS (MODIFICADA)
// =======================================================
async function loadSpreadsheetData() {
  const TSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLiWSwNDyZPZGbzv_XDKfajzO7PBxzls54GoIb9umOKYlqZ5BG6LwdRMX7ZH76hSTN0dFWRfA_OmNr/pub?output=tsv";

  try {
    console.log("INFO: Cargando datos del spreadsheet...");
    const response = await fetch(TSV_URL);
    const tsvText = await response.text();

    // Parsear TSV
    const lines = tsvText.trim().split("\n");
    const headers = lines[0].split("\t");

    // Crear mapa de datos desde el spreadsheet
    const spreadsheetData = {};
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split("\t");
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : "";
      });

      // Usar el ID como clave
      if (row.id) {
        spreadsheetData[row.id] = row;
      }
    }

    console.log(
      "INFO: Datos cargados:",
      Object.keys(spreadsheetData).length,
      "registros"
    );

    // Combinar datos de posición con datos del spreadsheet
    interactiveAreasData = standsBaseData.map((stand) => {
      const sheetData = spreadsheetData[stand.id] || {};

      // *** CAMBIO CLAVE: Usa sheetData.code para generar la URL ***
      const flagCode = sheetData.code || sheetData.flag || "";
      const flagUrl = getFlagUrl(flagCode);

      return {
        ...stand,
        name: sheetData.name || stand.id,
        flag: flagUrl, // Ahora contiene la URL generada
        info: sheetData.info || "Información no disponible",
        menu: sheetData.menu
          ? sheetData.menu.split("|").map((item) => item.trim())
          : [],
      };
    });

    console.log("INFO: Datos combinados correctamente");
    return true;
  } catch (error) {
    console.error(
      "ERROR: No se pudieron cargar los datos del spreadsheet:",
      error
    );
    // Si falla, usar datos base con valores por defecto
    interactiveAreasData = standsBaseData.map((stand) => ({
      ...stand,
      name: stand.id,
      flag: "",
      info: "Información no disponible",
    }));
    return false;
  }
}

// =======================================================
// FUNCIONES
// =======================================================
function applyTransform() {
  container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  updateTextVisibility();

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
  const centeredPanX =
    (containerRect.width - viewboxWidth * initialZoomLevel) / 2;
  const centeredPanY =
    (containerRect.height - viewboxHeight * initialZoomLevel) / 2;
  initialPanX = centeredPanX - viewboxX * initialZoomLevel;
  initialPanY = centeredPanY - viewboxY * initialZoomLevel;
  zoomLevel = initialZoomLevel;
  panX = initialPanX;
  panY = initialPanY;
  applyTransform();
  console.log(
    "INFO: Vista inicial aplicada. Zoom:",
    zoomLevel,
    "Pan:",
    panX,
    panY
  );
}

function animateZoom(
  startZoom,
  startPanX,
  startPanY,
  endZoom,
  endPanX,
  endPanY,
  duration
) {
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
  const interactiveAreas = document.querySelectorAll(".interactive-area");
  interactiveAreas.forEach((area) => {
    if (zoomLevel > zoomThreshold) {
      area.classList.add("zoomed-in");
    } else {
      area.classList.remove("zoomed-in");
    }
  });
}

function showTooltip(area, areaElement, pinned = false) {
  hideTooltip();

  if (!area.name) return;

  tooltip = document.createElement("div");
  tooltip.textContent = area.name;
  tooltip.className = "tooltip-text";

  if (pinned) {
    tooltip.classList.add("pinned");
  }

  container.appendChild(tooltip);

  requestAnimationFrame(() => {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    const tooltipX = area.x + area.width / 2 - tooltipWidth / 2;
    const tooltipY = area.y - tooltipHeight - 8;

    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;

    tooltip.style.transform = `scale(${1 / zoomLevel})`;

    tooltip.classList.add("show");

    if (pinned) {
      tooltipTimeout = setTimeout(() => {
        hideTooltip();
      }, 3000);
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
  const areaElement = document.createElement("div");
  areaElement.id = area.id;
  areaElement.classList.add("interactive-area");

  const isService = serviceAreasData.some((service) => service.id === area.id);
  if (isService) {
    areaElement.classList.add("invisible-service");
  }

  areaElement.style.left = `${area.x}px`;
  areaElement.style.top = `${area.y}px`;
  areaElement.style.width = `${area.width}px`;
  areaElement.style.height = `${area.height}px`;

  const flagImg = document.createElement("img");
  flagImg.src = area.flag;
  flagImg.alt = ` ${area.name}`;
  flagImg.className = "stand-flag";
  flagImg.loading = "lazy";

  const nameDiv = document.createElement("div");
  nameDiv.className = "stand-name";
  nameDiv.textContent = area.name;

  areaElement.appendChild(flagImg);
  areaElement.appendChild(nameDiv);

  container.appendChild(areaElement);

  if (isService) {
    areaElement.addEventListener("mouseenter", () => {
      showTooltip(area, areaElement);
    });
    areaElement.addEventListener("mouseleave", () => {
      hideTooltip();
    });
    areaElement.addEventListener("click", (e) => {
      e.stopPropagation();
      showTooltip(area, areaElement, true);
    });
    areaElement.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
        showTooltip(area, areaElement, true);
      },
      {
        passive: false,
      }
    );
  } else {
    areaElement.addEventListener("click", (e) => {
      e.stopPropagation();
      showModal(area);
    });
  }
}

function showModal(area) {
  modalTitle.textContent = area.name;
  modalFlag.src = area.flag;
  modalFlag.alt = `Bandera de ${area.name}`;
  modalInfo.textContent = area.info || "Información no disponible";

  modalMenu.innerHTML = "";
  if (area.menu && area.menu.length > 0) {
    area.menu.forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = item;
      li.appendChild(link);
      modalMenu.appendChild(li);
    });
  }

  modal.classList.add("show");
  modal.style.display = "flex";
}

function hideModal() {
  modal.classList.remove("show");
}

// =======================================================
// GESTIÓN DE EVENTOS
// =======================================================

zoomInBtn.addEventListener("click", () => {
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  const containerRect = interactiveContainer.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  const zoomFactor = 1.2;
  const targetZoom = Math.max(
    minZoomLevel,
    Math.min(zoomLevel * zoomFactor, 12)
  );
  const mapX = (centerX - oldPanX) / oldZoomLevel;
  const mapY = (centerY - oldPanY) / oldZoomLevel;
  const targetPanX = centerX - mapX * targetZoom;
  const targetPanY = centerY - mapY * targetZoom;
  animateZoom(
    oldZoomLevel,
    oldPanX,
    oldPanY,
    targetZoom,
    targetPanX,
    targetPanY,
    350
  );
  hideTooltip();
});

zoomOutBtn.addEventListener("click", () => {
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  const containerRect = interactiveContainer.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  const zoomFactor = 0.8;
  const targetZoom = Math.max(
    minZoomLevel,
    Math.min(zoomLevel * zoomFactor, 12)
  );
  const mapX = (centerX - oldPanX) / oldZoomLevel;
  const mapY = (centerY - oldPanY) / oldZoomLevel;
  const targetPanX = centerX - mapX * targetZoom;
  const targetPanY = centerY - mapY * targetZoom;
  animateZoom(
    oldZoomLevel,
    oldPanX,
    oldPanY,
    targetZoom,
    targetPanX,
    targetPanY,
    350
  );
  hideTooltip();
});

resetViewBtn.addEventListener("click", () => {
  if (isZoomAnimating && animationFrame) {
    cancelAnimationFrame(animationFrame);
    isZoomAnimating = false;
    animationFrame = null;
  }
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  animateZoom(
    oldZoomLevel,
    oldPanX,
    oldPanY,
    initialZoomLevel,
    initialPanX,
    initialPanY,
    500
  );
  hideTooltip();
});

if (closeBtn) {
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hideModal();
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      e.stopPropagation();
      hideModal();
    }
  });
}

window.onclick = (e) => {
  if (e.target === modal) hideModal();
  hideTooltip();
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") hideModal();
});

container.addEventListener("dblclick", (e) => {
  e.preventDefault();
  const oldZoomLevel = zoomLevel;
  const oldPanX = panX;
  const oldPanY = panY;
  animateZoom(
    oldZoomLevel,
    oldPanX,
    oldPanY,
    initialZoomLevel,
    initialPanX,
    initialPanY,
    500
  );
  hideTooltip();
});

container.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    if (isZoomAnimating && animationFrame) {
      cancelAnimationFrame(animationFrame);
      isZoomAnimating = false;
      animationFrame = null;
    }
    isPanning = true;
    container.style.cursor = "grabbing";
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    e.preventDefault();
    console.log("PAN: Mousedown detectado. Iniciando paneo.");
    hideTooltip();
  }
});

window.addEventListener("mouseup", () => {
  isPanning = false;
  container.style.cursor = "grab";
  console.log("PAN: Mouseup detectado. Finalizando paneo.");
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning || isZoomAnimating) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
  hideTooltip();
});

container.addEventListener("wheel", (e) => {
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
  animateZoom(
    oldZoomLevel,
    oldPanX,
    oldPanY,
    targetZoom,
    targetPanX,
    targetPanY,
    350
  );
  hideTooltip();
});

interactiveContainer.addEventListener(
  "touchstart",
  (e) => {
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
      initialPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialZoom = zoomLevel;
      console.log(
        "TOUCH: Touchstart detectado (2 dedos). Iniciando pinch-zoom."
      );
    }
  },
  { passive: true }
);

interactiveContainer.addEventListener(
  "touchmove",
  (e) => {
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
      const currentPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

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
  },
  { passive: false }
);

interactiveContainer.addEventListener(
  "touchend",
  (e) => {
    const touchDuration = Date.now() - touchStartTime;
    const currentTime = Date.now();
    console.log(
      `TOUCH: Touchend detectado. Duración: ${touchDuration}ms, Movimiento: ${hasMoved}`
    );

    if (e.touches.length === 1 && isMultiTouch) {
      const touch = e.touches[0];
      startX = touch.clientX - panX;
      startY = touch.clientY - panY;

      isMultiTouch = false;
      initialPinchDistance = 0;
      initialZoom = zoomLevel;
      console.log(
        "TOUCH: Se finalizó pinch-zoom. Preparando para un solo toque."
      );
      return;
    }

    if (
      !hasMoved &&
      !isMultiTouch &&
      touchDuration < 500 &&
      e.changedTouches.length === 1
    ) {
      const touch = e.changedTouches[0];

      console.log(
        `TOUCH: Posible toque detectado en X:${touch.clientX}, Y:${touch.clientY}`
      );

      if (currentTime - lastTapTime < 300) {
        console.log("TOUCH: Doble toque detectado. Restableciendo la vista.");
        const oldZoomLevel = zoomLevel;
        const oldPanX = panX;
        const oldPanY = panY;
        animateZoom(
          oldZoomLevel,
          oldPanX,
          oldPanY,
          initialZoomLevel,
          initialPanX,
          initialPanY,
          500
        );
        lastTapTime = 0;
        hideTooltip();
      } else {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
          const standElement = element.closest(".interactive-area");
          if (standElement) {
            const standId = standElement.id;
            const standData = interactiveAreasData
              .concat(serviceAreasData)
              .find((area) => area.id === standId);
            if (standData) {
              const isService = serviceAreasData.some(
                (service) => service.id === standId
              );
              if (isService) {
                showTooltip(standData, standElement, true);
              } else {
                showModal(standData);
              }
            }
          } else {
            console.log("TOUCH: No se encontró un stand en el punto de toque.");
          }
        } else {
          console.log(
            "TOUCH: No se encontró ningún elemento en el punto de toque."
          );
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
  },
  { passive: true }
);

// =======================================================
// INICIALIZACIÓN
// =======================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Cargar datos del spreadsheet
  await loadSpreadsheetData();

  // Crear áreas interactivas con datos combinados
  const allAreasData = interactiveAreasData.concat(serviceAreasData);
  allAreasData.forEach(createInteractiveArea);

  setTimeout(() => {
    setInitialView();
  }, 100);

  if (isMobileDevice()) {
    if (instructionsMobile) instructionsMobile.style.display = "block";
    if (instructionsPC) instructionsPC.style.display = "none";
  } else {
    if (instructionsMobile) instructionsMobile.style.display = "none";
    if (instructionsPC) instructionsPC.style.display = "block";
  }
});

window.addEventListener("resize", () => {
  setInitialView();
});
