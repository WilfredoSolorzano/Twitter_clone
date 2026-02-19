import React, { useState, useEffect, useCallback } from 'react'; 
import { postsAPI } from '../../services/api'; 
import { Link } from 'react-router-dom';

const ProfileMedia = ({ username }) => {
  const [mediaPosts, setMediaPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getUserPosts(username, { type: 'media' });
      setMediaPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
      setError('Não foi possível carregar a mídia');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]); 

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
          onClick={loadMedia}
          className="mt-2 text-twitter-blue hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (mediaPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Nenhuma mídia</p>
        <p className="text-gray-400 text-sm">
          Quando você postar fotos ou vídeos, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {mediaPosts.map((post) => (
        <Link 
          key={post.id} 
          to={`/post/${post.id}`}
          className="aspect-square overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
        >
          {post.image && (
            <img 
              src={post.image} 
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-image.png';
              }}
            />
          )}
          {post.video && (
            <div className="relative w-full h-full">
              <video 
                src={post.video} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ProfileMedia;