document.addEventListener('DOMContentLoaded', async () => {
  // Espera a que el formulario esté disponible en el DOM
  const esperarFormulario = () => {
    return new Promise(resolve => {
      const comprobarFormulario = setInterval(() => {
        const form = document.querySelector('form');
        if (form) {
          clearInterval(comprobarFormulario);
          resolve(form);
        }
      }, 100);
    });
  };

  // Obtiene los datos del formulario
  const obtenerDatosFormulario = () => {
    return {
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

  // Valida que todos los campos del formulario no estén vacíos
  const validarDatosFormulario = (datosFormulario) => {
    for (const clave in datosFormulario) {
      if (!datosFormulario[clave]) {
        return false; // Si algún campo está vacío, retorna false
      }
    }
    return true; // Todos los campos están llenos
  };

  // Muestra el spinner
  const mostrarSpinner = () => {
    const spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.display = 'block';
    }
  };

  // Oculta el spinner
  const ocultarSpinner = () => {
    const spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  };

  // Muestra el mensaje de éxito
  const mostrarMensajeExito = () => {
    const mensaje = document.getElementById('mensajeExito');
    if (mensaje) {
      mensaje.style.display = 'block';
    }
  };

  // Oculta el mensaje de éxito después de un delay
  const ocultarMensajeExitoDespuesDeUnDelay = () => {
    const mensaje = document.getElementById('mensajeExito');
    setTimeout(() => {
      if (mensaje) {
        mensaje.style.display = 'none';
      }
    }, 5000); // 5 segundos
  };

  // Redirige al login después de un tiempo
  const redirigirALogin = () => {
    setTimeout(() => {
      window.location.href = 'login.html'; // Redirige a la página de login
    }, 5000); // Después de 5 segundos
  };

  // Maneja el envío del formulario
  const manejarEnvioFormulario = async (evento, formulario) => {
    evento.preventDefault(); // Previene el comportamiento por defecto del formulario

    const datosFormulario = obtenerDatosFormulario();

    if (!validarDatosFormulario(datosFormulario)) {
      // Si los datos no son válidos, no hacer nada más
      return;
    }

    try {
      mostrarSpinner(); // Mostrar spinner mientras se envían los datos
      const respuesta = await enviarDatosFormulario(datosFormulario);

      ocultarSpinner(); // Ocultar spinner después de la respuesta

      if (!respuesta.ok) {
        console.error('Error en la solicitud:', respuesta.statusText);
        return; // Si la respuesta no es válida, no continuar
      }

      let datos = null;
      try {
        datos = await respuesta.json();
      } catch (e) {
        console.error('Error al parsear la respuesta JSON:', e);
        return;
      }

      if (datos && datos.message) {
        // Si la respuesta contiene un mensaje, mostrar el mensaje de éxito
        mostrarMensajeExito();
        formulario.reset(); // Resetea el formulario
        ocultarMensajeExitoDespuesDeUnDelay(); // Ocultar el mensaje de éxito después de 5 segundos
        redirigirALogin(); // Redirigir al login después de mostrar el mensaje de éxito
      } else {
        console.error('La respuesta del servidor no contiene un mensaje.');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      ocultarSpinner(); // Asegurarse de que el spinner se oculte en caso de error
    }
  };

  // Función para enviar los datos del formulario al servidor
  const enviarDatosFormulario = async (datosFormulario) => {
    try {
      const respuesta = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosFormulario),
      });

      return respuesta; // Devuelve la respuesta de la solicitud
    } catch (error) {
      console.error('Error al enviar los datos del formulario:', error);
      throw new Error('Error al enviar los datos del formulario');
    }
  };

  // Esperar a que el formulario esté disponible y luego agregar el event listener
  try {
    const formulario = await esperarFormulario();
    formulario.addEventListener('submit', (evento) => manejarEnvioFormulario(evento, formulario));
  } catch (error) {
    console.error('Formulario no encontrado:', error);
  }
});
