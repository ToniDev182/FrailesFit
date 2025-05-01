// Función para verificar si el usuario esta logueado
function verificarUsuarioLogueado() {
    const usuario = JSON.parse(localStorage.getItem("usuario")); // miramos en el localStorage
    return usuario && usuario.email ? true : false; // Verifica si el usuario tiene un email, indicando que está logueado
}

// Función para actualizar el carrito
function actualizarCarrito() {
    if (!verificarUsuarioLogueado()) {
        return; // Si no hay usuario logueado, no se actualiza el carrito
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || []; // obtiene el carrito almacenado en el localStorage o inicia uno vacio

    const cartCount = document.getElementById("cart-count"); // buscamos el elemento con dicho id en el DOM 
    if (cartCount) { // si existe
        // usamos reduce , que es un acumulador , para sumar las cantidades de los productos en el carrito.
        const totalProductos = carrito.reduce((total, p) => total + (p.cantidad || 1), 0); // uno si no hay ninguna cantidad , 0 como valor inicial
        cartCount.textContent = totalProductos;
    }

    const cartItems = document.querySelector(".cart-items"); // buscamos dicho id dentro del DOM
    if (cartItems) { // si existe:
        cartItems.innerHTML = ""; // limpiamos el contenido actual

        let totalPrecio = 0; // Total acumulado del carrito

        carrito.forEach((producto, index) => { // recorremos todos los elementos del carrito y para cada uno crea un contenedor
            const item = document.createElement("div");
            item.classList.add("cart-item");

            const cantidad = producto.cantidad || 1; // si no hay una cantidad definida por defecto será 1
            const subtotal = cantidad * producto.precio; // calculamos el total de cada producto
            totalPrecio += subtotal; // con esto ya podemos obtener el total acumulado.

            // AQUI BASICAMENTE CREAMOS EL ESPACIO DE CADA PRODUCTO PINTANDOLO DENTRO DEL CARRITO

            item.innerHTML = ` 
                <div class="cart-item-content">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="cart-item-img" />
                    <p>${producto.nombre} - ${producto.talla ? 'Talla: ' + producto.talla + ' - ' : ''}€${producto.precio} x${cantidad}</p>
                </div>
                <button class="eliminar-producto" data-index="${index}">X</button>
            `;

            cartItems.appendChild(item);
        });

        // Mostrar total 
        // creamos un div donde imprimir el Total. 
        const totalDiv = document.createElement("div");
        totalDiv.classList.add("cart-total");
        totalDiv.innerHTML = `<strong>Total:</strong> €${totalPrecio.toFixed(2)}`;
        cartItems.appendChild(totalDiv);

        // Asignar eventos a los botones de eliminar
        document.querySelectorAll(".eliminar-producto").forEach(boton => {
            boton.addEventListener("click", eliminarProducto);
        });
    }
}

// Función para eliminar producto por índice
function eliminarProducto(event) {
    if (!verificarUsuarioLogueado()) {
        return;
    }

    event.stopPropagation(); // Evita que se cierre el desplegable al eliminar un elemento


    // event.target hace referencia al elemento sobre el que se ha hecho click
    // obtenemos el valor del atributo del boton de eliminacion
    // con parseInt convertimos este valor en un entero ya que viene como string
    const index = parseInt(event.target.getAttribute("data-index"));

    // Inicializamos el carrito
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // si carrito es un numero y esta entre 0 o el tamaño del carrito es valido, si no no 
    if (!isNaN(index) && index >= 0 && index < carrito.length) {
        // Si hay más de una unidad, se resta cantidad
        if (carrito[index].cantidad && carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
            // si la cantidad del producto tiene la propiedad cantidady su valor es mas de uno se reduce su cantidad en 1
        } else {
            // sin embargo si es 1 o no tiene cantidad definida se elimina mediante el metodo splice en la posicion indicada. 
            // uno indica que solo se elimina un solo elemento
            carrito.splice(index, 1);
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarrito();
    }
}

// Función para agregar productos al carrito
function agregarAlCarrito(event) {
    if (!verificarUsuarioLogueado()) {
        return;
    }

    const boton = event.target; // Boton que presionamos para agregar el producto al carrito.

    // De los siguientes atributos extraemos la informacion de un producto que añadimos al carrito.

    const producto = boton.getAttribute("data-producto");
    const precio = parseFloat(boton.getAttribute("data-precio"));
    const imagen = boton.getAttribute("data-imagen");

    // Solo busca una talla si existe el select de talla cerca del botón
    // Cuando el usuario presiona el boton para agregar el producto al carrito, la fucion busfca dentro del div que contiene tanto el boton como el campo de seleccion
    const selectTalla = boton.parentNode.querySelector(".talla");

    const talla = selectTalla ? selectTalla.value : null;
    // si existe talla obtenemos su valor , si pue devuelve null.

    // Verifica si existe el campo de selecio+
    // si no se ha selecionado ninguna talla
    // si el valor que hay es el de por defecto 
    // en ese caso pedimos que el usuario seleccione una talla 
    if (selectTalla && (!talla || talla === "Selecciona la talla")) {
        alert("Por favor, selecciona una talla.");
        return;
    }

    // obtenemos el carrito actual
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Buscar si el producto ya está en el carrito
    // esto lo realizamos con el metodo findIndex que compara el nuevo producto con el producto actual en funcion de las propiedades que se ven.
    const indexExistente = carrito.findIndex(p =>
        p.nombre === producto &&
        p.talla === talla &&
        p.imagen === imagen
    );


    // Si el producto ya está en el carrito (findIndex devuelve un índice válido diferente de -1),
    // se incrementa la cantidad de ese producto.
    if (indexExistente !== -1) {
        // Si ya existe un producto con ese nombre, talla e imagen, aumentamos su cantidad.
        // Si la cantidad del producto no está definida (es null o undefined), la inicializamos con 1.
        carrito[indexExistente].cantidad = (carrito[indexExistente].cantidad || 1) + 1;
    } else {
        // Si el producto no está en el carrito (findIndex devuelve -1), lo agregamos al carrito con cantidad 1.
        const productoCarrito = {
            nombre: producto,  // El nombre del producto.
            precio: precio,    // El precio del producto.
            talla: talla,      // La talla del producto (si aplica).
            imagen: imagen,    // La imagen del producto.
            cantidad: 1        // Inicializamos la cantidad del producto en 1.
        };
        // Agregamos el nuevo producto al carrito.
        carrito.push(productoCarrito);
    }

    // Guardamos el carrito actualizado en el localStorage.
    // Esto asegura que el carrito persista incluso si el usuario recarga la página o cierra el navegador.
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Llamamos a la función 'actualizarCarrito', que probablemente se encarga de actualizar la interfaz
    // del carrito en la página (por ejemplo, el número de productos en el carrito visible al usuario).
    actualizarCarrito();
}




// Asignar eventos a los botones de "Añadir al carrito"
function asignarEventosCarrito() {
    if (!verificarUsuarioLogueado()) {
        return;
    }
    // seleccionamos todos los botones con la clase merch que son los de añadir al carrito
    const botones = document.querySelectorAll(".merch");

    // recorremos cada boton para añaidr un evento click y se ejecute la funcion agregar al carrito
    botones.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}




// Para que no haya conflicto con los botones esperamos a que la pagina esté completamente cargada.
window.addEventListener("load", () => {
    setTimeout(() => {

        // llamamos a la funcion para asignar los eventos al carrito
        // Actualizo el carrito por si habia elementos guardados en el localStorage.
        asignarEventosCarrito();
        actualizarCarrito();
    }, 500);
});

// Funcionalidad para la paginación de productos
document.addEventListener('DOMContentLoaded', function () { // es ejecutado al cargarse el html
    const productosPorPagina = 6; // cada pagina muestra 6 productos
    let paginaActual = 1; // empezamos por la pagina 1
    let productos = []; // aqui vamos a almacenar los productos que saquemos del json

    setTimeout(() => { // pequeño retraso para asegurar que el DOM esté listo
        fetch('/js/suple.json') // hacemos la consulta /ui/build/js/suple.json 
            .then(response => response.json()) // obtenemos la respuesta
            .then(data => {
                productos = data; //almacenamos los datos en productos
                mostrarProductos();  //mostramos productos
                generarPaginacion(); // mostramos paginacion
            });
    }, 200); // 200ms de espera antes de hacer la petición

    function mostrarProductos() {
        const inicio = (paginaActual - 1) * productosPorPagina; // restamos 1 a la pagina actual para que el primer producto sea el que ocupa la posicion 0
        const fin = inicio + productosPorPagina; // posicion final
        const productosPagina = productos.slice(inicio, fin); // slice permite extraer una porción del array que son nuestros 6 productos

        const contenedorProductos = document.getElementById('productos'); // selector de productos donde se va a insertar el producto
        if (!contenedorProductos) {
            return;
        }
        contenedorProductos.innerHTML = ''; // limpiamos el contenedor de productos

        productosPagina.forEach(producto => { // Creamos dinámicamente el contenedor de cada producto
            const productoHTML = `
                <div class="col-md-6 col-lg-4 my-4 row align-items-center producto">
                    <div class="col-4">
                        <img class="img-fluid" src="${producto.imagen}" alt="imagen galeria">
                    </div>
                    <div class="col-8 descripcion">
                        <h3 class="heading-producto fs-6 fw-bold text-uppercase">${producto.nombre}</h3>
                        <p class="p_descripcion">${producto.descripcion}</p>
                        <p class="fw-bold fs-3 producto-precio">${producto.precio}<span>€</span></p>
                        <button class="btn d-block text-center text-uppercase fw-bold merch" data-producto="${producto.nombre}" data-precio="${producto.precio}" data-imagen="${producto.imagen}">Añadir al Carrito</button>
                    </div>
                </div>
            `;
            contenedorProductos.innerHTML += productoHTML; // concatenamos cada producto sin borrar el anterior
        });

        // Reasignar eventos de "Añadir al carrito" después de cada cambio de página
        asignarEventosCarrito();
    }

    function generarPaginacion() {
        const totalPaginas = Math.ceil(productos.length / productosPorPagina); // número total de productos / cantidad de productos que se muestran por página, redondeamos para que todos los productos tengan una página asignada
        const contenedorPaginacion = document.getElementById('paginacion'); // selector de la paginación
        if (!contenedorPaginacion) {
            return;
        }
        contenedorPaginacion.innerHTML = ''; // limpiamos el paginador

        for (let i = 1; i <= totalPaginas; i++) { // bucle para crear un botón por cada página
            const boton = document.createElement('button');
            boton.textContent = i; // valor de cada página
            boton.classList.add('paginacion'); // añadimos clase al botón
            boton.addEventListener('click', () => {
                paginaActual = i;
                mostrarProductos();
            });
            contenedorPaginacion.appendChild(boton);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Esperamos un poco por si el botón tarda en renderizarse
    setTimeout(() => {
        const checkoutBtn = document.getElementById("checkout-btn");

        // Si no hay botón de checkout, salimos
        if (!checkoutBtn) return;

        // Cuando se hace clic en el botón de checkout
        checkoutBtn.addEventListener("click", () => {
            // Comprobamos si el usuario está logueado
            if (!verificarUsuarioLogueado()) {
                alert("Por favor, inicia sesión para realizar el pedido.");
                return;
            }

            // Obtenemos los datos del usuario y del carrito desde localStorage
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

            // Si faltan datos esenciales del usuario, mostramos alerta
            if (!usuario?.nombre || !usuario?.email) {
                alert("No se pudo obtener la información del usuario. Asegúrate de estar logueado.");
                return;
            }

            // Si el carrito está vacío, cancelamos el proceso
            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            // Preparamos el objeto del pedido con los datos del usuario y los productos
            const pedido = {
                email: usuario.email,
                cartItems: carrito.map(({ nombre, cantidad, precio, imagen, talla }) => ({
                    nombre,
                    cantidad,
                    precio,
                    imagen,
                    talla: talla || "N/A"  // Si no hay talla seleccionada, se pone "N/A"
                }))
            };

            // Enviamos el pedido al backend mediante fetch (POST)
            fetch(`${API_URL}/api/realizar-pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido)
            })
                .then(response => {
                    // Si la respuesta no es correcta, capturamos el mensaje de error
                    if (!response.ok) {
                        return response.text().then(textoError => {
                            throw new Error(`Error de API: ${textoError}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // Si el pedido se realizó con éxito, limpiamos el carrito
                    if (data.message === "Pedido realizado con éxito") {
                        alert("Tu pedido ha sido enviado con éxito. El administrador ha sido notificado.");
                        localStorage.removeItem("carrito"); // Vaciamos el carrito del localStorage
                        actualizarCarrito(); // Refrescamos el contador o vista del carrito
                    } else {
                        alert("Hubo un error al realizar el pedido. Intenta nuevamente.");
                    }
                })
                .catch(error => {
                    // En caso de error en la comunicación o en el proceso, mostramos alerta
                    alert("Hubo un error. Intenta nuevamente.");
                });
        });
    }, 300);
});
