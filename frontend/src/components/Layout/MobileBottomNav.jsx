import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHashtag, FaBell, FaEnvelope, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: FaHome, label: 'Início', path: '/' },
    { icon: FaHashtag, label: 'Explorar', path: '/explore' },
    { icon: FaBell, label: 'Notificações', path: '/notifications' },
    { icon: FaEnvelope, label: 'Mensagens', path: '/messages' },
    { icon: FaUser, label: 'Perfil', path: `/profile/${user?.username}` },
  ];

  // Não mostrar se não está logado
  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 xl:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center p-2"
            >
              <item.icon
                className={`h-6 w-6 ${
                  isActive ? 'text-twitter-blue' : 'text-gray-500'
                }`}
              />
              <span className="text-xs mt-1 text-gray-600">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;