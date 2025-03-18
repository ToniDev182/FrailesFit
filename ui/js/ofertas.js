document.addEventListener('DOMContentLoaded', () => {
    const galeria = document.getElementById('ofertas');  // Contenedor donde vamos a agregar las imágenes

    // Llamada al archivo JSON con los nombres de las imágenes
    fetch('/js/imagenes.json') // Asegúrate de que el archivo esté en la ruta correcta
        .then(response => response.json())
        .then(imagenes => {
            let index = 0; // Contador para las imágenes
            const totalImagenes = imagenes.length;

            // Función para obtener una imagen aleatoria del array de imágenes
            function obtenerImagenAleatoria() {
                const randomIndex = Math.floor(Math.random() * totalImagenes); // Índice aleatorio
                return imagenes[randomIndex];
            }

            // Función para mostrar 3 imágenes aleatorias
            function mostrarImagenes() {
                const currentImages = []; // Arreglo para almacenar las 3 imágenes aleatorias

                // Obtener 3 imágenes aleatorias del arreglo
                for (let i = 0; i < 3; i++) {
                    currentImages.push(obtenerImagenAleatoria());
                }

                // Crear un contenedor para las 3 tarjetas
                const row = document.createElement('div');
                row.classList.add('row', 'row-cols-1', 'row-cols-md-3', 'g-4', 'd-flex', 'justify-content-center'); // Añadir clases de Bootstrap

                currentImages.forEach(imagen => {
                    // Crear el contenedor de la imagen con clases de card
                    const col = document.createElement('div');
                    col.classList.add('col');
                    col.classList.add('oferta-imagen');
                    
                    const card = document.createElement('div');
                    card.classList.add('card', 'h-100', 'border-0', 'shadow-sm'); // Estilo de card de Bootstrap
                    card.style.borderRadius = '15px'; // Bordes redondeados
                    card.style.height = '350px'; // Ajustar la altura de la tarjeta
                    card.style.transition = 'transform 0.3s ease-in-out'; // Transición al pasar el ratón

                    const picture = document.createElement('picture');
                    picture.classList.add('card-img-top'); // Asegura que la imagen ocupe la parte superior de la card
                   
                    // Añadir la imagen WebP
                    const sourceWebP = document.createElement('source');
                    sourceWebP.setAttribute('srcset', `/build/img/ofertas/${imagen.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')}`);
                    sourceWebP.setAttribute('type', 'image/webp');
                    picture.appendChild(sourceWebP);

                    // Añadir la imagen AVIF
                    const sourceAVIF = document.createElement('source');
                    sourceAVIF.setAttribute('srcset', `/build/img/ofertas/${imagen.replace(/\.(jpg|jpeg|png|gif)$/i, '.avif')}`);
                    sourceAVIF.setAttribute('type', 'image/avif');
                    picture.appendChild(sourceAVIF);

                    // Añadir la imagen JPG (fallback)
                    const img = document.createElement('img');
                    img.setAttribute('src', `/build/img/ofertas/${imagen}`);
                    img.setAttribute('alt', 'Oferta Especial');
                    img.classList.add('card-img-top'); // Asegura que la imagen se vea bien dentro de la card
                    picture.appendChild(img);

                    card.appendChild(picture);

                    // Añadir una descripción si lo deseas (opcional)
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body', 'text-center');
                    const caption = document.createElement('p');
                    caption.classList.add('card-text');
                    caption.textContent = "Oferta Especial"; // Este texto puede ser lo que desees

                    // Aplicar estilos al texto
                    caption.style.fontWeight = 'bold'; // Negrita
                    caption.style.color = '#808000'; // Verde oliva

                    cardBody.appendChild(caption);
                    card.appendChild(cardBody);

                    col.appendChild(card);
                    row.appendChild(col); // Añadir la columna a la fila
                });

                // Limpiar el contenedor antes de agregar las nuevas imágenes
                const oldRow = galeria.querySelector('.row');
                if (oldRow) {
                    oldRow.classList.add('fade-out'); // Añadir una clase para hacer un desvanecimiento hacia fuera
                }

                // Añadir la fila con las 3 imágenes al contenedor
                setTimeout(() => {
                    galeria.innerHTML = ''; // Limpiar el contenedor
                    galeria.appendChild(row); // Añadir la fila con las 3 imágenes
                    row.classList.add('fade-in'); // Clase para hacer que la nueva fila se desvanezca hacia dentro
                }, 500); // Espera para que el fade-out se vea antes de limpiar el contenido

                // Esperar 2 segundos antes de mostrar las siguientes 3 imágenes
                setTimeout(mostrarImagenes, 2000); // Retraso de 2 segundos antes de mostrar las siguientes imágenes
            }

            mostrarImagenes(); // Iniciar mostrando las primeras 3 imágenes aleatorias
        })
        .catch(error => console.error('Error cargando imágenes:', error)); // Manejar cualquier error
});
