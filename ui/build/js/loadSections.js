const loadComponent = (id, url) => { // Función para cargar un componente.

    // En producción, la ruta es absoluta, apuntando a la carpeta 'build' dentro de 'ui'
    let basePath = window.location.pathname.includes("/build/") ? "/ui/build/" : "../"; // Ajustamos la basePath dependiendo del entorno

    const element = document.getElementById(id); // Seleccionamos el elemento con el id correspondiente

    if (!element) { // Si el elemento no existe, no hacemos nada
        return;
    }

    // Concatenamos la ruta base con la URL del componente
    fetch(basePath + url)
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`))
        .then(html => element.innerHTML = html) // Insertamos el HTML si la respuesta es correcta
        .catch(error => console.error(error)); // Si hay un error, lo mostramos en la consola
};

document.addEventListener("DOMContentLoaded", () => { // El código se dispara cuando la página ha cargado correctamente

    // Nuestro array de componentes con su id y su URL
    [
        { id: "header", url: "components/header.html" },
        { id: "servicios", url: "components/servicios.html" },
        { id: "nosotros", url: "components/nosotros.html" },
        { id: "galeria", url: "components/galeria.html" },
        { id: "planes", url: "components/planes.html" },
        { id: "footer", url: "components/footer.html" },
        { id: "clases", url: "components/clases.html" },
        { id: "padel", url: "components/padel.html" },
        { id: "pabellon", url: "components/pabellon.html" },
        { id: "gym", url: "components/gym.html" },
        { id: "formulario", url: "components/formulario.html" },
        { id: "entrenador", url: "components/entrenador.html" },
        { id: "muro", url: "components/muro.html" },
        { id: "merch", url: "components/merch.html" },
        { id: "suple", url: "components/suple.html" },
    ].forEach(({ id, url }) => loadComponent(id, url)); // Recorremos el array de componentes y cargamos cada uno
});
