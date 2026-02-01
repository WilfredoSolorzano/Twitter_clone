import React from 'react';

const More = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mais Opções</h1>
      <div className="card p-4 space-y-4">
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
          Configurações
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
          Ajuda
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
          Termos de Serviço
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
          Política de Privacidade
        </button>
      </div>
    </div>
  );
};

export default More;