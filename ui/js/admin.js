function esperarElemento(selector, callback) {
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    }
  }, 100); // Revisa cada 100ms
}

esperarElemento('#inputBusqueda', (inputBusqueda) => {
  const listaSugerencias = document.getElementById('listaSugerencias');
  const tableBody = document.getElementById('users-table-body');

  function limpiarTabla() {
    tableBody.innerHTML = '';
  }

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
          user.email = updatedUser.email;
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

  async function buscarUsuarios(query) {
    if (!query) {
      listaSugerencias.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error buscando usuarios');

      const users = await response.json();
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

  let debounceTimeout;
  inputBusqueda.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      buscarUsuarios(inputBusqueda.value.trim());
    }, 300);
  });
});
