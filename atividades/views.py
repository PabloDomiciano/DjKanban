from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, UpdateView, ListView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from django.contrib import messages
from django.core.exceptions import PermissionDenied
import logging

from atividades.models import Atividade
from atividades.forms import AtividadeForm
from atividades.subscribers.observers import atividade_subject

logger = logging.getLogger(__name__)


# View para atualização via AJAX do status
@login_required
@require_http_methods(["POST"])
def update_task_status(request, task_id):
    try:
        task = Atividade.objects.get(id=task_id)
        new_status = request.POST.get("status")

        if task.responsavel != request.user and not request.user.is_superuser:
            raise PermissionDenied("Sem permissão para esta tarefa")

        if new_status not in dict(Atividade.STATUS_CHOICES).keys():
            return JsonResponse(
                {"success": False, "error": "Status inválido"}, status=400
            )

        if task.status != new_status:
            old_status = task.status
            task.status = new_status
            task.atualizado_por = request.user
            task.save()

            # Aqui entra o padrão Observer
            # Notifica todos os observers cadastrados

            atividade_subject.notify(
                atividade=task,
                old_status=old_status,
                old_responsavel=task.responsavel,
                changed_by=request.user,
            )

        return JsonResponse({"success": True, "new_status": new_status})

    except Atividade.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Tarefa não encontrada"}, status=404
        )
    except PermissionDenied as e:
        return JsonResponse({"success": False, "error": str(e)}, status=403)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# Views baseadas em classe
class AtividadeCreateView(CreateView):
    model = Atividade
    form_class = AtividadeForm
    template_name = "form_modelo.html"
    success_url = reverse_lazy("atividade_list")
    extra_context = {"title": "Cadastro de Atividades"}

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        form.instance.criado_por = self.request.user
        form.instance.atualizado_por = self.request.user
        response = super().form_valid(form)


        # Ao criar atividade, também notifica os observers
        atividade_subject.notify(
            atividade=self.object,
            old_status=None,
            old_responsavel=None,
            changed_by=self.request.user,
        )

        messages.success(self.request, "Atividade criada com sucesso!")
        return response


class AtividadeUpdateView(UpdateView):
    model = Atividade
    form_class = AtividadeForm
    template_name = "form_modelo.html"
    success_url = reverse_lazy("atividade_list")
    extra_context = {
        "title": "Edição de Atividades",
        "titulo": "Edição de Atividades",
    }

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        """Verifica permissões antes de processar a requisição"""
        try:
            atividade = self.get_object()
            if atividade.responsavel != request.user and not request.user.is_superuser:
                raise PermissionDenied(
                    "Você não tem permissão para editar esta atividade"
                )

            return super().dispatch(request, *args, **kwargs)

        except Exception as e:
            logger.error(f"Erro no dispatch do UpdateView: {str(e)}")
            messages.error(request, "Ocorreu um erro ao acessar a atividade")
            return redirect(self.success_url)

    def form_valid(self, form):
        form.instance.criado_por = self.request.user
        form.instance.atualizado_por = self.request.user
        response = super().form_valid(form)

        atividade_subject.notify(
            atividade=self.object,
            old_status=None,
            old_responsavel=None,
            changed_by=self.request.user,
        )

        messages.success(self.request, "Atividade criada com sucesso!")
        return response


class AtividadeListView(ListView):
    model = Atividade
    template_name = "lista_modelo.html"
    context_object_name = "atividades"

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        queryset = self.get_queryset()
        context["todo_count"] = queryset.filter(status="a_fazer").count()
        context["in_progress_count"] = queryset.filter(status="em_progresso").count()
        context["in_review_count"] = queryset.filter(status="em_revisao").count()
        context["done_count"] = queryset.filter(status="concluido").count()
        return context

    def get_queryset(self):
        # Filtra atividades pelo responsável (a menos que seja superusuário)
        queryset = super().get_queryset()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(responsavel=self.request.user)
        return queryset.order_by("-prioridade", "data_vencimento")


class AtividadeDeleteView(DeleteView):
    model = Atividade
    template_name = "atividade_confirm_delete.html"
    success_url = reverse_lazy("atividade_list")
    extra_context = {
        "title": "Exclusão de Atividades",
        "titulo": "Exclusão de Atividades",
    }

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        try:
            atividade = self.get_object()
            if atividade.responsavel != request.user and not request.user.is_superuser:
                raise PermissionDenied(
                    "Você não tem permissão para excluir esta atividade"
                )
            return super().dispatch(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Erro no dispatch do DeleteView: {str(e)}")
            messages.error(request, "Ocorreu um erro ao acessar a atividade")
            return redirect(self.success_url)
