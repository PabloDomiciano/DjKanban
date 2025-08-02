from django.views.generic import TemplateView

# Create your views here.

class PaginaView(TemplateView):
    template_name = 'lista_modelo.html'
