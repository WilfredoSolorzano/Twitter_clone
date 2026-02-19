import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socialAuthAPI } from '../../services/api';

const SocialLoginButtons = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState({ google: false, apple: false });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalError, setModalError] = useState('');
  
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Abrir modal para login/registro social
  const openSocialModal = (provider) => {
    setSelectedProvider(provider);
    setShowLoginModal(true);
    setModalError('');
    setEmail('');
    setPassword('');
    
    // Sugerir email baseado no provedor
    const randomId = Date.now().toString().slice(-4);
    if (provider === 'google') {
      setEmail(`usuario.google${randomId}@exemplo.com`);
    } else {
      setEmail(`usuario.apple${randomId}@exemplo.com`);
    }
    setPassword('senha123'); 
  };

  // Fechar modal
  const closeModal = () => {
    setShowLoginModal(false);
    setSelectedProvider(null);
    setModalError('');
    setLoading({ google: false, apple: false });
  };

  // Lidar com login via modal
  const handleModalLogin = async () => {
    if (!email || !password) {
      setModalError('Preencha todos os campos');
      return;
    }

    setModalError('');
    setLoading(prev => ({ ...prev, [selectedProvider]: true }));

    try {
      console.log(`Tentando login ${selectedProvider} com:`, { email, password });
      
      // Tentar login primeiro
      try {
        // Usar a API normal de login
        const loginResponse = await socialAuthAPI.socialLogin(
          selectedProvider,
          email,
          password
        );
        
        console.log(`Login ${selectedProvider} bem-sucedido:`, loginResponse.data);
        
        // Salvar token e autenticar
        localStorage.setItem('token', loginResponse.data.token);
        authLogin(loginResponse.data.user);
        
        // Fechar modal e redirecionar
        closeModal();
        navigate('/');
        
        if (onSuccess) {
          onSuccess({
            provider: selectedProvider,
            user: loginResponse.data.user
          });
        }
        
      } catch (loginError) {
        console.log(`Login ${selectedProvider} falhou, tentando registro:`, loginError);
        
        // Se login falhar, tentar registrar
        try {
          const registerResponse = await socialAuthAPI.socialRegister(
            selectedProvider,
            email,
            password,
            `usuario_${selectedProvider}_${Date.now().toString().slice(-6)}`
          );
          
          console.log(`Registro ${selectedProvider} bem-sucedido:`, registerResponse.data);
          
          localStorage.setItem('token', registerResponse.data.token);
          authLogin(registerResponse.data.user);
          
          closeModal();
          navigate('/');
          
          if (onSuccess) {
            onSuccess({
              provider: selectedProvider,
              user: registerResponse.data.user,
              isNewUser: true
            });
          }
          
        } catch (registerError) {
          console.error(`Erro no registro ${selectedProvider}:`, registerError);
          setModalError(
            'Não foi possível criar a conta. ' +
            (registerError.response?.data?.error || 'Tente novamente mais tarde.')
          );
        }
      }
      
    } catch (error) {
      console.error(`Erro geral ${selectedProvider}:`, error);
      setModalError('Ocorreu um erro. Tente novamente.');
      
    } finally {
      setLoading(prev => ({ ...prev, [selectedProvider]: false }));
    }
  };

  // Funções originais atualizadas para abrir modal
  const handleGoogleLogin = () => {
    openSocialModal('google');
  };

  const handleAppleLogin = () => {
    openSocialModal('apple');
  };

  // Função para login rápido (criação automática de conta)
  const handleQuickLogin = async () => {
    if (!selectedProvider) return;
    
    setModalError('');
    setLoading(prev => ({ ...prev, [selectedProvider]: true }));
    
    try {
      const randomId = Date.now().toString().slice(-6);
      const testEmail = `${selectedProvider}.user.${randomId}@exemplo.com`;
      const testUsername = `${selectedProvider}_user_${randomId}`;
      const testPassword = 'senha123';
      
      console.log(`Criando conta ${selectedProvider} rápida:`, { testEmail, testUsername });
      
      try {
        const response = await socialAuthAPI.socialRegister(
          selectedProvider,
          testEmail,
          testPassword,
          testUsername
        );
        
        console.log(`Conta ${selectedProvider} criada:`, response.data);
        
        localStorage.setItem('token', response.data.token);
        authLogin(response.data.user);
        
        closeModal();
        navigate('/');
        
        if (onSuccess) {
          onSuccess({
            provider: selectedProvider,
            user: response.data.user,
            isNewUser: true
          });
        }
        
      } catch (apiError) {
        console.error(`Erro ao criar conta ${selectedProvider}:`, apiError);
        setModalError('Não foi possível criar conta automática. Use os campos acima.');
      }
      
    } catch (error) {
      console.error(`Erro no login rápido ${selectedProvider}:`, error);
      setModalError('Ocorreu um erro. Tente novamente.');
      
    } finally {
      setLoading(prev => ({ ...prev, [selectedProvider]: false }));
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading.google}
          className="w-full flex items-center justify-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.google ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              <span>Conectando...</span>
            </div>
          ) : (
            <>
              <FcGoogle className="h-5 w-5" />
              <span className="font-medium">Continuar com Google</span>
            </>
          )}
        </button>

        {/* Botão Apple */}
        <button
          onClick={handleAppleLogin}
          disabled={loading.apple}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.apple ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Conectando...</span>
            </div>
          ) : (
            <>
              <FaApple className="h-5 w-5" />
              <span className="font-medium">Continuar com Apple</span>
            </>
          )}
        </button>
      </div>

      {/* MODAL DE LOGIN SOCIAL */}
      {showLoginModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-fade-in">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${selectedProvider === 'google' ? 'bg-blue-50' : 'bg-gray-900'}`}>
                  {selectedProvider === 'google' ? (
                    <FcGoogle className="h-6 w-6" />
                  ) : (
                    <FaApple className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedProvider === 'google' ? 'Continuar com Google' : 'Continuar com Apple'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedProvider === 'google' 
                      ? 'Faça login ou crie uma nova conta' 
                      : 'Entre com sua conta Apple'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {modalError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {modalError}
                </div>
              )}

              {/* Formulário de Login */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                    disabled={loading[selectedProvider]}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedProvider === 'google'
                      ? 'Use seu email do Google ou qualquer email'
                      : 'Use seu email da Apple ou qualquer email'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Sua senha"
                    disabled={loading[selectedProvider]}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Senha sugerida: "senha123" (você pode alterar)
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleModalLogin}
                  disabled={loading[selectedProvider] || !email || !password}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[selectedProvider] ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      {selectedProvider === 'google' ? 'Conectando Google...' : 'Conectando Apple...'}
                    </span>
                  ) : (
                    `Entrar com ${selectedProvider === 'google' ? 'Google' : 'Apple'}`
                  )}
                </button>

                <button
                  onClick={handleQuickLogin}
                  disabled={loading[selectedProvider]}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[selectedProvider] ? (
                    'Criando conta...'
                  ) : (
                    `Criar conta ${selectedProvider === 'google' ? 'Google' : 'Apple'} rápida`
                  )}
                </button>

                <div className="text-center pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancelar e voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialLoginButtons;