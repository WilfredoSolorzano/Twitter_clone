import React from 'react';

const Bookmarks = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Salvos</h1>
      <div className="card p-4">
        <p className="text-gray-600">Você não tem tweets salvos.</p>
      </div>
    </div>
  );
};

export default Bookmarks;