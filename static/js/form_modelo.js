document.addEventListener('DOMContentLoaded', function() {
  // Obter data atual para o datepicker
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('task-due-date').min = today;

  // Contador de caracteres para o título
  const titleInput = document.getElementById('task-title');
  const charCounter = document.querySelector('.char-counter');
  
  if (titleInput && charCounter) {
    titleInput.addEventListener('input', function() {
      const currentLength = this.value.length;
      charCounter.textContent = `${currentLength}/100`;
      
      if (currentLength > 80) {
        charCounter.style.color = 'var(--warning-color)';
      } else {
        charCounter.style.color = 'var(--text-light)';
      }
    });
  }

  // Validação em tempo real
  const form = document.getElementById('task-form');
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });
  });

  function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (!field.value.trim()) {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Este campo é obrigatório';
    } else {
      formGroup.classList.remove('error');
      errorMessage.textContent = '';
    }
  }

  // Editor de texto simples
  const descriptionTextarea = document.getElementById('task-description');
  const textFormatButtons = document.querySelectorAll('.text-format-btn');
  
  textFormatButtons.forEach(button => {
    button.addEventListener('click', function() {
      const command = this.getAttribute('data-command');
      
      if (command === 'insertLink') {
        const url = prompt('Digite a URL:', 'https://');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      } else {
        document.execCommand(command, false, null);
      }
      
      descriptionTextarea.focus();
    });
  });

  // Opções rápidas de data
  const dateQuickOptions = document.querySelectorAll('.date-quick-option');
  const dueDateInput = document.getElementById('task-due-date');
  
  dateQuickOptions.forEach(option => {
    option.addEventListener('click', function() {
      const daysToAdd = parseInt(this.getAttribute('data-days'));
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + daysToAdd);
      
      const formattedDate = newDate.toISOString().split('T')[0];
      dueDateInput.value = formattedDate;
    });
  });

  // Modal de seleção de responsável
  const assigneeModal = document.getElementById('assignee-modal');
  const assigneeSelector = document.getElementById('assignee-selector');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const confirmAssigneeBtn = document.getElementById('confirm-assignee');
  
  // Dados de exemplo - em uma aplicação real, isso viria de uma API
  const teamMembers = [
    {
      id: 1,
      name: "Carlos Silva",
      role: "Desenvolvedor Sênior",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Ana Souza",
      role: "Designer UX/UI",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      role: "Gerente de Projetos",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: 4,
      name: "Mariana Costa",
      role: "QA Tester",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg"
    },
    {
      id: 5,
      name: "Ricardo Santos",
      role: "Desenvolvedor Frontend",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    }
  ];

  // Abrir modal de responsável
  if (assigneeSelector) {
    assigneeSelector.addEventListener('click', function() {
      renderTeamMembers(teamMembers, 'team-list');
      assigneeModal.classList.add('active');
    });
  }

  // Fechar modais
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });

  // Renderizar lista de membros da equipe
  function renderTeamMembers(members, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    members.forEach(member => {
      const memberElement = document.createElement('div');
      memberElement.className = 'team-member';
      memberElement.dataset.id = member.id;
      
      memberElement.innerHTML = `
        <img src="${member.avatar}" alt="${member.name}">
        <div class="member-info">
          <span class="member-name">${member.name}</span>
          <span class="member-role">${member.role}</span>
        </div>
        <i class="fas fa-check"></i>
      `;
      
      container.appendChild(memberElement);
    });
  }

  // Selecionar responsável
  document.addEventListener('click', function(e) {
    if (e.target.closest('.team-member')) {
      const memberElement = e.target.closest('.team-member');
      document.querySelectorAll('#team-list .team-member').forEach(m => {
        m.classList.remove('selected');
      });
      memberElement.classList.add('selected');
    }
  });

  // Confirmar seleção de responsável
  confirmAssigneeBtn.addEventListener('click', function() {
    const selectedMember = document.querySelector('#team-list .team-member.selected');
    
    if (selectedMember) {
      const memberId = selectedMember.dataset.id;
      const member = teamMembers.find(m => m.id == memberId);
      
      const assigneeAvatar = document.getElementById('assignee-avatar');
      const assigneeName = document.getElementById('assignee-name');
      
      assigneeAvatar.src = member.avatar;
      assigneeAvatar.style.display = 'block';
      assigneeName.textContent = member.name;
      assigneeName.style.display = 'block';
      
      assigneeSelector.classList.add('has-selection');
      assigneeModal.classList.remove('active');
      
      // Remover mensagem de erro se existir
      const assigneeGroup = assigneeSelector.closest('.form-group');
      assigneeGroup.classList.remove('error');
      assigneeGroup.querySelector('.error-message').textContent = '';
    }
  });

  // Modal de colaboradores
  const collaboratorsModal = document.getElementById('collaborators-modal');
  const collaboratorsSelector = document.getElementById('collaborators-container');
  const confirmCollaboratorsBtn = document.getElementById('confirm-collaborators');
  
  // Abrir modal de colaboradores
  if (collaboratorsSelector) {
    collaboratorsSelector.addEventListener('click', function() {
      renderTeamMembers(teamMembers, 'collaborators-list');
      collaboratorsModal.classList.add('active');
    });
  }

  // Selecionar múltiplos colaboradores
  document.addEventListener('click', function(e) {
    if (e.target.closest('#collaborators-list .team-member')) {
      const memberElement = e.target.closest('.team-member');
      memberElement.classList.toggle('selected');
    }
  });

  // Confirmar seleção de colaboradores
  confirmCollaboratorsBtn.addEventListener('click', function() {
    const selectedMembers = document.querySelectorAll('#collaborators-list .team-member.selected');
    
    if (selectedMembers.length > 0) {
      collaboratorsSelector.innerHTML = '';
      collaboratorsSelector.classList.add('has-selection');
      
      selectedMembers.forEach(memberElement => {
        const memberId = memberElement.dataset.id;
        const member = teamMembers.find(m => m.id == memberId);
        
        const collaboratorTag = document.createElement('div');
        collaboratorTag.className = 'collaborator-tag';
        collaboratorTag.innerHTML = `
          <img src="${member.avatar}" class="collaborator-avatar" alt="${member.name}">
          <span>${member.name}</span>
          <i class="fas fa-times collaborator-remove"></i>
        `;
        
        collaboratorsSelector.appendChild(collaboratorTag);
      });
      
      collaboratorsModal.classList.remove('active');
    }
  });

  // Remover colaborador
  collaboratorsSelector.addEventListener('click', function(e) {
    if (e.target.classList.contains('collaborator-remove')) {
      e.target.closest('.collaborator-tag').remove();
      
      // Se não houver mais colaboradores, mostrar placeholder
      if (collaboratorsSelector.querySelectorAll('.collaborator-tag').length === 0) {
        collaboratorsSelector.classList.remove('has-selection');
      }
    }
  });

  // Sistema de tags
  const tagsInput = document.getElementById('task-tags');
  const tagsContainer = document.getElementById('tags-container');
  const tagsSuggestions = document.getElementById('tags-suggestions');
  
  // Tags sugeridas - em uma aplicação real, isso viria de uma API
  const suggestedTags = [
    'frontend', 'backend', 'bug', 'feature', 
    'design', 'urgente', 'revisão', 'teste',
    'documentação', 'refatoração', 'otimização'
  ];

  if (tagsInput) {
    tagsInput.addEventListener('input', function() {
      const inputValue = this.value.trim().toLowerCase();
      
      if (inputValue.length > 0) {
        const matchingTags = suggestedTags.filter(tag => 
          tag.includes(inputValue) && 
          !Array.from(tagsContainer.querySelectorAll('.tag')).some(existingTag => 
            existingTag.textContent.trim().toLowerCase() === tag
          )
        );
        
        renderTagSuggestions(matchingTags);
      } else {
        tagsSuggestions.innerHTML = '';
        tagsSuggestions.classList.remove('visible');
      }
    });
    
    tagsInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
        e.preventDefault();
        addTag(this.value.trim());
        this.value = '';
        tagsSuggestions.classList.remove('visible');
      }
      
      // Navegação com teclado nas sugestões
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        const highlighted = tagsSuggestions.querySelector('.highlighted');
        const suggestions = tagsSuggestions.querySelectorAll('.tag-suggestion');
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!highlighted) {
            suggestions[0].classList.add('highlighted');
          } else {
            const next = highlighted.nextElementSibling;
            if (next) {
              highlighted.classList.remove('highlighted');
              next.classList.add('highlighted');
            }
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (highlighted) {
            const prev = highlighted.previousElementSibling;
            if (prev) {
              highlighted.classList.remove('highlighted');
              prev.classList.add('highlighted');
            }
          }
        } else if (e.key === 'Enter' && highlighted) {
          e.preventDefault();
          addTag(highlighted.textContent.trim());
          this.value = '';
          tagsSuggestions.classList.remove('visible');
        }
      }
    });
    
    tagsInput.addEventListener('focus', function() {
      if (this.value.trim().length > 0) {
        tagsSuggestions.classList.add('visible');
      }
    });
    
    tagsInput.addEventListener('blur', function() {
      setTimeout(() => {
        tagsSuggestions.classList.remove('visible');
      }, 200);
    });
  }

  // Adicionar tags a partir dos exemplos
  document.querySelectorAll('.tag-example').forEach(example => {
    example.addEventListener('click', function() {
      addTag(this.textContent.trim());
    });
  });

  function renderTagSuggestions(tags) {
    tagsSuggestions.innerHTML = '';
    
    if (tags.length > 0) {
      tags.forEach(tag => {
        const suggestion = document.createElement('div');
        suggestion.className = 'tag-suggestion';
        suggestion.textContent = tag;
        tagsSuggestions.appendChild(suggestion);
      });
      
      tagsSuggestions.classList.add('visible');
    } else {
      tagsSuggestions.classList.remove('visible');
    }
  }

  function addTag(tagText) {
    if (!tagText) return;
    
    // Verificar se a tag já existe
    const existingTags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => 
      tag.textContent.trim().toLowerCase()
    );
    
    if (existingTags.includes(tagText.toLowerCase())) return;
    
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
      ${tagText}
      <span class="tag-remove">&times;</span>
    `;
    
    tagsContainer.appendChild(tag);
    
    // Remover tag
    tag.querySelector('.tag-remove').addEventListener('click', function() {
      tag.remove();
    });
  }

  // Tags suggestions click
  tagsSuggestions.addEventListener('click', function(e) {
    if (e.target.classList.contains('tag-suggestion')) {
      addTag(e.target.textContent.trim());
      tagsInput.value = '';
      tagsSuggestions.classList.remove('visible');
      tagsInput.focus();
    }
  });

  // Upload de arquivos
  const fileInput = document.getElementById('task-attachments');
  const uploadArea = document.getElementById('upload-area');
  const filePreview = document.getElementById('file-preview');
  
  if (fileInput) {
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      this.style.borderColor = 'var(--primary-color)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
      this.style.backgroundColor = '';
      this.style.borderColor = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.style.backgroundColor = '';
      this.style.borderColor = '';
      
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        renderFilePreviews(fileInput.files);
      }
    });
    
    fileInput.addEventListener('change', function() {
      if (this.files.length) {
        renderFilePreviews(this.files);
      }
    });
  }

  function renderFilePreviews(files) {
    filePreview.innerHTML = '';
    
    if (files.length === 0) {
      filePreview.innerHTML = `
        <div class="file-preview-empty">
          <i class="far fa-file-alt"></i>
          <p>Nenhum arquivo adicionado</p>
        </div>
      `;
      return;
    }
    
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    
    Array.from(files).forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.dataset.index = index;
      
      const fileType = file.type.split('/')[0];
      let iconClass = 'fa-file';
      
      if (fileType === 'image') iconClass = 'fa-file-image';
      else if (fileType === 'application') {
        if (file.type.includes('pdf')) iconClass = 'fa-file-pdf';
        else if (file.type.includes('word')) iconClass = 'fa-file-word';
        else if (file.type.includes('excel')) iconClass = 'fa-file-excel';
      }
      
      fileItem.innerHTML = `
        <div class="file-icon">
          <i class="fas ${iconClass}"></i>
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <div class="file-actions">
          <button class="file-action-btn preview">
            <i class="fas fa-eye"></i>
          </button>
          <button class="file-action-btn delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      fileList.appendChild(fileItem);
      
      // Remover arquivo
      fileItem.querySelector('.delete').addEventListener('click', function() {
        removeFile(index);
      });
    });
    
    filePreview.appendChild(fileList);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function removeFile(index) {
    const dt = new DataTransfer();
    const files = fileInput.files;
    
    for (let i = 0; i < files.length; i++) {
      if (index !== i) {
        dt.items.add(files[i]);
      }
    }
    
    fileInput.files = dt.files;
    renderFilePreviews(fileInput.files);
  }

  // Limpar formulário
  const clearFormBtn = document.getElementById('clear-form');
  
  if (clearFormBtn) {
    clearFormBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
        form.reset();
        tagsContainer.innerHTML = '';
        filePreview.innerHTML = `
          <div class="file-preview-empty">
            <i class="far fa-file-alt"></i>
            <p>Nenhum arquivo adicionado</p>
          </div>
        `;
        
        // Resetar seleção de responsável
        const assigneeAvatar = document.getElementById('assignee-avatar');
        const assigneeName = document.getElementById('assignee-name');
        assigneeAvatar.src = '';
        assigneeAvatar.style.display = 'none';
        assigneeName.textContent = '';
        assigneeName.style.display = 'none';
        assigneeSelector.classList.remove('has-selection');
        
        // Resetar colaboradores
        collaboratorsSelector.innerHTML = `
          <div class="collaborator-placeholder">
            <i class="fas fa-users"></i>
            <span>Adicionar colaboradores</span>
          </div>
        `;
        collaboratorsSelector.classList.remove('has-selection');
      }
    });
  }

  // Salvar rascunho
  const saveDraftBtn = document.getElementById('save-draft');
  
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
      // Simular salvamento de rascunho
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      this.disabled = true;
      
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-check"></i> Rascunho Salvo';
        setTimeout(() => {
          this.innerHTML = '<i class="far fa-save"></i> Salvar Rascunho';
          this.disabled = false;
        }, 2000);
      }, 1500);
    });
  }

  // Enviar formulário
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validar campos obrigatórios
      let isValid = true;
      requiredFields.forEach(field => {
        validateField(field);
        if (!field.value.trim()) {
          isValid = false;
        }
      });
      
      // Validar responsável selecionado
      if (!assigneeSelector.classList.contains('has-selection')) {
        const assigneeGroup = assigneeSelector.closest('.form-group');
        assigneeGroup.classList.add('error');
        assigneeGroup.querySelector('.error-message').textContent = 'Por favor, selecione um responsável';
        isValid = false;
      }
      
      if (!isValid) {
        // Rolar até o primeiro erro
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // Simular envio do formulário
      const submitBtn = document.getElementById('submit-form');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Tarefa Criada!';
        
        // Redirecionar ou mostrar mensagem de sucesso
        setTimeout(() => {
          alert('Tarefa criada com sucesso!');
          form.reset();
          submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Criar Tarefa';
          submitBtn.disabled = false;
        }, 1000);
      }, 2000);
    });
  }

  // Pesquisa em modais
  const assigneeSearch = document.getElementById('assignee-search');
  const collaboratorsSearch = document.getElementById('collaborators-search');
  
  if (assigneeSearch) {
    assigneeSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterTeamMembers(searchTerm, 'team-list');
    });
  }
  
  if (collaboratorsSearch) {
    collaboratorsSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterTeamMembers(searchTerm, 'collaborators-list');
    });
  }

  function filterTeamMembers(searchTerm, containerId) {
    const members = document.querySelectorAll(`#${containerId} .team-member`);
    
    members.forEach(member => {
      const name = member.querySelector('.member-name').textContent.toLowerCase();
      const role = member.querySelector('.member-role').textContent.toLowerCase();
      
      if (name.includes(searchTerm) || role.includes(searchTerm)) {
        member.style.display = 'flex';
      } else {
        member.style.display = 'none';
      }
    });
  }
});