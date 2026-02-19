import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('🔍 AuthProvider - Token no localStorage:', token ? '✅ Presente' : '❌ Ausente');
    
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    console.log('🔍 Tentando carregar usuário...');
    try {
      const response = await authAPI.getProfile();
      console.log('✅ Usuário carregado:', response.data);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao carregar usuário:', err);
      console.error('❌ Status:', err.response?.status);
      console.error('❌ Dados:', err.response?.data);
      
      if (err.response?.status === 401) {
        console.log('🔍 Token inválido, removendo...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

const login = async (username, password) => {
  try {
    const response = await authAPI.login({ username, password });
    
    if (response.data.token) {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

  const logout = () => {
    console.log('🔍 Fazendo logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  console.log('🔍 AuthProvider - Estado atual:', { 
    user: user?.username, 
    loading, 
    isAuthenticated: !!user 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};