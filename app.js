// Inicializar variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskIdCounter = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;

window.onload = function () {
    updateTaskList();
};

// Agregar evento de submit al formulario
document.getElementById('taskForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Obtener valores del formulario
    const name = document.getElementById('taskName').value;
    const comment = document.getElementById('taskComment').value;
    const time = parseInt(document.getElementById('taskTime').value);


    // Crear nueva tarea
    const task = {
        id: taskIdCounter++,
        name: name,
        comment: comment,
        time: time,
        completed: false
    };

    // Agregar la tarea a la lista y actualizar la interfaz
    tasks.push(task);
    updateLocalStorage();
    updateTaskList();

    // Limpiar el formulario después de agregar una tarea
    document.getElementById('taskForm').reset();
});

// Función para actualizar la lista de tareas en la interfaz
function updateTaskList() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let totalTime = 0;
    let pendingTasks = 0;

    tasks.forEach(task => {
        const row = document.createElement("tr");
        row.id = `taskRow_${task.id}`;
        row.innerHTML = `
            <td>${task.name}</td>
            <td>${task.comment}</td>
            <td>${task.time} minutos</td>
            <td>

                <label class="mycheckbox">
                    <input type="checkbox" onchange="completeTask(${task.id})" ${task.completed ? 'checked' : ''}>
                    <span>
                    <i class="fas fa-check on"></i>
                    </span>
                </label>

                <div class="btn">
                    <button onclick="editTask(${task.id})">Editar</button>
                    <button onclick="deleteTask(${task.id})">Borrar</button>
                </div>
            </td>
        `;

        if (!task.completed) {
            pendingTasks++;
            totalTime += task.time;
        }

        taskList.appendChild(row);
    });

    // Actualizar la información de tareas pendientes y tiempo total
    document.getElementById("pendingTasks").innerText = pendingTasks;
    document.getElementById("totalTime").innerText = totalTime.toFixed();

    // Asignar eventos de botones después de la edición
    tasks.forEach(task => {
        const deleteButton = document.querySelector(`#taskRow_${task.id} button[onclick="deleteTask(${task.id})"]`);
        if (deleteButton) {
            deleteButton.addEventListener("click", () => deleteTask(task.id));
        }
    });
}

// Función para marcar una tarea como completada o a completar
function completeTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    // Alternar entre "A completar" y "Completada"
    task.completed = !task.completed;

    // Actualizar el estado de completado al completar una tarea
    updateLocalStorage();

    // Actualizar la lista de tareas en la interfaz
    updateTaskList();
}

// Función para editar una tarea
function editTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    const taskRow = document.getElementById(`taskRow_${taskId}`);

    // Crear campos de entrada para editar
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = tasks[taskIndex].name;

    const commentInput = document.createElement("textarea");
    commentInput.value = tasks[taskIndex].comment;

    const timeInput = document.createElement("input");
    timeInput.type = "number";
    timeInput.step = "10";
    timeInput.value = tasks[taskIndex].time;
    timeInput.style.width = "50px";
    timeInput.style.textAlign = "center";

    // Reemplazar contenido de la fila con campos de entrada
    taskRow.innerHTML = `
        <td><input type="text" value="${tasks[taskIndex].name}" id="editName_${taskId}" required></td>
        <td><textarea id="editComment_${taskId}" required>${tasks[taskIndex].comment}</textarea></td>
        <td><input type="number" step="10" value="${tasks[taskIndex].time}" id="editTime_${taskId}" required></td>
        <td>
            <button onclick="updateTask(${taskId})">Actualiza</button>
            <button onclick="cancelEdit(${taskId})">Cancela</button>
        </td>
    `;
}

// Función para actualizar una tarea después de editar
function updateTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    // Obtener nuevos valores de los campos de entrada
    const newName = document.getElementById(`editName_${taskId}`).value;
    const newComment = document.getElementById(`editComment_${taskId}`).value;
    const newTime = parseInt(document.getElementById(`editTime_${taskId}`).value);

    // Actualizar la tarea con los nuevos valores
    tasks[taskIndex].name = newName;
    tasks[taskIndex].comment = newComment;
    tasks[taskIndex].time = newTime;

    // Restablecer el estado a "A completar" después de editar
    tasks[taskIndex].completed = false;

    // Volver a mostrar la fila de la tabla con los nuevos valores
    updateTaskList();
}

// Función para cancelar la edición y volver a mostrar la fila original
function cancelEdit(taskId) {
    // Recargar la fila original de la tarea
    updateTaskList();
}


// Función para borrar una tarea
function deleteTask(taskId) {
    const confirmation = confirm("¿Estás seguro de que quieres borrar esta tarea?");

    if (confirmation) {
        tasks = tasks.filter(task => task.id !== taskId);
        updateLocalStorage();
        updateTaskList();
    }
}

// Función para actualizar el almacenamiento local
function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}