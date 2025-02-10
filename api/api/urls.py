from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from backend.views import ProjetoLeiViewSet, TypeListView, PhaseListView

router = DefaultRouter()
router.register(r'projetoslei', ProjetoLeiViewSet, basename='projetoslei')

urlpatterns = [
    path('', include(router.urls)),  # Includes all ViewSet routes
    path('admin/', admin.site.urls),
    path('types/', TypeListView.as_view(), name='projetoslei-types'),
    path('phases/', PhaseListView.as_view(), name='projetoslei-phases'),
]
