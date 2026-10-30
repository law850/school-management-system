from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from rest_framework import viewsets
from .models import Student, Teacher, ClassRoom, Attendance, Subject, Grade
from .serializers import (
    StudentSerializer, TeacherSerializer, ClassRoomSerializer, 
    AttendanceSerializer, SubjectSerializer, GradeSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer


@api_view(['GET'])
def generate_report_card(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        grades = Grade.objects.filter(student=student)
        attendance = Attendance.objects.filter(student=student)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report_card_{student.admission_no}.pdf"'

        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        # --- DESIGN: HEADER BACKGROUND ---
        p.setFillColor(colors.HexColor("#1e293b")) # Dark slate color
        p.rect(0, height - 120, width, 120, fill=1, stroke=0)
        
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 28)
        p.drawString(50, height - 60, "OFFICIAL REPORT CARD")
        
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 90, "School Management System")
        p.drawString(50, height - 105, "Nairobi, Kenya | info@school.com")

        # --- DESIGN: STUDENT INFO BOX ---
        p.setFillColor(colors.HexColor("#f1f5f9")) # Light gray box
        p.rect(40, height - 200, width - 80, 60, fill=1, stroke=0)
        
        p.setFillColor(colors.black)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(60, height - 160, "Student Name:")
        p.drawString(60, height - 180, "Admission No:")
        
        p.setFont("Helvetica", 12)
        p.drawString(150, height - 160, f"{student.first_name} {student.last_name}")
        p.drawString(150, height - 180, f"{student.admission_no}")

        p.setFont("Helvetica-Bold", 12)
        p.drawString(400, height - 160, "Classroom ID:")
        p.setFont("Helvetica", 12)
        p.drawString(490, height - 160, f"{student.classroom.id if student.classroom else 'N/A'}")

        # --- DESIGN: ACADEMIC GRADES TABLE ---
        y = height - 240
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "ACADEMIC PERFORMANCE")
        
        # Table Header
        y -= 25
        p.setFillColor(colors.HexColor("#e2e8f0"))
        p.rect(40, y - 5, width - 80, 20, fill=1, stroke=0)
        p.setFillColor(colors.black)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, y, "Subject")
        p.drawString(250, y, "Term")
        p.drawString(350, y, "Score")
        p.drawString(450, y, "Grade")

        # Table Rows
        p.setFont("Helvetica", 11)
        y -= 25
        
        for index, grade in enumerate(grades):
            # Alternating row colors for readability
            if index % 2 == 0:
                p.setFillColor(colors.HexColor("#f8fafc"))
                p.rect(40, y - 5, width - 80, 20, fill=1, stroke=0)
                p.setFillColor(colors.black)
                
            p.drawString(50, y, str(grade.subject.name))
            p.drawString(250, y, str(grade.term))
            p.drawString(350, y, str(grade.score))
            
            # Color code the grade letter
            if grade.letter_grade in ['A', 'B']:
                p.setFillColor(colors.HexColor("#16a34a")) # Green
            elif grade.letter_grade == 'C':
                p.setFillColor(colors.HexColor("#d97706")) # Yellow
            else:
                p.setFillColor(colors.HexColor("#dc2626")) # Red
                
            p.setFont("Helvetica-Bold", 11)
            p.drawString(450, y, str(grade.letter_grade))
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            y -= 25

        # --- DESIGN: ATTENDANCE SUMMARY ---
        y -= 20
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "ATTENDANCE SUMMARY")
        
        p.setFont("Helvetica", 11)
        y -= 25
        present_count = attendance.filter(status='Present').count()
        absent_count = attendance.filter(status='Absent').count()
        late_count = attendance.filter(status='Late').count()

        p.drawString(50, y, f"Total Days Recorded: {attendance.count()}")
        p.drawString(200, y, f"Present: {present_count}")
        p.drawString(300, y, f"Absent: {absent_count}")
        p.drawString(400, y, f"Late: {late_count}")

        # --- FOOTER ---
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(50, 50, "This is a computer-generated document. No signature is required.")

        p.showPage()
        p.save()

        return response

    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)