import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaCog, FaEdit, FaImage, FaCamera } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import PostList from "../Posts/PostList";
import EditProfile from "./EditProfile";
import ProfileReplies from "./ProfileReplies"; 
import ProfileMedia from "./ProfileMedia"; 
import ProfileLikes from "./ProfileLikes";

const Profile = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.getUser(username);
      setProfileUser(response.data);

      if (currentUser && response.data.followers) {
        setIsFollowing(
          response.data.followers.some(
            (follower) => follower.id === currentUser.id,
          ),
        );
      }
    } catch (err) {
      setError("Usuário não encontrado");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => {
    loadProfile();
  }, [username, loadProfile]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await authAPI.followUser(username);
      
      const newIsFollowing = response.data.status === 'followed';
      setIsFollowing(newIsFollowing);
      
      setProfileUser(prev => ({
        ...prev,
        is_following: newIsFollowing,
        followers_count: newIsFollowing 
          ? (prev.followers_count || 0) + 1 
          : (prev.followers_count || 0) - 1
      }));

      await loadProfile();
      
    } catch (error) {
      console.error("Erro ao seguir:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    if (updatedUser.username !== username) {
      navigate(`/profile/${updatedUser.username}`);
    } else {
      loadProfile();
    }
    setShowEditModal(false);
  };

  const tabs = [
    { id: "posts", label: "Tweets", component: PostList },
    { id: "replies", label: "Tweets e respostas", component: ProfileReplies },
    { id: "media", label: "Mídia", component: ProfileMedia },
    { id: "likes", label: "Curtidas", component: ProfileLikes },
  ];

  // Renderizar o componente da aba ativa
  const renderActiveTab = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const TabComponent = activeTabConfig.component;

    if (activeTab === "posts") {
      return <PostList userId={profileUser?.id} key={profileUser?.id} />;
    }

    // Para as outras abas, passar o username
    return <TabComponent username={username} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Usuário não encontrado"}
        </div>
        <button 
          onClick={() => navigate("/")} 
          className="mt-4 px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Voltar para o início
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center p-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold">{profileUser.username}</h2>
              <p className="text-gray-500 text-sm">
                {profileUser.posts_count || 0} Tweets
              </p>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="h-48 relative overflow-hidden">
          {profileUser.banner_image ? (
            <div className="relative">
              <img
                src={profileUser.banner_image}
                alt="Banner"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-twitter-blue to-purple-500"></div>
          )}
          
          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-80 transition-all z-10"
            >
              <FaImage className="inline mr-1" /> Editar banner
            </button>
          )}
        </div>

        {/* Profile Picture e Informações */}
        <div className="relative px-4">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-4 z-20">
            <div className="relative group">
              <img
                src={profileUser.profile_picture || '/default-avatar.png'}
                alt={profileUser.username}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              
              {isOwnProfile && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-200 cursor-pointer"
                  onClick={() => setShowEditModal(true)}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="bg-black bg-opacity-60 text-white p-3 rounded-full">
                      <FaCamera className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="absolute -top-16 right-4 z-20">
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center text-sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <FaEdit className="mr-2" />
                  Editar perfil
                </button>
              ) : (
                <>
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                    <FaCog />
                  </button>
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm min-w-[100px] ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {followLoading ? '...' : (isFollowing ? 'Seguindo' : 'Seguir')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Informações do perfil */}
          <div className="pt-20 pb-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{profileUser.username}</h1>
              <p className="text-gray-500">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="mt-3 text-gray-900">{profileUser.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-gray-500">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    Ingressou em{" "}
                    {profileUser.date_joined 
                      ? new Date(profileUser.date_joined).toLocaleDateString(
                          "pt-BR", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }
                        ) 
                      : 'Data não disponível'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-6 mt-4">
                <div>
                  <span className="font-bold">
                    {profileUser.following_count || 0}
                  </span>
                  <span className="text-gray-500 ml-1">Seguindo</span>
                </div>
                <div>
                  <span className="font-bold">
                    {profileUser.followers_count || 0}
                  </span>
                  <span className="text-gray-500 ml-1">Seguidores</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-center font-medium hover:bg-gray-50 transition-colors ${
                      activeTab === tab.id
                        ? "text-twitter-blue border-b-2 border-twitter-blue"
                        : "text-gray-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Renderiza a aba ativa */}
        <div className="px-4">
          {renderActiveTab()}
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      <EditProfile
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default Profile;