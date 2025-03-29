document.addEventListener('DOMContentLoaded', function () {
  const productosPorPagina = 6; 
  let paginaActual = 1;
  let productos = [];

  fetch('/ui/src/components/suple.json')
    .then(response => response.json())
    .then(data => {
      productos = data;
      mostrarProductos();
      generarPaginacion();
    })
    .catch(error => console.error('Error al cargar los productos:', error));

  function mostrarProductos() {
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    const contenedorProductos = document.getElementById('productos');
    if (!contenedorProductos) {
      console.error('No se encontró el contenedor de productos.');
      return;
    }
    contenedorProductos.innerHTML = ''; 

    productosPagina.forEach(producto => {
      const productoHTML = `
        <div class="col-md-6 col-lg-4 my-4 row align-items-center producto">
          <div class="col-4">
            <img class="img-fluid" src="${producto.imagen}" alt="imagen galeria">
          </div>
          <div class="producto col-8 descripcion">
            <h3 class="heading-producto fs-6 fw-bold text-uppercase">${producto.nombre}</h3>
            <p class="p_descripcion">${producto.descripcion}</p>
            <p class="fw-bold fs-3 producto-precio">${producto.precio}<span>€</span></p>
            <button class="btn d-block text-center text-uppercase fw-bold">Añadir al Carrito</button>
          </div>
        </div>
      `;
      contenedorProductos.innerHTML += productoHTML;
    });
  }

  function generarPaginacion() {
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    const contenedorPaginacion = document.getElementById('paginacion');
    if (!contenedorPaginacion) {
      console.error('No se encontró el contenedor de paginación.');
      return;
    }
    contenedorPaginacion.innerHTML = ''; 

    for (let i = 1; i <= totalPaginas; i++) {
      const boton = document.createElement('button');
      boton.textContent = i;
      boton.classList.add('paginacion');
      boton.onclick = () => {
        paginaActual = i;
        mostrarProductos();
      };
      contenedorPaginacion.appendChild(boton);
    }
  }
});
