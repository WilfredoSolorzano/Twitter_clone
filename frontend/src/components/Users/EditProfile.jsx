import React, { useState, useEffect } from 'react';
import { FaTimes, FaCamera, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const EditProfile = ({ isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
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
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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
      banner_image: 'REMOVE'
    }));
    setPreviewBanner('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_new_password) {
      setPasswordMessage('Preencha todos os campos de senha.');
      return;
    }

    try {
      await authAPI.changePassword(passwordData);
      setPasswordMessage('Senha alterada com sucesso.');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
    } catch (err) {
      const apiError = err.response?.data;
      if (typeof apiError === 'string') {
        setPasswordMessage(apiError);
      } else if (apiError?.detail) {
        setPasswordMessage(apiError.detail);
      } else if (apiError?.confirm_new_password?.[0]) {
        setPasswordMessage(apiError.confirm_new_password[0]);
      } else if (apiError?.new_password?.[0]) {
        setPasswordMessage(apiError.new_password[0]);
      } else if (apiError?.current_password?.[0]) {
        setPasswordMessage(apiError.current_password[0]);
      } else if (apiError?.non_field_errors?.[0]) {
        setPasswordMessage(apiError.non_field_errors[0]);
      } else {
        setPasswordMessage('Erro ao alterar senha.');
      }
    }
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
      
      if (formData.profile_picture instanceof File) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      
      if (formData.banner_image instanceof File) {
        formDataToSend.append('banner_image', formData.banner_image);
      } else if (formData.banner_image === 'REMOVE') {
        formDataToSend.append('banner_image', '');
      }

      const response = await authAPI.updateProfile(formDataToSend);
      
      localStorage.setItem('user', JSON.stringify(response.data));
      
      if (onUpdate) onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error('Erro detalhado:', err.response?.data);
      setError('Erro ao atualizar perfil. Tente novamente.');
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

              {/* Profile Picture */}
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

          <div className="mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="text-sm text-gray-600 hover:text-twitter-blue"
            >
              {showPasswordForm ? 'Ocultar alteração de senha' : 'Alterar senha'}
            </button>

            {showPasswordForm && (
              <div className="mt-3 space-y-3">
                <h3 className="font-semibold text-gray-900">Alterar senha</h3>

                {passwordMessage && (
                  <div className={`text-sm px-3 py-2 rounded ${
                    passwordMessage.includes('sucesso') 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}>
                    {passwordMessage}
                  </div>
                )}

                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Senha atual"
                  disabled={loading}
                />

                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Nova senha"
                  disabled={loading}
                />

                <input
                  type="password"
                  name="confirm_new_password"
                  value={passwordData.confirm_new_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Confirmar nova senha"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Atualizar senha
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;