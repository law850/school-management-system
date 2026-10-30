from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, TeacherViewSet, ClassRoomViewSet, AttendanceViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'classrooms', ClassRoomViewSet)
router.register(r'attendance', AttendanceViewSet) # <-- NEW LINE

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]