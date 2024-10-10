from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import logging
from .models import CustomUser

logger = logging.getLogger(__name__)

# Utility function to send an email
def send_email(subject, from_email, recipient_list, plain_message, html_message):
    try:
        # Set up the SMTP connection
        smtp_server = 'smtp.gmail.com' 
        smtp_port = 587  
        password = 'uorondjnhncqceeo' 

        message = MIMEMultipart()
        message["From"] = from_email
        message["To"] = ', '.join(recipient_list)
        message["Subject"] = subject

        message.attach(MIMEText(plain_message, "plain"))
        message.attach(MIMEText(html_message, "html"))

        context = ssl.create_default_context()

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()  
            server.starttls(context=context) 
            server.ehlo()
            server.login(from_email, password) 
            server.sendmail(from_email, recipient_list, message.as_string()) 
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_list}: {e}")

# Mail on creation of user
@receiver(post_save, sender=CustomUser)
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        subject = 'Welcome to TodoLIST!'
        from_email = 'business.ayanjit@gmail.com'
        recipient_list = [instance.email]

        html_message = f"<h1>Welcome, {instance.first_name}!</h1><p>Thank you for signing up for TodoLIST!</p>"
        plain_message = f"Welcome, {instance.first_name}!\n\nThank you for signing up for TodoLIST!"

        send_email(subject, from_email, recipient_list, plain_message, html_message)

# Mail on deletion of user
@receiver(post_delete, sender=CustomUser)
def send_deletion_email(sender, instance, **kwargs):
    subject = 'Account Deletion Confirmation'
    from_email = 'business.ayanjit@gmail.com'
    recipient_list = [instance.email]

    html_message = f"<h1>Your account has been deleted</h1><p>We're sorry to see you go, {instance.first_name}!</p>"
    plain_message = f"Your account has been deleted.\n\nWe're sorry to see you go, {instance.first_name}!"

    send_email(subject, from_email, recipient_list, plain_message, html_message)

