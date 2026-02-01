import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SocialLoginButtons from './SocialLoginButtons';
import LogoX from '../common/LogoX';
import ebacLogo from '../../assets/images/ebaclogo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = (data) => {
    console.log('Login social bem-sucedido:', data);

  };

  const handleSocialError = (errorMsg) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conteúdo Principal */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo e Cabeçalho */}
          <div className="text-center">
            <div className="flex justify-center">
              <LogoX className="text-gray-900" size="xl" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Entre no X Clone
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link to="/register" className="font-medium text-twitter-blue hover:text-twitter-darkBlue">
                crie uma nova conta
              </Link>
            </p>
          </div>

          {/* Formulário */}
          <div className="mt-8 bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* BOTÕES SOCIAIS */}
            <div className="mb-6">
              <SocialLoginButtons 
                onSuccess={handleSocialSuccess}
                onError={handleSocialError}
              />
            </div>

            {/* Divisor */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="mx-4 text-gray-500">ou</div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botão Criar Conta */}
            <div className="mb-6">
              <Link
                to="/register"
                className="w-full block text-center bg-twitter-blue hover:bg-twitter-darkBlue text-white font-bold py-3 px-4 rounded-full transition-colors"
              >
                Criar conta
              </Link>
            </div>

            {/* Divisor */}
            <div className="my-6 border-t border-gray-300"></div>

            {/* Seção de Login Existente */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Faça login com sua conta
              </h3>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  />
                </div>

                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-twitter-blue border border-twitter-blue hover:bg-twitter-lightBlue font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fazendo login...
                      </span>
                    ) : 'Entrar'}
                  </button>
                </div>
              </form>

              {/* Termos de Serviço */}
              <p className="mt-6 text-xs text-gray-500">
                Ao se cadastrar ou fazer login, você concorda com os termos de serviço e a política de privacidade, incluindo a Política de Cookies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé da EBAC */}
      <footer className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo e Informação da EBAC */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Logo da EBAC */}
              <div className="flex-shrink-0">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <img 
                    src={ebacLogo} 
                    alt="EBAC - Escola Britânica de Artes Criativas & Tecnologia" 
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
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-lg md:text-xl font-bold mb-1">
                  ESCOLA BRITÂNICA DE ARTES CRIATIVAS & TECNOLOGIA
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Curso Profissão: Desenvolvedor Full Stack Python v2
                </div>
              </div>
            </div>

            {/* Informação do Projeto */}
            <div className="text-center md:text-right">
              <div className="text-2xl md:text-3xl font-bold mb-2">
                X CLONE
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Trabalho Final do Curso - EBAC
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="my-6 border-t border-gray-700"></div>

          {/* Créditos */}
          <div className="text-center text-sm text-gray-400">
            <p>Este é um projeto educacional desenvolvido como parte do curso de Desenvolvimento Full Stack Python da EBAC.</p>
            <p className="mt-2">Interface inspirada no X - Todos os direitos da marca original são de seus respectivos proprietários.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;