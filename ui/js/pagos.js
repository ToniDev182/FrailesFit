document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Hacemos la petición al endpoint para obtener los pagos
        const response = await fetch('http://localhost:3000/api/pagos');
        const responseText = await response.text();  // Obtener la respuesta como texto

        let pagos;
        try {
            pagos = JSON.parse(responseText);  // Intentar convertirla a JSON
        } catch (error) {
            console.error('La respuesta no es JSON:', error);
            alert('Error al obtener los pagos. La respuesta no es JSON.');
            return;
        }

        const tableBody = document.getElementById('pagos-table-body');
        
        // Creamos un objeto para agrupar los pagos por email
        const pagosPorUsuario = pagos.reduce((acc, pago) => {
            if (!acc[pago.email]) {
                acc[pago.email] = [];
            }
            acc[pago.email].push(pago);
            return acc;
        }, {});

        // Iteramos sobre los pagos por usuario
        for (const [email, pagosUsuario] of Object.entries(pagosPorUsuario)) {
            // Fila con el correo del usuario, nombre y apellidos como encabezado
            const headerRow = document.createElement('tr');
            const primerPago = pagosUsuario[0];  // Tomamos el primer pago para obtener el nombre y apellidos
            headerRow.innerHTML = `
                <td colspan="11" class="text-center fw-bold">
                    ${primerPago.nombre} ${primerPago.apellidos} (${email})
                </td>
            `;
            tableBody.appendChild(headerRow);

            // Iteramos sobre los pagos de cada usuario
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

                // guardar cambios  
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
                        const response = await fetch(`http://localhost:3000/api/pagos/${pago.email}/${pago.mes_anio}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedPago),
                        });

                        const responseText = await response.text();
                        console.log(responseText);

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

                // Eliminar pago (Función unificada para eliminar pagos)
                const deleteButton = row.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => {
                    deletePago(pago, row);  // Llamamos a la función de eliminación para el pago existente
                });

                // Nuevo pago para el mismo usuario
                const newButton = row.querySelector('.new-btn');
                newButton.addEventListener('click', () => {
                    const newRow = document.createElement('tr');

                    newRow.innerHTML = `
                        <td><input type="email" value="${pago.email}" class="form-control" data-field="email" disabled></td>
                        <td><input type="text" value="" class="form-control edit-field" data-field="mes_anio"></td>
                        <td><input type="text" value="${pago.nombre}" class="form-control" data-field="nombre" disabled></td>
                        <td><input type="text" value="${pago.apellidos}" class="form-control" data-field="apellidos" disabled></td>
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

                        // Agregar los valores de los campos que no tienen la clase 'edit-field' (correo, nombre, apellidos)
                        newPago.email = newRow.querySelector('input[data-field="email"]').value;
                        newPago.nombre = newRow.querySelector('input[data-field="nombre"]').value;
                        newPago.apellidos = newRow.querySelector('input[data-field="apellidos"]').value;

                        console.log('Nuevo pago a guardar:', newPago);  // Verifica los datos

                        // Verificación de campos obligatorios
                        if (!newPago.email || !newPago.mes || !newPago.anio) {
                            alert('Faltan campos obligatorios (email, mes o año)');
                            return;
                        }

                        // Generación automática del campo mes_anio
                        const mes_anio = `${newPago.anio}-${String(newPago.mes).padStart(2, '0')}`;
                        newPago.mes_anio = mes_anio;

                        try {
                            const response = await fetch('http://localhost:3000/api/pagos/nuevo', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newPago),
                            });

                            const responseText = await response.text();
                            console.log(responseText);  // Verificar la respuesta del servidor

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

                    // Función para eliminar el nuevo pago
                    const deleteNewButton = newRow.querySelector('.delete-btn');
                    deleteNewButton.addEventListener('click', () => {
                        deletePago(null, newRow);  // Llamamos a la función de eliminación para el nuevo pago
                    });
                });
            });
        }

    } catch (error) {
       
    }
});

async function deletePago(pago, row) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este pago?');
    if (confirmDelete) {
        try {
            const response = await fetch(`http://localhost:3000/api/pagos/${pago ? pago.email : ''}/${pago ? pago.mes_anio : ''}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            // Verificar si el tipo de contenido es JSON
            const contentType = response.headers.get("Content-Type");
            let responseText = await response.text();  // Leer la respuesta como texto

            // Solo parseamos la respuesta si es JSON
            let data = null;
            if (contentType && contentType.includes("application/json")) {
                try {
                    data = JSON.parse(responseText);
                } catch (error) {
                    console.error('Error al parsear JSON:', error);
                    alert('La respuesta del servidor no es JSON válido.');
                    return;
                }
            }

            if (response.ok) {
                alert('Pago eliminado correctamente');
                row.remove(); // Eliminar la fila de la tabla
            } else {
                alert(data ? data.message : 'Error al eliminar el pago');
            }
        } catch (error) {
            console.error('Error al eliminar el pago:', error);
            alert('Hubo un error al intentar eliminar el pago.');
        }
    }
}
