from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 
                 'banner_image', 'date_joined', 'followers_count', 'following_count']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Credenciais inválidas")

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'bio', 'profile_picture', 'banner_image']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
        }

# Serializers para login social
class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    user_data = serializers.DictField(required=False)
    
    def validate(self, attrs):
        # Em produção, valide o token do Google aqui
        # Para desenvolvimento, use dados mock
        attrs['user_data'] = {
            'email': 'google.user@example.com',
            'social_id': 'google_123',
            'provider': 'google',
            'first_name': 'Google',
            'last_name': 'User',
            'username': 'google_user'
        }
        return attrs

class AppleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    user_data = serializers.DictField(required=False)
    
    def validate(self, attrs):
        # Em produção, valide o token da Apple aqui
        attrs['user_data'] = {
            'email': 'apple.user@example.com',
            'social_id': 'apple_123',
            'provider': 'apple',
            'first_name': 'Apple',
            'last_name': 'User',
            'username': 'apple_user'
        }
        return attrs

# Função para criar/obter usuário social
def get_or_create_social_user(user_data):
    email = user_data.get('email')
    social_id = user_data.get('social_id')
    provider = user_data.get('provider')
    
    try:
        # Tenta encontrar usuário pelo email
        if email:
            user = User.objects.get(email=email)
            return user
    except User.DoesNotExist:
        # Cria novo usuário
        username = user_data.get('username') or f"{provider}_{social_id}"
        
        # Garante que o username seja único
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            social_id=social_id,
            provider=provider
        )
        
        # Define uma senha padrão para contas sociais
        user.set_password('social_default_password')
        user.save()
        return user
    
    return None