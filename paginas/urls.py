from django.urls import path

from paginas.views import PaginaView, PaginaFormulario

urlpatterns = [
    path('', PaginaView.as_view(), name='modelo'),
    path('formulario/', PaginaFormulario.as_view(), name='form_modelo'),

]