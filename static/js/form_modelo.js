document.addEventListener("DOMContentLoaded", function() {
  // 1. FORÇAR ESTILIZAÇÃO DOS INPUTS
  function enforceFormStyles() {
    const inputs = document.querySelectorAll('.modern-form input, .modern-form select, .modern-form textarea');
    
    inputs.forEach(input => {
      // Remove todas as classes conflitantes
      input.className = '';
      input.classList.add('form-control');
      
      // Aplica estilos inline como fallback absoluto
      input.style.width = '100%';
      input.style.padding = '0.5rem 0.8rem';
      input.style.border = '1px solid #e9ecef';
      input.style.borderRadius = '4px';
      input.style.fontSize = '0.9rem';
      input.style.fontFamily = 'inherit';
      input.style.backgroundColor = 'white';
      input.style.boxShadow = 'none';
      input.style.transition = 'all 0.15s ease';
    });
  }

  // Executa imediatamente e após um pequeno delay
  enforceFormStyles();
  setTimeout(enforceFormStyles, 100);

  // 2. LIMPAR FORMULÁRIO
  const clearBtn = document.getElementById('clear-form');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar o formulário?')) {
        document.querySelector('.modern-form').reset();
      }
    });
  }

  // 3. SUBMISSÃO DO FORMULÁRIO
  const form = document.querySelector('.modern-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      
      // Simulação de envio
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('Formulário enviado com sucesso!');
      }, 1500);
    });
  }
});