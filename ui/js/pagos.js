function esperarElemento(selector, callback) {
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    }
  }, 100);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Petición para obtener todos los pagos
    const response = await fetch(`${API_URL}/api/pagos`);
    const responseText = await response.text();

    let pagos;
    try {
      pagos = JSON.parse(responseText);
    } catch (error) {
      console.error('La respuesta no es JSON:', error);
      alert('Error al obtener los pagos. La respuesta no es JSON.');
      return;
    }

    const tableBody = document.getElementById('pagos-table-body');

    // Función para actualizar la tabla según texto de búsqueda
    const actualizarPagos = (textoBusqueda) => {
      tableBody.innerHTML = ''; // limpiar tabla

      const texto = textoBusqueda.trim().toLowerCase();
      const pagosFiltrados = pagos.filter(pago => {
        const nombreCompleto = `${pago.nombre} ${pago.apellidos}`.toLowerCase();
        return nombreCompleto.includes(texto);
      });

      if (pagosFiltrados.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="11" class="text-center">No hay pagos para este usuario.</td>`;
        tableBody.appendChild(noDataRow);
        return;
      }

      pagosFiltrados.forEach(pago => {
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

          // Aquí NO validamos ni formateamos mes_anio, solo se toma tal cual
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
            } catch {
              alert('Error al actualizar el pago. La respuesta no es JSON.');
              return;
            }

            if (response.ok) {
              alert('Pago actualizado correctamente');
            } else {
              alert(data.message || 'Error al actualizar el pago');
            }
          } catch (error) {
            console.error('Error al actualizar el pago:', error);
            alert('Hubo un error al intentar actualizar el pago.');
          }
        });

        // Eliminar pago
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
          deletePago(pago, row);
        });

        // Crear nuevo pago
        const newButton = row.querySelector('.new-btn');
        newButton.addEventListener('click', () => {
          const newRow = document.createElement('tr');
          newRow.innerHTML = `
            <td><input type="email" value="" class="form-control edit-field" data-field="email"></td>
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

          // Guardar nuevo pago
          const saveNewButton = newRow.querySelector('.save-btn');
          saveNewButton.addEventListener('click', async () => {
            const newPago = {};
            newRow.querySelectorAll('.edit-field').forEach(input => {
              newPago[input.getAttribute('data-field')] = input.value;
            });

            if (!newPago.email || !newPago.mes || !newPago.anio) {
              alert('Faltan campos obligatorios (email, mes o año)');
              return;
            }

            
            try {
              const response = await fetch(`${API_URL}/api/pagos/nuevo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPago),
              });

              const responseText = await response.text();
              let data;
              try {
                data = JSON.parse(responseText);
              } catch {
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

    // Esperar a que el input de búsqueda esté cargado antes de usarlo
    esperarElemento('#inputBusquedaPagos', (inputBusqueda) => {
      inputBusqueda.addEventListener('input', (e) => {
        const texto = e.target.value;
        actualizarPagos(texto);
      });

      // Mostrar todos los pagos inicialmente
      actualizarPagos('');
    });
  } catch (error) {
    console.error('Error al cargar los pagos:', error);
    alert('Hubo un error al cargar los pagos.');
  }
});

// Función para eliminar pago
async function deletePago(pago, row) {
  const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este pago?');
  if (confirmDelete) {
    try {
      const response = await fetch(`${API_URL}/api/pagos/${pago ? pago.email : ''}/${pago ? pago.mes_anio : ''}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Pago eliminado correctamente');
        row.remove();
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
