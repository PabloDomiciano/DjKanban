from django import template
from ..models import Atividade

register = template.Library()

@register.filter
def status_count(queryset, status):
    return queryset.filter(status=status).count()

@register.filter(name='status_count')  # Alternativa com nome explícito
def status_count_filter(queryset, status):
    return queryset.filter(status=status).count()