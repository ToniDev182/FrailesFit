const loadComponent = (id, url) => {
    let basePath = window.location.pathname.includes("/src/pages/") ? "../../" : "";
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    fetch(basePath + url)
        .then(response => response.ok ? response.text() : Promise.reject(`Error al cargar ${url}: ${response.statusText}`))
        .then(html => element.innerHTML = html)
        .catch(error => console.error(error));
};

document.addEventListener("DOMContentLoaded", () => {
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
    ].forEach(({ id, url }) => loadComponent(id, url));
});
