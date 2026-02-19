import React, { useState } from 'react';
import CreatePost from '../components/Posts/CreatePost';
import PostList from '../components/Posts/PostList';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, loading } = useAuth();

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="p-4">
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold">Início</h1>
      </div>
      
      <div className="p-4">
        <CreatePost onPostCreated={handlePostCreated} />
        <PostList feed refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Home;