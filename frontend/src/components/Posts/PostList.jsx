import React, { useState, useEffect, useCallback } from 'react';
import PostItem from './PostItem';
import { postsAPI } from '../../services/api';

const PostList = ({ feed = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = feed 
        ? await postsAPI.getFeed()
        : await postsAPI.getPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Erro ao carregar postagens');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [feed]);

  useEffect(() => {
    loadPosts();
  }, [feed, loadPosts]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
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
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feed ? 'Siga alguns usuários para ver postagens!' : 'Nenhuma postagem encontrada.'}
        </h3>
        <p className="text-gray-600">
          {feed ? 'Comece seguindo outros usuários para ver suas postagens aqui.' : 'Seja o primeiro a postar!'}
        </p>
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