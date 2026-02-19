import React, { useState, useEffect, useCallback } from 'react';
import PostItem from './PostItem';
import { postsAPI } from '../../services/api';

const PostList = ({ feed = false, username = null, refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    console.log(`🔍 PostList - Token:`, token ? '✅' : '❌');
    
    try {
      console.log(`📤 PostList - Carregando posts:`, { feed, username });
      
      let response;
      if (username) {
        // 👈 Se tem username, busca posts do usuário específico
        console.log(`👤 Buscando posts de: ${username}`);
        response = await postsAPI.getUserPosts(username);
      } else if (feed) {
        console.log('📱 Buscando feed');
        response = await postsAPI.getFeed();
      } else {
        console.log('🌍 Buscando todos os posts');
        response = await postsAPI.getPosts();
      }
      
      console.log('✅ PostList - Posts carregados:', response.data);
      
      // Log para verificar se os posts são do usuário correto
      if (username) {
        response.data.forEach(post => {
          console.log(`Post ${post.id} é de: ${post.user?.username}`);
        });
      }
      
      setPosts(response.data);
    } catch (err) {
      console.error('❌ PostList - Erro:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Erro ao carregar postagens');
      }
    } finally {
      setLoading(false);
    }
  }, [feed, username]);

  useEffect(() => {
    loadPosts();
  }, [feed, username, loadPosts, refreshTrigger]);

  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handlePostUpdated = () => {
    loadPosts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
        {error === 'Sessão expirada. Faça login novamente.' && (
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-2 text-sm underline"
          >
            Ir para login
          </button>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {username ? 'Nenhum post encontrado' : feed ? 'Nenhum post no feed' : 'Nenhum post encontrado'}
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onDelete={handlePostDeleted}
          onUpdate={handlePostUpdated}
        />
      ))}
    </div>
  );
};

export default PostList;