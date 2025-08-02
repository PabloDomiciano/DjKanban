from django.urls import path

from atividades.views import AtividadeCreateView, AtividadeDeleteView, AtividadeListView, AtividadeUpdateView, update_task_status

urlpatterns = [
    path('', AtividadeListView.as_view(), name='atividade_list'),
    path('cadastrar/', AtividadeCreateView.as_view(), name='atividade_create'),
    path('editar/atividade/<int:pk>', AtividadeUpdateView.as_view(), name='atividade_edit'),
    path('excluir/atividade/<int:pk>', AtividadeDeleteView.as_view(), name='atividade_delete'),
    path('update-task-status/<int:task_id>/', update_task_status, name='update_task_status'),
]