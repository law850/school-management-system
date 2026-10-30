from rest_framework import serializers
from .models import Student, Teacher, ClassRoom, Attendance

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class ClassRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRoom
        fields = '__all__'

# ADD THIS AT THE BOTTOM
class AttendanceSerializer(serializers.ModelSerializer):
    # This will include the student's name in the JSON, not just their ID
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'