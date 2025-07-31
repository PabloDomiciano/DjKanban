from django.views.generic import TemplateView

# Create your views here.

class PaginaView(TemplateView):
    template_name = 'modelo.html'
    
class PaginaFormulario(TemplateView):
    template_name = 'form_modelo.html'