document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Hacemos la petición al endpoint para obtener todos los pagos
        const response = await fetch(`${API_URL}/api/pagos`);
        const responseText = await response.text();  // Obtener la respuesta como texto

        let pagos;
        try {
            pagos = JSON.parse(responseText);  // Intentar convertirla a JSON
        } catch (error) {
            console.error('La respuesta no es JSON:', error);
            alert('Error al obtener los pagos. La respuesta no es JSON.');
            return;
        }

        // Obtener el select para los usuarios
        const selectUsuarios = document.getElementById('filtro-usuarios');

        // Crear un conjunto para evitar duplicados
        const usuarios = new Set();

        // Llenar el conjunto con los nombres completos de los usuarios
        pagos.forEach(pago => {
            usuarios.add(`${pago.nombre} ${pago.apellidos}`);
        });

        // Llenar el select con los usuarios
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            selectUsuarios.appendChild(option);
        });

        // Obtener la tabla para los pagos
        const tableBody = document.getElementById('pagos-table-body');

        // Función para actualizar la tabla según el usuario seleccionado
        const actualizarPagos = (usuarioSeleccionado) => {
            tableBody.innerHTML = '';  // Limpiar la tabla

            // Filtrar los pagos por el usuario seleccionado
            const pagosUsuario = pagos.filter(pago => `${pago.nombre} ${pago.apellidos}` === usuarioSeleccionado);

            // Si no hay pagos para el usuario, mostrar mensaje
            if (pagosUsuario.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `<td colspan="11" class="text-center">No hay pagos para este usuario.</td>`;
                tableBody.appendChild(noDataRow);
                return;
            }

            // Iterar sobre los pagos del usuario seleccionado y mostrarlos en la tabla
            pagosUsuario.forEach(pago => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td><input type="email" value="${pago.email}" class="form-control" data-field="email" disabled></td>
                    <td><input type="text" value="${pago.mes_anio || ''}" class="form-control edit-field" data-field="mes_anio"></td>
                    <td><input type="text" value="${pago.nombre}" class="form-control" data-field="nombre" disabled></td>
                    <td><input type="text" value="${pago.apellidos}" class="form-control" data-field="apellidos" disabled></td>
                    <td><input type="text" value="${pago.mes}" class="form-control edit-field" data-field="mes"></td>
                    <td><input type="number" value="${pago.anio}" class="form-control edit-field" data-field="anio"></td>
                    <td><input type="text" value="${pago.estado}" class="form-control edit-field" data-field="estado"></td>
                    <td><input type="date" value="${pago.fechaPago || ''}" class="form-control edit-field" data-field="fechaPago"></td>
                    <td><input type="number" value="${pago.cantidad || ''}" class="form-control edit-field" data-field="cantidad"></td>
                    <td><input type="text" value="${pago.metodo || ''}" class="form-control edit-field" data-field="metodo"></td>
                    <td class="d-flex justify-content-center align-items-center">
                        <button class="btn fs-6 m-1 save-btn">✅</button>
                        <button class="btn fs-6 m-1 delete-btn">❌</button>
                        <button class="btn fs-6 m-1 new-btn">➕</button>
                    </td>
                `;

                tableBody.appendChild(row);

                // Guardar cambios del pago
                const saveButton = row.querySelector('.save-btn');
                saveButton.addEventListener('click', async () => {
                    const updatedPago = {};
                    row.querySelectorAll('.edit-field').forEach(input => {
                        updatedPago[input.getAttribute('data-field')] = input.value;
                    });

                    // Generación automática del campo mes_anio
                    const mes_anio = `${updatedPago.anio}-${String(updatedPago.mes || new Date().getMonth() + 1).padStart(2, '0')}`;
                    updatedPago.mes_anio = mes_anio;

                    try {
                        const response = await fetch(`${API_URL}/api/pagos/${pago.email}/${pago.mes_anio}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedPago),
                        });

                        const responseText = await response.text();
                        let data;
                        try {
                            data = JSON.parse(responseText);
                        } catch (error) {
                            console.error('La respuesta no es JSON:', error);
                            alert('Error al actualizar el pago. La respuesta no es JSON.');
                            return;
                        }

                        if (response.ok) {
                            alert('Pago actualizado correctamente');
                        } else {
                            alert(data.message);
                        }
                    } catch (error) {
                        console.error('Error al actualizar el pago:', error);
                        alert('Hubo un error al intentar actualizar el pago.');
                    }
                });

                // Eliminar pago
                const deleteButton = row.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => {
                    deletePago(pago, row);  // Llamamos a la función de eliminación para el pago existente
                });

                // Crear nuevo pago
                const newButton = row.querySelector('.new-btn');
                newButton.addEventListener('click', () => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td><input type="email" value="${pago.email}" class="form-control edit-field" data-field="email" disabled></td>
                        <td><input type="text" value="" class="form-control edit-field" data-field="mes_anio"></td>
                        <td><input type="text" value="${pago.nombre}" class="form-control edit-field" data-field="nombre" disabled></td>
                        <td><input type="text" value="${pago.apellidos}" class="form-control edit-field" data-field="apellidos" disabled></td>
                        <td><input type="text" value="" class="form-control edit-field" data-field="mes"></td>
                        <td><input type="number" value="${new Date().getFullYear()}" class="form-control edit-field" data-field="anio"></td>
                        <td><input type="text" value="no pagado" class="form-control edit-field" data-field="estado"></td>
                        <td><input type="date" value="" class="form-control edit-field" data-field="fechaPago"></td>
                        <td><input type="number" value="" class="form-control edit-field" data-field="cantidad"></td>
                        <td><input type="text" value="" class="form-control edit-field" data-field="metodo"></td>
                        <td class="d-flex justify-content-center align-items-center">
                            <button class="btn fs-6 m-1 save-btn">✅</button>
                            <button class="btn fs-6 m-1 delete-btn">❌</button>
                        </td>
                    `;

                    tableBody.appendChild(newRow);

                    // Función para guardar el nuevo pago
                    const saveNewButton = newRow.querySelector('.save-btn');
                    saveNewButton.addEventListener('click', async () => {
                        const newPago = {};
                        newRow.querySelectorAll('.edit-field').forEach(input => {
                            newPago[input.getAttribute('data-field')] = input.value;
                        });

                        // Verificación de campos obligatorios
                        if (!newPago.email || !newPago.mes || !newPago.anio) {
                            alert('Faltan campos obligatorios (email, mes o año)');
                            return;
                        }

                        // Generación automática del campo mes_anio
                        const mes_anio = `${newPago.anio}-${String(newPago.mes).padStart(2, '0')}`;
                        newPago.mes_anio = mes_anio;

                        try {
                            const response = await fetch(`${API_URL}/api/pagos/nuevo`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newPago),
                            });

                            const responseText = await response.text();
                            let data;
                            try {
                                data = JSON.parse(responseText);  // Intentar convertir la respuesta a JSON
                            } catch (error) {
                                console.error('La respuesta no es JSON:', error);
                                alert('Error al crear el nuevo pago. La respuesta no es JSON.');
                                return;
                            }

                            if (response.ok) {
                                alert('Nuevo pago creado correctamente');
                            } else {
                                alert(data.message || 'Error desconocido al guardar el pago.');
                            }
                        } catch (error) {
                            console.error('Error al crear el nuevo pago:', error);
                            alert('Hubo un error al intentar crear el nuevo pago.');
                        }
                    });
                });
            });
        };

        // Cuando se cambia el usuario en el select
        selectUsuarios.addEventListener('change', () => {
            const usuarioSeleccionado = selectUsuarios.value;
            if (usuarioSeleccionado) {
                actualizarPagos(usuarioSeleccionado);  // Llamar a la función para mostrar los pagos del usuario seleccionado
            } else {
                tableBody.innerHTML = '';  // Limpiar la tabla si no hay usuario seleccionado
            }
        });
    } catch (error) {
        console.error('Error al cargar los pagos:', error);
        alert('Hubo un error al cargar los pagos.');
    }
});

async function deletePago(pago, row) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este pago?');
    if (confirmDelete) {
        try {
            const response = await fetch(`${API_URL}/api/pagos/${pago ? pago.email : ''}/${pago ? pago.mes_anio : ''}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                alert('Pago eliminado correctamente');
                row.remove();  // Eliminar la fila de la tabla
            } else {
                const responseText = await response.text();
                const responseData = JSON.parse(responseText);
                alert(responseData.message || 'Error al eliminar el pago');
            }
        } catch (error) {
            console.error('Error al eliminar el pago:', error);
            alert('Hubo un error al eliminar el pago.');
        }
    }
}
