import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import SocialLoginButtons from './SocialLoginButtons';
import LogoX from '../common/LogoX';
import ebacLogo from '../../assets/images/ebaclogo.png';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [passwordChangeData, setPasswordChangeData] = useState({
    username: '',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const { login, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    try {
      console.log('🔍 Login - Enviando credenciais...');
      const result = await login(username, password);
      console.log('✅ Login - Sucesso:', result);
      
      const token = localStorage.getItem('access_token');
      console.log('✅ Token no localStorage após login:', token ? 'Presente' : 'Ausente');
      
      if (token) {
        setTimeout(() => {
          console.log('✅ Redirecionando para home...');
          navigate("/", { replace: true });
        }, 500);
      } else {
        console.error('❌ Token não foi salvo!');
        setLocalError("Erro ao salvar token de autenticação.");
      }
      
    } catch (err) {
      console.error("❌ Erro no login:", err);
      if (err.response?.data?.detail) {
        setLocalError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setLocalError(err.response.data.non_field_errors[0]);
      } else {
        setLocalError("Credenciais inválidas. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Usuário já autenticado, redirecionando...');
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSocialSuccess = () => {
    console.log('✅ Login social sucesso, redirecionando...');
    navigate("/", { replace: true });
  };

  const handleSocialError = (errorMsg) => {
    setLocalError(errorMsg);
  };

  const handleChangePasswordField = (e) => {
    const { name, value } = e.target;
    setPasswordChangeData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenChangePassword = () => {
    if (username) {
      setShowChangePassword(true);
    } else {
      setLocalError("Por favor, preencha seu nome de usuário antes de alterar a senha.");
    }
  };

  const handleChangePasswordFromLogin = async (e) => {
    e.preventDefault();
    setPasswordChangeMessage('');
    setPasswordChangeLoading(true);

    try {
      const dataToSend = {
        ...passwordChangeData,
        username: username 
      };
      
      const response = await authAPI.changePasswordFromLogin(dataToSend);
      setPasswordChangeMessage(response.data?.detail || 'Senha alterada com sucesso.');
      setPasswordChangeData({
        username: '',
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
      
      setTimeout(() => {
        setShowChangePassword(false);
      }, 2000);
      
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError?.current_password?.[0]) {
        setPasswordChangeMessage(apiError.current_password[0]);
      } else if (apiError?.confirm_new_password?.[0]) {
        setPasswordChangeMessage(apiError.confirm_new_password[0]);
      } else if (apiError?.new_password?.[0]) {
        setPasswordChangeMessage(apiError.new_password[0]);
      } else if (apiError?.non_field_errors?.[0]) {
        setPasswordChangeMessage(apiError.non_field_errors[0]);
      } else if (apiError?.detail) {
        setPasswordChangeMessage(apiError.detail);
      } else {
        setPasswordChangeMessage('Não foi possível alterar a senha agora.');
      }
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center">
              <LogoX className="text-gray-900" size="xl" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Entre no X Clone
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{" "}
              <Link
                to="/register"
                className="font-medium text-twitter-blue hover:text-twitter-darkBlue"
              >
                crie uma nova conta
              </Link>
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {displayError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {displayError}
              </div>
            )}

            <div className="mb-6">
              <SocialLoginButtons
                onSuccess={handleSocialSuccess}
                onError={handleSocialError}
              />
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="mx-4 text-gray-500">ou</div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome de usuário ou email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleOpenChangePassword}
                  className="text-sm text-gray-500 hover:text-twitter-blue"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-twitter-blue border border-twitter-blue hover:bg-twitter-lightBlue font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-twitter-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Fazendo login...
                    </span>
                  ) : 'Entrar'}
                </button>
              </div>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Não tem uma conta?{" "}
                <Link
                  to="/register"
                  className="text-twitter-blue hover:text-twitter-darkBlue font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Ao se cadastrar ou fazer login, você concorda com os termos de
              serviço e a política de privacidade, incluindo a Política de Cookies.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <img
                  src={ebacLogo}
                  alt="EBAC"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="text-white text-center">
                        <div class="text-lg font-bold">EBAC</div>
                        <div class="text-xs">Logo</div>
                      </div>
                    `;
                  }}
                />
              </div>

              <div className="text-center md:text-left">
                <div className="text-lg font-bold mb-1">
                  ESCOLA BRITÂNICA DE ARTES CRIATIVAS & TECNOLOGIA
                </div>
                <div className="text-sm text-gray-300">
                  Curso Profissão: Desenvolvedor Full Stack Python v2
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-2xl font-bold mb-2">X CLONE</div>
              <div className="text-sm text-gray-300">
                Trabalho Final do Curso - EBAC
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-gray-700"></div>
          
          <div className="text-center text-sm text-gray-400">
            <p>Este é um projeto educacional desenvolvido como parte do curso de Desenvolvimento Full Stack Python da EBAC.</p>
            <p className="mt-2">Interface inspirada no X - Todos os direitos da marca original são de seus respectivos proprietários.</p>
          </div>
        </div>
      </footer>

      {/* MODAL ALTERAR SENHA */}
      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowChangePassword(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowChangePassword(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Alterar senha</h2>
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Preencha os dados abaixo para alterar sua senha e sair da tela de login
            </p>

            {passwordChangeMessage && (
              <div className={`mb-4 px-4 py-3 rounded text-sm ${
                passwordChangeMessage.includes('sucesso') 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                {passwordChangeMessage}
              </div>
            )}

            <form onSubmit={handleChangePasswordFromLogin} className="space-y-4">
              <input
                type="text"
                name="username"
                required
                value={passwordChangeData.username || username}
                onChange={handleChangePasswordField}
                placeholder="Nome de usuário"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                disabled={passwordChangeLoading}
              />

              <input
                type="password"
                name="current_password"
                required
                value={passwordChangeData.current_password}
                onChange={handleChangePasswordField}
                placeholder="Senha atual"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                disabled={passwordChangeLoading}
              />

              <input
                type="password"
                name="new_password"
                required
                value={passwordChangeData.new_password}
                onChange={handleChangePasswordField}
                placeholder="Nova senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                disabled={passwordChangeLoading}
              />

              <input
                type="password"
                name="confirm_new_password"
                required
                value={passwordChangeData.confirm_new_password}
                onChange={handleChangePasswordField}
                placeholder="Confirmar nova senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                disabled={passwordChangeLoading}
              />

              <button
                type="submit"
                disabled={passwordChangeLoading}
                className="w-full bg-twitter-blue hover:bg-twitter-darkBlue text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
              >
                {passwordChangeLoading ? 'Atualizando...' : 'Atualizar senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;