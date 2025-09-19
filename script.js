const container = document.querySelector('.container');
const modal = document.getElementById('infoModal');
const closeBtn = document.querySelector('.close-btn');
const modalFlag = document.getElementById('modalFlag');
const modalTitle = document.getElementById('modalTitle');
const modalMenu = document.getElementById('modalMenu');
const modalInfo = document.getElementById('modalInfo');

// =======================================================
// FUNCIONALIDAD: ZOOM Y NAVEGACIÓN MEJORADA
// =======================================================
let isPanning = false;
let startX = 0;
let startY = 0;
let panX = 0;
let panY = 0;
let zoomLevel = 1;

// Variables para soporte táctil
let initialPinchDistance = 0;
let initialZoom = 1;
let touchStartPanX = 0;
let touchStartPanY = 0;

// Variables para animación de zoom
let isZoomAnimating = false;
let animationFrame = null;

// Selecciona todos los nombres de los stands para la funcionalidad de texto dinámico
const standNames = document.querySelectorAll('.stand-name');

// Inicializar la posición del contenedor al cargar
let initialRect = null;
document.addEventListener('DOMContentLoaded', () => {
    initialRect = container.getBoundingClientRect();
    applyTransform();
});

function applyTransform() {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    updateTextVisibility();
}

// Función para animar zoom suavemente usando requestAnimationFrame
function animateZoom(targetZoom, targetPanX, targetPanY, duration = 200) {
    if (isZoomAnimating && animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    const startZoom = zoomLevel;
    const startPanXValue = panX;
    const startPanYValue = panY;
    const startTime = performance.now();
    
    isZoomAnimating = true;
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Función de easing suave
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolar valores
        zoomLevel = startZoom + (targetZoom - startZoom) * easeProgress;
        panX = startPanXValue + (targetPanX - startPanXValue) * easeProgress;
        panY = startPanYValue + (targetPanY - startPanYValue) * easeProgress;
        
        applyTransform();
        
        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            isZoomAnimating = false;
            animationFrame = null;
            // Asegurar valores finales exactos
            zoomLevel = targetZoom;
            panX = targetPanX;
            panY = targetPanY;
            applyTransform();
        }
    }
    
    animationFrame = requestAnimationFrame(animate);
}

// Eventos para mouse (PC)
container.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Solo botón izquierdo
        // Cancelar animación si está en curso
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
    e.preventDefault(); // Evita el scroll de la página

    const zoomSpeed = 0.5;
    const oldZoomLevel = zoomLevel;

    // Actualizar el nivel de zoom
    if (e.deltaY < 0) {
        zoomLevel += zoomSpeed;
    } else {
        zoomLevel -= zoomSpeed;
    }

    // Limitar el nivel de zoom
    zoomLevel = Math.max(1, Math.min(zoomLevel, 12));

    // Usar la posición inicial del contenedor
    const cursorX = e.clientX - initialRect.left;
    const cursorY = e.clientY - initialRect.top;

    // Calcular el punto en el espacio del mapa antes del zoom
    const mapX = (cursorX - panX) / oldZoomLevel;
    const mapY = (cursorY - panY) / oldZoomLevel;

    // Calcular el nuevo pan para mantener el punto bajo el cursor
    panX = cursorX - mapX * zoomLevel;
    panY = cursorY - mapY * zoomLevel;

    // Logs detallados para depuración
    console.log({
        eventClientX: e.clientX,
        eventClientY: e.clientY,
        initialRectLeft: initialRect.left,
        initialRectTop: initialRect.top,
        rectWidth: initialRect.width,
        rectHeight: initialRect.height,
        cursorX: cursorX,
        cursorY: cursorY,
        mapX: mapX,
        mapY: mapY,
        oldZoomLevel: oldZoomLevel,
        zoomLevel: zoomLevel,
        panX: panX,
        panY: panY
    });

    // Usar animación suave para el zoom
    animateZoom(zoomLevel, panX, panY, 200);
}, { passive: false });

// =======================================================
// SOPORTE TÁCTIL MEJORADO
// =======================================================

// Función para calcular distancia entre dos puntos táctiles
function getDistance(touch1, touch2) {
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
}

// Función para obtener el punto medio entre dos toques
function getMidpoint(touch1, touch2) {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}

container.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // Cancelar animación si está en curso
        if (isZoomAnimating && animationFrame) {
            cancelAnimationFrame(animationFrame);
            isZoomAnimating = false;
            animationFrame = null;
        }
        
        // Un dedo: pan
        isPanning = true;
        const touch = e.touches[0];
        startX = touch.clientX - panX;
        startY = touch.clientY - panY;
        touchStartPanX = panX;
        touchStartPanY = panY;
    } else if (e.touches.length === 2) {
        // Dos dedos: zoom
        isPanning = false;
        initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
        initialZoom = zoomLevel;
    }
}, { passive: false });

container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isPanning && !isZoomAnimating) {
        // Pan con un dedo
        const touch = e.touches[0];
        panX = touch.clientX - startX;
        panY = touch.clientY - startY;
        applyTransform();
    } else if (e.touches.length === 2) {
        // Zoom con dos dedos
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const zoomFactor = currentDistance / initialPinchDistance;
        const newZoom = Math.max(1, Math.min(initialZoom * zoomFactor, 12));
        
        // Obtener punto medio para zoom
        const midpoint = getMidpoint(e.touches[0], e.touches[1]);
        
        // Usar la posición inicial del contenedor
        const cursorX = midpoint.x - initialRect.left;
        const cursorY = midpoint.y - initialRect.top;
        
        // Calcular la posición del punto bajo el punto medio antes del zoom
        const pointX = (cursorX - touchStartPanX) / initialZoom;
        const pointY = (cursorY - touchStartPanY) / initialZoom;
        
        // Calcular nueva posición de pan
        panX = cursorX - pointX * newZoom;
        panY = cursorY - pointY * newZoom;
        zoomLevel = newZoom;
        
        applyTransform();
    }
}, { passive: false });

container.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 0) {
        isPanning = false;
    } else if (e.touches.length === 1) {
        // Cambiar de zoom a pan
        isPanning = true;
        const touch = e.touches[0];
        startX = touch.clientX - panX;
        startY = touch.clientY - panY;
        touchStartPanX = panX;
        touchStartPanY = panY;
    }
}, { passive: false });

// Función para mostrar u ocultar el texto y animar la bandera según el zoom
function updateTextVisibility() {
    const zoomThreshold = 1.2; // Reducir umbral para mostrar nombres antes
    
    // Iteramos sobre todos los stands para aplicar la clase
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
// FIN DE LA FUNCIONALIDAD DE ZOOM Y NAVEGACIÓN
// =======================================================

const interactiveAreasData = [
    { id: 'stand-1', type: 'stand', name: 'Italia', flag: 'https://flagpedia.net/data/flags/w580/it.png', menu: ['Pasta', 'Ópera', 'Arte'] },
    { id: 'stand-2', type: 'stand', name: 'Argentina', flag: 'https://flagpedia.net/data/flags/w580/ar.png', menu: ['Asado', 'Tango', 'Vino'] },
    { id: 'stand-3', type: 'stand', name: 'Japón', flag: 'https://flagpedia.net/data/flags/w580/jp.png', menu: ['Sushi', 'Manga', 'Tecnología'] },
    { id: 'stand-4', type: 'stand', name: 'Brasil', flag: 'https://flagpedia.net/data/flags/w580/br.png', menu: ['Feijoada', 'Samba', 'Fútbol'] },
    { id: 'stand-5', type: 'stand', name: 'México', flag: 'https://flagpedia.net/data/flags/w580/mx.png', menu: ['Tacos', 'Mariachi', 'Cultura Maya'] },
    { id: 'stand-6', type: 'stand', name: 'Francia', flag: 'https://flagpedia.net/data/flags/w580/fr.png', menu: ['Croissants', 'Moda', 'Torre Eiffel'] },
    { id: 'stand-7', type: 'stand', name: 'España', flag: 'https://flagpedia.net/data/flags/w580/es.png', menu: ['Paella', 'Flamenco', 'Tapas'] },
    { id: 'stand-8', type: 'stand', name: 'Grecia', flag: 'https://flagpedia.net/data/flags/w580/gr.png', menu: ['Moussaka', 'Mitología', 'Olímpicos'] },
    { id: 'stand-9', type: 'stand', name: 'Alemania', flag: 'https://flagpedia.net/data/flags/w580/de.png', menu: ['Bratwurst', 'Cerveza', 'Autos'] },
    { id: 'stand-10', type: 'stand', name: 'Irlanda', flag: 'https://flagpedia.net/data/flags/w580/ie.png', menu: ['Irish Stew', 'Música Celta', 'San Patricio'] },
    { id: 'stand-11', type: 'stand', name: 'Canadá', flag: 'https://flagpedia.net/data/flags/w580/ca.png', menu: ['Poutine', 'Jarabe de Arce', 'Hockey'] },
    { id: 'stand-12', type: 'stand', name: 'Reino Unido', flag: 'https://flagpedia.net/data/flags/w580/gb.png', menu: ['Fish & Chips', 'Té', 'Realeza'] },
    { id: 'stand-13', type: 'stand', name: 'Estados Unidos', flag: 'https://flagpedia.net/data/flags/w580/us.png', menu: ['Hamburguesas', 'Jazz', 'Hollywood'] },
    { id: 'stand-14', type: 'stand', name: 'China', flag: 'https://flagpedia.net/data/flags/w580/cn.png', menu: ['Dim Sum', 'Ópera', 'Muralla China'] },
    { id: 'stand-15', type: 'stand', name: 'India', flag: 'https://flagpedia.net/data/flags/w580/in.png', menu: ['Curry', 'Bollywood', 'Yoga'] },
    { id: 'stand-16', type: 'stand', name: 'Egipto', flag: 'https://flagpedia.net/data/flags/w580/eg.png', menu: ['Koshari', 'Pirámides', 'Faraones'] },
    { id: 'stand-17', type: 'stand', name: 'Rusia', flag: 'https://flagpedia.net/data/flags/w580/ru.png', menu: ['Borscht', 'Ballet', 'Literatura'] },
    { id: 'stand-18', type: 'stand', name: 'Turquía', flag: 'https://flagpedia.net/data/flags/w580/tr.png', menu: ['Kebabs', 'Hagia Sophia', 'Bazar'] },
    { id: 'stand-19', type: 'stand', name: 'Etiopía', flag: 'https://flagpedia.net/data/flags/w580/et.png', menu: ['Injera', 'Café', 'Historia'] },
    { id: 'stand-20', type: 'stand', name: 'Sudáfrica', flag: 'https://flagpedia.net/data/flags/w580/za.png', menu: ['Braai', 'Safari', 'Naturaleza'] },
    { id: 'stand-21', type: 'stand', name: 'Australia', flag: 'https://flagpedia.net/data/flags/w580/au.png', menu: ['Meat Pie', 'Canguros', 'Ópera de Sídney'] },
    { id: 'stand-22', type: 'stand', name: 'Perú', flag: 'https://flagpedia.net/data/flags/w580/pe.png', menu: ['Ceviche', 'Música Andina', 'Machu Picchu'] },
    { id: 'stand-23', type: 'stand', name: 'Colombia', flag: 'https://flagpedia.net/data/flags/w580/co.png', menu: ['Arepas', 'Vallenato', 'Café'] },
    { id: 'stand-24', type: 'stand', name: 'Chile', flag: 'https://flagpedia.net/data/flags/w580/cl.png', menu: ['Empanadas', 'Vino', 'Naturaleza Extrema'] },
    { id: 'stand-25', type: 'stand', name: 'Uruguay', flag: 'https://flagpedia.net/data/flags/w580/uy.png', menu: ['Chivito', 'Candombe', 'Mate'] },
    { id: 'stand-26', type: 'stand', name: 'Venezuela', flag: 'https://flagpedia.net/data/flags/w580/ve.png', menu: ['Arepa', 'Joropo', 'Petróleo'] },
    { id: 'stand-27', type: 'stand', name: 'Cuba', flag: 'https://flagpedia.net/data/flags/w580/cu.png', menu: ['Ropa Vieja', 'Salsa', 'Coches Clásicos'] },
    { id: 'stand-28', type: 'stand', name: 'Panamá', flag: 'https://flagpedia.net/data/flags/w580/pa.png', menu: ['Sancocho', 'Cumbia', 'Canal'] },
    { id: 'stand-29', type: 'stand', name: 'Noruega', flag: 'https://flagpedia.net/data/flags/w580/no.png', menu: ['Salmón', 'Fiordos', 'Aurora Boreal'] },
    { id: 'stand-30', type: 'stand', name: 'Suecia', flag: 'https://flagpedia.net/data/flags/w580/se.png', menu: ['Albóndigas', 'ABBA', 'Diseño'] },
    { id: 'stand-31', type: 'stand', name: 'Finlandia', flag: 'https://flagpedia.net/data/flags/w580/fi.png', menu: ['Karjalanpiirakka', 'Sauna', 'Nokia'] },
    { id: 'stand-32', type: 'stand', name: 'Polonia', flag: 'https://flagpedia.net/data/flags/w580/pl.png', menu: ['Pierogi', 'Polka', 'Historia'] },
    { id: 'stand-33', type: 'stand', name: 'Marruecos', flag: 'https://flagpedia.net/data/flags/w580/ma.png', menu: ['Tagine', 'Gnawa', 'Té de Menta'] },
    { id: 'stand-34', type: 'stand', name: 'Líbano', flag: 'https://flagpedia.net/data/flags/w580/lb.png', menu: ['Hummus', 'Dabke', 'Baklava'] },
    { id: 'stand-35', type: 'stand', name: 'Siria', flag: 'https://flagpedia.net/data/flags/w580/sy.png', menu: ['Kibbeh', 'Música Árabe', 'Arte'] },
    { id: 'stand-36', type: 'stand', name: 'Israel', flag: 'https://flagpedia.net/data/flags/w580/il.png', menu: ['Falafel', 'Hora', 'Tecnología'] },
    { id: 'stand-37', type: 'stand', name: 'Portugal', flag: 'https://flagpedia.net/data/flags/w580/pt.png', menu: ['Bacalhau', 'Fado', 'Pasteles de Nata'] },
    { id: 'stand-38', type: 'stand', name: 'Suiza', flag: 'https://flagpedia.net/data/flags/w580/ch.png', menu: ['Fondue', 'Alpino', 'Relojes'] },
    { id: 'stand-39', type: 'stand', name: 'Austria', flag: 'https://flagpedia.net/data/flags/w580/at.png', menu: ['Schnitzel', 'Vals', 'Mozart'] },
    { id: 'stand-40', type: 'stand', name: 'Rep. Checa', flag: 'https://flagpedia.net/data/flags/w580/cz.png', menu: ['Goulash', 'Cerveza', 'Praga'] },
    { id: 'stand-41', type: 'stand', name: 'Paraguay', flag: 'https://flagpedia.net/data/flags/w580/py.png', menu: ['Sopa', 'Polka', 'Guaraní'] },
    { id: 'stand-42', type: 'stand', name: 'Bolivia', flag: 'https://flagpedia.net/data/flags/w580/bo.png', menu: ['Salteñas', 'Charango', 'Andes'] },
    { id: 'stand-43', type: 'stand', name: 'Ecuador', flag: 'https://flagpedia.net/data/flags/w580/ec.png', menu: ['Ceviche', 'Pasillo', 'Galápagos'] }
];

function createInteractiveArea(area) {
    const areaElement = document.createElement('div');
    areaElement.id = area.id;
    areaElement.classList.add('interactive-area', 'stand');
    
    const flagImg = document.createElement('img');
    flagImg.src = area.flag;
    flagImg.alt = `Bandera de ${area.name}`;
    flagImg.className = 'stand-flag';
    flagImg.onerror = function() {
        this.style.display = 'none';
    };
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'stand-name';
    nameDiv.textContent = area.name;
    
    areaElement.appendChild(flagImg);
    areaElement.appendChild(nameDiv);
    
    areaElement.onclick = (e) => {
        e.stopPropagation();
        showModal(area);
    };
    
    container.appendChild(areaElement);
}

// Crear solo los stands
interactiveAreasData.forEach(createInteractiveArea);

function showModal(area) {
    modalTitle.textContent = area.name;
    modalFlag.src = area.flag;
    modalFlag.alt = `Bandera de ${area.name}`;
    modalFlag.style.display = 'block';
    modalInfo.style.display = 'none';

    modalMenu.innerHTML = '';
    area.menu.forEach(item => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = item;
        link.onclick = (e) => {
            e.preventDefault();
        };
        listItem.appendChild(link);
        modalMenu.appendChild(listItem);
    });
    modalMenu.style.display = 'block';
    modal.style.display = 'flex';
}

function hideModal() {
    modal.style.display = 'none';
}

closeBtn.onclick = hideModal;

window.onclick = function(event) {
    if (event.target === modal) {
        hideModal();
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        hideModal();
    }
});

// Inicializar estado
applyTransform();