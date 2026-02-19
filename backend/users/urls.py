from django.urls import path
from .views import (
    AppleLoginAPI, RegisterAPI, LoginAPI, UserAPI, ProfileUpdateAPI,
    ChangePasswordAPI, ChangePasswordFromLoginAPI,
    UserDetailAPI, UserListAPI, FollowUserAPI, FollowersListAPI, FollowingListAPI,
    GoogleLoginAPI,
)

urlpatterns = [
    # Autenticação
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('change-password-login/', ChangePasswordFromLoginAPI.as_view(), name='change-password-login'),
    path('google-login/', GoogleLoginAPI.as_view(), name='google-login'),
    path('apple-login/', AppleLoginAPI.as_view(), name='apple-login'),
    
    # Perfil do usuário logado
    path('user/', UserAPI.as_view(), name='user'),
    path('profile/update/', ProfileUpdateAPI.as_view(), name='profile-update'),
    path('profile/change-password/', ChangePasswordAPI.as_view(), name='change-password'),
    
    # Outros usuários
    path('users/', UserListAPI.as_view(), name='users-list'),
    path('user/<str:username>/', UserDetailAPI.as_view(), name='user-detail'),
    path('user/<str:username>/follow/', FollowUserAPI.as_view(), name='follow-user'),
    path('user/<str:username>/followers/', FollowersListAPI.as_view(), name='followers-list'),
    path('user/<str:username>/following/', FollowingListAPI.as_view(), name='following-list'),
]