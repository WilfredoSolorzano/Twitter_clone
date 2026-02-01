import React from 'react';
import CreatePost from '../components/Posts/CreatePost';
import PostList from '../components/Posts/PostList';

const Home = () => {
  return (
    <div className="p-4">
      {/* Header da página */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold">Início</h1>
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-4">
        <CreatePost />
        <PostList feed />
      </div>
    </div>
  );
};

export default Home;