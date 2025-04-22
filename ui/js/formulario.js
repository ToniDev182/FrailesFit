document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que el formulario y el botón estén cargados
    setTimeout(() => {
        const form = document.querySelector('.formulario');
        const submitButton = document.querySelector('#enviarFormulario');

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
                const response = await fetch('http://localhost:3000/enviar-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                console.log('Respuesta del servidor:', data);

                if (response.ok) {
                    alert('¡Mensaje enviado exitosamente!');
                    form.reset(); // Resetear el formulario después de enviar
                } else {
                    alert('Hubo un error al enviar el mensaje.');
                }
            } catch (error) {
                console.error('Error al intentar enviar el mensaje:', error);
                alert('Hubo un error en el servidor. Intenta de nuevo más tarde.');
            }
        });
    }, 500); // Espera 500ms para asegurarse de que los elementos están listos
});
