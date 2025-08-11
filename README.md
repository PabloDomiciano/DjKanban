# 🗂️ FlowBoard — Sistema Kanban em Django

![Python](https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

> Um sistema de gerenciamento de tarefas estilo **Kanban** para equipes que buscam produtividade, clareza e eficiência.

---

## 📑 Índice
- [📌 Visão Geral](#-visão-geral)
- [⚙️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [🚀 Como Executar o Projeto](#-como-executar-o-projeto)
- [🎯 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [📊 Modelo de Dados](#-modelo-de-dados)
- [🛣️ Roadmap](#️-roadmap)
- [👨‍💻 Autor](#-autor)

---

## 📌 Visão Geral
O **FlowBoard** é um sistema de gerenciamento de tarefas estilo **Kanban** desenvolvido em **Django**.  
Ele permite **visualizar, organizar e priorizar** tarefas de forma intuitiva com **arrastar e soltar**, notificações e controle de prazos.

**Principais recursos:**
- 📋 Quadro Kanban com **4 colunas**: *A Fazer*, *Em Progresso*, *Em Revisão*, *Concluído*
- 🔄 **Drag-and-drop** para movimentar tarefas
- ⏱️ Atualização em tempo real via AJAX
- 🎯 Priorização por **Alta**, **Média** e **Baixa**
- 📧 Notificações por e-mail para mudanças de status

---

## ⚙️ Tecnologias Utilizadas

### **Backend**
| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Python | 3.13.15 | Linguagem principal |
| Django | 4.2.23 | Framework web |
| PostgreSQL | 15 | Banco de dados (SQLite no dev) |

### **Frontend**
- HTML5 + CSS3
- JavaScript Vanilla (*drag-and-drop*)

### **Dependências Extras**
- `django-widget-tweaks` → Melhorias nos formulários
- `python-dotenv` → Gerenciamento de variáveis de ambiente

---

## 🚀 Como Executar o Projeto

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/PabloDomiciano/DjKanban.git
cd DjKanban

# 2️⃣ Criar e ativar o ambiente virtual (Windows)
python -m venv venv
venv\Scripts\activate

# 3️⃣ Instalar dependências
pip install -r requirements.txt
Dependências salvas no Drive: 📥 https://drive.google.com/drive/folders/1t82dSB-6M6gQU_xlrJWVGfbx-fYhcfq5?usp=drive_link

# 4️⃣ Configurar variáveis de ambiente
cp .env.example .env

# 5️⃣ Migrar banco de dados
python manage.py migrate

# 6️⃣ Rodar o servidor
python manage.py runserver
