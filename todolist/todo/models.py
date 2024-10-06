from django.contrib.auth.models import AbstractUser
from djongo import models
import random
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ('F', 'Female'),
        ('M', 'Male'),
        ('O', 'Other')
    ]

    email = models.EmailField(unique=True, blank=False, null=False)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=False, null=False)

    otp = models.CharField(max_length=6, null=True, blank=True)  
    otp_created_at = models.DateTimeField(null=True, blank=True)

    tasks = models.JSONField(default=list)

    def __str__(self):
        return f"{self.username}"

    def generate_otp(self):
        self.otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.otp_created_at = timezone.now()
        self.save()

    def verify_otp(self, otp_input):
        if self.otp == otp_input and self.is_otp_valid():
            return True
        return False

    def is_otp_valid(self):
        if self.otp_created_at:
            return (timezone.now() - self.otp_created_at).seconds < 120
        return False

    def add_task(self, task_name, task_desc, schedule_date, start_time="00:00:00", end_time="23:59:59"):
        task = {
            'task_id': str(uuid.uuid4()),
            'task_name': task_name,
            'task_desc': task_desc,
            'task_created': timezone.now(),
            'task_done': False,
            'schedule_date': schedule_date,
            'start_time': start_time,
            'end_time': end_time,
        }
        self.tasks.append(task)
        self.save()