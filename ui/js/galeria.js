
document.addEventListener("DOMContentLoaded", function() {
 
    fetch("/ui/src/components/galeria.html") 
        .then(response => response.text())
        .then(data => {
            document.getElementById("galeria").innerHTML = data;
            cargarModal();
        });
    
    fetch("/ui/src/components/modalGaleria.html") 
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("beforeend", data);
            cargarModal();
        });
});


function cargarModal() {
    const images = document.querySelectorAll(".img-clickable");
    images.forEach(img => {
        img.addEventListener("click", function() {
            document.getElementById("modalImage").src = this.getAttribute("data-src");
        });
    });
}