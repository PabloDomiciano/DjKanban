# subscribers/observers.py
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


class AtividadeSubject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        try:
            self._observers.remove(observer)
        except ValueError:
            pass

    def notify(self, atividade, old_status, old_responsavel, changed_by):
        for observer in self._observers:
            try:
                observer(atividade, old_status, old_responsavel, changed_by)
            except Exception as e:
                logger.error(f"Observer {observer.__name__} falhou: {str(e)}")


# Observers concretos
def log_status_change(atividade, old_status, old_responsavel, changed_by):
    logger.info(
        f"Atividade {atividade.id} modificada por {changed_by.username}. "
        f"Status: {old_status} → {atividade.status}, "
        f"Responsável: {old_responsavel} → {atividade.responsavel}"
    )


def notify_email(atividade, old_status, old_responsavel, changed_by):
    if not settings.EMAIL_HOST_USER:  # Verifica se o e-mail está configurado
        logger.warning("Serviço de e-mail não configurado. Notificação não enviada.")
        return
        
    if atividade.responsavel and atividade.responsavel != old_responsavel:
        send_mail(
            subject=f"Você foi designado para: {atividade.titulo}",
            message=f"""
            Nova designação:
            
            Tarefa: {atividade.titulo}
            Status: {atividade.get_status_display()}
            Prioridade: {atividade.get_prioridade_display()}
            Vencimento: {atividade.data_vencimento}
            
            Alterado por: {changed_by.get_full_name() or changed_by.username}
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[atividade.responsavel.email],
            fail_silently=True,
        )


# Instância global do subject
atividade_subject = AtividadeSubject()
atividade_subject.attach(log_status_change)
atividade_subject.attach(notify_email)
