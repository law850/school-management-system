from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, TeacherViewSet, ClassRoomViewSet, 
    AttendanceViewSet, SubjectViewSet, GradeViewSet,
    generate_report_card  # <-- ADDED HERE
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'classrooms', ClassRoomViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'grades', GradeViewSet)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # THIS IS THE NEW LINE FOR THE PDF
    path('students/<int:student_id>/report-card/', generate_report_card, name='report_card'),
    
    path('', include(router.urls)),
]