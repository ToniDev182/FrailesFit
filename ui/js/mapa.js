function initMap(idMapa, ubicacion, titulo, imagen) {
    const mapaDiv = document.getElementById(idMapa);

    if (!mapaDiv) {
        console.warn(`El contenedor del mapa "${idMapa}" no existe en el DOM.`);
        return;
    }

    const map = new google.maps.Map(mapaDiv, {
        center: ubicacion,
        zoom: 17,
    });

    const marker = new google.maps.Marker({
        position: ubicacion,
        map: map,
        title: titulo,
        icon: `http://maps.google.com/mapfiles/ms/icons/green-dot.png`,
    });

    const infowindowContent = `
        <div style="text-align: center;">
            <h6>${titulo}</h6>
            <img src="${imagen}" 
                alt="${titulo}" 
                style="width:100px; height:auto; border-radius: 8px;">
        </div>
    `;

    const infowindow = new google.maps.InfoWindow({
        content: infowindowContent,
    });

    infowindow.open(map, marker);

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });
}

// Esperamos un poco para asegurarnos de que los contenedores del mapa existen en el DOM ya que estamos tenemos el codigo separado por componentes 
setTimeout(function () {

    /* Pista de Pádel */
    initMap("mapa", { lat: 37.4849812434942, lng: -3.835837184015876 },
        "Pista de Pádel - FrailesFit", "/ui/build/img/instalaciones/padel3.avif");

    /* Pabellón Municipal */
    initMap("mapa2", { lat: 37.48620759682936, lng: -3.8368328642593856 },
        "Pabellón Municipal - FrailesFit", "/ui/build/img/instalaciones/pabellon4.avif");

    // Mapa 3 - Nueva ubicación
    initMap("mapa3", { lat: 37.48639017941614, lng: -3.8389264403327514 },
        "FrailesFit", "/ui/build/img/entrada2.avif");

}, 200);




