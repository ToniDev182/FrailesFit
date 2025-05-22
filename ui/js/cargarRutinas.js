document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        const userData = JSON.parse(localStorage.getItem('usuario'));

        if (userData && userData.email) {
            const contenidoRutina = document.querySelector('.contenido-rutina');
            const rutinaContainer = document.getElementById('rutina-container');

            // Ocultamos el contenido de la rutina hasta que se obtenga la información
            if (contenidoRutina) contenidoRutina.style.display = 'none';

            try {
                // Hacemos la solicitud para obtener la rutina asociada al usuario
                const response = await fetch(`${API_URL}/rutinas/${userData.email}`);
                const data = await response.json();

                if (response.ok && data.rutina) {
                    const rutinaElement = document.getElementById('rutina');
                    const rutina = data.rutina;

                    if (rutinaElement) {
                        let html = `<h3 class="fw-bold galeriaHeader">${data.nombre || 'Sin nombre'}</h3>`;
                        html += `<p class="galeriaHeader"><strong>Última actualización:</strong> ${data.ultimaActualizacion || '-'}</p>`;

                        const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

                        // Recorremos los días y sus ejercicios
                        diasOrdenados.forEach(dia => {
                            const ejercicios = rutina[dia];

                            if (ejercicios && ejercicios.length > 0) {
                                html += `<h4 class="mt-4 text-capitalize galeriaHeader">${dia}</h4>`;
                                html += '<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">';

                                ejercicios.forEach(ejercicio => {
                                    // Hacemos las tarjetas más pequeñas
                                    html += `
                                    <div class="col">
                                      <div class="card h-100">
                                        <img src="${ejercicio.imagenUrl || '#'}" class="card-img-top img-fluid" alt="${ejercicio.nombre || ''}">
                                        <div class="card-body p-2"> 
                                          <h5 class="card-title small">${ejercicio.nombre || 'Sin nombre'}</h5> 
                                          <p class="card-text small"><strong>Repeticiones:</strong> ${ejercicio.repeticiones || '-'}</p>
                                          <p class="card-text small"><strong>Observaciones:</strong> ${ejercicio.observaciones || '-'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  `;
                                });

                                html += '</div>'; // cierre de row
                            }
                        });

                        rutinaElement.innerHTML = html;
                    }

                    // Mostramos el contenedor de la rutina cuando esté lista
                    if (rutinaContainer) rutinaContainer.style.display = 'block';
                } else {
                    console.warn('Rutina no encontrada o mal formateada');
                    alert('No tienes una rutina asociada.');
                }
            } catch (error) {
                console.error('Error al obtener la rutina:', error);
                alert('Hubo un error al obtener tu rutina.');
            }
        } else {
            console.log('Usuario no logueado');
        }
    }, 100);
});
