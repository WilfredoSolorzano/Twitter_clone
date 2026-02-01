from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from knox.models import AuthToken
from .serializers import (
    UserSerializer, RegisterSerializer, 
    LoginSerializer, ProfileUpdateSerializer,
    GoogleAuthSerializer, AppleAuthSerializer,  
    get_or_create_social_user 
)
from .models import User

# ===== VIEWS DE AUTENTICAÇÃO =====

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })

class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })

# ===== VIEWS PARA LOGIN SOCIAL =====

class GoogleLoginAPI(generics.GenericAPIView):  
    serializer_class = GoogleAuthSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_data = serializer.validated_data['user_data']
        user = get_or_create_social_user(user_data)
        
        # Criar token para o usuário
        token = AuthToken.objects.create(user)[1]
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token
        })

class AppleLoginAPI(generics.GenericAPIView):
    serializer_class = AppleAuthSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_data = serializer.validated_data['user_data']
        user = get_or_create_social_user(user_data)
        
        # Criar token para o usuário
        token = AuthToken.objects.create(user)[1]
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token
        })

# ===== VIEWS DE PERFIL E USUÁRIO =====

class UserAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class ProfileUpdateAPI(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserDetailAPI(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'

# ===== VIEWS DE SEGUIR USUÁRIOS =====

class FollowUserAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, username):
        try:
            user_to_follow = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user == user_to_follow:
            return Response({'error': 'Não é possível seguir a si mesmo'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if user_to_follow in request.user.following.all():
            request.user.following.remove(user_to_follow)
            return Response({'status': 'unfollowed'})
        else:
            request.user.following.add(user_to_follow)
            return Response({'status': 'followed'})

class FollowersListAPI(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        username = self.kwargs['username']
        try:
            user = User.objects.get(username=username)
            return user.followers.all()
        except User.DoesNotExist:
            return User.objects.none()

class FollowingListAPI(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        username = self.kwargs['username']
        try:
            user = User.objects.get(username=username)
            return user.following.all()
        except User.DoesNotExist:
            return User.objects.none()