document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDescriptionInput = document.getElementById('todo-description');
    const todoPriorityInput = document.getElementById('todo-priority');
    const dueDateInput = document.getElementById('due-date-input');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const progressBar = document.getElementById('progress-bar');
    const taskCounter = document.getElementById('task-counter');
    const dateFilterInput = document.getElementById('date-filter-input');
    const clearDateFilterBtn = document.getElementById('clear-date-filter-btn');
    const currentDatetimeEl = document.getElementById('current-datetime');

    // Detail Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const detailTaskTitle = document.getElementById('detail-task-title');
    const detailTaskDescription = document.getElementById('detail-task-description');
    const detailPriority = document.getElementById('detail-priority');
    const detailDueDate = document.getElementById('detail-due-date');
    const detailCreatedAt = document.getElementById('detail-created-at');
    const detailStatus = document.getElementById('detail-status');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskText = document.getElementById('edit-task-text');
    const editTaskDescription = document.getElementById('edit-task-description');
    const editDueDate = document.getElementById('edit-due-date');
    const editPriority = document.getElementById('edit-priority');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Confirm Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmText = document.getElementById('confirm-text');
    const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
    const confirmActionBtn = document.getElementById('confirm-action-btn');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let selectedDateFilter = null;

    // New Date Time Function
    const updateDateTime = () => {
        const now = new Date();
        const options = {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        currentDatetimeEl.textContent = now.toLocaleString('en-US', options);
    };

    // Core Functions
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const renderTasks = () => {
        const tasksToRender = filterTasks();
        todoList.innerHTML = '';
        updateProgress();
        if (tasksToRender.length === 0) {
            emptyState.classList.remove('hidden');
            todoList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            todoList.classList.remove('hidden');
            tasksToRender.forEach(task => todoList.appendChild(createTaskElement(task)));
        }
    };

    const filterTasks = () => {
        if (selectedDateFilter) {
            return tasks.filter(task => task.dueDate === selectedDateFilter);
        }
        switch (currentFilter) {
            case 'pending':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            case 'all':
            default:
                return tasks;
        }
    };
    
    const updateProgress = () => {
        const completedTasks = tasks.filter(t => t.completed).length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        taskCounter.textContent = `${completedTasks}/${totalTasks} Tasks Completed`;
    };

    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        const today = new Date(); today.setHours(0,0,0,0);
        const dueDate = new Date(task.dueDate);
        let dateClass = '', formattedDueDate = 'No due date';
        if (task.dueDate) {
            if (new Date(dueDate.toDateString()) < today) dateClass = 'overdue';
            else if (new Date(dueDate.toDateString()).getTime() === today.getTime()) dateClass = 'due-today';
            formattedDueDate = dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        
        const statusTag = `<span class="status-tag ${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</span>`;
        
        li.innerHTML = `
            <div class="checkbox" role="button"><i class="fa-solid fa-check"></i></div>
            <div class="task-content">
                <div class="task-header">
                    <span class="task-text">${task.text}</span>
                    <span class="priority-tag ${task.priority}">${task.priority}</span>
                    ${statusTag}
                </div>
                <div class="due-date ${dateClass}">Due: ${formattedDueDate}</div>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" aria-label="Edit task"><i class="fa-solid fa-pencil"></i></button>
                <button class="delete-btn" aria-label="Delete task"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        return li;
    };

    // Task Actions
    const addTask = (text, description, priority, dueDate) => {
        tasks.unshift({
            id: Date.now(), text, description, priority,
            dueDate: dueDate, completed: false,
            createdAt: new Date().toISOString()
        });
        saveTasks();
    };
    
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    };

    const toggleComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        saveTasks();
    };
    
    // Modal Functions
    const openDetailModal = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        detailTaskTitle.textContent = task.text;
        detailTaskDescription.textContent = task.description || 'No description provided.';
        const priorityTag = document.createElement('span');
        priorityTag.className = `priority-tag ${task.priority}`;
        priorityTag.textContent = task.priority;
        detailPriority.innerHTML = '';
        detailPriority.appendChild(priorityTag);
        detailDueDate.textContent = new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        detailCreatedAt.textContent = new Date(task.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        detailStatus.textContent = task.completed ? 'Completed' : 'Pending';
        detailModal.classList.remove('hidden');
    };
    const closeDetailModal = () => detailModal.classList.add('hidden');
    
    function openEditModal(id) { const task = tasks.find(t => t.id === id); if (task) { editTaskId.value = task.id; editTaskText.value = task.text; editTaskDescription.value = task.description; editDueDate.value = task.dueDate; editPriority.value = task.priority; editModal.classList.remove('hidden'); } }
    
    function openConfirmModal(title, text, onConfirm) { confirmTitle.textContent = title; confirmText.textContent = text; confirmModal.classList.remove('hidden'); confirmActionBtn.onclick = () => { onConfirm(); confirmModal.classList.add('hidden'); }; }

    // Event Listeners
    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const taskText = todoInput.value;

        if (taskText.trim() === '') {
            todoForm.classList.add('form-invalid');
            todoInput.classList.add('input-error');
            setTimeout(() => {
                todoForm.classList.remove('form-invalid');
                todoInput.classList.remove('input-error');
            }, 600);
            return;
        }

        addTask(taskText, todoDescriptionInput.value, todoPriorityInput.value, dueDateInput.value);
        todoForm.reset();
    });

    todoList.addEventListener('click', e => {
        const item = e.target.closest('.todo-item');
        if (!item) return;
        const id = Number(item.dataset.id);

        if (e.target.closest('.checkbox')) {
            toggleComplete(id);
        } else if (e.target.closest('.edit-btn')) {
            openEditModal(id);
        } else if (e.target.closest('.delete-btn')) {
            openConfirmModal('Delete Task', 'Are you sure you want to delete this task?', () => deleteTask(id));
        } else if (e.target.closest('.task-content')) {
            openDetailModal(id);
        }
    });

    closeDetailBtn.addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });

    cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    editForm.addEventListener('submit', e => { e.preventDefault(); const id = Number(editTaskId.value); tasks = tasks.map(task => task.id === id ? { ...task, text: editTaskText.value, description: editTaskDescription.value, dueDate: editDueDate.value, priority: editPriority.value } : task ); saveTasks(); editModal.classList.add('hidden'); });
    
    deleteAllBtn.addEventListener('click', () => { if (tasks.length === 0) return; openConfirmModal('Delete All Tasks', 'This will permanently delete every task. Are you sure?', () => { tasks = []; saveTasks(); }); });
    cancelConfirmBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dateFilterInput.value = '';
            selectedDateFilter = null;
            clearDateFilterBtn.classList.add('hidden');
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    dateFilterInput.addEventListener('change', (e) => {
        selectedDateFilter = e.target.value;
        if (selectedDateFilter) {
            filterBtns.forEach(b => b.classList.remove('active'));
            clearDateFilterBtn.classList.remove('hidden');
        } else {
             document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
             clearDateFilterBtn.classList.add('hidden');
        }
        renderTasks();
    });

    clearDateFilterBtn.addEventListener('click', () => {
        dateFilterInput.value = '';
        selectedDateFilter = null;
        clearDateFilterBtn.classList.add('hidden');
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        renderTasks();
    });
    
    const applyTheme = (theme) => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); };
    themeToggle.addEventListener('click', () => { const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(newTheme); });
    
    // Initial Load 
    updateDateTime();
    setInterval(updateDateTime, 1000);
    applyTheme(localStorage.getItem('theme') || 'light');
    renderTasks();
});