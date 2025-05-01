document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que el formulario y el botón estén cargados
    setTimeout(() => {
        const form = document.querySelector('.formulario');
        const submitButton = document.querySelector('#enviarFormulario');
        const spinner = document.querySelector('#spinner');
        const mensajeExito = document.querySelector('#mensajeExito');

        // Verificar si el formulario y el botón están disponibles
        if (!form || !submitButton) {
            console.error('Formulario o botón de envío no encontrados');
            return;
        }

        // Verificar si el usuario está logueado
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        if (!usuario) {
            // Si no hay usuario logueado, deshabilitar el botón de enviar
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
            alert('Debes iniciar sesión para poder enviar el formulario.');
        } else {
            // Si el usuario está logueado, habilitar el botón de enviar
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');

            // Llenar el campo de nombre automáticamente
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.value = usuario.nombre; // Completa el nombre en el formulario
            }
        }

        // Añadir el evento de clic para el envío del formulario
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevenir el envío por defecto

            // Obtener los datos del formulario
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const tel = document.getElementById('tel').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            const aceptarPoliticas = document.getElementById('aceptarPoliticas').checked;

            console.log('Datos del formulario:', { nombre, email, tel, mensaje, aceptarPoliticas });

            // Validar que los campos obligatorios estén completos
            if (!nombre || !email || !mensaje || !aceptarPoliticas) {
                console.log('Campos no válidos, faltan campos obligatorios.');
                alert('Por favor, completa todos los campos obligatorios y acepta las políticas de privacidad.');
                return;
            }

            // Preparar los datos a enviar al backend
            const formData = {
                nombre,
                email,
                tel,
                mensaje,
                usuarioEmail: usuario.email // Enviar el email del usuario logueado
            };

            console.log('Datos listos para enviar:', formData);

            try {
                // Mostrar el spinner y ocultar el mensaje de éxito
                spinner.style.display = 'inline-block';
                mensajeExito.style.display = 'none';

                const response = await fetch(`${API_URL}/enviar-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                console.log('Respuesta del servidor:', data);

                if (response.ok) {
                    // Ocultar el spinner y mostrar el mensaje de éxito
                    spinner.style.display = 'none';
                    mensajeExito.style.display = 'block';
                    form.reset(); // Resetear el formulario después de enviar

                    // Ocultar el mensaje de éxito después de 2 segundos
                    setTimeout(() => {
                        mensajeExito.style.display = 'none';
                    }, 2000); // 2000ms = 2 segundos
                }
            } catch (error) {
                console.error('Error al intentar enviar el mensaje:', error);
                // Ocultar el spinner
                spinner.style.display = 'none';
            }
        });
    }, 500); // Espera 500ms para asegurarse de que los elementos están listos
});
