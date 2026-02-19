import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const FollowingModal = ({ isOpen, onClose, currentUser, onUnfollow }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState('');

  const loadFollowing = useCallback(async () => {
    if (!currentUser) {
      console.log('❌ FollowingModal: currentUser é null');
      return;
    }
    
    console.log('📤 FollowingModal: Carregando seguindo de:', currentUser.username);
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.getFollowing(currentUser.username);
      console.log('✅ FollowingModal: Resposta da API:', response);
      console.log('✅ FollowingModal: Dados recebidos:', response.data);
      
      setFollowing(response.data);
    } catch (error) {
      console.error('❌ FollowingModal: Erro ao carregar seguindo:', error);
      console.error('❌ FollowingModal: Status:', error.response?.status);
      console.error('❌ FollowingModal: Dados do erro:', error.response?.data);
      setError('Erro ao carregar lista de seguidos');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFollowing();
    }
  }, [isOpen, currentUser, loadFollowing]);

  const handleUnfollow = async (username) => {
    setFollowLoading(prev => ({ ...prev, [username]: true }));
    try {
      console.log('📤 FollowingModal: Deixando de seguir:', username);
      const response = await authAPI.followUser(username);
      console.log('✅ FollowingModal: Resposta do unfollow:', response.data);
      
      setFollowing(prev => prev.filter(u => u.username !== username));
      
      if (onUnfollow) onUnfollow(username);
      
    } catch (error) {
      console.error('❌ FollowingModal: Erro ao deixar de seguir:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [username]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Seguindo</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={loadFollowing}
                className="text-twitter-blue text-sm hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Você ainda não segue ninguém</p>
              <p className="text-sm text-gray-400">
                Explore a aba "Explorar" e encontre pessoas interessantes para seguir!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 flex-1 min-w-0"
                    onClick={onClose}
                  >
                    <img
                      src={user.profile_picture || defaultAvatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => e.target.src = defaultAvatar}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{user.username}</p>
                      <p className="text-gray-500 text-sm truncate">
                        @{user.username}
                      </p>
                      {user.followers_count !== undefined && (
                        <p className="text-gray-400 text-xs">
                          {user.followers_count} seguidores
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => handleUnfollow(user.username)}
                    disabled={followLoading[user.username]}
                    className="text-sm px-4 py-2 rounded-full font-medium bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-600 hover:border-red-200 border border-gray-300 transition-all min-w-[110px] disabled:opacity-50"
                  >
                    {followLoading[user.username] ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600 mr-1"></div>
                        ...
                      </span>
                    ) : (
                      'Deixar de seguir'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;