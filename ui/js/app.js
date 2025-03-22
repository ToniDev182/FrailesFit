const modalImagen = document.querySelector('#modal-imagen');

if (modalImagen) {
    modalImagen.addEventListener('show.bs.modal', function (event) {
        const enlace = event.relatedTarget;
        const rutaImagen = enlace.getAttribute('data-bs-imagen')


        /* contruir la imagen */
        

        const imagen = document.createElement('IMG');
        imagen.src = `/ui/build/img/clientes/${rutaImagen}.avif`;
        imagen.classList.add('img-fluid');
        imagen.alt = 'imagen Galeria';

        const contenidoModal = document.querySelector('.modal-body');

        contenidoModal.appendChild(imagen);

    });

    modalImagen.addEventListener('hidden.bs.modal', function () {
        const contenidoModal = document.querySelector('.modal-body');
        contenidoModal.textContent = '';
    });

}