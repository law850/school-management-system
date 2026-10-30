from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, TeacherViewSet, ClassRoomViewSet

# The router automatically creates standard URLs for our views
router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'classrooms', ClassRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]