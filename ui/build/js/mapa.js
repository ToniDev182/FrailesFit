// Función para cargar la API de Google Maps
async function loadGoogleMapsAPI() {
    try {
        // Hacer la solicitud al backend para obtener la clave de la API
        const response = await fetch('http://localhost:3000/api/google-maps-key');
        
        if (!response.ok) {
            throw new Error('Error al obtener la clave de la API.');
        }

        const data = await response.json();
        const apiKey = data.apiKey;

        // Cargar el script de la API de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // Asegurarse de que la función initMap esté definida para ser llamada cuando se cargue el script
        script.onload = () => {
            console.log('Google Maps API cargada correctamente');
            // Llamar a la función initMap una vez que la API está lista
            initMap("mapa", { lat: 37.4849812434942, lng: -3.835837184015876 },
                "Pista de Pádel - FrailesFit", "https://i.postimg.cc/d3b7L4N6/padel3.avif");
            initMap("mapa2", { lat: 37.48620759682936, lng: -3.8368328642593856 },
                "Pabellón Municipal - FrailesFit", "https://i.postimg.cc/V6H0cYj3/pabellon4.avif");
            initMap("mapa3", { lat: 37.48639017941614, lng: -3.8389264403327514 },
                "FrailesFit", "https://i.postimg.cc/MHS2HBbR/entrada2.avif");
        };

        script.onerror = (error) => {
            console.error('Error al cargar la API de Google Maps:', error);
        };

    } catch (error) {
        console.error('Error al obtener la clave de la API:', error);
    }
}

// Función para inicializar el mapa
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

// Llamar a la función para cargar la API de Google Maps
loadGoogleMapsAPI();
