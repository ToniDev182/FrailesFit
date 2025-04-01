document.addEventListener("DOMContentLoaded", function () {  //Nos aseguramos de que la funcion se ejecuta despues de que se haya cargado todo el contenido. 
    const galeriaContainer = document.getElementById("galeria"); // nuestro ul

    if (galeriaContainer) { // si existe 
        fetch("src/components/galeria.html") // hacemos una solicitud para obtener el contenido del archivo. 
            .then(response => response.text()) // convertimos la respuesta en texto
            .then(data => { // luego se inserta data dentro de nuestro selector 
                galeriaContainer.innerHTML = data;
                cargarModal();
            });
    }

    fetch("src/components/modalGaleria.html") // hacemos la peticion 
        .then(response => response.text()) // obtenemos respuesta en texto 
        .then(data => { // 
            document.body.insertAdjacentHTML("beforeend", data); // de esta manera insertamos el modal al final del body
            cargarModal();
        });
});

function cargarModal() {
    const images = document.querySelectorAll(".img-clickable"); // buscamos todas las imagenes que tienen esta clase 

    if (images.length === 0) return; // si no existe ninguna no hace nada 

    images.forEach(img => {  // recorremos las imagnes y añadimos sobre ellas un evento onclick
        img.addEventListener("click", function () { 
            const modalImage = document.getElementById("modalImage"); //  obtenemos el lugar donde va a ir la imagen 
            if (modalImage) { //
                modalImage.src = this.getAttribute("data-src"); //obtenemos el valor del data-src de la imagen clicada, este es la url de la imagen que vamos a cargar dentro del modal. 
            }
        });
    });
}
