document.addEventListener("DOMContentLoaded", () => {
    let todosLosEjercicios = [];
    let rutina = {}; // Aquí almacenaremos la rutina que vamos a enviar al backend

    async function cargarEjercicios() {
        try {
            const res = await fetch("http://localhost:3000/ejercicios");
            if (!res.ok) throw new Error("Error al obtener los ejercicios. Estado: " + res.status);

            const data = await res.json();
            if (!data.ejercicios) throw new Error("La respuesta no contiene ejercicios.");

            todosLosEjercicios = data.ejercicios;
            mostrarEjercicios(todosLosEjercicios);
        } catch (error) {
            console.error("Error al cargar ejercicios:", error);
        }
    }

    async function cargarUsuarios() {
        try {
            const res = await fetch("http://localhost:3000/users");
            if (!res.ok) throw new Error("Error al obtener los usuarios. Estado: " + res.status);

            const usuarios = await res.json();
            const selectUsuarios = document.getElementById("emailUsuario");

            if (!Array.isArray(usuarios)) {
                throw new Error("La respuesta no es un array de usuarios.");
            }

            usuarios.forEach(usuario => {
                const option = document.createElement("option");
                option.value = usuario.email;
                option.textContent = usuario.email;
                selectUsuarios.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    }

    function mostrarEjercicios(lista) {
        const listaEjercicios = document.getElementById("listaEjercicios");
        if (!listaEjercicios) {
            console.error("Elemento #listaEjercicios no encontrado en el DOM");
            return;
        }

        listaEjercicios.innerHTML = "";

        lista.forEach((ej) => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-3";

            col.innerHTML = `
                <div class="card h-100">
                    <img src="${ej.imagenUrl}" class="card-img-top" alt="${ej.nombre}" style="max-width: 100%; height: auto; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title">${ej.nombre}</h5>
                        <p class="card-text">${ej.grupoMuscular}</p>

                        <div class="mb-2">
                            <label class="form-label mb-0">Repeticiones</label>
                            <input type="text" class="form-control form-control-sm repeticiones" placeholder="Ej: 4x12">
                        </div>
                        <div class="mb-2">
                            <label class="form-label mb-0">Observaciones</label>
                            <input type="text" class="form-control form-control-sm observaciones" placeholder="Ej: Cuidar la técnica">
                        </div>
                        <div class="input-group mb-2">
                            <select class="form-select dias-select">
                                <option value="lunes">Lunes</option>
                                <option value="martes">Martes</option>
                                <option value="miercoles">Miércoles</option>
                                <option value="jueves">Jueves</option>
                                <option value="viernes">Viernes</option>
                            </select>
                            <button class="btn btn-outline-success btn-sm btn-agregar">Añadir</button>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                const botonAgregar = col.querySelector(".btn-agregar");
                const selectDia = col.querySelector(".dias-select");
                const inputReps = col.querySelector(".repeticiones");
                const inputObs = col.querySelector(".observaciones");

                botonAgregar.addEventListener("click", () => {
                    const dia = selectDia.value;
                    const repeticiones = inputReps.value.trim();
                    const observaciones = inputObs.value.trim();

                    agregarEjercicioADia(ej, dia, repeticiones, observaciones);
                });
            }, 0);

            listaEjercicios.appendChild(col);
        });
    }

    function agregarEjercicioADia(ejercicio, dia, repeticiones, observaciones) {
        if (!rutina[dia]) {
            rutina[dia] = [];
        }

        rutina[dia].push({
            nombre: ejercicio.nombre,
            repeticiones: repeticiones,
            observaciones: observaciones,
            imagenUrl: ejercicio.imagenUrl,
        });

        const ulDia = document.getElementById(dia);
        if (!ulDia) {
            console.warn(`No se encontró la lista para el día: ${dia}`);
            return;
        }

        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-start flex-column flex-md-row">
                <div class="d-flex align-items-center">
                    <img src="${ejercicio.imagenUrl}" alt="${ejercicio.nombre}" class="img-thumbnail me-3" style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <strong>${ejercicio.nombre}</strong> <br>
                        <small><em>${repeticiones || "Sin repeticiones"}</em> - ${observaciones || "Sin observaciones"}</small>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm mt-2 mt-md-0">✖</button>
            </div>
        `;

        li.querySelector("button").addEventListener("click", () => li.remove());

        ulDia.appendChild(li);
    }

    async function guardarRutina() {
        console.log("Intentando guardar rutina...");
        const nombre = document.getElementById("nombreRutina").value;
        const email = document.getElementById("emailUsuario").value;

        if (!email) {
            alert("Por favor, selecciona un usuario");
            console.log("No se seleccionó un usuario.");
            return;
        }

        if (Object.keys(rutina).length === 0) {
            alert("No has añadido ningún ejercicio a la rutina");
            console.log("No se añadieron ejercicios a la rutina.");
            return;
        }

        try {
            console.log("Enviando la rutina al backend...");
            const response = await fetch("http://localhost:3000/rutinas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    nombre: nombre,
                    rutina: rutina,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al guardar la rutina");
            }

            const data = await response.json();
            alert(data.message || "Rutina guardada correctamente");
            console.log("Rutina guardada correctamente.");
        } catch (error) {
            console.error("Error al guardar rutina:", error);
            alert("Hubo un error al guardar la rutina");
        }
    }

    function configurarBotonGuardar() {
        const botonGuardarRutina = document.getElementById("guardarRutina");
        if (botonGuardarRutina) {
            botonGuardarRutina.addEventListener("click", () => {
                console.log("Botón 'Guardar rutina' clickeado.");
                guardarRutina();
            });
        } else {
            setTimeout(configurarBotonGuardar, 100);
        }
    }

    function configurarFiltro() {
        const filtroGrupo = document.getElementById("filtroGrupo");

        if (filtroGrupo) {
            filtroGrupo.addEventListener("change", () => {
                const grupoSeleccionado = filtroGrupo.value;
                if (grupoSeleccionado === "Todos") {
                    mostrarEjercicios(todosLosEjercicios);
                } else {
                    const ejerciciosFiltrados = todosLosEjercicios.filter(
                        ej => ej.grupoMuscular === grupoSeleccionado
                    );
                    mostrarEjercicios(ejerciciosFiltrados);
                }
            });
        } else {
            console.warn("No se encontró el elemento #filtroGrupo");
        }
    }

    function comprobarElemento() {
        const listaEjercicios = document.getElementById("listaEjercicios");
        const selectUsuarios = document.getElementById("emailUsuario");

        if (listaEjercicios && selectUsuarios) {
            cargarEjercicios();
            cargarUsuarios();
            configurarFiltro();
            configurarBotonGuardar(); // Aquí añadimos el botón a la comprobación
        } else {
            setTimeout(comprobarElemento, 100);
        }
    }

    comprobarElemento();
});
