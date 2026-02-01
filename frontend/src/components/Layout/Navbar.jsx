import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaHashtag, FaBell, FaEnvelope, FaBookmark, FaUser, FaEllipsisH, FaFeatherAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import CreatePost from '../Posts/CreatePost';
import LogoX from '../common/LogoX';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTweetModal, setShowTweetModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: FaHome, label: 'Início', path: '/' },
    { icon: FaHashtag, label: 'Explorar', path: '/explore' },
    { icon: FaBell, label: 'Notificações', path: '/notifications' },
    { icon: FaEnvelope, label: 'Mensagens', path: '/messages' },
    { icon: FaBookmark, label: 'Salvos', path: '/bookmarks' },
    { icon: FaUser, label: 'Perfil', path: `/profile/${user?.username}` },
    { icon: FaEllipsisH, label: 'Mais', path: '/more' },
  ];

  const handleTweet = () => {
    setShowTweetModal(true);
  };

  const handleTweetSuccess = () => {
    setShowTweetModal(false);
    // Opcional: recarregar feed ou mostrar notificação
  };

  return (
    <>
      <div className="sticky top-0 h-screen flex flex-col border-r border-gray-200 w-64 px-4 py-6">
        
        <div className="mb-6 px-4">
          <LogoX className="text-gray-900" size="lg" />
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
            >
              <item.icon className="h-7 w-7 text-gray-700 group-hover:text-twitter-blue" />
              <span className="text-xl font-medium text-gray-700 group-hover:text-twitter-blue">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Botão Tweet - Desktop */}
        <div className="mt-6 mb-8 hidden md:block">
          <button 
            onClick={handleTweet} 
            className="w-full bg-twitter-blue text-white font-bold py-3 px-4 rounded-full hover:bg-twitter-darkBlue transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FaFeatherAlt className="h-5 w-5" />
            <span>Tweetar</span>
          </button>
        </div>

        {/* Botão Tweet - Mobile (flutuante) */}
        <div className="fixed bottom-20 right-6 md:hidden z-40">
          <button
            onClick={handleTweet} // 
            className="bg-twitter-blue text-white p-4 rounded-full shadow-lg hover:bg-twitter-darkBlue transition-colors duration-200"
          >
            <FaFeatherAlt className="h-6 w-6" />
          </button>
        </div>

        {/* Perfil do usuário */}
        {user && (
          <div className="flex items-center justify-between p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer group">
            <div className="flex items-center space-x-3">
              <img
                src={user.profile_picture || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-twitter-blue transition-colors duration-200 p-2"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      
      {showTweetModal && (
        <CreatePost
          isModal={true}
          onPostCreated={() => {
            // Recarregar posts
            handleTweetSuccess(); // Isso já chama setShowTweetModal(false)
            window.location.reload(); // Recarrega a página
          }}
          onClose={() => setShowTweetModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;