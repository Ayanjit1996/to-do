from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/', views.homeview, name="home"),
    path('api/signup/', views.signup_view, name="signup"),
    path('api/login/', views.login_view, name="login"),
    path('api/send-otp/', views.send_otp, name='send_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/logout/', views.logout_view, name="logout"),
    path('api/deleteuser/', views.delete_user, name="delete_user"),
    path('api/info/', views.info, name="info"),
    path('api/create/', views.create_task, name="create"),
    path('api/view/<uuid:task_id>/', views.view_task, name="view"),
    path('api/update/', views.edit_task, name="edit_task"),
    path('api/delete/', views.delete_task, name="delete_task"),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
