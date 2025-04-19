const loadComponent = (id, url) => { // vamos a hacer una funcion para cargar un componente. 

    // window.locaticon para la pagina atual, pathname coge el paz y verificca si incluye src/pages, si es asi hacemos una ternaria para verificar que se cumple la condicion S si es asi, añadimos ../../ para poder cargar los componentes 
    let basePath = window.location.pathname.includes("/src/pages/") ? "../../" : "";
    const element = document.getElementById(id); // selector del id del componente

    if (!element) { // si no existe no hacemos nada
        return;
    }

    fetch(basePath + url) // concadenamos el resultado de nuestra ruta base con la url, de esta manera si cargamos contacto.html por ejemplo e intentamos cargar el header la ruta seria la correcta
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`))
        .then(html => element.innerHTML = html)
        .catch(error => console.error(error));

    // si la respuesta es correcta obtendremos la misma pasada a texto, si no se rechaza la promesa y se muestra un error 

    // .then(html => element.innerHTML = html) insertamos el componente en el html
};

document.addEventListener("DOMContentLoaded", () => { // El codigo se dispara cuando la pagina a cargado correctamente

    // nuestro array de componentes con su id y su Url



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
        { id: "log", url: "src/components/log.html" },
        { id: "reg", url: "src/components/reg.html" },
        { id: "admin", url: "src/components/admin.html" },
        { id: "pagos", url: "src/components/pagos.html" },
        { id: "adminRutina", url: "src/components/adminRutina.html" },
        { id: "userRutina", url: "src/components/userRutina.html" },
    ].forEach(({ id, url }) => loadComponent(id, url));  // recorremos cada a elemento del array y llamamos a loadcomponent, haciendo una solicitud para cada uno de ellos, si es exitosa se carga el elemento dentro del DOM
});
 

