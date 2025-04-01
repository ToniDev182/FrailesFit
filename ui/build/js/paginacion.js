document.addEventListener('DOMContentLoaded', function () { // es ejecutado al cargarse el html 
  const productosPorPagina = 6; // cada pagina muestra 6 productos 
  let paginaActual = 1; // empezamos por la pagina 1
  let productos = []; // aqui vamos a almacenar los productos que saquemos del json

  fetch('/js/suple.json') // hacemos la consulta /* /ui/build/js/suple.json */
    .then(response => response.json()) // obteneos la respuesta
    .then(data => {
      productos = data; //almacenamos los datos en productos
      mostrarProductos();  //mostramos productos
      generarPaginacion(); // mostramos paginacion 
    })
    .catch(error => console.error('Error al cargar los productos:', error)); // manejamos la posiblidad del error

  function mostrarProductos() {
    const inicio = (paginaActual - 1) * productosPorPagina; // restamos 1 a la pagina atual para que el primer producto sea el que ocupa la posicion 0, producto inicial 
    const fin = inicio + productosPorPagina; // posicion final 
    const productosPagina = productos.slice(inicio, fin); // slice permite extraer una porcion del array que son nuestros 6 productos

    const contenedorProductos = document.getElementById('productos');// selector de productos donde se va a insertar el producto
    if (!contenedorProductos) { // si no existe el producto
      console.error('No se encontró el contenedor de productos.');
      return;
    }
    contenedorProductos.innerHTML = ''; // limpiamos el contenedor de productos 

    productosPagina.forEach(producto => { // Creamos dinamicamente el contenedor de cada producto
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
      contenedorProductos.innerHTML += productoHTML; // concadenamos cada producto sin borrar el anterior
    });
  }

  function generarPaginacion() {
    const totalPaginas = Math.ceil(productos.length / productosPorPagina); // numero total de productos / cantidad de productos que se muestran por pagina, redondeamos para que todos los productos tengan unap pagina asignada
    const contenedorPaginacion = document.getElementById('paginacion'); // selector de la paginacion 
    if (!contenedorPaginacion) { // comprobamos que existe 
      console.error('No se encontró el contenedor de paginación.');
      return;
    }
    contenedorPaginacion.innerHTML = ''; // limpiamos el paginador 

    for (let i = 1; i <= totalPaginas; i++) { // bucle para crear un boton por cada pagina
      const boton = document.createElement('button');
      boton.textContent = i; // valor de cada pagina 
      boton.classList.add('paginacion'); // añadimos esta clase para configurar los estilos del boton
      boton.onclick = () => {
        paginaActual = i; // actualiza la pagina actual, dandole el valor de i
        mostrarProductos(); // llamada a productos para actualizar los productos mostrados
      };
      contenedorPaginacion.appendChild(boton); // se añaden los botones dentro del contenedor 
    }
  }
});
