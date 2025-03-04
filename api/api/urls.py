from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register(r'projetoslei', views.ProjetoLeiViewSet)
router.register(r'legislatures', views.LegislatureViewSet)
router.register(r'phases', views.PhaseViewSet)
router.register(r'authors', views.AuthorViewSet)
router.register(r'votes', views.VoteViewSet)
router.register(r'publications', views.PublicationViewSet)
router.register(r'commissions', views.CommissionViewSet)
router.register(r'debates', views.DebateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.DashboardStatisticsView.as_view(), name='dashboard-statistics'),
    path('types/', views.TypeListView.as_view(), name='initiative-types'),
    path('phase-names/', views.PhaseListView.as_view(), name='phase-names'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]