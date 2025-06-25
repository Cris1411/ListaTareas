// Inicialización de variables globales
// Cargamos las tareas guardadas en localStorage o inicializamos un array vacío
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
// Inicializamos el contador de IDs basado en la última tarea existente
let contadorIdTarea = tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1;

// Referencia al botón de modo oscuro
const interruptorModoOscuro = document.getElementById('interruptorModoOscuro');

// Función para verificar y aplicar el modo oscuro al cargar la página
function aplicarPreferenciaModoOscuro() {
    const esModoOscuro = localStorage.getItem('modoOscuro') === 'activado';
    if (esModoOscuro) {
        document.body.classList.add('modo-oscuro');
        interruptorModoOscuro.textContent = 'Modo Claro';
    } else {
        document.body.classList.remove('modo-oscuro');
        interruptorModoOscuro.textContent = 'Modo Oscuro';
    }
}

// Llamar a la función al cargar la página
aplicarPreferenciaModoOscuro();

// Event listener para el botón de modo oscuro
interruptorModoOscuro.addEventListener('click', () => {
    if (document.body.classList.contains('modo-oscuro')) {
        document.body.classList.remove('modo-oscuro');
        localStorage.setItem('modoOscuro', 'desactivado');
        interruptorModoOscuro.textContent = 'Modo Oscuro';
    } else {
        document.body.classList.add('modo-oscuro');
        localStorage.setItem('modoOscuro', 'activado');
        interruptorModoOscuro.textContent = 'Modo Claro';
    }
});

// Función que se ejecuta cuando la página termina de cargar
window.onload = function () {
    actualizarListaTareas();
};

// Evento que maneja el envío del formulario para crear nuevas tareas
document.getElementById('formularioTarea').addEventListener('submit', function (evento) {
    evento.preventDefault(); // Prevenimos el comportamiento por defecto del formulario

    // Obtenemos los valores ingresados por el usuario
    const nombre = document.getElementById('nombreTarea').value;
    const comentario = document.getElementById('comentarioTarea').value;
    const tiempo = parseInt(document.getElementById('tiempoTarea').value);

    // Creamos un nuevo objeto tarea con los datos ingresados
    const tarea = {
        id: contadorIdTarea++, // Asignamos un ID único e incrementamos el contador
        nombre: nombre,
        comentario: comentario,
        tiempo: tiempo,
        completada: false // Por defecto, la tarea no está completada
    };

    // Agregamos la nueva tarea al array y actualizamos la interfaz
    tareas.push(tarea);
    actualizarLocalStorage(); // Guardamos en localStorage
    actualizarListaTareas(); // Actualizamos la visualización

    // Limpiamos el formulario para una nueva entrada
    document.getElementById('formularioTarea').reset();
});

// Función que actualiza la lista de tareas en la interfaz
function actualizarListaTareas() {
    const listaTareas = document.getElementById("listaTareas");
    listaTareas.innerHTML = ""; // Limpiamos la lista actual

    // Variables para el cálculo de estadísticas
    let tiempoTotal = 0;
    let tareasPendientes = 0;

    // Iteramos sobre cada tarea para crear su representación visual
    tareas.forEach(tarea => {
        const fila = document.createElement("tr");
        fila.id = `filaTarea_${tarea.id}`;
        // Creamos el HTML para cada fila de tarea
        fila.innerHTML = `
            <td>${tarea.nombre}</td>
            <td>${tarea.comentario}</td>
            <td>${tarea.tiempo} minutos</td>
            <td>
                <label class="mycheckbox">
                    <input type="checkbox" onchange="completarTarea(${tarea.id})" ${tarea.completada ? 'checked' : ''}>
                    <span>
                    <i class="fas fa-check on"></i>
                    </span>
                </label>

                <div class="btn">
                    <button onclick="editarTarea(${tarea.id})">Editar</button>
                    <button onclick="borrarTarea(${tarea.id})">Borrar</button>
                </div>
            </td>
        `;

        // Actualizamos las estadísticas si la tarea no está completada
        if (!tarea.completada) {
            tareasPendientes++;
            tiempoTotal += tarea.tiempo;
        }

        listaTareas.appendChild(fila);
    });

    // Actualizamos los contadores en la interfaz
    document.getElementById("tareasPendientes").innerText = tareasPendientes;
    document.getElementById("tiempoTotal").innerText = tiempoTotal.toFixed();

    // Asignamos eventos a los botones de eliminar
    tareas.forEach(tarea => {
        const botonBorrar = document.querySelector(`#filaTarea_${tarea.id} button[onclick="borrarTarea(${tarea.id})"]`);
        if (botonBorrar) {
            botonBorrar.addEventListener("click", () => borrarTarea(tarea.id));
        }
    });
}

// Función para marcar una tarea como completada o no completada
function completarTarea(idTarea) {
    const tarea = tareas.find(tarea => tarea.id === idTarea);
    tarea.completada = !tarea.completada; // Invertimos el estado actual
    actualizarLocalStorage(); // Guardamos los cambios
    actualizarListaTareas(); // Actualizamos la interfaz
}

// Función para iniciar la edición de una tarea
function editarTarea(idTarea) {
    const indiceTarea = tareas.findIndex(tarea => tarea.id === idTarea);
    const filaTarea = document.getElementById(`filaTarea_${idTarea}`);

    // Reemplazamos la fila con campos de edición
    filaTarea.innerHTML = `
        <td><input type="text" value="${tareas[indiceTarea].nombre}" id="editarNombre_${idTarea}" required></td>
        <td><textarea id="editarComentario_${idTarea}" required>${tareas[indiceTarea].comentario}</textarea></td>
        <td><input type="number" step="10" value="${tareas[indiceTarea].tiempo}" id="editarTiempo_${idTarea}" required></td>
        <td>
            <button onclick="actualizarTarea(${idTarea})">Actualizar</button>
            <button onclick="cancelarEdicion(${idTarea})">Cancelar</button>
        </td>
    `;
}

// Función para guardar los cambios después de editar una tarea
function actualizarTarea(idTarea) {
    const indiceTarea = tareas.findIndex(tarea => tarea.id === idTarea);

    // Obtenemos los nuevos valores ingresados
    const nuevoNombre = document.getElementById(`editarNombre_${idTarea}`).value;
    const nuevoComentario = document.getElementById(`editarComentario_${idTarea}`).value;
    const nuevoTiempo = parseInt(document.getElementById(`editarTiempo_${idTarea}`).value);

    // Actualizamos la tarea con los nuevos valores
    tareas[indiceTarea].nombre = nuevoNombre;
    tareas[indiceTarea].comentario = nuevoComentario;
    tareas[indiceTarea].tiempo = nuevoTiempo;
    tareas[indiceTarea].completada = false; // Reseteamos el estado a no completado

    actualizarListaTareas(); // Actualizamos la interfaz
}

// Función para cancelar la edición y volver al estado original
function cancelarEdicion(idTarea) {
    actualizarListaTareas(); // Recargamos la lista original
}

// Función para eliminar una tarea
function borrarTarea(idTarea) {
    // Pedimos confirmación antes de eliminar
    const confirmacion = confirm("¿Estás seguro de que quieres borrar esta tarea?");

    if (confirmacion) {
        // Filtramos la tarea a eliminar del array
        tareas = tareas.filter(tarea => tarea.id !== idTarea);
        actualizarLocalStorage(); // Guardamos los cambios
        actualizarListaTareas(); // Actualizamos la interfaz
    }
}

// Función para guardar las tareas en localStorage
function actualizarLocalStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}