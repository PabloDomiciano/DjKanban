// Variável global para o card sendo arrastado
let draggedTask = null;

// Configura os listeners de drag-and-drop
function setupDragAndDrop() {
  const tasks = document.querySelectorAll(".task-card");
  const columns = document.querySelectorAll(".tasks-list");

  tasks.forEach((task) => {
    task.addEventListener("dragstart", dragStart);
    task.addEventListener("dragend", dragEnd);
  });

  columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", dragDrop);
  });
}

// Evento quando começa a arrastar
function dragStart() {
  draggedTask = this;
  this.classList.add("dragging");

  // Adiciona um efeito visual durante o drag
  setTimeout(() => {
    this.style.opacity = "0.4";
  }, 0);
}

// Evento quando termina de arrastar
function dragEnd() {
  this.classList.remove("dragging");
  this.style.opacity = "1";
  draggedTask = null;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("dragover");
}

function dragLeave() {
  this.classList.remove("dragover");
}

async function dragDrop(e) {
  e.preventDefault();
  this.classList.remove("dragover");

  if (!draggedTask) {
    console.warn("Nenhum card sendo arrastado");
    return;
  }

  console.log("Elemento alvo do drop:", this.id);
  console.log("Card arrastado:", draggedTask.dataset.taskId);

  const originalColumn = document.querySelector(
    `#${getColumnFromStatus(draggedTask.dataset.status)}`
  );

  if (!originalColumn) {
    console.error(
      "Coluna original não encontrada para status:",
      draggedTask.dataset.status
    );
    return;
  }

  const originalPosition = Array.from(originalColumn.children).indexOf(
    draggedTask
  );
  const newStatus = getStatusFromColumn(this.id);

  if (!newStatus) {
    console.error(
      "Não foi possível determinar novo status para coluna:",
      this.id
    );
    return;
  }

  console.log("Novo status:", newStatus);

  try {
    draggedTask.classList.add("updating");
    console.log("Enviando atualização para o servidor...");

    const response = await updateTaskStatus(
      draggedTask.dataset.taskId,
      newStatus
    );
    console.log("Resposta do servidor:", response);

    if (response.success) {
      console.log("Atualização bem-sucedida, atualizando interface...");
      draggedTask.dataset.status = newStatus;
      this.appendChild(draggedTask);
      updateTaskCounts();
      showTempFeedback(draggedTask, "Status atualizado!", "success");

      if (newStatus === "concluido") {
        draggedTask.querySelector(".task-priority").className =
          "task-priority completed";
      }
    } else {
      console.error("Erro na resposta:", response.error);
      showTempFeedback(
        draggedTask,
        response.error || "Erro ao atualizar",
        "error"
      );
      throw new Error(response.error || "Erro ao atualizar status");
    }
  } catch (error) {
    console.error("Erro durante o drop:", error);
    originalColumn.insertBefore(
      draggedTask,
      originalColumn.children[originalPosition]
    );
    showTempFeedback(draggedTask, "Falha na atualização", "error");
  } finally {
    draggedTask.classList.remove("updating");
  }
}
async function updateTaskStatus(taskId, newStatus) {
  const url = `/update-task-status/${taskId}/`;
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;

  if (!csrfToken) {
    console.error("CSRF Token não encontrado!");
    return { success: false, error: "CSRF Token não encontrado" };
  }

  console.log("Enviando requisição para:", url);
  console.log("Dados:", { status: newStatus });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: `status=${encodeURIComponent(
        newStatus
      )}&csrfmiddlewaretoken=${encodeURIComponent(csrfToken)}`,
    });

    console.log("Resposta recebida, status:", response.status);
    const result = await response.json();
    console.log("Resposta JSON:", result);

    if (!response.ok) {
      throw new Error(result.error || `Erro HTTP: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { success: false, error: error.message };
  }
}

// Atualiza os contadores de tarefas em cada coluna
function updateTaskCounts() {
  document.querySelectorAll(".kanban-column").forEach((column) => {
    const columnId = column.querySelector(".tasks-list").id;
    const taskCount = column.querySelectorAll(".task-card").length;
    column.querySelector(".task-count").textContent = taskCount;
  });
}

// Mostra feedback temporário no card
function showTempFeedback(task, message, type) {
  const feedback = document.createElement("div");
  feedback.className = `task-feedback ${type}`;
  feedback.textContent = message;

  task.appendChild(feedback);

  setTimeout(() => {
    feedback.classList.add("fade-out");
    setTimeout(() => feedback.remove(), 500);
  }, 2000);
}

// Função para obter o token CSRF
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Inicializa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function () {
  setupDragAndDrop();

  // Atualiza os contadores inicialmente
  updateTaskCounts();

  // Configura mutation observer para novos cards dinâmicos
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.classList && node.classList.contains("task-card")) {
          node.addEventListener("dragstart", dragStart);
          node.addEventListener("dragend", dragEnd);
        }
      });
    });
  });

  // Observa todas as colunas para novos cards
  document.querySelectorAll(".tasks-list").forEach((column) => {
    observer.observe(column, { childList: true });
  });
});

// Mapeia colunas para status
function getStatusFromColumn(columnId) {
  const statusMap = {
    todo: "a_fazer",
    "in-progress": "em_progresso",
    "in-review": "em_revisao",
    done: "concluido",
  };

  const status = statusMap[columnId];
  if (!status) {
    console.error(`Mapeamento não encontrado para coluna: ${columnId}`);
  }
  return status;
}

// Mapeia status para colunas
function getColumnFromStatus(status) {
  const columnMap = {
    a_fazer: "todo",
    em_progresso: "in-progress",
    em_revisao: "in-review",
    concluido: "done",
  };

  const column = columnMap[status];
  if (!column) {
    console.error(`Mapeamento não encontrado para status: ${status}`);
  }
  return column;
}
