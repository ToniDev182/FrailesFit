const loadComponent = (id, url) => { // Función para cargar un componente dentro de un contenedor en la página

    // En producción, la ruta es absoluta, apuntando a la carpeta 'build' dentro de 'ui'
    // Si estamos en un entorno de producción, la ruta base apuntará a la carpeta build, de lo contrario, será relativa
    let basePath = window.location.pathname.includes("/build/") ? "/ui/build/" : "../"; // Ajustamos la basePath dependiendo del entorno
                                                                                

    const element = document.getElementById(id); // Seleccionamos el elemento con el id correspondiente en el DOM

    if (!element) { // Si el elemento con el id especificado no existe, no hacemos nada
        return;
    }

    // Concatenamos la ruta base con la URL del componente (ej., /ui/build/components/header.html)
    fetch(basePath + url)
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`)) // Verificamos que la respuesta sea correcta
        .then(html => element.innerHTML = html) // Insertamos el contenido HTML dentro del elemento si la respuesta es positiva
        .catch(error => console.error(error)); // Si ocurre un error, lo mostramos en la consola
};

document.addEventListener("DOMContentLoaded", () => { // Este código se ejecuta cuando la página ha sido completamente cargada

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
    ].forEach(({ id, url }) => loadComponent(id, url)); // Recorremos el array de componentes y cargamos cada uno en su respectivo contenedor
});
