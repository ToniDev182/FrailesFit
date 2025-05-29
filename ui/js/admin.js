document.addEventListener('DOMContentLoaded', () => {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const listaSugerencias = document.getElementById('listaSugerencias');
  const tableBody = document.getElementById('users-table-body');

  // Función para limpiar la tabla de usuario(s)
  function limpiarTabla() {
    tableBody.innerHTML = '';
  }

  // Función para mostrar un usuario en la tabla (igual que antes)
  function mostrarUsuario(user) {
    limpiarTabla();

    const row = document.createElement('tr');

    row.innerHTML = `
      <td><input type="text" value="${user.nombre}" class="form-control edit-field" data-field="nombre"></td>
      <td><input type="text" value="${user.apellidos}" class="form-control edit-field" data-field="apellidos"></td>
      <td><input type="email" value="${user.email}" class="form-control edit-field" data-field="email"></td>
      <td><input type="text" value="${user.direccion}" class="form-control edit-field" data-field="direccion"></td>
      <td><input type="text" value="${user.telefono}" class="form-control edit-field" data-field="telefono"></td>
      <td><input type="text" value="${user.dni}" class="form-control edit-field" data-field="dni"></td>
      <td><input type="number" value="${user.edad}" class="form-control edit-field" data-field="edad"></td>
      <td><input type="number" value="${user.tipoUsuario}" class="form-control edit-field" data-field="tipoUsuario"></td>
      <td class="d-flex justify-content-center align-items-center">
        <button class="btn fs-6 m-1 save-btn">✅</button>
        <button class="btn fs-6 m-1 delete-btn">❌</button>
      </td>
    `;

    tableBody.appendChild(row);

    // Guardar cambios
    const saveButton = row.querySelector('.save-btn');
    saveButton.addEventListener('click', async () => {
      const updatedUser = {};

      row.querySelectorAll('.edit-field').forEach(input => {
        updatedUser[input.getAttribute('data-field')] = input.value;
      });

      try {
        const response = await fetch(`${API_URL}/users/${user.email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Usuario actualizado correctamente');
          // Actualizar email en caso de que cambie para futuras operaciones (si aplicase)
          user.email = updatedUser.email;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        alert('Hubo un error al intentar actualizar el usuario.');
      }
    });

    // Eliminar usuario
    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', async () => {
      const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este usuario?');
      if (confirmDelete) {
        try {
          const response = await fetch(`${API_URL}/users/${user.email}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            alert('Usuario eliminado correctamente');
            limpiarTabla();
            inputBusqueda.value = '';
            listaSugerencias.innerHTML = '';
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
  }

  // Buscar usuarios para sugerencias según el texto (fetch al backend)
  async function buscarUsuarios(query) {
    if (!query) {
      listaSugerencias.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error buscando usuarios');
      }
      const users = await response.json();

      // Mostrar sugerencias
      listaSugerencias.innerHTML = '';

      if (users.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay resultados';
        li.classList.add('list-group-item', 'text-muted');
        listaSugerencias.appendChild(li);
        return;
      }

      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.nombre} ${user.apellidos}`;
        li.classList.add('list-group-item', 'list-group-item-action');
        li.style.cursor = 'pointer';

        li.addEventListener('click', () => {
          mostrarUsuario(user);
          listaSugerencias.innerHTML = '';
          inputBusqueda.value = `${user.nombre} ${user.apellidos}`;
        });

        listaSugerencias.appendChild(li);
      });
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    }
  }

  // Evento input con debounce para no saturar peticiones
  let debounceTimeout;
  inputBusqueda.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      buscarUsuarios(inputBusqueda.value.trim());
    }, 300);
  });
});
