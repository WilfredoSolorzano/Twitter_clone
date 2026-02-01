import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userXNatgeo from '../../assets/images/natgeo.jpeg';
import userXBBC from '../../assets/images/bbc.webp';
import userXnasa from '../../assets/images/nasa.png';


const RightSidebar = () => {
  const [loading, setLoading] = useState({ google: false, apple: false });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se usuário já está logado, não mostrar botões de inscrição
  if (user) {
    return (
      <div className="sticky top-0 p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar no X Clone"
              className="w-full p-3 pl-10 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-twitter-blue"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Trending */}
        <div className="card p-4 mb-4">
          <h3 className="font-bold text-xl mb-4">O que está acontecendo</h3>
          <div className="space-y-4">

            <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
              <p className="text-sm text-gray-500">Tecnologia · educacional</p>
              <p className="font-bold">EBAC</p>
              <p className="text-sm text-gray-500">10.2K Tweets</p>
            </div>

            <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
              <p className="text-sm text-gray-500">Tendência no Brasil</p>
              <p className="font-bold"># X Clone</p>
              <p className="text-sm text-gray-500">2.5K Tweets</p>
            </div>

            <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
              <p className="text-sm text-gray-500"> Tendência Internacional</p>
              <p className="font-bold">ReactJS</p>
              <p className="text-sm text-gray-500">5.2K Tweets</p>
            </div>
          </div>
        </div>

        {/* Who to follow */}
        <div className="card p-4">
          <h3 className="font-bold text-xl mb-4">Quem seguir</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={userXNatgeo}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold">National Geographic</p>
                  <p className="text-gray-500 text-sm">@natgeo</p>
                </div>
              </div>
              <button className="btn-primary text-sm px-4 py-1">
                Seguir
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={userXBBC}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold">BBC Earth</p>
                  <p className="text-gray-500 text-sm">@BBCEarth</p>
                </div>
              </div>
              <button className="btn-primary text-sm px-4 py-1">
                Seguir
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={userXnasa}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold">NASA</p>
                  <p className="text-gray-500 text-sm">@NASA</p>
                </div>
              </div>
              <button className="btn-primary text-sm px-4 py-1">
                Seguir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se NÃO está logado, mostrar opções de inscrição
  const handleGoogleSignup = async () => {
    try {
      setLoading(prev => ({ ...prev, google: true }));
      setError('');
      
      // Aqui é implementado o fluxo real do Google OAuth
      // Por enquanto, vamos mostrar uma mensagem
      alert(
        'Funcionalidade "Inscreva-se com Google" em desenvolvimento!\n\n' +
        'Por enquanto, clique em "Tweetar" na sidebar esquerda para registrar-se.'
      );
      
      // Redirecionar para registro
      navigate('/register');
      
    } catch (err) {
      setError('Erro ao conectar com Google');
      console.error('Erro Google:', err);
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleAppleSignup = async () => {
    try {
      setLoading(prev => ({ ...prev, apple: true }));
      setError('');
      
      alert(
        'Funcionalidade "Inscreva-se com Apple" em desenvolvimento!\n\n' +
        'Por enquanto, use o registro tradicional.'
      );
      
      navigate('/register');
      
    } catch (err) {
      setError('Erro ao conectar com Apple');
      console.error('Erro Apple:', err);
    } finally {
      setLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return (
    <div className="sticky top-0 p-4">
      {/* Mensagem de boas-vindas para não logados */}
      <div className="card p-6 mb-6 text-center">
        <h3 className="font-bold text-xl mb-2">Não perca o que está acontecendo</h3>
        <p className="text-gray-600 mb-4">
          As pessoas que usam o X Clone são as primeiras a saber.
        </p>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignup}
            disabled={loading.google}
            className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            {loading.google ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            ) : (
              <FcGoogle className="h-5 w-5" />
            )}
            <span className="font-medium">Inscreva-se com Google</span>
          </button>
          
          <button
            onClick={handleAppleSignup}
            disabled={loading.apple}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-black text-white rounded-full hover:bg-gray-900 transition-colors"
          >
            {loading.apple ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FaApple className="h-5 w-5" />
            )}
            <span className="font-medium">Inscreva-se com Apple</span>
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Ao se inscrever, você concorda com os <button className="text-twitter-blue hover:underline bg-none border-none p-0 cursor-pointer">Termos de Serviço</button> e a <button className="text-twitter-blue hover:underline bg-none border-none p-0 cursor-pointer">Política de Privacidade</button>, incluindo o <button className="text-twitter-blue hover:underline bg-none border-none p-0 cursor-pointer">Uso de Cookies</button>.</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar no X Clone"
            className="w-full p-3 pl-10 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-twitter-blue"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="card p-4 mb-4">
        <h3 className="font-bold text-xl mb-4">O que está acontecendo</h3>
        <div className="space-y-4">
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm text-gray-500">Tendência no Brasil</p>
            <p className="font-bold"># X Clone</p>
            <p className="text-sm text-gray-500">2.5K Tweets</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm text-gray-500">Tecnologia · Tendência</p>
            <p className="font-bold">ReactJS</p>
            <p className="text-sm text-gray-500">5.2K Tweets</p>
          </div>
        </div>
      </div>

      {/* Login tradicional */}
      <div className="card p-4">
        <h3 className="font-bold text-xl mb-4">Já tem uma conta?</h3>
        <button
          onClick={() => navigate('/login')}
          className="w-full btn-primary py-3"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;