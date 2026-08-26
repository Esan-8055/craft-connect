from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("activities", views.UserActivityViewSet, basename="user-activity")

urlpatterns = [
    path("", include(router.urls)),
    path("for-you/", views.RecommendationView.as_view(), name="recommendations"),
]
