document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Drag and drop functionality
    const tasks = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.tasks-list');
    
    tasks.forEach(task => {
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragend', dragEnd);
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', dragDrop);
    });
    
    let draggedTask = null;
    
    function dragStart() {
        draggedTask = this;
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }
    
    function dragEnd() {
        this.classList.remove('dragging');
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    function dragEnter(e) {
        e.preventDefault();
        this.classList.add('dragover');
    }
    
    function dragLeave() {
        this.classList.remove('dragover');
    }
    
    function dragDrop() {
        this.classList.remove('dragover');
        this.appendChild(draggedTask);
        updateTaskCounts();
    }
    
    // Update task counts in column headers
    function updateTaskCounts() {
        document.querySelectorAll('.kanban-column').forEach(column => {
            const columnId = column.querySelector('.tasks-list').id;
            const taskCount = column.querySelectorAll('.task-card').length;
            column.querySelector('.task-count').textContent = taskCount;
            
            // Update priority colors based on column
            if (columnId === 'done') {
                column.querySelectorAll('.task-priority').forEach(priority => {
                    priority.classList.remove('high', 'medium', 'low');
                    priority.classList.add('completed');
                });
            }
        });
    }
    
    // Add new task
    const addTaskButtons = document.querySelectorAll('.add-task-btn');
    
    addTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const column = this.closest('.kanban-column');
            const tasksList = column.querySelector('.tasks-list');
            
            const newTask = document.createElement('div');
            newTask.className = 'task-card';
            newTask.draggable = true;
            newTask.innerHTML = `
                <div class="task-header">
                    <span class="task-priority medium"></span>
                    <div class="task-actions">
                        <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
                <div class="task-body">
                    <h4 contenteditable="true">Nova Tarefa</h4>
                    <p contenteditable="true">Descrição da tarefa...</p>
                </div>
                <div class="task-footer">
                    <div class="task-meta">
                        <span class="task-date"><i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString()}</span>
                        <span class="task-comments"><i class="far fa-comment"></i> 0</span>
                    </div>
                    <div class="task-assignee">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Assignee">
                    </div>
                </div>
            `;
            
            tasksList.appendChild(newTask);
            updateTaskCounts();
            
            // Add drag events to new task
            newTask.addEventListener('dragstart', dragStart);
            newTask.addEventListener('dragend', dragEnd);
        });
    });
    
    // Initialize task counts
    updateTaskCounts();
    
    // Simulate notification count update
    setInterval(() => {
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent);
            const newCount = currentCount > 0 ? currentCount - 1 : 3;
            notificationBadge.textContent = newCount;
        }
    }, 10000);
});