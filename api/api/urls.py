from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from backend.views import ProjetoLeiViewSet, TypeListView, PhaseListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register(r'projetoslei', ProjetoLeiViewSet, basename='projetoslei')

urlpatterns = [
    path('', include(router.urls)), 
    path('admin/', admin.site.urls),
    path('types/', TypeListView.as_view(), name='projetoslei-types'),
    path('phases/', PhaseListView.as_view(), name='projetoslei-phases'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
