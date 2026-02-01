import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaHashtag, FaBell, 
  FaEnvelope, FaBookmark, FaUser, FaEllipsisH,
  FaBars, FaTimes, FaFeatherAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LogoX from '../common/LogoX';

const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: FaHome, label: 'Início', path: '/' },
    { icon: FaHashtag, label: 'Explorar', path: '/explore' },
    { icon: FaBell, label: 'Notificações', path: '/notifications' },
    { icon: FaEnvelope, label: 'Mensagens', path: '/messages' },
    { icon: FaBookmark, label: 'Salvos', path: '/bookmarks' },
    { icon: FaUser, label: 'Perfil', path: `/profile/${user?.username}` },
    { icon: FaEllipsisH, label: 'Mais', path: '/more' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleTweet = () => {
    // Implementar modal de tweet
    alert('Funcionalidade de tweet em desenvolvimento!');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar para Mobile */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 xl:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Botão Hamburguer */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6 text-gray-700" />
            ) : (
              <FaBars className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* Logo Twitter */}
          <div className="mb-6 px-4">
            <LogoX className="text-gray-900" size="sm" />
         </div>

          {/* Botão Perfil (aparece só quando logado) */}
          {user && (
            <Link to={`/profile/${user.username}`} className="p-2">
              <img
                src={user.profile_picture || '/default-avatar.png'}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Overlay quando menu aberto */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`
        fixed top-0 left-0 h-full bg-white w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} xl:hidden
        shadow-xl
      `}>
        <div className="h-full flex flex-col">
          {/* Header do Menu */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div className="mb-6 px-4">
                <LogoX className="text-gray-900" size="lg" />
                </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Perfil do usuário */}
            {user && (
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-4 p-4 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-6 w-6 text-gray-700" />
                <span className="text-lg font-medium text-gray-900">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Footer do Menu */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Botão Tweet Mobile */}
            <button
              onClick={handleTweet}
              className="w-full bg-twitter-blue text-white font-bold py-3 px-4 rounded-full hover:bg-twitter-darkBlue transition-colors flex items-center justify-center space-x-2"
            >
              <FaFeatherAlt className="h-5 w-5" />
              <span>Tweetar</span>
            </button>

            {/* Botão Sair */}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Espaço para a top bar */}
      <div className="h-16 xl:h-0"></div>
    </>
  );
};

export default MobileNavbar;