# subscribers/observers.py
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

logger = logging.getLogger(__name__)


class AtividadeSubject:
    def __init__(self):
        # Lista de funções observadoras (observers)
        self._observers = []

    def attach(self, observer):
        # Adiciona um novo observer se ainda não estiver registrado
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        # Remove um observer, se existir
        try:
            self._observers.remove(observer)
        except ValueError:
            pass

    def notify(self, atividade, old_status, old_responsavel, changed_by):
        # Notifica todos os observers com os dados da atividade alterada
        for observer in self._observers:
            try:
                observer(atividade, old_status, old_responsavel, changed_by)
            except Exception as e:
                logger.error(
                    f"Erro no observer {observer.__name__}: {str(e)}", exc_info=True
                )


def log_status_change(atividade, old_status, old_responsavel, changed_by):
    # Verifica se houve mudança de status ou responsável
    changes = []
    if atividade.status != old_status:
        changes.append(f"status: {old_status}→{atividade.status}")
    if atividade.responsavel != old_responsavel:
        changes.append(f"responsável: {old_responsavel}→{atividade.responsavel}")

    # Se houve mudanças, registra no log
    if changes:
        logger.info(
            f"Atividade {atividade.id} alterada por {changed_by.username}. "
            f"Mudanças: {', '.join(changes)}"
        )


def notify_email(atividade, old_status, old_responsavel, changed_by):
    # Verifica se as configurações de e-mail estão corretas
    if not all([settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD]):
        logger.warning("Configuração de e-mail incompleta. Notificação não enviada.")
        return

    # Lista de e-mails para notificar
    emails_para_notificar = set(["20210001143@estudantes.ifpr.edu.br","pablo.domiciano2019@gmail.com" ])

    # Adiciona o e-mail do novo responsável (se válido)
    if atividade.responsavel and atividade.responsavel.email:
        try:
            validate_email(atividade.responsavel.email)
            emails_para_notificar.add(atividade.responsavel.email)
        except ValidationError:
            logger.error(
                f"E-mail inválido do responsável: {atividade.responsavel.email}"
            )

    # 2. Responsável anterior (se mudou e era diferente)
    if (
        old_responsavel
        and old_responsavel.email
        and atividade.responsavel != old_responsavel
    ):
        try:
            validate_email(old_responsavel.email)
            emails_para_notificar.add(old_responsavel.email)
        except ValidationError:
            logger.error(
                f"E-mail inválido do responsável anterior: {old_responsavel.email}"
            )

    # 3. Usuário que fez a alteração
    if changed_by and changed_by.email:
        try:
            validate_email(changed_by.email)
            # Só adiciona se não for o responsável atual nem anterior
            if changed_by != atividade.responsavel and (
                not old_responsavel or changed_by != old_responsavel
            ):
                emails_para_notificar.add(changed_by.email)
        except ValidationError:
            logger.error(f"E-mail inválido do autor da mudança: {changed_by.email}")

    if not emails_para_notificar:
        logger.warning(
            f"Nenhum e-mail válido para notificar sobre a atividade {atividade.id}"
        )
        return

    # Prepara o conteúdo do e-mail
    subject = f"Atualização na tarefa: {atividade.titulo}"

    # Detectar mudanças
    changes = []
    if atividade.status != old_status:
        changes.append(f"Status alterado de '{old_status}' para '{atividade.status}'")
    if atividade.responsavel != old_responsavel:
        old_name = old_responsavel.get_full_name() if old_responsavel else "Ninguém"
        new_name = (
            atividade.responsavel.get_full_name()
            if atividade.responsavel
            else "Ninguém"
        )
        changes.append(f"Responsável alterado de '{old_name}' para '{new_name}'")

    message = f"""
    Olá,

    A tarefa "{atividade.titulo}" foi atualizada por {changed_by.get_full_name() or changed_by.username}.

    {'\n    '.join(changes) if changes else 'Detalhes da tarefa foram atualizados'}

    Detalhes atuais:
    - Título: {atividade.titulo}
    - Status: {atividade.get_status_display()}
    - Prioridade: {atividade.get_prioridade_display()}
    - Data de Vencimento: {atividade.data_vencimento.strftime('%d/%m/%Y') if atividade.data_vencimento else 'Não definida'}
    - Responsável: {atividade.responsavel.get_full_name() if atividade.responsavel else 'Não definido'}
    - Atrasada: {'Sim' if atividade.atrasado else 'Não'}

    Data da última atualização: {atividade.atualizado_em.strftime('%d/%m/%Y %H:%M')}
    """

    try:
        # Envia e-mail com informações da tarefa
        send_mail(
            subject=subject,
            message=message.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=list(emails_para_notificar),
            fail_silently=False,
        )
        logger.info(f"E-mail enviado para: {', '.join(emails_para_notificar)}")
    except Exception as e:
        logger.error(f"Falha ao enviar e-mail: {str(e)}", exc_info=True)


# Instância global
# Cria instância global do Subject
atividade_subject = AtividadeSubject()
# Adiciona os observers: log e e-mail
atividade_subject.attach(log_status_change)
atividade_subject.attach(notify_email)
