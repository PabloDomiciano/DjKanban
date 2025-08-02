from django import forms
from .models import Atividade

class AtividadeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Adiciona a classe form-control a todos os campos automaticamente
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})
            if 'class' in field.widget.attrs:
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs['class'] = 'form-control'

    class Meta:
        model = Atividade
        fields = ['titulo', 'descricao', 'prioridade', 'status', 'data_vencimento', 'responsavel']
        widgets = {
            'data_vencimento': forms.DateInput(
                attrs={
                    'type': 'date',
                    'class': 'form-control',
                    'placeholder': 'Selecione a data'
                }
            ),
            'descricao': forms.Textarea(
                attrs={
                    'rows': 3,
                    'class': 'form-control',
                    'placeholder': 'Descreva a tarefa...',
                }
            ),
            'titulo': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Título da tarefa'
                }
            ),
            'prioridade': forms.Select(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'responsavel': forms.Select(attrs={'class': 'form-control'}),
        }