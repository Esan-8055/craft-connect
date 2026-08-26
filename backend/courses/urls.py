from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.CourseViewSet, basename="course")

# Nested video routes: /api/courses/{course_pk}/videos/
video_router = DefaultRouter()
video_router.register("", views.VideoViewSet, basename="course-video")

urlpatterns = [
    path("", include(router.urls)),
    path("<int:course_pk>/videos/", include(video_router.urls)),
]
