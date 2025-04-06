document.addEventListener('DOMContentLoaded', async () => { // como siempre esperamos a que todo el contenido del DOM esté completamente cargado.


  // creamos esta funcion para que el formulario esté 100% disponible en el DOM  
  // cada 100mls se verifica si el formulario existe 
  const esperarFormulario = () => {
    return new Promise(resolve => { // cremos una promesa que regresará un resultado
      const comprobarFormulario = setInterval(() => { // realiza la busqueda del formulario
        const form = document.querySelector('form'); // mediante el selector del formulario
        if (form) {
          clearInterval(comprobarFormulario); // detiene la busqueda una vez 
          resolve(form); // resolvemos la promesa  y devuelve el objeto form asi, no hay fallo
        }
      }, 100);
    });
  };



  const obtenerDatosFormulario = () => {
    return { // accdemos a los elementos del DOM mediante mediante sus ides y los guardamos en una constante
      nombre: document.getElementById('nombre').value.trim(),
      apellidos: document.getElementById('apellidos').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      dni: document.getElementById('dni').value.trim(),
      edad: document.getElementById('edad').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value.trim(),
    };
  };



  const validarDatosFormulario = (datosFormulario) => { // una funcion para recorrer los datos del formulario 
    for (const clave in datosFormulario) { // mediante un for
      if (!datosFormulario[clave]) { // si falta alguno retornamos un false y un mensaje 
        alert(`El campo ${clave} no puede estar vacío.`);
        return false;
      }
    }
    return true;
  };



  const manejarEnvioFormulario = async (evento, formulario) => { // Creamos esta funcion asincrona que nos permitira esperar a que se completen diferentes acciones dentro de la misma, 
    evento.preventDefault(); // evita que se recargue la pagina

    const datosFormulario = obtenerDatosFormulario(); // guardamos los datos del formulario dentro de una constante

    if (!validarDatosFormulario(datosFormulario)) { // Validamos la informacion del formulario 
      return;
    }

    try {
      const respuesta = await enviarDatosFormulario(datosFormulario); // hacemos una llamada a la fucion enviarDatos que es una funcion asincrona que envia datos del formulario al servidor, usamos await para esperar a que esta funcion termine antes de continuar

      if (!respuesta.ok) { // Si la respuesta no es exitosa se extrae el mensaje de error de la respuesta del servidor
        const mensajeError = await respuesta.text();
        console.error('Error en la solicitud:', mensajeError);
        alert('Hubo un problema con el registro. Intenta de nuevo.');
        return; // detine la ejecucion
      }

      let datos = null; // iniciamos datos a null
      try { // se intenta parsear la respuesta a JSON 
        datos = await respuesta.json();
      } catch (e) { // en caso de que no sea posible , se captura el error y se muestra el error
        console.error('Error al parsear la respuesta JSON:', e);
        alert('La respuesta del servidor no es válida.');
        return;
      }

      if (datos && datos.message) {  // para sacar el mensaje de la respuesta del servidor. por ejemplo puede ser que la contraseña tiene menos de 6 carctres
        alert(datos.message);
      } else {
        alert('La respuesta del servidor no contiene un mensaje.');
      }

      mostrarMensajeExito(); // tengo un mensaje de exito en el propio html, este tiene un display none, que pasa a block con esta funcion 
      formulario.reset(); // reseteamos los campos del formulario 
      ocultarMensajeExitoDespuesDeUnDelay(); // dicho mensaje pasa a oculto otra vez tras un tiempo de espera

    } catch (error) {
      console.error('Error al enviar el formulario:', error); // si ocurre cualquier otro error dentro del try lanzamos este error
      alert('Hubo un problema al registrar el usuario.');
    }
  };



  const enviarDatosFormulario = async (datosFormulario) => { // enviamos a nuestro servidor (api los datos del formulario)
    try {
      const respuesta = await fetch('http://localhost:3000/register', { // enviamos a nuestra url
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // decimos al servidor que el contenido de la solicitud es tipo JSON
        },
        body: JSON.stringify(datosFormulario), // contiene los datos que se envian al servidor
      }); // fetch y await garantizan que la ejecucion se detendrá hasta que el servidor responda.

      return respuesta; // lo que devuelve el servidor
    } catch (error) {
      throw new Error('Error al enviar los datos del formulario');
    }
  };



  const mostrarMensajeExito = () => { // mostrar el mensaje de exito
    const mensaje = document.getElementById('message');
    mensaje.style.display = 'block';
  };



  const ocultarMensajeExitoDespuesDeUnDelay = () => { // volever a ocultar el mensaje 5 segundos despues
    const mensaje = document.getElementById('message');
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 5000);
  };





  try {
    const formulario = await esperarFormulario(); // formulario almacena el formulario una vez esté disponible
    formulario.addEventListener('submit', (evento) => manejarEnvioFormulario(evento, formulario)); // esta funcion es para que cuando el formulario sea envidado , le estamos diciendo ejecuta la funcion manejar formulario con el formulario dentro
  } catch (error) {
    console.error('Formulario no encontrado:', error);
  }
});
