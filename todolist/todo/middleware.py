from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed, TokenError
from django.contrib.auth.models import AnonymousUser
from jwt.exceptions import ExpiredSignatureError
import logging

logger = logging.getLogger(__name__)

# Paths requiring protection and refresh token paths
protected_paths = {'/', '/create/', '/update/', '/delete/', '/view/', '/deleteuser/', '/logout/', '/info/'}
refreshtokepath = {'/api/token/refresh/', '/api/token/'}

class CustomAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()  # JWT Authentication

    def __call__(self, request):

        auth = request.headers.get('Authorization')
        if auth and auth.startswith('Bearer '):  # Token found
            token = auth.split(' ')[1]  # Extract the JWT token
            try:
                # Validate the JWT token
                validated_token = self.jwt_auth.get_validated_token(token)
                request.user = self.jwt_auth.get_user(validated_token)  # Set user based on validated token
            except ExpiredSignatureError:
                logger.error("JWT access token expired.")
                return JsonResponse({"message": "Access token has expired."}, status=401)
            except (InvalidToken, AuthenticationFailed, TokenError) as e:
                logger.warning(f"JWT authentication error: {str(e)}")
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()  # No token, user is anonymous

        # Check if the request path is protected and the user is not authenticated
        if request.path in protected_paths and not request.user.is_authenticated:
            logger.warning(f"Unauthorized access attempt to {request.path}")
            return JsonResponse({"message": "Authentication required. Please log in."}, status=401)

        # Log token refresh action for specified paths
        if request.path in refreshtokepath:
            logger.info(f"Token refresh action on {request.path}")

        # Continue processing the request
        response = self.get_response(request)
        return response