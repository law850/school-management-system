from django.db import models

class ClassRoom(models.Model):
    name = models.CharField(max_length=50)
    section = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.name} - {self.section}"


class Teacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    subject_specialty = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    admission_no = models.CharField(max_length=20, unique=True, blank=True)
    date_of_birth = models.DateField()
    classroom = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.admission_no:
            last_student = Student.objects.all().order_by('id').last()
            if not last_student:
                self.admission_no = 'ADM001'
            else:
                last_id = int(last_student.admission_no.replace('ADM', ''))
                new_id = last_id + 1
                self.admission_no = f'ADM{new_id:03d}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_no})"


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.first_name} - {self.date} - {self.status}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    term = models.CharField(max_length=20, default='Term 1')

    def __str__(self):
        return f"{self.student.first_name} - {self.subject.name} - {self.score}"

    @property
    def letter_grade(self):
        if self.score >= 80: return 'A'
        elif self.score >= 70: return 'B'
        elif self.score >= 60: return 'C'
        elif self.score >= 50: return 'D'
        else: return 'F'