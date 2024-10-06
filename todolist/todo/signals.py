from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

# Mail on creation of user
@receiver(post_save, sender=CustomUser)
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        try:
            subject = 'Welcome to TodoLIST!'
            from_email = 'business.ayanjit@gmail.com'
            recipient_list = [instance.email]

            html_message = f"<h1>Welcome, {instance.first_name}!</h1><p>Thank you for signing up for TodoLIST!</p>"
            plain_message = f"Welcome, {instance.first_name}!\n\nThank you for signing up for TodoLIST!"

            send_mail(
                subject,
                plain_message,  
                from_email,
                recipient_list,
                fail_silently=False,
                html_message=html_message
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email to {instance.email}: {e}")

# Mail on deletion of user
@receiver(post_delete, sender=CustomUser)
def send_deletion_email(sender, instance, **kwargs):
    try:
        subject = 'Account Deletion Confirmation'
        from_email = 'business.ayanjit@gmail.com'
        recipient_list = [instance.email]

        html_message = f"<h1>Your account has been deleted</h1><p>We're sorry to see you go, {instance.first_name}!</p>"
        plain_message = f"Your account has been deleted.\n\nWe're sorry to see you go, {instance.first_name}!"

        send_mail(
            subject,
            plain_message,  
            from_email,
            recipient_list,
            fail_silently=False,
            html_message=html_message
        )
    except Exception as e:
        logger.error(f"Failed to send deletion email to {instance.email}: {e}")