from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'banner_image',
                  'date_joined', 'followers_count', 'following_count', 'posts_count', 'is_following']
        read_only_fields = ['date_joined']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

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

    def validate_email(self, value):
        if value and User.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
            raise serializers.ValidationError('Este email já está em uso.')
        return value

    def validate_username(self, value):
        if value and User.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError('Este nome de usuário já está em uso.')
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Senha atual inválida.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'As novas senhas não coincidem.'})
        
        try:
            validate_password(attrs['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class ChangePasswordFromLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=64)
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['current_password'])
        if not user or not user.is_active:
            raise serializers.ValidationError({'current_password': 'Credenciais inválidas para alterar a senha.'})

        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'As novas senhas não coincidem.'})

        try:
            validate_password(attrs['new_password'], user)
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        
        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    user_data = serializers.DictField(required=False)

    def validate(self, attrs):
        attrs['user_data'] = {
            'email': 'google.user@example.com',
            'social_id': 'google123',
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
        attrs['user_data'] = {
            'email': 'apple.user@example.com',
            'social_id': 'apple123',
            'provider': 'apple',
            'first_name': 'Apple',
            'last_name': 'User',
            'username': 'apple_user'
        }
        return attrs


def get_or_create_social_user(user_data):
    email = user_data.get('email')
    social_id = user_data.get('social_id')
    provider = user_data.get('provider')
    first_name = user_data.get('first_name', '')
    last_name = user_data.get('last_name', '')
    username = user_data.get('username') or f"{provider}_{social_id}" if social_id else f"{provider}_user"

    try:
        if email:
            user = User.objects.get(email=email)
            return user
        return None
    except User.DoesNotExist:
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}-{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email or '',
            password=User.objects.make_random_password(),
            first_name=first_name,
            last_name=last_name
        )
        user.save()
        return user