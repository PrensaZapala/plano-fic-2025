const container = document.querySelector('.container');
const modal = document.getElementById('infoModal');
const closeBtn = document.querySelector('.close-btn');
const modalFlag = document.getElementById('modalFlag');
const modalTitle = document.getElementById('modalTitle');
const modalMenu = document.getElementById('modalMenu');
const modalInfo = document.getElementById('modalInfo');

const interactiveAreasData = [
    // Stands con banderas y nombres
    { id: 'stand-1', type: 'stand', name: 'Italia', flag: 'https://flagpedia.net/data/flags/w580/it.png', menu: ['Pasta Italiana', 'Opera', 'Arte Renacentista'] },
    { id: 'stand-2', type: 'stand', name: 'Argentina', flag: 'https://flagpedia.net/data/flags/w580/ar.png', menu: ['Asado', 'Tango', 'Folklore'] },
    { id: 'stand-3', type: 'stand', name: 'Japón', flag: 'https://flagpedia.net/data/flags/w580/jp.png', menu: ['Sushi', 'Manga', 'Ceremonia del Té'] },
    { id: 'stand-4', type: 'stand', name: 'Brasil', flag: 'https://flagpedia.net/data/flags/w580/br.png', menu: ['Feijoada', 'Samba', 'Carnaval'] },
    { id: 'stand-5', type: 'stand', name: 'México', flag: 'https://flagpedia.net/data/flags/w580/mx.png', menu: ['Tacos', 'Mariachi', 'Día de Muertos'] },
    { id: 'stand-6', type: 'stand', name: 'Francia', flag: 'https://flagpedia.net/data/flags/w580/fr.png', menu: ['Croissants', 'Chanson', 'Vino Francés'] },
    { id: 'stand-7', type: 'stand', name: 'España', flag: 'https://flagpedia.net/data/flags/w580/es.png', menu: ['Paella', 'Flamenco', 'Tapas'] },
    { id: 'stand-8', type: 'stand', name: 'Grecia', flag: 'https://flagpedia.net/data/flags/w580/gr.png', menu: ['Moussaka', 'Mitología', 'Danza Griega'] },
    { id: 'stand-9', type: 'stand', name: 'Alemania', flag: 'https://flagpedia.net/data/flags/w580/de.png', menu: ['Bratwurst', 'Oktoberfest', 'Música Clásica'] },
    { id: 'stand-10', type: 'stand', name: 'Irlanda', flag: 'https://flagpedia.net/data/flags/w580/ie.png', menu: ['Irish Stew', 'Música Celta', 'San Patricio'] },
    { id: 'stand-11', type: 'stand', name: 'Canadá', flag: 'https://flagpedia.net/data/flags/w580/ca.png', menu: ['Poutine', 'Jarabe de Arce', 'Hockey'] },
    { id: 'stand-12', type: 'stand', name: 'Reino Unido', flag: 'https://flagpedia.net/data/flags/w580/gb.png', menu: ['Fish & Chips', 'Té Inglés', 'Rock Británico'] },
    { id: 'stand-13', type: 'stand', name: 'Estados Unidos', flag: 'https://flagpedia.net/data/flags/w580/us.png', menu: ['Hamburguesas', 'Jazz', 'Hollywood'] },
    { id: 'stand-14', type: 'stand', name: 'China', flag: 'https://flagpedia.net/data/flags/w580/cn.png', menu: ['Dim Sum', 'Ópera China', 'Kung Fu'] },
    { id: 'stand-15', type: 'stand', name: 'India', flag: 'https://flagpedia.net/data/flags/w580/in.png', menu: ['Curry', 'Bollywood', 'Yoga'] },
    { id: 'stand-16', type: 'stand', name: 'Egipto', flag: 'https://flagpedia.net/data/flags/w580/eg.png', menu: ['Koshari', 'Pirámides', 'Danza del Vientre'] },
    { id: 'stand-17', type: 'stand', name: 'Rusia', flag: 'https://flagpedia.net/data/flags/w580/ru.png', menu: ['Borscht', 'Ballet', 'Literatura'] },
    { id: 'stand-18', type: 'stand', name: 'Turquía', flag: 'https://flagpedia.net/data/flags/w580/tr.png', menu: ['Kebabs', 'Té Turco', 'Danza Folclórica'] },
    { id: 'stand-19', type: 'stand', name: 'Etiopía', flag: 'https://flagpedia.net/data/flags/w580/et.png', menu: ['Injera', 'Café Etíope', 'Música Tradicional'] },
    { id: 'stand-20', type: 'stand', name: 'Sudáfrica', flag: 'https://flagpedia.net/data/flags/w580/za.png', menu: ['Braai', 'Ubuntu', 'Safari'] },
    { id: 'stand-21', type: 'stand', name: 'Australia', flag: 'https://flagpedia.net/data/flags/w580/au.png', menu: ['Meat Pie', 'Didgeridoo', 'Surf'] },
    { id: 'stand-22', type: 'stand', name: 'Perú', flag: 'https://flagpedia.net/data/flags/w580/pe.png', menu: ['Ceviche', 'Música Andina', 'Machu Picchu'] },
    { id: 'stand-23', type: 'stand', name: 'Colombia', flag: 'https://flagpedia.net/data/flags/w580/co.png', menu: ['Arepas', 'Vallenato', 'Café Colombiano'] },
    { id: 'stand-24', type: 'stand', name: 'Chile', flag: 'https://flagpedia.net/data/flags/w580/cl.png', menu: ['Empanadas', 'Cueca', 'Vino Chileno'] },
    { id: 'stand-25', type: 'stand', name: 'Uruguay', flag: 'https://flagpedia.net/data/flags/w580/uy.png', menu: ['Chivito', 'Candombe', 'Mate'] },
    { id: 'stand-26', type: 'stand', name: 'Venezuela', flag: 'https://flagpedia.net/data/flags/w580/ve.png', menu: ['Arepa', 'Joropo', 'Pabellón'] },
    { id: 'stand-27', type: 'stand', name: 'Cuba', flag: 'https://flagpedia.net/data/flags/w580/cu.png', menu: ['Ropa Vieja', 'Salsa', 'Habanos'] },
    { id: 'stand-28', type: 'stand', name: 'Panamá', flag: 'https://flagpedia.net/data/flags/w580/pa.png', menu: ['Sancocho', 'Cumbia', 'Canal de Panamá'] },
    { id: 'stand-29', type: 'stand', name: 'Noruega', flag: 'https://flagpedia.net/data/flags/w580/no.png', menu: ['Salmón', 'Fiordos', 'Aurora Boreal'] },
    { id: 'stand-30', type: 'stand', name: 'Suecia', flag: 'https://flagpedia.net/data/flags/w580/se.png', menu: ['Albóndigas', 'ABBA', 'Midsommar'] },
    { id: 'stand-31', type: 'stand', name: 'Finlandia', flag: 'https://flagpedia.net/data/flags/w580/fi.png', menu: ['Karjalanpiirakka', 'Sauna', 'Nokia'] },
    { id: 'stand-32', type: 'stand', name: 'Polonia', flag: 'https://flagpedia.net/data/flags/w580/pl.png', menu: ['Pierogi', 'Polka', 'Chopin'] },
    { id: 'stand-33', type: 'stand', name: 'Marruecos', flag: 'https://flagpedia.net/data/flags/w580/ma.png', menu: ['Tagine', 'Gnawa', 'Té de Menta'] },
    { id: 'stand-34', type: 'stand', name: 'Líbano', flag: 'https://flagpedia.net/data/flags/w580/lb.png', menu: ['Hummus', 'Dabke', 'Baklava'] },
    { id: 'stand-35', type: 'stand', name: 'Siria', flag: 'https://flagpedia.net/data/flags/w580/sy.png', menu: ['Kibbeh', 'Música Árabe', 'Arte Islámico'] },
    { id: 'stand-36', type: 'stand', name: 'Israel', flag: 'https://flagpedia.net/data/flags/w580/il.png', menu: ['Falafel', 'Hora', 'Tecnología'] },
    { id: 'stand-37', type: 'stand', name: 'Portugal', flag: 'https://flagpedia.net/data/flags/w580/pt.png', menu: ['Bacalhau', 'Fado', 'Pasteles de Nata'] },
    { id: 'stand-38', type: 'stand', name: 'Suiza', flag: 'https://flagpedia.net/data/flags/w580/ch.png', menu: ['Fondue', 'Alphorn', 'Relojes'] },
    { id: 'stand-39', type: 'stand', name: 'Austria', flag: 'https://flagpedia.net/data/flags/w580/at.png', menu: ['Schnitzel', 'Vals Vienés', 'Mozart'] },
    { id: 'stand-40', type: 'stand', name: 'Rep. Checa', flag: 'https://flagpedia.net/data/flags/w580/cz.png', menu: ['Goulash', 'Cerveza Pilsner', 'Praga'] },
    { id: 'stand-41', type: 'stand', name: 'Paraguay', flag: 'https://flagpedia.net/data/flags/w580/py.png', menu: ['Sopa Paraguaya', 'Polka', 'Guaraní'] },
    { id: 'stand-42', type: 'stand', name: 'Bolivia', flag: 'https://flagpedia.net/data/flags/w580/bo.png', menu: ['Salteñas', 'Carnaval de Oruro', 'Charango'] },
    { id: 'stand-43', type: 'stand', name: 'Ecuador', flag: 'https://flagpedia.net/data/flags/w580/ec.png', menu: ['Ceviche', 'Pasillo', 'Galápagos'] }
];

function createInteractiveArea(area) {
    const areaElement = document.createElement('div');
    areaElement.id = area.id;
    areaElement.classList.add('interactive-area');

    if (area.type === 'stand') {
        areaElement.classList.add('stand');
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
    }
    
    areaElement.onclick = () => showModal(area);
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