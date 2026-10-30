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
    admission_no = models.CharField(max_length=20, unique=True, blank=True) # <-- Added blank=True
    date_of_birth = models.DateField()
    classroom = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # If this is a new student and no admission_no is provided
        if not self.admission_no:
            # 1. Count how many students exist
            last_student = Student.objects.all().order_by('id').last()
            if not last_student:
                # If no students exist, start at ADM001
                self.admission_no = 'ADM001'
            else:
                # 2. Extract the number from the last admission_no, add 1, and format it
                last_id = int(last_student.admission_no.replace('ADM', ''))
                new_id = last_id + 1
                self.admission_no = f'ADM{new_id:03d}' # format as ADM002, ADM003, etc.
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_no})"