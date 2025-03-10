from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.views import ProjetoLeiViewSet, LegislatureViewSet,PhaseViewSet, AuthorViewSet, VoteViewSet, PublicationViewSet, CommissionViewSet, DebateViewSet, DashboardStatisticsView, TypeListView, UniquePhaseNamesView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.documentation import include_docs_urls
from django.urls import re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


router = DefaultRouter()
router.register(r'projetoslei', ProjetoLeiViewSet)
router.register(r'legislatures', LegislatureViewSet)
router.register(r'phases', PhaseViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'votes', VoteViewSet)
router.register(r'publications', PublicationViewSet)
router.register(r'commissions', CommissionViewSet)
router.register(r'debates', DebateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardStatisticsView.as_view(), name='dashboard-statistics'),
    path('types/', TypeListView.as_view(), name='initiative-types'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('phases-unique/', UniquePhaseNamesView.as_view(), name='unique-phases'),
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]