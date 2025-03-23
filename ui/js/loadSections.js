const loadComponent = (id, url) => {
    fetch(url)
        .then(response => response.text())
        .then(html => document.getElementById(id).innerHTML = html)
        .catch(error => console.error(`Error al cargar ${url}:`, error));
};

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "src/components/header.html");
    loadComponent("servicios", "src/components/servicios.html");
    loadComponent("nosotros", "src/components/nosotros.html");
    loadComponent("galeria", "src/components/galeria.html");
    loadComponent("planes", "src/components/planes.html");
    loadComponent("footer", "src/components/footer.html");
});
