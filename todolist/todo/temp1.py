from django.http import JsonResponse
from django.contrib.auth import authenticate, logout
from .models import CustomUser
from rest_framework import status
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import re
import logging
import uuid
import pytz
import smtplib
import ssl

# Set up logger for debugging and error tracking
logger = logging.getLogger(__name__)

def send_otp(user):
    try:
        user.generate_otp()
        message = MIMEMultipart()
        message["From"] = 'business.ayanjit@gmail.com'
        message["To"] = user.email
        message["Subject"] = 'Your OTP Code'

        body = f'Your OTP code is {user.otp}. It is valid for 2 minutes.'
        message.attach(MIMEText(body, "plain"))

        smtp_server = 'smtp.gmail.com'
        smtp_port = 587  
        password = 'uorondjnhncqceeo' 

        context = ssl.create_default_context()

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()  
            server.starttls(context=context) 
            server.ehlo() 
            server.login('business.ayanjit@gmail.com', password)
            server.sendmail(message["From"], message["To"], message.as_string())

        return True, None  
    except Exception as e:
        return False, str(e)


# ------------------------------
# User signup view to create new users
# ------------------------------
@api_view(['POST'])
def signup_view(request):
    data = request.data
    errors = {}

    # Define required fields for user signup
    required_fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'gender']
    for field in required_fields:
        if field not in data:
            errors[field] = f"{field} is required."
    
    # Proceed if no errors are found
    if not errors:
        if data['password'] != data['confirm_password']:
            errors['password'] = "Passwords do not match."
            return JsonResponse({"errors": errors}, status=400)

        try:
            # Create a new user
            user = CustomUser(
                username=data['username'],
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                gender=data['gender']
            )
            user.set_password(data['password'])  
            user.save()

            # Call the send_otp function to generate and send OTP
            success, error_message = send_otp(user)

            if success:
                return JsonResponse({"message": "User created successfully. OTP sent to your email."}, status=200)
            else:
                return JsonResponse({"error": f"Failed to send OTP: {error_message}"}, status=500)

        except Exception as e:
            return JsonResponse({"message": "Could not create user. User exists or other issue"}, status=400)
        
    # Return error response if validation fails
    return JsonResponse({"errors": errors}, status=400)


# ------------------------------
# User login view
# ------------------------------
@api_view(['POST'])
def login_view(request):

    request.data.pop('agreeToTerms', None)

    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    # Validate presence of either username or email
    if not username and not email:
        return JsonResponse({"message": "Either username or email is required."}, status=400)
    
    # Validate password field
    if not password:
        return JsonResponse({"message": "Password is required."}, status=400)

    # Fetch user by username or email
    user = None
    try:
        if username:
            user = CustomUser.objects.get(username=username)
        elif email:
            user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return JsonResponse({"message": "User does not exist."}, status=404)

    # Authenticate the user
    authenticated_user = authenticate(request, username=user.username, password=password)
    if authenticated_user is not None:
        try:
            # Directly call the send_otp function to send OTP
            success, error_message = send_otp(user)

            if success:
                return JsonResponse({"message": "OTP sent successfully."}, status=200)
            else:
                return JsonResponse({"error": f"Failed to send OTP: {error_message}"}, status=500)

        except Exception as e:
            return JsonResponse({"message": f"Failed to send OTP. Error: {str(e)}"}, status=500)

    # Return invalid credentials message if authentication fails
    return JsonResponse({"message": "Invalid credentials."}, status=400)


# ------------------------------
# OTP verification view for user login
# ------------------------------
@api_view(['POST'])
def verify_otp(request):
    data = request.data
    otp_input = data.get('otp')
    email_or_username = data.get('cred')

    # Ensure OTP and credentials are provided
    if not otp_input or not email_or_username:
        return JsonResponse({'error': 'OTP and email/username are required'}, status=400)

    # Fetch user by email or username
    try:
        if re.search(r'@[A-Za-z0-9]+\.[A-Za-z0-9]+$', email_or_username):
            user = CustomUser.objects.get(email=email_or_username)
        else:
            user = CustomUser.objects.get(username=email_or_username)
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Validate OTP and check if it's still valid
    if user.otp == otp_input and user.is_otp_valid():
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "message": "Signed in successfully",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }, status=200)

    # Return error response for invalid or expired OTP
    return JsonResponse({'error': 'Invalid or expired OTP'}, status=400)

# ------------------------------
# Logout view for authenticated users
# ------------------------------
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    username = request.user.username
    logout(request)
    return JsonResponse({"message": f"User {username} logged out successfully."}, status=status.HTTP_200_OK)

# ------------------------------
# Delete user account functionality for authenticated users
# ------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    username = request.user.username
    try:
        user = CustomUser.objects.get(username=username)
        user.delete()
        return JsonResponse({"message": "User deleted successfully."}, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return JsonResponse({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# ------------------------------
# Fetch authenticated user's profile information
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def info(request):
    username = request.user.username
    try:
        user = CustomUser.objects.get(username=username)
        
        # Prepare and return user profile data
        response_data = {
            "username": f"@{user.username}",
            "name": f"{user.first_name} {user.last_name}".strip(),  
            "email": user.email,
            "gender": user.gender,
            "tasks_count": len(user.tasks) if user.tasks else 0
        }
        
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        return JsonResponse({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------------
# Create a new task for the authenticated user
# ------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task(request):
    username = request.user.username
    try:
        user = CustomUser.objects.get(username=username)

        # Collect task details from the request
        kolkata_tz = pytz.timezone('Asia/Kolkata')
        task_data = {
            "task_id": str(uuid.uuid4()),  
            "task_name": request.data.get('name'),
            "task_desc": request.data.get('description'),
            "task_created": timezone.now().astimezone(kolkata_tz),
            "task_done": request.data.get('task_done', False),
            "schedule_date": request.data.get('dueDate'),
            "start_time": request.data.get('timeStart'),
            "end_time": request.data.get('timeEnd'),
        }

        if user.tasks is None:
            user.tasks = []

        user.tasks.append(task_data)
        user.save()
        return JsonResponse({"message": "Task created successfully", "task_id": task_data["task_id"]}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        logger.error(f"Error in create_task: {str(e)}")
        return JsonResponse({"error": "Internal Server Error"}, status=500)

# ------------------------------
# Homeview: Fetch all tasks for the authenticated user
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def homeview(request):
    # Retrieve the username from the authenticated user
    username = request.user.username
    try:
        # Fetch the CustomUser instance based on the username
        user = CustomUser.objects.get(username=username)

        # If the user has tasks, format and return them, otherwise return an empty list
        tasks = user.tasks if user.tasks is not None else []

        # Debugging: Log the retrieved tasks
        logger.info(f"Retrieved tasks for user {username}: {tasks}")

        if tasks:
            # Construct a task list by extracting necessary fields from each task
            task_list = [
                {
                    'task_id': task['task_id'],
                    'task_name': task['task_name'],
                    'task_created': task['task_created'],
                    'task_done': task['task_done']
                }
                for task in tasks
            ]
            # Sort the task list by creation date (most recent first)
            task_list.sort(key=lambda x: x['task_created'], reverse=True)

            # Debugging: Log the sorted task list
            logger.info(f"Sorted task list for user {username}: {task_list}")

            return JsonResponse(task_list, safe=False, status=200)
        else:
            # Return a response indicating no tasks found
            return JsonResponse({"error": "No tasks found for the given username"}, status=200)

    except CustomUser.DoesNotExist:
        # If the user doesn't exist, return a 404 error
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        # Log any other unexpected errors and return a 500 error
        logger.error(f"Error in homeview: {str(e)}")
        return JsonResponse({"error": "Internal Server Error"}, status=500)

# ------------------------------
# View Task: Fetch a specific task by its ID
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_task(request, task_id):

    # Ensure a valid task ID is provided
    if not task_id:
        return JsonResponse({"error": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve the username from the authenticated user
    username = request.user.username
    try:
        # Fetch the CustomUser instance based on the username
        user = CustomUser.objects.get(username=username)
        
        # Look for the task with the given task ID in the user's task list
        task = next((task for task in user.tasks if str(task['task_id']) == str(task_id)), None)
        
        if task is not None:
            # Prepare and return the response with the task details
            response_data = {
                "task_id": task['task_id'],
                "task_name": task['task_name'],
                "task_desc": task['task_desc'],
                "task_created": task['task_created'],
                "task_done": task['task_done'],
                "schedule_date": task['schedule_date'],
                "start_time": task['start_time'],
                "end_time": task['end_time']
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        else:
            # Return a response if the task was not found
            return JsonResponse({"error": "No such task found"}, status=status.HTTP_404_NOT_FOUND)

    except CustomUser.DoesNotExist:
        # If the user doesn't exist, return a 404 error
        return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Log any other unexpected errors and return a 500 error
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------------
# Edit Task: Update the details of an existing task
# ------------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_task(request):

    # Retrieve the username from the authenticated user
    username = request.user.username
    # Get the task ID from the request payload
    task_id = request.data.get('task_id')

    try:
        # Fetch the CustomUser instance based on the username
        user = CustomUser.objects.get(username=username)
        
        # Look for the task with the given task ID in the user's task list
        task = next((task for task in user.tasks if str(task['task_id']) == str(task_id)), None)

        if task is not None:
            # Update the task fields, using existing values as defaults if not provided in the request
            task.update({
                'task_name': request.data.get('task_name', task['task_name']),
                'task_desc': request.data.get('task_desc', task['task_desc']),
                'task_done': request.data.get('task_done', task['task_done']),
                'schedule_date': request.data.get('schedule_date', task['schedule_date']),
                'start_time': request.data.get('start_time', task['start_time']),
                'end_time': request.data.get('end_time', task['end_time']),
            })

            # Save the user object to persist changes to the database
            user.save()

            # Return a success response with the updated task data
            return JsonResponse({"message": "Task updated successfully", "task": task}, status=status.HTTP_200_OK)
        
        # If the task was not found, return a 404 error
        return JsonResponse({"error": "No such task found"}, status=status.HTTP_404_NOT_FOUND)

    except CustomUser.DoesNotExist:
        # If the user doesn't exist, return a 404 error
        return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Log any other unexpected errors and return a 500 error
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------------
# Delete Task: Remove a task from the user's list
# ------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request):

    try:
        # Retrieve the task ID from the request payload
        task_id = request.data.get('task_id')

        # Ensure a valid task ID is provided
        if not task_id:
            return JsonResponse({"error": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the authenticated user
        user = request.user

        # Look for the task with the given task ID in the user's task list
        task = next((task for task in user.tasks if task['task_id'] == task_id), None)

        if task:
            # Remove the task from the user's task list
            user.tasks.remove(task)
            user.save()  # Save the changes to the database
            
            # Return a success response
            return JsonResponse({"success": "Task deleted successfully"}, status=status.HTTP_200_OK)
        else:
            # If the task was not found, return a 404 error
            return JsonResponse({"error": "No such task found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        # Log any other unexpected errors and return a 500 error
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
