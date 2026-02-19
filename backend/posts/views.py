from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post
from .serializers import PostSerializer, PostCreateSerializer
from interactions.models import Like
from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()

class PostListCreateAPI(generics.ListCreateAPIView):
    serializer_class = PostSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_queryset(self):
        print(f"Usuário: {self.request.user}, Autenticado: {self.request.user.is_authenticated}")
        
        queryset = Post.objects.all()
        

        username = self.request.query_params.get('user')
        if username:
            print(f"🔍 Filtrando posts do usuário: {username}")
            try:
                user = User.objects.get(username=username)
                queryset = queryset.filter(user=user)
                print(f"✅ Encontrados {queryset.count()} posts para {username}")
            except User.DoesNotExist:
                print(f"❌ Usuário {username} não encontrado")
                return Post.objects.none()
        
  
        elif self.request.query_params.get('feed'):
            print("📱 Carregando feed")
            following = self.request.user.following.all()
            queryset = queryset.filter(
                Q(user__in=following) | Q(user=self.request.user)
            ).distinct()
    
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PostDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class LikePostAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'error': 'Post não encontrado'}, status=404)
        
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post
        )
        
        if not created:
            like.delete()
            return Response({'status': 'unliked'})
        
        return Response({'status': 'liked'})


class RetweetPostAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.user in post.retweets.all():
            post.retweets.remove(request.user)
            return Response({
                'status': 'unretweeted',
                'retweets_count': post.retweets.count()
            })
        else:
            post.retweets.add(request.user)
            return Response({
                'status': 'retweeted',
                'retweets_count': post.retweets.count()
            })