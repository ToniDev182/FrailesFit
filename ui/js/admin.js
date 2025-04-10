document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();
        const tableBody = document.getElementById('users-table-body');

        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><input type="text" value="${user.nombre}" class="form-control edit-field" data-field="nombre"></td>
                <td><input type="text" value="${user.apellidos}" class="form-control edit-field" data-field="apellidos"></td>
                <td><input type="email" value="${user.email}" class="form-control edit-field" data-field="email" disabled></td>
                <td><input type="text" value="${user.direccion}" class="form-control edit-field" data-field="direccion"></td>
                <td><input type="text" value="${user.telefono}" class="form-control edit-field" data-field="telefono"></td>
                <td><input type="text" value="${user.dni}" class="form-control edit-field" data-field="dni"></td>
                <td><input type="number" value="${user.edad}" class="form-control edit-field" data-field="edad"></td>
                <td><input type="number" value="${user.tipoUsuario}" class="form-control edit-field" data-field="tipoUsuario"></td>
                <td class="d-flex justify-content-center align-align-items-center">
                    <button class="btn fs-6 m-1 save-btn">✅</button>
                    <button class="btn fs-6 m-1 delete-btn">❌</button>
                </td>
            `;

            tableBody.appendChild(row);

            const saveButton = row.querySelector('.save-btn');
            saveButton.addEventListener('click', async () => {
                const updatedUser = {};

                row.querySelectorAll('.edit-field').forEach(input => {
                    updatedUser[input.getAttribute('data-field')] = input.value;
                });

                try {
                    const response = await fetch(`http://localhost:3000/users/${user.email}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedUser),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('Usuario actualizado correctamente');
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error al actualizar el usuario:', error);
                    alert('Hubo un error al intentar actualizar el usuario.');
                }
            });

            const deleteButton = row.querySelector('.delete-btn');
            deleteButton.addEventListener('click', async () => {
                const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este usuario?');
                if (confirmDelete) {
                    try {
                        const response = await fetch(`http://localhost:3000/users/${user.email}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                        });

                        if (response.ok) {
                            alert('Usuario eliminado correctamente');
                            tableBody.removeChild(row);
                        } else {
                            const data = await response.json();
                            alert(data.message);
                        }
                    } catch (error) {
                        console.error('Error al eliminar el usuario:', error);
                        alert('Hubo un error al intentar eliminar el usuario.');
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    }
});
