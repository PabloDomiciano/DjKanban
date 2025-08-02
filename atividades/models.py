from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Atividade(models.Model):
    PRIORIDADE_ALT = "alta prioridade"
    PRIORIDADE_MED = "media prioridade"
    PRIORIDADE_BAI = "baixa prioridade"
    PRIORIDADES = [
        (PRIORIDADE_ALT, "Alta Prioridade"),
        (PRIORIDADE_MED, "Média Prioridade"),
        (PRIORIDADE_BAI, "Baixa Prioridade"),
    ]

    STATUS_A_FAZER = "a_fazer"
    STATUS_EM_PROGRESSO = "em_progresso"
    STATUS_EM_REVISAO = "em_revisao"
    STATUS_CONCLUIDO = "concluido"
    STATUS_CHOICES = [
        (STATUS_A_FAZER, "A Fazer"),
        (STATUS_EM_PROGRESSO, "Em Progresso"),
        (STATUS_EM_REVISAO, "Em Revisão"),
        (STATUS_CONCLUIDO, "Concluído"),
    ]

    titulo = models.CharField(max_length=200, verbose_name="Título")
    descricao = models.TextField(verbose_name="Descrição", blank=True)
    prioridade = models.CharField(
        max_length=20,
        choices=PRIORIDADES,
        default=PRIORIDADE_MED,
        verbose_name="Prioridade",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_A_FAZER,
        verbose_name="Status",
    )
    data_vencimento = models.DateField(
        verbose_name="Data de Vencimento", null=True, blank=True
    )
    responsavel = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Responsável",
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-prioridade", "data_vencimento"]

    def __str__(self):
        return self.titulo

    @property
    def atrasado(self):
        if self.data_vencimento and self.status != self.STATUS_CONCLUIDO:
            return self.data_vencimento < timezone.localdate()
        return False
