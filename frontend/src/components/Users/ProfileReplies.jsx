import React, { useState, useEffect, useCallback } from 'react'; 
import { postsAPI } from '../../services/api'; 
import PostList from '../Posts/PostList';

const ProfileReplies = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
  const loadReplies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getUserPosts(username, { type: 'replies' });
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
      setError('Não foi possível carregar as respostas');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadReplies();
  }, [loadReplies]); 

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadReplies}
          className="mt-2 text-twitter-blue hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Nenhuma resposta</p>
        <p className="text-gray-400 text-sm">
          Quando você responder a um tweet, ele aparecerá aqui.
        </p>
      </div>
    );
  }

  return <PostList posts={posts} />;
};

export default ProfileReplies;