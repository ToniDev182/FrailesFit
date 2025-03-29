document.addEventListener("DOMContentLoaded", function () {
    const galeriaContainer = document.getElementById("galeria");

    if (galeriaContainer) {
        fetch("/ui/src/components/galeria.html")
            .then(response => response.text())
            .then(data => {
                galeriaContainer.innerHTML = data;
                cargarModal();
            });
    }

    fetch("/ui/src/components/modalGaleria.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("beforeend", data);
            cargarModal();
        });
});

function cargarModal() {
    const images = document.querySelectorAll(".img-clickable");

    if (images.length === 0) return;

    images.forEach(img => {
        img.addEventListener("click", function () {
            const modalImage = document.getElementById("modalImage");
            if (modalImage) {
                modalImage.src = this.getAttribute("data-src");
            }
        });
    });
}
