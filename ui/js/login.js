document.addEventListener('DOMContentLoaded', () => {  // se asegura que el codigo se ejecute solo cuando el HTML ha sido completamente cargado
  setTimeout(() => { // uso setTimeout para retrasar un poco la ejecucion del codigo para asegurarme que todo se carga

    const form = document.querySelector('.formulario'); // seleccionamos el formulario 

    if (form) { // si se ha cargado el elemento formulario en el DOM 
      form.addEventListener('submit', async (e) => { // añadimos un listener para enviar el formulario  
        e.preventDefault(); // evitamos toda accion por defecto 

        const email = document.getElementById('email').value.trim(); // guardamos los valores de email y contraseña
        const password = document.getElementById('password').value;

        if (!email || !password) { // verificamos que todos los campos se han rellenado correctamente
          alert('Por favor, completa todos los campos.');
          return;
        }

        // Mostrar el spinner mientras se espera la respuesta
        const spinner = document.getElementById('spinner');
        spinner.style.display = 'block';  // Mostrar el spinner

        try {
          const response = await fetch(`${API_URL}/login`, { // venga, y ahora realizamos la consulta a nuestra api
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // mediante un post enviamos los datos del formulario en JSON con stringify
          });

          const data = await response.json(); // Obtenemos la respuesta en json

          if (response.ok) { // si hay exito en la respuesta enviamos el mensaje 

            // vamos a almacenar los datos del usuario en el local storage
            localStorage.setItem('usuario', JSON.stringify({
              nombre: data.nombre,
              email: data.email,
              tipoUsuario: data.tipoUsuario,
            }));
 
            // Esperar unos segundos para mostrar el spinner antes de redirigir
            setTimeout(() => {
              window.location.href = '../../index.html'; // Redirigir al index
            }, 1000);  // Aquí se podría ajustar el tiempo de espera

          } else {
            alert(data.message);
          }
        
        } catch (error) {
          console.error('Error al intentar iniciar sesión:', error); // si hubo algun error a la hora de hacer la solicitud o procesarla lo capturamos 
          alert('Hubo un error en el servidor. Intenta de nuevo más tarde.');
        } finally {
          // Ocultar el spinner cuando se termine
          spinner.style.display = 'none'; // Escondemos el spinner cuando se complete el proceso
        }
      });
    }

    // Mostrar nombre del usuario en el header si está logueado
    const userData = JSON.parse(localStorage.getItem('usuario')); // obtenemos los datos de un usuario guardados en el localstorage

    if (userData && userData.nombre) { // sacamos de esos datos el nombre del usuario 
      const usernameElement = document.getElementById('username'); // seleccionamos donde quermos mostrarlo con un selector 
      if (usernameElement) {
        usernameElement.textContent = userData.nombre; // Establecer el nombre del usuario en el header
      }

      const tipoUsuarioNumber = Number(userData.tipoUsuario);

      if (tipoUsuarioNumber === 0) {
        const adminBtn = document.getElementById('admin-panel-btn');
        if (adminBtn) {
          adminBtn.classList.remove('d-none');
        }

        // Mostrar la sección de registro solo si el usuario es admin
        const registerDiv = document.querySelector('.register'); // seleccionamos el contenedor de registro
        if (registerDiv) {
          registerDiv.classList.remove('d-none'); // quitamos la clase que lo oculta
        }
      }

    } else {
      console.log('No se encontró el usuario en localStorage');
    }

    //Cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Eliminar datos del usuario en localStorage
        localStorage.removeItem('usuario');

        // Actualizar el nombre del usuario en el header para reflejar que se ha cerrado sesión
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
          usernameElement.textContent = 'Usuario'; // Volver al estado original
        }
        window.location.reload();
      });
    }
  }, 100);
});
