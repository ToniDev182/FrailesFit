 // Inicializar el mapa centrado en Baeza
 var map = L.map('map').setView([37.993693, -3.468119], 14);

 // Cargar el mapa de OpenStreetMap
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '&copy; OpenStreetMap contributors'
 }).addTo(map);

 // Contenido del popup con imagen, mensaje y enlace
 var popupContent = `
     <div style="text-align:center;">
         <h3>Baeza</h3>
         <img src="./build/img/coop27.jpg" alt="Catedral de Baeza" style="width:100%; max-width:250px; border-radius:8px;">
         <p>Ciudad Patrimonio de la Humanidad, famosa por su historia y arquitectura renacentista.</p>
         <a href="https://es.wikipedia.org/wiki/Baeza" target="_blank" 
            style="display:inline-block; padding:6px 12px; background:#007BFF; color:white; text-decoration:none; border-radius:4px;">
            Más información
         </a>
     </div>
 `;
 // Agregar un marcador en Baeza con el popup personalizado
 L.marker([37.993693, -3.468119]).addTo(map)
     .bindPopup(popupContent)
     .openPopup();

