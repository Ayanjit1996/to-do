from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', views.homeview, name="home"),
    path('signup/', views.signup_view, name="signup"),
    path('login/', views.login_view, name="login"),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('logout/', views.logout_view, name="logout"),
    path('deleteuser/', views.delete_user, name="delete_user"),
    path('info/', views.info, name="info"),
    path('create/', views.create_task, name="create"),
    path('view/<uuid:task_id>/', views.view_task, name="view"),
    path('update/', views.edit_task, name="edit_task"),
    path('delete/', views.delete_task, name="delete_task"),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]