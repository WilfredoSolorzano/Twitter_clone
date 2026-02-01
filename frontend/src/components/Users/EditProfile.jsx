import React, { useState, useEffect } from 'react';
import { FaTimes, FaCamera, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const EditProfile = ({ isOpen, onClose, onUpdate }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    profile_picture: null,
    banner_image: null
  });
  const [previewProfile, setPreviewProfile] = useState('');
  const [previewBanner, setPreviewBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        profile_picture: null,
        banner_image: null
      });
      setPreviewProfile(user.profile_picture || '');
      setPreviewBanner(user.banner_image || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        banner_image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBanner(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBannerImage = () => {
    setFormData(prev => ({
      ...prev,
      banner_image: 'REMOVE' // Special flag to remove banner
    }));
    setPreviewBanner('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Criar FormData para enviar arquivos
      const formDataToSend = new FormData();
      
      if (formData.username !== user.username) {
        formDataToSend.append('username', formData.username);
      }
      if (formData.email !== user.email) {
        formDataToSend.append('email', formData.email);
      }
      if (formData.bio !== user.bio) {
        formDataToSend.append('bio', formData.bio);
      }
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      if (formData.banner_image) {
        if (formData.banner_image === 'REMOVE') {
          formDataToSend.append('banner_image', '');
        } else {
          formDataToSend.append('banner_image', formData.banner_image);
        }
      }

      const updatedUser = await updateProfile(formDataToSend);
      if (onUpdate) onUpdate(updatedUser);
      onClose();
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">Editar perfil</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary px-4 py-2"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Banner Section */}
          <div className="mb-6">
            <div className="relative">
              {/* Banner Preview */}
              <div className="h-32 rounded-t-2xl overflow-hidden relative">
                {previewBanner ? (
                  <img
                    src={previewBanner}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-twitter-blue to-purple-500"></div>
                )}
                
                {/* Overlay para banner */}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>

              {/* Banner Controls */}
              <div className="absolute top-2 right-2 flex space-x-2 z-10">
                <label className="bg-black bg-opacity-60 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-80 transition-all">
                  <FaImage className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerImageChange}
                    disabled={loading}
                  />
                </label>
                {previewBanner && (
                  <button
                    type="button"
                    onClick={removeBannerImage}
                    className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Profile Picture - Positioned over banner with higher z-index */}
              <div className="absolute -bottom-10 left-4 z-20">
                <div className="relative">
                  <div className="relative group">
                    <img
                      src={previewProfile || '/default-avatar.png'}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                    />
                    {/* Overlay na foto de perfil */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-200"></div>
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                      <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
                        <FaCamera className="h-5 w-5" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                        disabled={loading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografia
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="input-field resize-none"
                placeholder="Conte um pouco sobre você..."
                disabled={loading}
                maxLength="160"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.bio.length}/160
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;