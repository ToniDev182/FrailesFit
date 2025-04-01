const loadComponent = (id, url) => {
    let basePath = "";
    
    // Detectar si estamos en build
    if (window.location.pathname.includes("/build/")) {
        basePath = "src/";
    } else if (window.location.pathname.includes("/src/pages/")) {
        basePath = "../../";
    }

    const element = document.getElementById(id);
    if (!element || element.innerHTML.trim() !== "") return; // Evita cargarlo dos veces

    fetch(basePath + url)
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`))
        .then(html => element.innerHTML = html)
        .catch(error => console.warn(`⚠️ ${error}`));
};

document.addEventListener("DOMContentLoaded", () => {
    if (window.componentsLoaded) return; // Evita que se ejecute dos veces
    window.componentsLoaded = true;

    const components = [
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
    ];

    components.forEach(({ id, url }) => loadComponent(id, url));
});
