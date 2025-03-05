from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.views import ProjetoLeiViewSet, LegislatureViewSet,PhaseViewSet, AuthorViewSet, VoteViewSet, PublicationViewSet, CommissionViewSet, DebateViewSet, DashboardStatisticsView, TypeListView, UniquePhaseNamesView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


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
]