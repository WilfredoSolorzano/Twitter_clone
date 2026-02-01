import React from 'react';
import PostList from '../components/Posts/PostList';

const Explore = () => {
  return (
    <div className="p-4">
      {/* Header da página */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold">Explorar</h1>
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-4">
        <PostList />
      </div>
    </div>
  );
};

export default Explore;