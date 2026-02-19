import React, { useState, useEffect, useCallback } from 'react'; 
import { postsAPI } from '../../services/api'; 
import PostList from '../Posts/PostList';

const ProfileLikes = ({ username }) => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const loadLikedPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getUserLikes(username);
      setLikedPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar curtidas:', error);
      setError('Não foi possível carregar as curtidas');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadLikedPosts();
  }, [loadLikedPosts]); 

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
          onClick={loadLikedPosts}
          className="mt-2 text-twitter-blue hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (likedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Nenhuma curtida</p>
        <p className="text-gray-400 text-sm">
          Quando você curtir um tweet, ele aparecerá aqui.
        </p>
      </div>
    );
  }

  return <PostList posts={likedPosts} />;
};

export default ProfileLikes;