import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import FollowingModal from './FollowingModal';
import userXNatgeo from '../../assets/images/natgeo.jpeg';
import userXBBC from '../../assets/images/bbc.webp';
import userXnasa from '../../assets/images/nasa.png';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const RightSidebar = () => {
  const [followLoading, setFollowLoading] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Função para carregar estado dos fixos do localStorage
  const loadFixedSuggestionsState = useCallback(() => {
    try {
      const savedState = localStorage.getItem('fixedSuggestionsState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Erro ao carregar estado do localStorage:', error);
    }
    return {
      natgeo: false,
      BBCEarth: false,
      NASA: false
    };
  }, []);

  // Função para salvar estado dos fixos no localStorage
  const saveFixedSuggestionsState = useCallback((suggestions) => {
    try {
      const stateToSave = {
        natgeo: suggestions.find(f => f.username === 'natgeo')?.is_following || false,
        BBCEarth: suggestions.find(f => f.username === 'BBCEarth')?.is_following || false,
        NASA: suggestions.find(f => f.username === 'NASA')?.is_following || false
      };
      localStorage.setItem('fixedSuggestionsState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Erro ao salvar estado no localStorage:', error);
    }
  }, []);

  // Sugestões fixas com contadores simulados
  const [fixedSuggestions, setFixedSuggestions] = useState(() => {
    const savedState = loadFixedSuggestionsState();
    
    return [
      { 
        id: 'fixed-natgeo',
        name: 'National Geographic', 
        username: 'natgeo', 
        image: userXNatgeo,
        is_following: savedState.natgeo || false,
        is_real: false,
        followers_count: 12500000 
      },
      { 
        id: 'fixed-bbc',
        name: 'BBC Earth', 
        username: 'BBCEarth', 
        image: userXBBC,
        is_following: savedState.BBCEarth || false,
        is_real: false,
        followers_count: 8900000 
      },
      { 
        id: 'fixed-nasa',
        name: 'NASA', 
        username: 'NASA', 
        image: userXnasa,
        is_following: savedState.NASA || false,
        is_real: false,
        followers_count: 45200000 
      }
    ];
  });

  // Salvar estado dos fixos no localStorage sempre que mudar
  useEffect(() => {
    saveFixedSuggestionsState(fixedSuggestions);
  }, [fixedSuggestions, saveFixedSuggestionsState]);

  // Função para formatar números
  const formatNumber = useCallback((num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  // Função para formatar o texto de seguidores
  const formatFollowersText = useCallback((count) => {
    if (count === 1) return '1 seguidor';
    if (count === 0) return '0 seguidores';
    return `${formatNumber(count)} seguidores`;
  }, [formatNumber]);

  // Carregar usuários para sugestões
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoadingUsers(true);
    setUsersError('');
    try {
      const response = await authAPI.getUsers();
      
      // Filtrar apenas usuários que não são o currentUser e que NÃO está seguindo
      const otherUsers = response.data.filter(u => 
        u.id !== currentUser?.id && !u.is_following
      );
      
      const usersWithFollowStatus = otherUsers.map(u => ({
        ...u,
        id: `real-${u.id}`,
        name: u.username,
        image: u.profile_picture,
        is_following: false,
        is_real: true,
        followers_count: u.followers_count || 0
      }));
      
      // Embaralhar e pegar apenas 3 usuários reais aleatórios
      const shuffled = [...usersWithFollowStatus].sort(() => 0.5 - Math.random());
      setUsers(shuffled.slice(0, 3));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsersError('Não foi possível carregar as sugestões.');
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const handleFollow = async (suggestion) => {
    const { username, is_real } = suggestion;

    if (!is_real) {
      // Para usuários fixos, alternar estado e remover após 1 segundo
      setFixedSuggestions(prev => 
        prev.map(f => 
          f.username === username 
            ? { ...f, is_following: !f.is_following }
            : f
        )
      );
      
      if (!suggestion.is_following) {
        setTimeout(() => {
          setFixedSuggestions(prev => 
            prev.filter(f => f.username !== username)
          );
        }, 1000);
      }
      return;
    }

    // Para usuários reais
    setFollowLoading((prev) => ({ ...prev, [username]: true }));
    try {
      const response = await authAPI.followUser(username);
      
      if (response.data.status === 'followed') {
        // Remover da lista de sugestões
        setUsers(prevUsers => 
          prevUsers.filter(u => u.username !== username)
        );
      }
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [username]: false }));
    }
  };

  // Combinar usuários reais com sugestões fixas
  const getAllSuggestions = useCallback(() => {
    if (!isAuthenticated) return fixedSuggestions;
    if (loadingUsers) return [];
    
    const allSuggestions = [
      ...users, 
      ...fixedSuggestions.filter(f => !f.is_following)
    ];
    
    return allSuggestions.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [isAuthenticated, loadingUsers, users, fixedSuggestions]);

  const suggestions = getAllSuggestions();

  const handleUnfollow = useCallback(() => {
    // Quando alguém é deixado de seguir, recarregar sugestões
    loadUsers();
  }, [loadUsers]);

  // Se usuário já está logado, mostrar sidebar completa
  if (isAuthenticated) {
    return (
      <>
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
                <p className="text-sm text-gray-500">Tendência Internacional</p>
                <p className="font-bold">ReactJS</p>
                <p className="text-sm text-gray-500">5.2K Tweets</p>
              </div>
            </div>
          </div>

          {/* Who to follow - COM BOTÃO GERENCIAR */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Quem seguir</h3>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="text-twitter-blue text-sm hover:underline font-medium"
              >
                Gerenciar
              </button>
            </div>
            
            {loadingUsers && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-twitter-blue"></div>
              </div>
            )}

            {usersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
                {usersError}
              </div>
            )}

            {!loadingUsers && (
              <div className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-2">Nenhuma sugestão no momento</p>
                    <p className="text-sm text-gray-400">
                      Você já está seguindo todos os usuários disponíveis!
                    </p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between">
                      <Link 
                        to={suggestion.is_real ? `/profile/${suggestion.username}` : '#'} 
                        className="flex items-center space-x-3 flex-1 min-w-0 group"
                        onClick={(e) => !suggestion.is_real && e.preventDefault()}
                      >
                        <img
                          src={suggestion.image || defaultAvatar}
                          alt={suggestion.name || suggestion.username}
                          className="w-12 h-12 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate group-hover:underline">
                            {suggestion.name || suggestion.username}
                          </p>
                          <p className="text-gray-500 text-sm truncate">
                            @{suggestion.username}
                          </p>
                          {suggestion.followers_count !== undefined && (
                            <p className="text-gray-500 text-xs">
                              {formatFollowersText(suggestion.followers_count)}
                            </p>
                          )}
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => handleFollow(suggestion)}
                        disabled={suggestion.is_real ? followLoading[suggestion.username] : false}
                        className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ml-2 min-w-[90px] ${
                          suggestion.is_following 
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300' 
                            : 'bg-black text-white hover:bg-gray-800'
                        } disabled:opacity-50`}
                      >
                        {suggestion.is_real && followLoading[suggestion.username] 
                          ? '...' 
                          : (suggestion.is_following ? 'Seguindo' : 'Seguir')
                        }
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Gerenciamento de Seguindo */}
        <FollowingModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          currentUser={currentUser}
          onUnfollow={handleUnfollow}
        />
      </>
    );
  }

  // Versão para usuário não logado
  return (
    <div className="hidden lg:block w-80 p-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-lg mb-3">Quem seguir</h2>
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">Faça login para ver sugestões de perfis para seguir</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-twitter-blue text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-600 transition-colors flex-1"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border border-twitter-blue text-twitter-blue px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-50 transition-colors flex-1"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;