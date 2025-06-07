document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCountSpan = document.getElementById('taskCount');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Load tasks from local storage when the page loads
    loadTasks();
    updateTaskCount(); // Update count on load

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    clearAllBtn.addEventListener('click', clearAllTasks);

    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === "") {
            alert("Please enter a task.");
            return;
        }

        createTaskElement(taskText, false); // false indicates not completed
        saveTasks(); // Save tasks after adding
        taskInput.value = ''; // Clear the input field
        taskInput.focus(); // Keep focus on the input for quick adding
        updateTaskCount(); // Update count after adding
    }

    function createTaskElement(taskText, isCompleted) {
        const listItem = document.createElement('li');
        if (isCompleted) {
            listItem.classList.add('completed');
        }

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;
        listItem.appendChild(taskSpan);

        // Make task text editable on click
        taskSpan.addEventListener('click', () => {
            if (listItem.classList.contains('editing')) return; // Prevent multiple edit modes

            listItem.classList.add('editing');

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = taskSpan.textContent;
            editInput.classList.add('edit-task-input'); // Add a class for styling

            // Replace span with input
            listItem.replaceChild(editInput, taskSpan);
            editInput.focus(); // Focus on the input field
            editInput.select(); // Select all text in the input

            const saveEdit = () => {
                const newText = editInput.value.trim();
                if (newText === "") {
                    alert("Task cannot be empty. Reverting to original task.");
                    listItem.replaceChild(taskSpan, editInput); // Revert to original span
                } else {
                    taskSpan.textContent = newText;
                    listItem.replaceChild(taskSpan, editInput);
                    saveTasks(); // Save after editing
                }
                listItem.classList.remove('editing');
            };

            // Save on blur
            editInput.addEventListener('blur', saveEdit);
            // Save on Enter key
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    editInput.blur(); // Trigger blur to save
                }
            });
        });


        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const completeBtn = document.createElement('button');
        completeBtn.textContent = isCompleted ? 'Uncomplete' : 'Complete';
        completeBtn.classList.add('complete-btn');
        completeBtn.addEventListener('click', () => {
            listItem.classList.toggle('completed');
            completeBtn.textContent = listItem.classList.contains('completed') ? 'Uncomplete' : 'Complete';
            saveTasks(); // Save after toggling completion
            updateTaskCount(); // Update count after completion toggle
        });
        actionsDiv.appendChild(completeBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            // Optional: Add a fade-out effect before removal
            listItem.style.opacity = '0';
            setTimeout(() => {
                taskList.removeChild(listItem);
                saveTasks(); // Save after deleting
                updateTaskCount(); // Update count after deleting
            }, 300); // Match this with CSS transition duration
        });
        actionsDiv.appendChild(deleteBtn);

        listItem.appendChild(actionsDiv);
        taskList.appendChild(listItem);
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(listItem => {
            tasks.push({
                text: listItem.querySelector('span') ? listItem.querySelector('span').textContent : '', // Handle case where input is active
                completed: listItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                createTaskElement(task.text, task.completed);
            });
        }
    }

    function updateTaskCount() {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('li.completed').length;
        taskCountSpan.textContent = `Total tasks: ${totalTasks} | Completed: ${completedTasks}`;
    }

    function clearAllTasks() {
        if (confirm("Are you sure you want to clear all tasks? This action cannot be undone.")) {
            // Optional: Add a fade-out effect for all tasks
            taskList.style.opacity = '0';
            setTimeout(() => {
                taskList.innerHTML = ''; // Clears all list items
                saveTasks(); // Clear tasks from local storage
                updateTaskCount(); // Reset count
                taskList.style.opacity = '1'; // Bring back opacity
            }, 300);
        }
    }
});