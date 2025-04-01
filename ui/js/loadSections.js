const loadComponent = (id, url) => { // vamos a hacer una función para cargar un componente.

    // window.location para la página actual, pathname coge el path y verifica si incluye src/pages, 
    // si es así hacemos una ternaria para verificar que se cumple la condición. 
    // Si se cumple, añadimos "../../" para poder cargar los componentes correctamente.
    let basePath = window.location.pathname.includes("/src/pages/") ? "../../" : "";
    const element = document.getElementById(id); // selector del id del componente

    if (!element || element.innerHTML.trim() !== "") { 
        return; // Si el elemento no existe o ya tiene contenido, no hacemos nada.
    }

    fetch(basePath + url) // concatenamos el resultado de nuestra ruta base con la url, 
        // de esta manera si cargamos contacto.html por ejemplo e intentamos cargar el header, la ruta será la correcta
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`))
        .then(html => element.innerHTML = html)
        .catch(error => console.error(error));

    // Si la respuesta es correcta, obtendremos la misma pasada a texto.
    // Si no, se rechaza la promesa y se muestra un error.

    // .then(html => element.innerHTML = html) inserta el componente en el HTML.
};

document.addEventListener("DOMContentLoaded", () => { // El código se ejecuta cuando la página ha cargado correctamente.

    // Nuestro array de componentes con su id y su URL.
    [
        { id: "header", url: "src/components/header.html" },
        { id: "servicios", url: "src/components/servicios.html" },
        { id: "nosotros", url: "src/components/nosotros.html" },
        { id: "galeria", url: "src/components/galeria.html" },
        { id: "planes", url: "src/components/planes.html" },
        { id: "footer", url: "src/components/footer.html" },
        { id: "clases", url: "src/components/clases.html" },
        { id: "padel", url: "src/components/padel.html" },
        { id: "pabellon", url: "src/components/pabellon.html" },
        { id: "gym", url: "src/components/gym.html" },
        { id: "formulario", url: "src/components/formulario.html" },
        { id: "entrenador", url: "src/components/entrenador.html" },
        { id: "muro", url: "src/components/muro.html" },
        { id: "merch", url: "src/components/merch.html" },
        { id: "suple", url: "src/components/suple.html" },
    ].forEach(({ id, url }) => loadComponent(id, url)); // Recorremos cada elemento del array y llamamos a loadComponent, 
    // haciendo una solicitud para cada uno de ellos. Si es exitosa, se carga el elemento dentro del DOM.
});
