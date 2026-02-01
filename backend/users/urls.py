
from django.urls import path
from .views import (
    AppleLoginAPI, RegisterAPI, LoginAPI, UserAPI, ProfileUpdateAPI,
    UserDetailAPI, FollowUserAPI, FollowersListAPI, FollowingListAPI,
    GoogleLoginAPI, 
)

urlpatterns = [
    # URLs antigas (para compatibilidade)
    path('auth/register/', RegisterAPI.as_view(), name='register-old'),
    path('auth/login/', LoginAPI.as_view(), name='login-old'),
    path('auth/google-login/', GoogleLoginAPI.as_view(), name='google-login-old'),
    path('auth/apple-login/', AppleLoginAPI.as_view(), name='apple-login-old'),
    path('auth/user/', UserAPI.as_view(), name='user-old'),
    path('auth/profile/update/', ProfileUpdateAPI.as_view(), name='profile-update-old'),
    
    # URLs novas (sem /auth/)
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('google-login/', GoogleLoginAPI.as_view(), name='google-login'),
    path('apple-login/', AppleLoginAPI.as_view(), name='apple-login'),  
    path('user/', UserAPI.as_view(), name='user'),
    path('profile/update/', ProfileUpdateAPI.as_view(), name='profile-update'),
    
    # Outros usuários
    path('user/<str:username>/', UserDetailAPI.as_view(), name='user-detail'),
    path('user/<str:username>/follow/', FollowUserAPI.as_view(), name='follow-user'),
    path('user/<str:username>/followers/', FollowersListAPI.as_view(), name='followers-list'),
    path('user/<str:username>/following/', FollowingListAPI.as_view(), name='following-list'),
]